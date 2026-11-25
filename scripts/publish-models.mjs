/**
 * Upload the two recognisers and the LiteRT.js runtime to R2, each in its
 * own models/<version>/ folder of the images bucket. The Worker serves them
 * at /models/<version>/<file> with an immutable cache.
 *
 *   node scripts/publish-models.mjs --dry-run
 *   node scripts/publish-models.mjs --local     (wrangler dev's local R2)
 *   node scripts/publish-models.mjs             (the real bucket)
 *   node scripts/publish-models.mjs --models <folder with the .tflite files>
 *
 * The model files are not in the repository. They were trained with the
 * scripts kept outside it (see STATE.md); by default this looks for them in
 * data/models/. Their descriptions and licence are data/identify/. The
 * runtime comes from the pinned @litertjs/core dev dependency, with
 * litert.mjs bundled by esbuild as KNP Birds does. Every file is checked
 * against the size and SHA-256 in src/identify.js before anything is
 * uploaded, so the wrong file cannot be published by mistake.
 *
 * Run it once per version, before a Worker that names that version is
 * deployed. `pnpm run deploy` does not do it. About 46 MB in R2 is well
 * inside the free allowance; check with the owner if that ever changes.
 *
 * The first upload, on 25 November 2026, went through the Cloudflare API
 * because wrangler was not signed in: files over 3 MB were sent in parts,
 * joined in R2 and checked against the same SHA-256 values.
 */
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import {
  MODEL_EXTRAS,
  MODEL_PREFIX,
  PHOTO_MODEL,
  RUNTIME,
  SOUND_MODEL,
} from '../src/identify.js'
import { runWrangler } from './publish-kv.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runtimeDir = path.join(root, 'node_modules/@litertjs/core')
export const BUCKET = 'knp-mammals-images'
export const DEFAULT_MODELS = path.join(root, 'data', 'models')

const CONTENT_TYPE = {
  '.tflite': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
}

/** LiteRT.js as one file: its published entry imports a package by bare name. */
export const bundleRuntime = async () => {
  const result = await build({
    entryPoints: [path.join(runtimeDir, 'dist/index.js')],
    bundle: true,
    format: 'esm',
    write: false,
    logLevel: 'silent',
  })
  return Buffer.from(result.outputFiles[0].contents)
}

export const verified = (file, bytes, expected = {}) => {
  if (expected.bytes != null && bytes.length !== expected.bytes)
    throw new Error(
      `${file} is ${bytes.length} bytes, expected ${expected.bytes}`,
    )
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (expected.sha256 && sha256 !== expected.sha256)
    throw new Error(
      `${file} has SHA-256 ${sha256}, expected ${expected.sha256}`,
    )
  return bytes
}

const entry = (version, file, bytes) => ({
  file,
  key: `${MODEL_PREFIX}/${version}/${file}`,
  bytes,
  contentType: CONTENT_TYPE[path.extname(file)],
})

/** Every file, read and checked: [{ file, key, bytes, contentType }]. */
export const modelFiles = async (modelsDir = DEFAULT_MODELS) => {
  const files = []
  for (const item of RUNTIME.files) {
    const bytes =
      item.file === 'litert.mjs'
        ? await bundleRuntime()
        : await readFile(path.join(runtimeDir, 'wasm', item.file))
    files.push(
      entry(RUNTIME.version, item.file, verified(item.file, bytes, item)),
    )
  }
  for (const model of [PHOTO_MODEL, SOUND_MODEL]) {
    const bytes = await readFile(path.join(modelsDir, model.file)).catch(() => {
      throw new Error(
        `No ${model.file} in ${modelsDir}. Pass --models <folder>.`,
      )
    })
    files.push(
      entry(model.version, model.file, verified(model.file, bytes, model)),
    )
    for (const file of MODEL_EXTRAS[model.version])
      files.push(
        entry(
          model.version,
          file,
          await readFile(path.join(root, 'data', 'identify', file)),
        ),
      )
  }
  return files
}

export const publishModels = async ({
  modelsDir,
  local = false,
  dryRun = false,
  run = runWrangler,
  read = modelFiles,
  log = console.log,
} = {}) => {
  const files = await read(modelsDir)
  const scratch = dryRun
    ? null
    : await mkdtemp(path.join(tmpdir(), 'knp-models-'))
  try {
    for (const item of files) {
      log(
        `${dryRun ? 'would upload' : 'uploading'} ${item.key} (${item.bytes.length} bytes, ${item.contentType})`,
      )
      if (dryRun) continue
      const source = path.join(scratch, item.file)
      await writeFile(source, item.bytes)
      await run([
        'r2',
        'object',
        'put',
        `${BUCKET}/${item.key}`,
        '--file',
        source,
        '--content-type',
        item.contentType,
        local ? '--local' : '--remote',
      ])
    }
  } finally {
    if (scratch) await rm(scratch, { recursive: true, force: true })
  }
  return files.map(({ key, bytes }) => ({ key, bytes: bytes.length }))
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2)
  const at = args.indexOf('--models')
  publishModels({
    modelsDir: at >= 0 ? path.resolve(args[at + 1]) : undefined,
    local: args.includes('--local'),
    dryRun: args.includes('--dry-run'),
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
