import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { gunzipSync } from 'node:zlib'
import { collectEntries } from '../scripts/seed.mjs'
import {
  NO_OBSERVATION_REFS,
  isObservationRef,
  publicDetails,
  withoutObservationRefs,
} from '../src/labels.js'
import { handleRequest } from '../src/worker.js'
import { repoRoot } from './helpers.js'

const HIDDEN = [...NO_OBSERVATION_REFS].sort()

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (pathname, init) =>
  handleRequest(new Request(`${origin}${pathname}`, init), env)
const parse = (key) => {
  const value = store.get(key)
  return typeof value === 'string' ? JSON.parse(value) : value
}

/** Observation addresses and ids stored for the three species. */
const tokensFrom = (value, into) => {
  if (Array.isArray(value)) {
    for (const item of value) tokensFrom(item, into)
    return
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) tokensFrom(item, into)
    return
  }
  if (typeof value !== 'string' || !isObservationRef(value)) return
  into.add(value)
  const obs = value.match(/\/observations\/(\d+)/gi) || []
  for (const match of obs) into.add(match.replace(/^\/observations\//i, ''))
  const xc = value.match(/xeno-canto\.org\/(XC)?(\d+)/i)
  if (xc) {
    into.add(xc[2])
    into.add(`XC${xc[2]}`)
  }
  const photos = value.match(/\/photos\/(\d+)/g) || []
  for (const match of photos) into.add(match)
}

const sourceTokens = new Set()
const detailsDir = path.join(repoRoot, 'data', 'species', 'details')
for (const slug of HIDDEN) {
  const details = JSON.parse(
    await readFile(path.join(detailsDir, `${slug}.json`), 'utf8'),
  )
  tokensFrom(details, sourceTokens)
}
assert.ok(sourceTokens.size > 0)

const hits = (body, label) => {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  const found = []
  for (const token of sourceTokens) {
    if (text.includes(token)) found.push(token)
  }
  // A visitor page must also not grow a new observation address for them.
  const extras = text.match(
    /inaturalist\.org\/(?:observations|photos)\/\d+|inaturalist-open-data\.s3\.amazonaws\.com\/photos\/\d+|xeno-canto\.org\/(?:XC)?\d+/gi,
  )
  // Those patterns are only a leak when they appear on a page about one of
  // the three, or in a document that lists them (credits, search-samples,
  // identify). Callers pass `strict` for those.
  return { found, extras: extras ?? [], text, label }
}

const assertClean = (body, label, { allowOtherObservations = false } = {}) => {
  const { found, extras } = hits(body, label)
  assert.deepEqual(
    found,
    [],
    `${label} still names an observation of the three`,
  )
  if (!allowOtherObservations)
    assert.deepEqual(extras, [], `${label} still has an observation address`)
}

test('observation addresses are dropped, author and licence stay', () => {
  const commons = {
    key: 'diceros-bicornis/kruger-lying.jpg',
    hosted: true,
    author: 'Bernard DUPONT',
    license: 'CC BY-SA 2.0',
    source:
      'https://commons.wikimedia.org/wiki/File:Black_Rhino_(Diceros_bicornis)_(6025386757).jpg',
    fileUrl: 'https://thumb.wikimedia.org/wikipedia/commons/x.jpg',
  }
  const inat = {
    key: 'diceros-bicornis/kruger-browsing.jpg',
    hosted: true,
    author: 'Henry de Lange',
    license: 'CC BY 4.0',
    source: 'https://www.inaturalist.org/observations/10675774',
    fileUrl:
      'https://inaturalist-open-data.s3.amazonaws.com/photos/14904587/large.jpg',
    observation_id: '10675774',
  }
  assert.equal(withoutObservationRefs('panthera-leo', inat), inat)
  const cleaned = withoutObservationRefs('diceros-bicornis', inat)
  assert.equal(cleaned.author, 'Henry de Lange')
  assert.equal(cleaned.license, 'CC BY 4.0')
  assert.equal(cleaned.source, undefined)
  assert.equal(cleaned.fileUrl, undefined)
  assert.equal(cleaned.observation_id, undefined)
  const kept = withoutObservationRefs('diceros-bicornis', commons)
  assert.equal(kept.source, commons.source)
  assert.equal(kept.fileUrl, commons.fileUrl)
  const published = publicDetails('diceros-bicornis', {
    images: [inat, commons],
    calls: [{ recordings: [{ source: 'https://xeno-canto.org/99' }] }],
  })
  assert.equal(published.images[0].source, undefined)
  assert.equal(published.images[1].source, commons.source)
  assert.equal(published.calls[0].recordings[0].source, undefined)
})

test('every visitor surface hides observation refs for the rhinos and the pangolin', async () => {
  const docs = HIDDEN.map((slug) => parse(`species/${slug}`))
  const families = [...new Set(docs.map((doc) => doc.familySlug))]
  const orders = [...new Set(docs.map((doc) => doc.orderSlug))]
  const names = docs.flatMap((doc) => [doc.en, doc.latin, doc.slug])

  const paths = [
    '/',
    '/credits',
    '/credits.md',
    '/credits.json',
    '/facts',
    '/facts.md',
    '/facts.json',
    '/llms.txt',
    '/sitemap',
    '/sitemap.xml',
    '/offline.json',
    '/mcp/server-card',
    '/identify',
    '/identify.md',
    '/identify.json',
    '/identify/photo',
    '/identify/photo.md',
    '/identify/photo.json',
    '/identify/sound',
    '/identify/sound.md',
    '/identify/sound.json',
    ...HIDDEN.flatMap((slug) => [
      `/species/${slug}`,
      `/species/${slug}.md`,
      `/species/${slug}.json`,
    ]),
    ...families.flatMap((slug) => [
      `/family/${slug}`,
      `/family/${slug}.md`,
      `/family/${slug}.json`,
    ]),
    ...orders.flatMap((slug) => [
      `/order/${slug}`,
      `/order/${slug}.md`,
      `/order/${slug}.json`,
    ]),
    ...names.flatMap((name) => [
      `/search?q=${encodeURIComponent(name)}`,
      `/search.md?q=${encodeURIComponent(name)}`,
      `/search.json?q=${encodeURIComponent(name)}`,
    ]),
  ]

  for (const pathname of paths) {
    const response = await get(pathname)
    assert.equal(response.status, 200, pathname)
    const body = await response.text()
    const onlyThese =
      /^\/species\/(?:ceratotherium-simum|diceros-bicornis|smutsia-temminckii)(?:\.(?:md|json))?$/.test(
        pathname,
      )
    assertClean(body, pathname, { allowOtherObservations: !onlyThese })
  }

  for (const key of [
    'index/credits',
    'index/search-samples',
    'index/identify',
    'index/facts',
    ...HIDDEN.map((slug) => `species/${slug}`),
  ]) {
    assertClean(parse(key), key, {
      allowOtherObservations: !key.startsWith('species/'),
    })
  }

  // Author and licence remain, and Wikimedia sources stay.
  const black = await (await get('/species/diceros-bicornis')).text()
  assert.match(black, /Henry de Lange/)
  assert.match(black, /CC BY 4\.0/)
  assert.match(black, /Bernard DUPONT/)
  assert.match(black, /commons\.wikimedia\.org/)
  const credits = await (await get('/credits')).text()
  assert.match(credits, /Henry de Lange/)
  assert.doesNotMatch(credits, /inaturalist\.org\/observations\/10675774/)
  const pangolin = parse('species/smutsia-temminckii')
  for (const image of pangolin.details.images) {
    assert.equal(image.author && image.license ? true : false, true)
    assert.equal(image.source, undefined)
    assert.equal(image.fileUrl, undefined)
  }
})

test('the training lists keep no observation id for the three species', async () => {
  const rows = gunzipSync(
    await readFile(path.join(repoRoot, 'data/identify/photo-training.csv.gz')),
  )
    .toString('utf8')
    .trim()
    .split('\n')
  const header = rows[0].split(',')
  const slugAt = header.indexOf('slug')
  const obsAt = header.indexOf('observation_id')
  let hidden = 0
  for (const line of rows.slice(1)) {
    const cols = line.split(',')
    if (!HIDDEN.includes(cols[slugAt])) continue
    hidden += 1
    assert.equal(cols[obsAt], '', cols[slugAt])
  }
  assert.ok(hidden > 0)
  const files = await readdir(detailsDir)
  assert.ok(files.includes('ceratotherium-simum.json'))
})
