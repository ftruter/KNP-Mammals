import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { collectEntries, readMirror } from '../scripts/seed.mjs'
import { LARGE_DOWNLOAD_BYTES, OFFLINE_KEY } from '../src/offline.js'
import {
  deriveOffline,
  selectGuideData,
  selectGuidePages,
} from '../src/offline.js'
import { autoCacheUrls, offlineManifest } from '../src/offline-app.js'
import { SERVICE_WORKER_CSP } from '../src/respond.js'
import { parseUrl } from '../src/route.js'
import { handleRequest } from '../src/worker.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = await readFile(path.join(root, 'src/client/offline.js'), 'utf8')
// The script only starts work where there is a document, so its rules can be
// loaded here and tested as plain functions.
const client = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
)

const MIB = 1048576
const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (pathname, init) =>
  handleRequest(new Request(`${origin}${pathname}`, init), env)

const photo = (key, fileUrl, extra = {}) => ({
  key,
  fileUrl,
  license: 'CC BY 4.0',
  hosted: true,
  ...extra,
})
const clip = (key, fileUrl, quality, extra = {}) => ({
  key,
  fileUrl,
  license: 'CC BY-NC-SA 4.0',
  hosted: false,
  quality,
  ...extra,
})

test('every sampled page links the manifest and the offline script', async () => {
  for (const pathname of ['/', '/species/connochaetes-taurinus', '/nothing']) {
    const body = await (await get(pathname)).text()
    assert.match(body, /<link rel="manifest" href="\/manifest\.webmanifest">/)
    assert.match(
      body,
      /<meta name="theme-color" media="\(prefers-color-scheme: dark\)" content="#0E2816">/,
    )
    assert.match(body, /<meta name="theme-color" content="#28602a">/)
    assert.match(body, /<meta name="mobile-web-app-capable" content="yes">/)
    assert.match(
      body,
      /<meta name="apple-mobile-web-app-capable" content="yes">/,
    )
    assert.match(
      body,
      /<meta name="apple-mobile-web-app-status-bar-style" content="default">/,
    )
    assert.match(body, /<link rel="apple-touch-icon" href="\/apple-touch-icon/)
    assert.match(
      body,
      /<script type="module" defer src="\/offline\.js\?v=[0-9a-f]+">/,
    )
  }

  const response = await get('/manifest.webmanifest')
  assert.equal(
    response.headers.get('content-type'),
    'application/manifest+json; charset=utf-8',
  )
  const manifest = await response.json()
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.name, 'Mammals of Kruger National Park')
  assert.equal(manifest.short_name, 'Mammals of KNP')
  assert.equal(manifest.theme_color, '#28602a')
  assert.equal(manifest.background_color, '#FDF6E3')
  assert.deepEqual(
    manifest.icons.map((icon) => [icon.sizes, icon.purpose]),
    [
      ['192x192', 'any'],
      ['512x512', 'any'],
      ['512x512', 'maskable'],
    ],
  )
  for (const icon of manifest.icons) {
    const file = await get(icon.src)
    assert.equal(file.status, 200, icon.src)
    assert.equal(file.headers.get('content-type'), 'image/png')
  }
})

test('the panel is on the home page only, and it is hidden', async () => {
  const home = await (await get('/')).text()
  assert.match(
    home,
    /<section id="offline-panel" class="offline-panel" aria-labelledby="offline-heading" data-manifest="\/offline\.json" hidden>/,
  )
  assert.match(
    home,
    /Signal in much of the park is poor\. Tick what to keep on this device\./,
  )
  assert.match(
    home,
    /<p id="offline-status" class="visually-hidden" role="status" aria-live="polite">/,
  )
  for (const pathname of ['/families', '/species/connochaetes-taurinus']) {
    const body = await (await get(pathname)).text()
    assert.doesNotMatch(body, /offline-panel/, pathname)
  }
})

test('the service worker and the page script are served unchanged', async () => {
  const worker = await get('/sw.js')
  const workerBody = await worker.text()
  assert.equal(
    worker.headers.get('content-type'),
    'text/javascript; charset=utf-8',
  )
  assert.equal(
    workerBody,
    await readFile(path.join(root, 'src/client/sw.js'), 'utf8'),
  )
  assert.equal(
    worker.headers.get('content-security-policy'),
    SERVICE_WORKER_CSP,
  )
  assert.equal(SERVICE_WORKER_CSP, "default-src 'self'")
  assert.match(workerBody, /No signal · KNP Mammals/)

  const script = await get('/offline.js')
  assert.equal(await script.text(), source)
  const policy = script.headers.get('content-security-policy')
  assert.match(policy, /manifest-src 'self'/)
  assert.match(policy, /connect-src 'self'/)
  assert.doesNotMatch(policy, /connect-src[^;]*https:/)
  assert.doesNotMatch(policy, /wasm/)
})

test('the saved pages and the four media rows come from the seed', async () => {
  assert.equal(parseUrl(new URL(`${origin}/offline.json`)).key, OFFLINE_KEY)
  const response = await get('/offline.json')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /^application\/json/)
  const manifest = await response.json()
  assert.equal(manifest.largeBytes, LARGE_DOWNLOAD_BYTES)
  assert.equal(manifest.largeBytes, 50 * MIB)
  assert.deepEqual(
    manifest.categories.map((category) => category.label),
    [
      'Images for families (one image for each of up to three species)',
      'Images for species (one image each)',
      'Sound clips for families (one clip for each of up to three species)',
      'Sound clips for species',
    ],
  )
  const families = JSON.parse(store.get('index/families'))
  const species = JSON.parse(store.get('index/species'))
  const offline = JSON.parse(store.get(OFFLINE_KEY))
  assert.equal(offline.kind, 'offline')
  assert.deepEqual(offline.iconic, [])
  assert.equal(families.orders.length, 14)
  assert.equal(families.families.length, 39)
  assert.equal(species.species.length, 143)
  assert.equal(
    offline.pages.length,
    8 +
      families.orders.length +
      families.families.length +
      species.species.length,
  )
  assert.equal(offline.pages.length, 204)
  assert.deepEqual(offline.pages.slice(0, 8), [
    '/',
    '/families',
    '/orders',
    '/species',
    '/facts',
    '/credits',
    '/ask-ai',
    '/sitemap',
  ])
  assert.ok(offline.pages.includes('/order/carnivora'))
  assert.ok(offline.pages.includes('/species/connochaetes-taurinus'))
  const orders = offline.pages.filter((page) => page.startsWith('/order/'))
  const familyPages = offline.pages.filter((page) =>
    page.startsWith('/family/'),
  )
  const speciesPages = offline.pages.filter((page) =>
    page.startsWith('/species/'),
  )
  assert.deepEqual(orders, orders.slice().sort())
  assert.deepEqual(familyPages, familyPages.slice().sort())
  assert.deepEqual(speciesPages, speciesPages.slice().sort())
  assert.equal(manifest.pages.length, offline.pages.length)
  assert.equal(manifest.data.length, manifest.pages.length)
  assert.deepEqual(manifest.data, selectGuideData(manifest.pages))
  assert.ok(manifest.data.includes('/.json'))
  assert.ok(manifest.data.includes('/species.json'))
  assert.ok(manifest.data.includes('/families.json'))
  assert.ok(manifest.data.includes('/species/connochaetes-taurinus.json'))
  assert.equal(
    manifest.data.includes('/offline.json'),
    false,
    'the offline list is saved separately, not as page data',
  )
  const saved = autoCacheUrls(manifest)
  assert.deepEqual(saved, [
    '/offline.json',
    ...manifest.shell,
    ...manifest.pages,
    ...manifest.data,
  ])
  assert.match(source, /manifest\.data \?\? \[\]/)
  for (const url of saved) assert.equal((await get(url)).status, 200, url)
  assert.equal((await get('/offline')).status, 404)
  assert.equal((await get('/offline.md')).status, 404)

  assert.equal(offline.images.length, 108)
  assert.equal(offline.clips.length, 9)
  const wildebeest = offline.images.find(
    (item) => item.slug === 'connochaetes-taurinus',
  )
  assert.equal(wildebeest.url, '/images/connochaetes-taurinus/kruger-front.jpg')
  assert.match(wildebeest.alias, /^https:\/\//)
  assert.equal(Number.isInteger(wildebeest.bytes) && wildebeest.bytes > 0, true)
  const grunt = offline.clips.find(
    (item) => item.slug === 'connochaetes-taurinus',
  )
  assert.equal(grunt.url, '/audio/xeno-canto/XC1148048')
  for (const item of [...offline.images, ...offline.clips]) {
    assert.match(item.url, /^\/(images|audio)\//)
    assert.equal(item.url.includes('/offline/'), false)
    assert.match(item.alias, /^https:\/\//)
    assert.equal(Number.isInteger(item.bytes) && item.bytes > 0, true)
  }
  const byId = Object.fromEntries(
    manifest.categories.map((category) => [category.id, category]),
  )
  assert.equal(byId['family-images'].files.length, 0)
  assert.equal(byId['family-clips'].files.length, 0)
  assert.equal(byId['species-images'].files.length, 108)
  assert.equal(byId['species-clips'].files.length, 9)
  const options = client.resolveOptions(manifest, true)
  const familyImages = options.find((option) => option.id === 'family-images')
  const speciesImages = options.find((option) => option.id === 'species-images')
  const familyClips = options.find((option) => option.id === 'family-clips')
  const speciesClips = options.find((option) => option.id === 'species-clips')
  assert.ok(familyImages.bytes <= speciesImages.bytes)
  assert.ok(familyClips.bytes <= speciesClips.bytes)
  assert.equal(familyImages.bytes, 0)
  assert.ok(speciesImages.bytes > 0)
})

test('a missing offline document still serves the shell', async () => {
  const bare = {
    MAMMALS_KV: {
      get: async (key) =>
        key === OFFLINE_KEY ? null : (store.get(key) ?? null),
    },
  }
  const response = await handleRequest(
    new Request(`${origin}/offline.json`),
    bare,
  )
  assert.equal(response.status, 200)
  const manifest = await response.json()
  assert.equal(manifest.files.length, 0)
  assert.deepEqual(manifest.pages, ['/'])
  assert.deepEqual(manifest.data, ['/.json'])
  assert.ok(autoCacheUrls(manifest).includes('/.json'))
  assert.ok(manifest.shell.includes('/manifest.webmanifest'))
  assert.ok(
    manifest.categories.every((category) => category.files.length === 0),
  )
})

test('a mirror file is optional, and a measured copy uses the hosted address', async () => {
  const empty = deriveOffline(
    [
      {
        slug: 'panthera-leo',
        details: {
          images: [photo('panthera-leo/a.jpg', 'https://example.com/a.jpg')],
        },
      },
    ],
    [],
    [],
    null,
  )
  assert.deepEqual(empty.images, [])
  assert.deepEqual(empty.clips, [])
  assert.deepEqual(empty.iconic, [])
  const manifest = offlineManifest(empty)
  assert.ok(
    manifest.categories.every((category) => category.files.length === 0),
  )

  const lion = {
    slug: 'panthera-leo',
    details: {
      images: [
        photo('panthera-leo/nd.jpg', 'https://example.com/nd.jpg', {
          license: 'CC BY-ND 4.0',
        }),
        photo('panthera-leo/a.jpg', 'https://example.com/a.jpg'),
        photo('panthera-leo/stale.jpg', 'https://example.com/stale.jpg', {
          hosted: false,
        }),
      ],
      calls: [
        {
          recordings: [
            clip('xeno-canto/b', 'https://example.com/b.mp3', 'B'),
            clip('xeno-canto/a', 'https://example.com/a.mp3', 'A', {
              hosted: true,
            }),
            clip('xeno-canto/a2', 'https://example.com/a2.mp3', 'A'),
            clip('xeno-canto/http', 'http://example.com/no.mp3', 'A'),
          ],
        },
      ],
    },
  }
  const mirror = {
    images: {
      'panthera-leo/nd.jpg': {
        bytes: 10,
        source: 'https://example.com/nd.jpg',
      },
      'panthera-leo/a.jpg': {
        bytes: 300000,
        source: 'https://example.com/a.jpg',
      },
      'panthera-leo/stale.jpg': {
        bytes: 100000,
        source: 'https://example.com/old.jpg',
      },
      'panthera-leo/zero.jpg': {
        bytes: 0,
        source: 'https://example.com/a.jpg',
      },
      'panthera-leo/text.jpg': {
        bytes: '12',
        source: 'https://example.com/a.jpg',
      },
    },
    audio: {
      'xeno-canto/b': { bytes: 20, source: 'https://example.com/b.mp3' },
      'xeno-canto/a': { bytes: 400000, source: 'https://example.com/a.mp3' },
      'xeno-canto/a2': { bytes: 15, source: 'https://example.com/a2.mp3' },
      'xeno-canto/http': { bytes: 15, source: 'http://example.com/no.mp3' },
    },
  }
  const doc = deriveOffline(
    [lion],
    [{ slug: 'felidae', iconicSpecies: ['panthera-leo'] }],
    [{ slug: 'carnivora' }],
    mirror,
  )
  assert.deepEqual(doc.iconic, [])
  assert.deepEqual(
    doc.images.map((item) => [item.slug, item.bytes, item.url]),
    [['panthera-leo', 300000, '/images/panthera-leo/a.jpg']],
  )
  assert.equal(doc.images[0].alias, 'https://example.com/a.jpg')
  assert.equal(doc.images[0].url.includes('/offline/'), false)
  assert.deepEqual(
    doc.clips.map((item) => [item.url, item.bytes]),
    [['/audio/xeno-canto/a', 400000]],
  )
  assert.ok(doc.pages.includes('/order/carnivora'))
  assert.ok(doc.pages.includes('/family/felidae'))
  assert.ok(doc.pages.includes('/species/panthera-leo'))

  const bare = deriveOffline(
    [
      {
        slug: 'syncerus-caffer',
        images: [
          photo('syncerus-caffer/side.jpg', 'https://example.com/side.jpg', {
            hosted: false,
          }),
        ],
      },
    ],
    [],
    [],
    {
      images: {
        'syncerus-caffer/side.jpg': {
          bytes: 80,
          source: 'https://example.com/side.jpg',
        },
      },
    },
  )
  assert.equal(bare.images[0].url, '/images/syncerus-caffer/side.jpg')
})

test('a file shared by a family row and a species row is stored once', () => {
  const doc = {
    kind: 'offline',
    pages: ['/'],
    iconic: ['a'],
    images: [
      {
        slug: 'a',
        url: '/images/a.jpg',
        bytes: 100,
        alias: 'https://example.com/a.jpg',
      },
      {
        slug: 'b',
        url: '/images/b.jpg',
        bytes: 50,
        alias: 'https://example.com/b.jpg',
      },
    ],
    clips: [
      {
        slug: 'a',
        url: '/audio/a.mp3',
        bytes: 80,
        alias: 'https://example.com/a.mp3',
      },
    ],
  }
  const manifest = offlineManifest(doc)
  const options = client.resolveOptions(manifest, true)
  const familyImages = options.find((option) => option.id === 'family-images')
  const speciesImages = options.find((option) => option.id === 'species-images')
  const familyClips = options.find((option) => option.id === 'family-clips')
  const speciesClips = options.find((option) => option.id === 'species-clips')
  assert.equal(familyImages.bytes, 100)
  assert.equal(speciesImages.bytes, 150)
  assert.ok(familyImages.bytes <= speciesImages.bytes)
  assert.equal(familyClips.bytes, 80)
  assert.equal(speciesClips.bytes, 80)
  assert.equal(familyImages.includedIn, 'species-images')
  assert.equal(
    manifest.files.filter((file) => file.url === '/images/a.jpg').length,
    1,
  )
  const smaller = offlineManifest({
    ...doc,
    images: doc.images.slice(0, 1),
  })
  assert.notEqual(
    smaller.categories.find((category) => category.id === 'species-images')
      .signature,
    manifest.categories.find((category) => category.id === 'species-images')
      .signature,
  )
  assert.equal(
    smaller.categories.find((category) => category.id === 'family-images')
      .signature,
    manifest.categories.find((category) => category.id === 'family-images')
      .signature,
  )
})

test('an unserved guide path is left out of the saved pages', () => {
  assert.deepEqual(selectGuidePages(['/', '/identify/photo', '/mcp']), ['/'])
  assert.deepEqual(
    selectGuideData(['/', '/identify/photo', '/mcp', '/offline']),
    ['/.json'],
  )
})

test('an installed copy can open a species page from the saved pack with no network', async () => {
  const manifest = await (await get('/offline.json')).json()
  const saved = autoCacheUrls(manifest)
  assert.ok(saved.includes('/species/panthera-leo'))
  assert.ok(saved.includes('/species/panthera-leo.json'))
  assert.ok(saved.includes('/species.json'))
  assert.ok(saved.includes('/families.json'))
  assert.equal(
    manifest.categories.some((category) => category.id === 'species-json'),
    false,
  )

  const needed = [
    '/species/panthera-leo',
    '/species/panthera-leo.json',
    '/species.json',
    '/families.json',
  ]
  const cache = new Map()
  for (const url of needed) {
    const response = await get(url)
    assert.equal(response.status, 200, url)
    cache.set(url, {
      status: response.status,
      type: response.headers.get('content-type'),
      body: await response.text(),
    })
  }

  const offlineGet = (url) => cache.get(url) ?? null
  const page = offlineGet('/species/panthera-leo')
  assert.ok(page, 'the species HTML was saved with the guide')
  assert.match(page.type, /^text\/html/)
  assert.match(page.body, /<h1>Lion<\/h1>/)
  assert.match(page.body, /Panthera leo/)
  assert.doesNotMatch(page.body, /<h1>Not found<\/h1>/)

  const file = offlineGet('/species/panthera-leo.json')
  assert.ok(file, 'the species JSON was saved with the guide')
  assert.match(file.type, /^application\/json/)
  const doc = JSON.parse(file.body)
  assert.equal(doc.slug, 'panthera-leo')
  assert.equal(doc.en ?? doc.commonNames?.en, 'Lion')
  assert.equal(offlineGet('/species/does-not-exist'), null)
})

test('a missing mirror file is an empty list, not a guessed size', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'knp-mammals-mirror-'))
  assert.equal(await readMirror(dir), null)
})

test('sizes are mebibytes to one decimal place', () => {
  assert.equal(client.mebibytes(29 * MIB), '29.0')
  assert.equal(client.sizeText(0, 29 * MIB, false), '(29.0 MiB)')
  assert.equal(
    client.sizeText(2.1 * MIB, 29 * MIB, true),
    '(⬇︎ 2.1 MiB ~7.2% of 29.0 MiB)',
  )
  assert.equal(
    client.sizeText(40 * MIB, 29 * MIB, true).includes('100.0%'),
    true,
  )
})

test('a large download is asked about off wifi, and Data Saver asks always', () => {
  const ask = (type, bytes, saveData = false) =>
    client.downloadQuestion({
      kind: client.connectionKind(type === undefined ? undefined : { type }),
      saveData,
      bytes,
      largeBytes: LARGE_DOWNLOAD_BYTES,
    })
  const large = 240 * MIB
  assert.equal(ask('wifi', large), null)
  assert.equal(ask('ethernet', large), null)
  assert.equal(
    ask('cellular', large),
    "You're on mobile data. Download 240.0 MiB now?",
  )
  assert.equal(ask('cellular', 50 * MIB), null)
  assert.equal(ask('cellular', 50 * MIB + 1)?.includes('50.0 MiB'), true)
  assert.equal(ask(undefined, large), 'This is a 240.0 MiB download. Continue?')
  assert.equal(ask('unknown', large), 'This is a 240.0 MiB download. Continue?')
  assert.equal(ask(undefined, 20 * MIB), null)
  assert.equal(
    ask('wifi', MIB, true),
    'Data Saver is on. Download 1.0 MiB now?',
  )
  assert.match(ask('cellular', MIB, true), /mobile data and Data Saver is on/)
  assert.equal(
    client.connectionKind({ effectiveType: '2g', downlink: 0.1 }),
    'unknown',
  )
  assert.doesNotMatch(source, /connection\??\.(effectiveType|downlink)/)
})

test('chunk ranges cover a file exactly', () => {
  assert.deepEqual(client.chunkRanges(10, 4), [
    { start: 0, end: 3 },
    { start: 4, end: 7 },
    { start: 8, end: 9 },
  ])
  const bytes = 50 * MIB + 3
  const ranges = client.chunkRanges(bytes)
  assert.equal(ranges[0].start, 0)
  assert.equal(ranges.at(-1).end, bytes - 1)
  for (let index = 1; index < ranges.length; index += 1)
    assert.equal(ranges[index].start, ranges[index - 1].end + 1)
  const covered = ranges.reduce(
    (sum, range) => sum + (range.end - range.start + 1),
    0,
  )
  assert.equal(covered, bytes)
})

test('what is ticked follows the files on the device', () => {
  const file = (url) => ({ url, bytes: 10 })
  const option = {
    id: 'species-images',
    signature: 'b',
    files: [file('/a'), file('/b')],
  }
  const part = {
    id: 'family-images',
    includedIn: 'species-images',
    signature: 'p',
    files: [file('/a')],
  }
  const state = client.optionState
  const all = new Set(['/a', '/b'])
  assert.equal(state(option, all, {}), 'done')
  assert.equal(
    state(option, new Set(['/a']), {
      'species-images': { wanted: true, done: null },
    }),
    'resume',
  )
  assert.equal(
    state(option, new Set(), { 'species-images': { wanted: true, done: 'b' } }),
    'off',
  )
  assert.equal(
    state(option, new Set(['/a']), {
      'species-images': { wanted: true, done: 'a' },
    }),
    'update',
  )
  assert.equal(state(option, new Set(['/a']), {}), 'off')
  assert.equal(
    state(part, new Set(), { 'species-images': { wanted: true, done: null } }),
    'included',
  )
  assert.equal(state({ id: 'x', files: [] }, all, {}), 'unavailable')
  assert.deepEqual(
    client.removableFiles(part, [option, part], {
      'species-images': { wanted: true },
    }),
    [],
  )
  assert.deepEqual(
    client
      .removableFiles(option, [option, part], {
        'family-images': { wanted: true },
      })
      .map((item) => item.url),
    ['/b'],
  )
})
