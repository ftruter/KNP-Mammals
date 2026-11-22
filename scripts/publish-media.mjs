/**
 * Copy every photograph and recording the pages already show into R2.
 *
 *   node scripts/publish-media.mjs --dry-run     what would be copied; no network
 *   node scripts/publish-media.mjs --measure     HEAD each source for its size; no upload
 *   node scripts/publish-media.mjs --local       copy into wrangler dev's local R2
 *   node scripts/publish-media.mjs --limit 20    stop after 20 copies
 *   node scripts/publish-media.mjs               copy into the remote bucket
 *
 * The object key is the key already stored on the species (`images/<key>` and
 * `audio/<key>` on the site are that key with the prefix stripped). A file is
 * skipped when data/media/mirror.json already records the same source URL.
 * A key that has left the plan is deleted, except future `models/` and
 * `offline/` prefixes. The content type is sniffed from the bytes. A source
 * label is not trusted. HTML and anything that is not an image or audio byte
 * stream is refused.
 *
 * This command does not set `hosted` and does not edit species files. It does
 * not create the bucket. A remote run puts objects into the bucket and writes
 * mirror.json, and needs the owner's yes first. `--dry-run` makes no remote
 * call. A `--local` run does not write mirror.json.
 */
import { createHash } from 'node:crypto'
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
  mkdir,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { licenceForbidsDerivatives } from '../src/labels.js'
import { runWrangler } from './publish-kv.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const BUCKET = 'knp-mammals-images'
export const MIRROR_FILE = path.join(root, 'data', 'media', 'mirror.json')
const DEFAULT_DATA_DIR = path.join(root, 'data')
const PRESERVED_PREFIXES = ['models/', 'offline/']
const STREAMS_PER_HOST = 4
const UPLOAD_STREAMS = 4
const SAVE_EVERY = 25
const TIMEOUT_MS = 600000
const USER_AGENT =
  process.env.MEDIA_USER_AGENT ||
  'knp-mammals-media-mirror/1.0 (https://mammals.truter.world)'
const NOTE = 'Written by scripts/publish-media.mjs. Do not edit by hand.'

const KIND = { images: 'image/', audio: 'audio/' }

/** CC0, CC BY, CC BY-SA, CC BY-NC, and the SA variants. ND is not included. */
export const licenceAllowed = (licence) =>
  typeof licence === 'string' &&
  /^(?:CC0(?:\s+1\.0)?|CC BY(?:-NC)?(?:-SA)?(?:\s+\d+(?:\.\d+)?)?)$/i.test(
    licence.trim(),
  )

const preservedKey = (key) =>
  PRESERVED_PREFIXES.some((prefix) => key.startsWith(prefix))

const rejectReason = (item) => {
  if (!item || typeof item.key !== 'string' || item.key.length === 0)
    return 'no key'
  if (preservedKey(item.key)) return 'preserved prefix'
  if (licenceForbidsDerivatives(item.license) || !licenceAllowed(item.license))
    return 'licence'
  if (typeof item.fileUrl !== 'string' || !/^https:/.test(item.fileUrl))
    return 'not https'
  return ''
}

/**
 * Every displayable photograph and recording: `{ items, skipped }`.
 * `items` is `{ group, key, source }`, with `group` of `images` or `audio`.
 * This does not choose a new file and does not change `hosted`.
 */
export const mediaPlan = (speciesDocs) => {
  const plan = new Map()
  const skipped = []
  const consider = (group, item, slug) => {
    const reason = rejectReason(item)
    if (reason) {
      if (item && (item.key || item.fileUrl || item.license))
        skipped.push({
          group,
          slug,
          key: typeof item.key === 'string' ? item.key : '',
          reason,
        })
      return
    }
    const id = `${group}\0${item.key}`
    if (plan.has(id)) {
      skipped.push({ group, slug, key: item.key, reason: 'duplicate key' })
      return
    }
    plan.set(id, { group, key: item.key, source: item.fileUrl })
  }
  for (const doc of speciesDocs) {
    const slug = typeof doc?.slug === 'string' ? doc.slug : ''
    for (const image of Array.isArray(doc?.images) ? doc.images : [])
      consider('images', image, slug)
    for (const call of Array.isArray(doc?.calls) ? doc.calls : []) {
      const recordings = Array.isArray(call?.recordings) ? call.recordings : []
      for (const recording of recordings) consider('audio', recording, slug)
    }
  }
  const items = [...plan.values()].sort(
    (a, b) => a.group.localeCompare(b.group) || a.key.localeCompare(b.key),
  )
  return { items, skipped }
}

export const loadSpeciesDetails = async (dataDir = DEFAULT_DATA_DIR) => {
  const dir = path.join(dataDir, 'species', 'details')
  const names = (await readdir(dir))
    .filter((name) => name.endsWith('.json'))
    .sort()
  const docs = []
  for (const name of names)
    docs.push(JSON.parse(await readFile(path.join(dir, name), 'utf8')))
  return docs
}

/**
 * The media type the first bytes show, or null. Wikimedia and iNaturalist
 * content-type labels are not consulted.
 */
export const sniff = (bytes) => {
  const view = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
  const text = (from, to) => view.subarray(from, to).toString('latin1')
  if (view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff)
    return 'image/jpeg'
  if (view[0] === 0x89 && text(1, 4) === 'PNG') return 'image/png'
  if (text(0, 6) === 'GIF87a' || text(0, 6) === 'GIF89a') return 'image/gif'
  if (text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP') return 'image/webp'
  if (text(0, 4) === 'RIFF' && text(8, 12) === 'WAVE') return 'audio/wav'
  if (text(0, 4) === 'OggS') return 'audio/ogg'
  if (text(0, 4) === 'fLaC') return 'audio/flac'
  if (text(0, 3) === 'ID3') return 'audio/mpeg'
  if (view[0] === 0xff && (view[1] & 0xe0) === 0xe0 && (view[1] & 0x06) !== 0)
    return 'audio/mpeg'
  if (view.length >= 8 && text(4, 8) === 'ftyp') return 'audio/mp4'
  return null
}

/** The file at `item.source`: `{ bytes, contentType }`. Refuses non-media. */
export const download = async (item, fetcher = fetch) => {
  const response = await fetcher(item.source, {
    headers: { 'user-agent': USER_AGENT },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok)
    throw new Error(`${response.status} fetching ${item.source}`)
  const contentType = (response.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  if (/^text\/|json|xml/.test(contentType))
    throw new Error(
      `${item.source} is ${contentType}, expected ${KIND[item.group]}*`,
    )
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length === 0) throw new Error(`${item.source} is empty`)
  const found = sniff(bytes)
  if (!found?.startsWith(KIND[item.group]))
    throw new Error(
      `${item.source} is ${found || contentType || 'of no recognised type'}, expected ${KIND[item.group]}*`,
    )
  return { bytes, contentType: found }
}

/** The size a source states for a file, or null when it does not say. */
export const measure = async (item, fetcher = fetch) => {
  const response = await fetcher(item.source, {
    method: 'HEAD',
    headers: { 'user-agent': USER_AGENT },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const length = Number(response.headers.get('content-length'))
  return response.ok && Number.isInteger(length) && length > 0 ? length : null
}

/** Runs `job` on every item: the hosts side by side, a few streams to each. */
export const byHost = async (items, job, streams = STREAMS_PER_HOST) => {
  const hosts = new Map()
  for (const item of items) {
    const host = new URL(item.source).host
    hosts.set(host, [...(hosts.get(host) ?? []), item])
  }
  await Promise.all(
    [...hosts.values()].flatMap((queue) =>
      Array.from({ length: Math.min(streams, queue.length) }, async () => {
        while (queue.length) await job(queue.shift())
      }),
    ),
  )
}

const mebibytes = (bytes) => (bytes / 1048576).toFixed(1)

const emptyMirror = () => ({ note: NOTE, images: {}, audio: {} })

const sorted = (mirror) => ({
  note: mirror.note,
  images: Object.fromEntries(
    Object.entries(mirror.images).sort(([a], [b]) => a.localeCompare(b)),
  ),
  audio: Object.fromEntries(
    Object.entries(mirror.audio).sort(([a], [b]) => a.localeCompare(b)),
  ),
})

const readMirror = async (mirrorFile) => {
  let parsed
  try {
    parsed = JSON.parse(await readFile(mirrorFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return emptyMirror()
    throw error
  }
  if (
    !parsed ||
    typeof parsed.images !== 'object' ||
    parsed.images === null ||
    Array.isArray(parsed.images) ||
    typeof parsed.audio !== 'object' ||
    parsed.audio === null ||
    Array.isArray(parsed.audio)
  )
    throw new Error(`${mirrorFile} is not a media mirror`)
  return {
    note: typeof parsed.note === 'string' ? parsed.note : NOTE,
    images: { ...parsed.images },
    audio: { ...parsed.audio },
  }
}

export const publishMedia = async ({
  dryRun = false,
  measureOnly = false,
  local = false,
  limit = Infinity,
  dataDir,
  species,
  mirrorFile = MIRROR_FILE,
  run = runWrangler,
  fetcher = fetch,
  log = console.log,
} = {}) => {
  const docs = species ?? (await loadSpeciesDetails(dataDir))
  const { items, skipped } = mediaPlan(docs)
  for (const item of skipped)
    log(`skip ${item.slug} ${item.key || '(no key)'} (${item.reason})`)
  const mirror = await readMirror(mirrorFile)
  const sameSource = (item) =>
    mirror[item.group][item.key]?.source === item.source
  const todo = items
    .filter((item) => local || !sameSource(item))
    .slice(0, limit)
  const planned = new Set(items.map((item) => `${item.group}\0${item.key}`))
  const stale = ['images', 'audio'].flatMap((group) =>
    Object.keys(mirror[group])
      .filter((key) => !preservedKey(key) && !planned.has(`${group}\0${key}`))
      .map((key) => ({ group, key })),
  )
  const photographs = items.filter((item) => item.group === 'images').length
  const clips = items.length - photographs
  log(
    `${items.length} files in the plan (${photographs} photographs, ${clips} clips); ${todo.length} to copy, ${stale.length} old copies to delete`,
  )

  if (dryRun) {
    for (const item of todo) log(`would copy ${item.source} to ${item.key}`)
    for (const item of stale) log(`would delete ${item.key}`)
    return { plan: items, skipped, copied: [], deleted: stale }
  }

  if (measureOnly) {
    const totals = { images: 0, audio: 0 }
    let unknown = 0
    await byHost(items, async (item) => {
      const bytes = await measure(item, fetcher).catch(() => null)
      if (bytes == null) unknown += 1
      else totals[item.group] += bytes
    })
    log(
      `photographs ${mebibytes(totals.images)} MiB, clips ${mebibytes(totals.audio)} MiB, ${unknown} files whose source did not state a size`,
    )
    return { plan: items, skipped, totals, unknown, copied: [], deleted: [] }
  }

  const scratch = await mkdtemp(path.join(tmpdir(), 'knp-mammals-media-'))
  const save = async () => {
    if (local) return
    await mkdir(path.dirname(mirrorFile), { recursive: true })
    await writeFile(mirrorFile, `${JSON.stringify(sorted(mirror), null, 2)}\n`)
  }
  const copied = []
  const failed = []
  const uploads = []
  let slot = 0
  const upload = async (item, file) => {
    const source = path.join(scratch, String((slot += 1)))
    await writeFile(source, file.bytes)
    try {
      await run([
        'r2',
        'object',
        'put',
        `${BUCKET}/${item.key}`,
        '--file',
        source,
        '--content-type',
        file.contentType,
        local ? '--local' : '--remote',
      ])
    } finally {
      await rm(source, { force: true })
    }
    mirror[item.group][item.key] = {
      bytes: file.bytes.length,
      sha256: createHash('sha256').update(file.bytes).digest('hex'),
      contentType: file.contentType,
      source: item.source,
    }
    copied.push(item)
    log(`copied ${item.key} (${file.bytes.length} bytes, ${file.contentType})`)
    if (copied.length % SAVE_EVERY === 0) await save()
  }
  const gate = Array.from({ length: UPLOAD_STREAMS }, () => Promise.resolve())
  let next = 0
  try {
    await byHost(todo, async (item) => {
      try {
        const file = await download(item, fetcher)
        const lane = (next += 1) % UPLOAD_STREAMS
        const job = gate[lane].then(() =>
          upload(item, file).catch((error) => {
            failed.push({ item, error })
          }),
        )
        gate[lane] = job
        uploads.push(job)
      } catch (error) {
        failed.push({ item, error })
      }
    })
    await Promise.all(uploads)
    if (failed.length) {
      for (const { item, error } of failed)
        console.error(
          `failed ${item.source}: ${error instanceof Error ? error.message : error}`,
        )
      throw new Error(
        `${failed.length} of ${todo.length} files were not copied. Run the command again to retry them.`,
      )
    }
    const deleted = []
    for (const item of stale) {
      await run([
        'r2',
        'object',
        'delete',
        `${BUCKET}/${item.key}`,
        local ? '--local' : '--remote',
      ])
      delete mirror[item.group][item.key]
      deleted.push(item)
      log(`deleted ${item.key}`)
    }
    await save()
    return { plan: items, skipped, copied, deleted }
  } finally {
    await save().catch(() => {})
    await rm(scratch, { recursive: true, force: true })
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const args = process.argv.slice(2)
  const at = args.indexOf('--limit')
  const limit = at < 0 ? Infinity : Number(args[at + 1])
  if (at >= 0 && (!Number.isInteger(limit) || limit < 0)) {
    console.error('--limit needs a whole number of files')
    process.exitCode = 1
  } else {
    publishMedia({
      dryRun: args.includes('--dry-run'),
      measureOnly: args.includes('--measure'),
      local: args.includes('--local'),
      limit,
    }).catch((error) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exitCode = 1
    })
  }
}
