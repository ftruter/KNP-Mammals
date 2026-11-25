import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { gunzipSync } from 'node:zlib'
import { collectEntries } from '../scripts/seed.mjs'
import {
  BATS_NOTE,
  MODEL_KEYS,
  PHOTO_MODEL,
  SOUND_LIKELY,
  SOUND_MODEL,
  SOUND_POSSIBLE,
  deriveIdentify,
  photoBase,
  runtimeBase,
  soundBase,
  withoutPlace,
} from '../src/identify.js'
import { handleRequest } from '../src/worker.js'
import { repoRoot } from './helpers.js'

const load = async (file) => {
  const source = await readFile(path.join(repoRoot, file), 'utf8')
  // The scripts only start work where there is a document, so their rules
  // can be tested here as plain functions.
  return import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  )
}
const sound = await load('src/client/identify-sound.js')
const photo = await load('src/client/identify-photo.js')

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const kv = { get: async (key) => store.get(key) ?? null }
const origin = 'https://mammals.example'
const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
const bucket = {
  seen: [],
  async get(key) {
    this.seen.push(key)
    return { body: bytes, size: bytes.length, httpEtag: '"m"' }
  },
}
const env = { MAMMALS_KV: kv, IMAGES: bucket }
const get = (pathname, init) =>
  handleRequest(new Request(`${origin}${pathname}`, init), env)
const json = (key) => {
  const value = store.get(key)
  return typeof value === 'string' ? JSON.parse(value) : value
}
const HIDDEN = ['ceratotherium-simum', 'diceros-bicornis', 'smutsia-temminckii']

test('the identify pages are served with WebAssembly and worker rights', async () => {
  for (const pathname of ['/identify/photo', '/identify/sound']) {
    const response = await get(pathname)
    assert.equal(response.status, 200, pathname)
    const csp = response.headers.get('content-security-policy')
    assert.match(csp, /'wasm-unsafe-eval'/, pathname)
    assert.match(csp, /worker-src 'self'/, pathname)
    const body = await response.text()
    assert.match(body, /id="identify"/)
    assert.match(body, /data-worker="\/identify-worker\.js\?v=/)
    assert.ok(body.includes(BATS_NOTE), `${pathname} names the bats rule`)
    assert.match(body, /href="\/credits#recognisers"/)
  }
  const index = await get('/identify')
  assert.equal(index.status, 200)
  assert.doesNotMatch(
    index.headers.get('content-security-policy'),
    /wasm-unsafe-eval/,
  )
  const plain = await get('/')
  assert.doesNotMatch(
    plain.headers.get('content-security-policy'),
    /wasm-unsafe-eval/,
  )
})

test('only the sound page may use the microphone, and nothing the camera', async () => {
  const soundPage = await get('/identify/sound')
  assert.match(
    soundPage.headers.get('permissions-policy'),
    /microphone=\(self\)/,
  )
  assert.match(soundPage.headers.get('permissions-policy'), /camera=\(\)/)
  const photoPage = await get('/identify/photo')
  assert.doesNotMatch(
    photoPage.headers.get('permissions-policy') ?? '',
    /microphone=\(self\)/,
  )
  const body = await photoPage.text()
  assert.match(body, /capture="environment"/)
})

test('the worker script is served as a script under the identify policy', async () => {
  const response = await get('/identify-worker.js')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /javascript/)
  assert.match(
    response.headers.get('content-security-policy'),
    /'wasm-unsafe-eval'/,
  )
  const source = await response.text()
  // A classic worker: an export would be a syntax error there.
  assert.doesNotMatch(source, /^export /m)
  assert.match(source, /loadAndCompile/)
})

test('only listed model files are served, with the right types', async () => {
  const expected = {
    [`${photoBase}${PHOTO_MODEL.file}`]: 'application/octet-stream',
    [`${soundBase}${SOUND_MODEL.file}`]: 'application/octet-stream',
    [`${photoBase}photo-model.json`]: 'application/json',
    [`${soundBase}LICENSE.md`]: 'text/markdown',
    [`${runtimeBase}litert_wasm_internal.wasm`]: 'application/wasm',
    [`${runtimeBase}litert.mjs`]: 'text/javascript',
  }
  for (const [pathname, type] of Object.entries(expected)) {
    assert.ok(MODEL_KEYS.has(pathname.slice(1)), pathname)
    const response = await get(pathname)
    assert.equal(response.status, 200, pathname)
    assert.match(response.headers.get('content-type'), new RegExp(`^${type}`))
    assert.match(response.headers.get('cache-control'), /immutable/)
  }
  for (const pathname of [
    '/models/other/x.tflite',
    `${photoBase}secret.tflite`,
    `${photoBase}LICENSE.txt`,
    `${soundBase}${PHOTO_MODEL.file}`,
  ]) {
    const response = await get(pathname)
    assert.equal(response.status, 404, pathname)
  }
  assert.ok(bucket.seen.every((key) => MODEL_KEYS.has(key)))
  const part = await get(`${photoBase}${PHOTO_MODEL.file}`, {
    headers: { range: 'bytes=0-3' },
  })
  assert.equal(part.headers.get('accept-ranges'), 'bytes')
})

test('the sound windows are the loudest that do not overlap', () => {
  const { WINDOW, HOP, chooseWindows } = sound
  assert.equal(WINDOW, 144000)
  assert.equal(HOP, 72000)
  const short = chooseWindows(new Float32Array(48000).fill(0.5))
  assert.equal(short.count, 1)
  assert.equal(short.samples.length, WINDOW)
  assert.equal(short.samples[0], 0)
  assert.equal(short.samples[WINDOW / 2], 0.5)

  const samples = new Float32Array(WINDOW * 5)
  // A loud call from 6 to 9 seconds, a fainter one from 12 to 15.
  for (let i = 6 * 48000; i < 9 * 48000; i += 1) samples[i] = i % 2 ? 0.8 : -0.8
  for (let i = 12 * 48000; i < 15 * 48000; i += 1)
    samples[i] = i % 2 ? 0.2 : -0.2
  const picked = chooseWindows(samples, 2)
  assert.equal(picked.count, 2)
  assert.deepEqual(picked.starts, [6 * 48000, 12 * 48000])
  const all = chooseWindows(samples)
  assert.ok(all.count <= 6)
  for (let i = 1; i < all.starts.length; i += 1)
    assert.ok(all.starts[i] - all.starts[i - 1] >= WINDOW)
})

test('each window is normalised as in training', () => {
  const frame = Float32Array.from([0.1, 0.2, 0.3, 0.2])
  sound.normalise(frame)
  const peak = Math.max(...frame.map(Math.abs))
  assert.ok(Math.abs(peak - 0.9) < 1e-6)
  assert.ok(Math.abs(frame.reduce((a, b) => a + b, 0)) < 1e-6)
  const faint = Float32Array.from([1e-6, -1e-6, 1e-6, -1e-6])
  sound.normalise(faint)
  // No more than +40 dB of gain.
  assert.ok(Math.max(...faint.map(Math.abs)) <= 1.001e-4)
  const silent = new Float32Array(4)
  sound.normalise(silent)
  assert.deepEqual([...silent], [0, 0, 0, 0])
})

test('sound scores are the sigmoid of the best window, ranked with "not sure"', () => {
  assert.ok(Math.abs(sound.LIKELY - SOUND_LIKELY) < 1e-12)
  assert.ok(Math.abs(sound.POSSIBLE - SOUND_POSSIBLE) < 1e-12)
  assert.ok(Math.abs(SOUND_LIKELY - 0.6225) < 1e-4)
  // Two windows, three labels: raw scores (logits).
  const scores = sound.speciesScores(
    Float32Array.from([-6, 0.3, 2, -5, 0.4, -1]),
    2,
    3,
  )
  assert.ok(Math.abs(scores[0] - 1 / (1 + Math.exp(5))) < 1e-6)
  assert.ok(Math.abs(scores[1] - 1 / (1 + Math.exp(-0.4))) < 1e-6)
  assert.ok(Math.abs(scores[2] - 1 / (1 + Math.exp(-2))) < 1e-6)
  const species = [
    { slug: 'a', en: 'A' },
    { slug: 'b', en: 'B' },
    { slug: 'c', en: 'C' },
  ]
  const ranked = sound.rankResults(scores, species)
  assert.equal(ranked.kind, 'species')
  assert.deepEqual(
    ranked.candidates.map((item) => [item.slug, item.confidence]),
    [
      ['c', 'likely'],
      ['b', 'possible'],
    ],
  )
  const quiet = sound.rankResults([0.1, 0.2, 0.3], species)
  assert.equal(quiet.kind, 'none')
  assert.equal(quiet.closest.slug, 'c')
})

test('the photo square is the centre 88% and stays inside the photo', () => {
  const { cropSquare, rankResults, toRgb } = photo
  assert.deepEqual(cropSquare(1000, 500), { left: 280, top: 30, side: 440 })
  assert.deepEqual(cropSquare(1000, 500, { x: 0, y: 1 }), {
    left: 0,
    top: 60,
    side: 440,
  })
  assert.equal(cropSquare(1000, 500, { zoom: 2 }).side, 220)
  assert.equal(cropSquare(1000, 500, { zoom: 10 }).side, 440 / 3)
  assert.deepEqual(
    [...toRgb(Uint8ClampedArray.from([1, 2, 3, 255, 4, 5, 6, 0]))],
    [1, 2, 3, 4, 5, 6],
  )
  const species = ['a', 'b', 'c', 'd'].map((slug) => ({ slug, en: slug }))
  const sure = rankResults([0.05, 0.7, 0.2, 0.05], species)
  assert.equal(sure.kind, 'species')
  assert.deepEqual(
    sure.candidates.map((item) => [item.slug, item.confidence]),
    [
      ['b', 'likely'],
      ['c', 'unsure'],
      ['a', 'unsure'],
    ],
  )
  const unsure = rankResults([0.24, 0.2, 0.3 - 0.07, 0.33 - 0.1], species)
  assert.equal(unsure.kind, 'none')
  assert.equal(unsure.candidates.length, 3)
})

test('a bat in either model stops the build', () => {
  const doc = json('index/identify')
  assert.equal(doc.bats, BATS_NOTE)
  const speciesBySlug = new Map([
    [
      'epomophorus-wahlbergi',
      {
        slug: 'epomophorus-wahlbergi',
        en: 'Bat',
        latin: 'E. w.',
        familySlug: 'pteropodidae',
      },
    ],
  ])
  const familyBySlug = new Map([['pteropodidae', { order: 'Chiroptera' }]])
  const model = (extra) => ({ ...extra })
  assert.throws(
    () =>
      deriveIdentify({
        photoModel: model({
          ...PHOTO_MODEL,
          classes: ['epomophorus-wahlbergi'],
          test: {},
        }),
        soundModel: model({ ...SOUND_MODEL, labels: [] }),
        speciesBySlug,
        familyBySlug,
      }),
    /bat/,
  )
  const orders = new Map(
    entries
      .filter(({ key }) => key.startsWith('family/'))
      .map(({ value }) => {
        const family = typeof value === 'string' ? JSON.parse(value) : value
        return [family.slug, family.order]
      }),
  )
  for (const item of [...doc.photo.species, ...doc.sound.species]) {
    const row = json(`species/${item.slug}`)
    assert.ok(row, item.slug)
    if (orders.size && row.familySlug)
      assert.notEqual(orders.get(row.familySlug), 'Chiroptera', item.slug)
  }
})

test('the rhinos and the pangolin give away no place', async () => {
  const sample = {
    image: {
      key: 'x.jpg',
      hosted: true,
      source: 'https://www.inaturalist.org/observations/1',
      fileUrl: 'https://static.inaturalist.org/1.jpg',
      author: 'A',
      license: 'CC BY 4.0',
    },
    call: {
      key: 'y.mp3',
      hosted: false,
      fileUrl: 'https://xeno-canto.org/1/download',
      author: 'B',
    },
  }
  assert.deepEqual(withoutPlace('smutsia-temminckii', sample), {
    image: { key: 'x.jpg', hosted: true, author: 'A', license: 'CC BY 4.0' },
  })
  assert.equal(withoutPlace('panthera-leo', sample), sample)
  assert.equal(withoutPlace('diceros-bicornis', { call: sample.call }), null)

  const doc = json('index/identify')
  for (const item of [...doc.photo.species, ...doc.sound.species].filter(
    (row) => HIDDEN.includes(row.slug),
  )) {
    for (const media of Object.values(item.sample ?? {})) {
      assert.equal(media.source, undefined, item.slug)
      assert.equal(media.fileUrl, undefined, item.slug)
    }
  }
  const body = await (await get('/identify/photo')).text()
  for (const slug of HIDDEN) {
    const card = body.match(
      new RegExp(
        `<template id="identify-card-${slug}">([\\s\\S]*?)</template>`,
      ),
    )
    assert.ok(card, slug)
    assert.doesNotMatch(
      card[1],
      /inaturalist\.org\/observations|observation/i,
      slug,
    )
  }

  const rows = gunzipSync(
    await readFile(path.join(repoRoot, 'data/identify/photo-training.csv.gz')),
  )
    .toString('utf8')
    .trim()
    .split('\n')
  const header = rows[0].split(',')
  assert.deepEqual(header.slice(0, 3), ['slug', 'photo_id', 'observation_id'])
  let hidden = 0
  for (const line of rows.slice(1)) {
    const [slug, , observation] = line.split(',')
    if (HIDDEN.includes(slug)) {
      hidden += 1
      assert.equal(observation, '', `${slug} keeps no observation id`)
    }
  }
  assert.ok(hidden > 0)
})

test('the credits page names the recognisers and their training data', async () => {
  const body = await (await get('/credits')).text()
  assert.match(body, /<h2 id="recognisers">/)
  assert.match(body, /photo-training\.csv\.gz/)
  assert.match(body, /sound-training\.csv\.gz/)
  assert.match(body, /BirdNET/)
  assert.match(body, /ESC-50/)
  assert.match(body, /CC BY-NC-SA 4\.0/)
  const md = await (await get('/credits.md')).text()
  assert.match(md, /BirdNET/)
})

test('the identify pages have plain text and data versions', async () => {
  const soundJson = await (await get('/identify/sound.json')).json()
  assert.equal(soundJson.kind, 'identify-sound')
  assert.equal(soundJson.bats, BATS_NOTE)
  assert.ok(Math.abs(soundJson.thresholds.likely - SOUND_LIKELY) < 1e-12)
  assert.equal(soundJson.species.length, 10)
  assert.equal(soundJson.assets.model, `${soundBase}${SOUND_MODEL.file}`)
  assert.equal(soundJson.assets.sha256, SOUND_MODEL.sha256)
  const photoJson = await (await get('/identify/photo.json')).json()
  assert.equal(photoJson.kind, 'identify-photo')
  assert.equal(photoJson.thresholds.likely, 0.5)
  assert.equal(photoJson.species.length, 85)
  const md = await (await get('/identify/photo.md')).text()
  assert.match(md, /## How well it works/)
  assert.ok(md.includes(BATS_NOTE))
})

test('the models can be saved for use without a signal', async () => {
  const manifest = await (await get('/offline.json')).json()
  for (const [id, model] of [
    ['photo-model', PHOTO_MODEL],
    ['sound-model', SOUND_MODEL],
  ]) {
    const category = manifest.categories.find((item) => item.id === id)
    assert.ok(category, id)
    const files = category.files.map((index) => manifest.files[index])
    const main = files.find((file) =>
      (file.url ?? file.path ?? file).toString().endsWith(model.file),
    )
    assert.ok(main, `${id} includes its model`)
    assert.equal(main.sha256, model.sha256)
    assert.ok(
      files.some((file) =>
        String(file.url ?? file.path ?? file).endsWith('.wasm'),
      ),
    )
  }
})
