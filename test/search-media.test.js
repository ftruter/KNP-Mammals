import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'
import { collectEntries } from '../scripts/seed.mjs'
import { NO_OBSERVATION_REFS } from '../src/labels.js'
import {
  loadSearchRecords,
  recordsFromIndexes,
  searchRecords,
  searchSample,
} from '../src/search.js'
import { buildSearchSamples, sampleFor } from '../src/search-samples.js'
import { handleRequest } from '../src/worker.js'
import { repoRoot } from './helpers.js'

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (path) => handleRequest(new Request(`${origin}${path}`), env)

const cards = (html) =>
  html
    .split('<li class="search-result">')
    .slice(1)
    .map((card) => card.split('</ol>')[0])
const cardFor = (html, slug) =>
  cards(html).find((card) => card.includes(`href="/species/${slug}"`)) ?? ''

test('seed writes one photograph and one call for each species that has them', () => {
  const doc = JSON.parse(store.get('index/search-samples'))
  const wildebeest = doc.samples['connochaetes-taurinus']
  assert.equal(wildebeest.image.key, 'connochaetes-taurinus/kruger-front.jpg')
  assert.equal(wildebeest.call.key, 'xeno-canto/XC1148048')
  assert.equal(wildebeest.call.type, 'call')
  const index = JSON.parse(store.get('index/species')).species
  const withImage = index.filter((row) => doc.samples[row.slug]?.image)
  const withCall = index.filter((row) => doc.samples[row.slug]?.call)
  assert.ok(withImage.length > 90)
  assert.equal(withCall.length, 9)
  assert.equal(doc.samples['mops-ansorgei'], undefined)
  for (const sample of Object.values(doc.samples))
    assert.deepEqual(
      Object.keys(sample).filter((field) => !['image', 'call'].includes(field)),
      [],
    )
})

test('a sample keeps only what a page needs to load and credit the file', () => {
  const details = {
    images: [
      {
        key: 'x/a.jpg',
        fileUrl: 'https://example.org/a.jpg',
        hosted: true,
        license: 'CC0',
        author: 'A',
        source: 'https://example.org/a',
        caption: 'not kept',
        view: 'running',
      },
    ],
    calls: [
      { type: 'alarm', description: 'not kept', recordings: [] },
      {
        type: 'contact',
        recordings: [
          {
            key: 'xeno-canto/XC9',
            fileUrl: 'https://xeno-canto.org/sounds/x.mp3',
            license: 'CC BY 4.0',
            author: 'B',
            source: 'https://xeno-canto.org/9',
            quality: 'A',
          },
        ],
      },
    ],
  }
  const sample = sampleFor(details)
  assert.equal(sample.image.caption, undefined)
  assert.equal(sample.call.quality, undefined)
  assert.equal(sample.call.type, 'contact')
  assert.equal(sampleFor({}), null)
  assert.deepEqual(
    [...Object.keys(buildSearchSamples(new Map([['a', {}]])).samples)],
    [],
  )
})

test('a species card shows its photograph, its credit and one play button', async () => {
  const html = await (await get('/search?q=wildebeest')).text()
  const card = cardFor(html, 'connochaetes-taurinus')
  assert.match(
    card,
    /<figure class="search-photo"><img draggable="false" src="\/images\/connochaetes-taurinus\/kruger-front\.jpg" alt="Adult blue wildebeest[^"]*" loading="lazy" decoding="async">|<figure class="search-photo">\n<img [^>]*src="\/images\/connochaetes-taurinus\/kruger-front\.jpg"/,
  )
  assert.match(card, /<figcaption>[\s\S]*Bernard DUPONT/)
  assert.equal([...card.matchAll(/class="call-player"/g)].length, 1)
  assert.match(card, /data-play="Play call" data-stop="Stop call"/)
  assert.match(
    card,
    /<audio controls preload="none" src="\/audio\/xeno-canto\/XC1148048"/,
  )
  assert.match(card, /xeno-canto catalogue number/)
  assert.doesNotMatch(card, /Quality [A-E]/)
  assert.doesNotMatch(card, /<h3><a [^>]*>[^<]*<\/a><\/h3>[\s\S]*<h3>/)
})

test('a species with a photograph and no clip has no player', async () => {
  const html = await (await get('/search?q=impala')).text()
  const card = cardFor(html, 'aepyceros-melampus')
  assert.match(card, /class="search-photo"/)
  assert.match(card, /src="\/images\/aepyceros-melampus\//)
  assert.doesNotMatch(card, /call-player|<audio/)
})

test('a species with no photograph keeps its shape with a note, and families stay names', async () => {
  const html = await (await get('/search?q=mops')).text()
  const card = cardFor(html, 'mops-ansorgei')
  assert.match(card, /class="search-photo is-missing"/)
  assert.match(card, /No photograph yet\./)
  assert.doesNotMatch(card, /<img|call-player/)
  const family = cards(
    await (await get('/search?q=orycteropodidae')).text(),
  ).filter((item) => item.includes('href="/family/'))
  assert.ok(family.length > 0)
  for (const item of family)
    assert.doesNotMatch(item, /search-photo|call-player|<img/)
})

test('the text outputs stay text and do not read the samples', async () => {
  for (const path of ['/search.json?q=lion', '/search.md?q=lion']) {
    const text = await (await get(path)).text()
    assert.doesNotMatch(
      text,
      /call-player|search-photo|\/audio\/|\/images\//,
      path,
    )
  }
  const data = await (await get('/search.json?q=lion')).json()
  for (const result of data.results)
    assert.deepEqual(Object.keys(result).sort(), [
      'afrikaansName',
      'englishName',
      'kind',
      'pages',
      'scientificName',
    ])
  const keys = []
  const watched = {
    MAMMALS_KV: {
      get: async (key) => {
        keys.push(key)
        return store.get(key) ?? null
      },
    },
  }
  await handleRequest(new Request(`${origin}/search.json?q=lion`), watched)
  assert.deepEqual(keys.sort(), ['index/families', 'index/species'])
  keys.length = 0
  await handleRequest(new Request(`${origin}/search?q=lion`), watched)
  assert.deepEqual(keys.sort(), [
    'index/families',
    'index/search-samples',
    'index/species',
  ])
})

test('a missing samples document leaves the cards as names', async () => {
  const bare = {
    MAMMALS_KV: {
      get: async (key) =>
        key === 'index/search-samples' ? null : (store.get(key) ?? null),
    },
  }
  const response = await handleRequest(
    new Request(`${origin}/search?q=wildebeest`),
    bare,
  )
  assert.equal(response.status, 200)
  const card = cardFor(await response.text(), 'connochaetes-taurinus')
  assert.match(card, /search-photo is-missing/)
  assert.doesNotMatch(card, /call-player/)
  const broken = {
    MAMMALS_KV: {
      get: async (key) =>
        key === 'index/search-samples' ? '{' : (store.get(key) ?? null),
    },
  }
  const records = await loadSearchRecords(broken.MAMMALS_KV, { samples: true })
  assert.ok(records.length > 100)
})

test('rhino and pangolin clips never show a catalogue number, and an ND file is not shown', () => {
  const species = {
    species: ['ceratotherium-simum', 'smutsia-temminckii', 'x-other'].map(
      (slug) => ({ slug, latin: slug, en: slug, af: null }),
    ),
  }
  const clip = {
    key: 'xeno-canto/XC77',
    hosted: false,
    fileUrl: 'https://xeno-canto.org/sounds/77.mp3',
    license: 'CC BY-NC 4.0',
    author: 'A B',
    source: 'https://xeno-canto.org/77',
  }
  const samples = {
    samples: Object.fromEntries(
      species.species.map(({ slug }) => [slug, { call: clip }]),
    ),
  }
  samples.samples['x-other'].image = {
    key: 'x/y.jpg',
    hosted: true,
    license: 'CC BY-ND 4.0',
  }
  const records = recordsFromIndexes(species, null, samples)
  const [rhino, pangolin, other] = [
    'ceratotherium-simum',
    'smutsia-temminckii',
    'x-other',
  ].map((slug) => {
    const found = searchRecords(records, slug, 5, origin).results[0]
    return JSON.stringify(searchSample(found))
  })
  assert.equal(NO_OBSERVATION_REFS.has('ceratotherium-simum'), true)
  assert.doesNotMatch(rhino, /XC77|catalogue/)
  assert.doesNotMatch(pangolin, /XC77|catalogue/)
  assert.match(other, /XC77/)
  assert.equal(JSON.parse(other).image, null)
})

test('the page script shows the note when a search photograph fails to load', async () => {
  const handlers = {}
  const classes = new Set()
  const img = {
    complete: false,
    naturalWidth: 0,
    addEventListener: (type, fn) => (handlers[type] = fn),
  }
  const photo = {
    querySelector: () => img,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
  }
  const source = (
    await readFile(path.join(repoRoot, 'src/client/app.js'), 'utf8')
  ).replace('export const compareSortKeys', 'const compareSortKeys')
  vm.runInNewContext(source, {
    document: {
      querySelectorAll: (selector) =>
        selector === '.search-photo' ? [photo] : [],
      querySelector: () => null,
      addEventListener() {},
      documentElement: { classList: { add() {} } },
    },
    window: {
      location: { origin: 'https://m.test', href: 'https://m.test/' },
      matchMedia: () => ({ matches: false }),
      requestAnimationFrame: (fn) => fn(),
      addEventListener() {},
    },
    URL,
    URLSearchParams,
    console,
  })
  handlers.error()
  assert.equal(classes.has('is-missing'), true)
  handlers.load()
  assert.equal(classes.has('is-missing'), false)
})
