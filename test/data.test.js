import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { licenceAllowed } from '../scripts/publish-media.mjs'
import { loadStore, readJson, repoRoot } from './helpers.js'

/**
 * Schema and content rules for data/ and the KV payload from
 * collectEntries(). docs/schema.md is the written schema. There is no
 * JSON Schema file in this batch.
 *
 * Caption and alt wording are not checked. A caption audit is editing
 * those strings, and this file must not lock them. The Kruger place-name
 * rule for captions is left for that audit. Rhino and pangolin captions
 * stay covered in test/media.test.js.
 */

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.wrangler'])
const KNOWN_STATUS = new Set(['resident'])
const REF_FIELDS = ['similar', 'predators', 'prey']

const detailsDir = path.join(repoRoot, 'data', 'species', 'details')

const slugFromScientificName = (name) =>
  name.trim().toLowerCase().replaceAll(/\s+/g, '-')

const walkFiles = async (dir) => {
  const found = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await walkFiles(full)))
    else found.push(full)
  }
  return found
}

const readDetails = async () => {
  const names = (await readdir(detailsDir))
    .filter((name) => name.endsWith('.json'))
    .sort()
  const details = new Map()
  for (const name of names) {
    const text = await readFile(path.join(detailsDir, name), 'utf8')
    details.set(name.slice(0, -5), { text, doc: JSON.parse(text) })
  }
  return details
}

const boundsOk = (estimate, where) => {
  assert.ok(
    estimate && typeof estimate === 'object' && !Array.isArray(estimate),
    where,
  )
  const { low, high } = estimate
  const empty = low === null && high === null
  const numbers = Number.isInteger(low) && Number.isInteger(high)
  assert.ok(empty || numbers, `${where} bounds`)
  if (numbers) assert.ok(low <= high, `${where} ${low} > ${high}`)
}

const unitOk = (unit, where) =>
  assert.ok(unit === 'individuals' || unit === null, `${where} unit ${unit}`)

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0

const sameName = (left, right) =>
  left.localeCompare(right, 'en', { sensitivity: 'accent' }) === 0

const mediaItems = (doc) => [
  ...(Array.isArray(doc.images) ? doc.images : []).map((item) => [
    'images',
    item,
  ]),
  ...(Array.isArray(doc.calls) ? doc.calls : []).flatMap((call) =>
    (Array.isArray(call.recordings) ? call.recordings : []).map((item) => [
      'audio',
      item,
    ]),
  ),
]

const details = await readDetails()
const list = await readJson('data/species-list.json')
const families = await readJson('data/families.json')
const mirror = await readJson('data/media/mirror.json')
const { records } = await loadStore()
const familySlugs = new Set(families.map((family) => family.slug))
const bySlug = new Map(list.species.map((species) => [species.slug, species]))

test('every listed species has one details file, and every details file is listed', () => {
  const listed = list.species.map((species) => species.slug)
  assert.equal(new Set(listed).size, listed.length)
  assert.deepEqual([...details.keys()].sort(), [...listed].sort())
})

test('a slug matches its file and scientific name, and names a known family', () => {
  assert.equal(familySlugs.size, families.length)
  for (const row of list.species) {
    const loaded = details.get(row.slug)
    assert.ok(loaded, row.slug)
    const { doc } = loaded
    assert.equal(doc.slug, row.slug, row.slug)
    assert.equal(doc.scientificName, row.latin, row.slug)
    assert.equal(slugFromScientificName(doc.scientificName), doc.slug, row.slug)
    assert.equal(doc.family, row.familySlug, row.slug)
    assert.ok(familySlugs.has(doc.family), `${row.slug} ${doc.family}`)
  }
})

test('a details document has the published shape', () => {
  for (const [slug, { doc }] of details) {
    const row = bySlug.get(slug)
    assert.equal(doc.kind, 'species', slug)
    assert.equal(typeof doc.sampleData, 'boolean', slug)
    assert.ok(nonEmpty(doc.commonNames?.en), slug)
    assert.equal(doc.commonNames.en, row.en, slug)
    assert.ok(Array.isArray(doc.gaps) && doc.gaps.length > 0, slug)
    for (const gap of doc.gaps)
      assert.ok(typeof gap === 'string' && gap.trim(), `${slug} gap`)
    if (doc.status != null)
      assert.ok(KNOWN_STATUS.has(doc.status), `${slug} ${doc.status}`)
    if (doc.monthsPresent == null) continue
    assert.ok(Array.isArray(doc.monthsPresent), slug)
    const seen = new Set()
    for (const month of doc.monthsPresent) {
      assert.ok(
        Number.isInteger(month) && month >= 1 && month <= 12,
        `${slug} month ${month}`,
      )
      assert.equal(seen.has(month), false, `${slug} month ${month}`)
      seen.add(month)
    }
  }
})

test('a population is a pair of integers or both empty', () => {
  for (const [slug, { doc }] of details) {
    const population = doc.population
    assert.ok(population && typeof population === 'object', slug)
    boundsOk(population.estimate, slug)
    unitOk(population.unit, slug)
    if (population.previousEstimates == null) continue
    assert.ok(Array.isArray(population.previousEstimates), slug)
    for (const [index, previous] of population.previousEstimates.entries()) {
      const where = `${slug} previous ${index}`
      boundsOk(previous.estimate, where)
      unitOk(previous.unit, where)
    }
  }
})

test('published data does not contain the #VALUE! spreadsheet error', async () => {
  const files = await walkFiles(path.join(repoRoot, 'data'))
  const hits = []
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    if (text.includes('#VALUE!')) hits.push(path.relative(repoRoot, file))
  }
  assert.deepEqual(hits, [])
})

test('photographs and recordings name an author, a source, and an allowed licence', () => {
  assert.equal(licenceAllowed('CC BY-ND 4.0'), false)
  assert.equal(licenceAllowed('CC BY-NC-ND 4.0'), false)
  assert.equal(licenceAllowed('All rights reserved'), false)
  let checked = 0
  for (const [slug, { doc }] of details) {
    for (const [group, item] of mediaItems(doc)) {
      const where = `${slug} ${group} ${item?.key}`
      assert.ok(nonEmpty(item?.author), where)
      assert.ok(nonEmpty(item?.source), where)
      assert.ok(nonEmpty(item?.license), where)
      assert.equal(licenceAllowed(item.license), true, where)
      assert.equal(typeof item.hosted, 'boolean', where)
      checked += 1
    }
  }
  assert.ok(checked > 0)
})

test('hosted photographs and recordings are exactly the media mirror', () => {
  assert.equal(typeof mirror.images, 'object')
  assert.equal(typeof mirror.audio, 'object')
  const hosted = { images: new Set(), audio: new Set() }
  const counts = { images: 0, audio: 0 }
  for (const [slug, { doc }] of details) {
    for (const [group, item] of mediaItems(doc)) {
      if (item.hosted !== true) continue
      const where = `${slug} ${group} ${item.key}`
      assert.ok(nonEmpty(item.key), where)
      assert.equal(hosted[group].has(item.key), false, where)
      hosted[group].add(item.key)
      counts[group] += 1
    }
  }
  for (const group of ['images', 'audio']) {
    const entries = mirror[group]
    assert.deepEqual(
      [...hosted[group]].sort(),
      Object.keys(entries).sort(),
      group,
    )
    assert.equal(hosted[group].size, counts[group], group)
    const prefix = group === 'images' ? 'image/' : 'audio/'
    for (const [key, entry] of Object.entries(entries)) {
      const where = `${group} ${key}`
      assert.ok(Number.isInteger(entry.bytes) && entry.bytes > 0, where)
      assert.match(entry.sha256, /^[a-f0-9]{64}$/, where)
      assert.ok(
        typeof entry.contentType === 'string' &&
          entry.contentType.startsWith(prefix),
        where,
      )
      assert.ok(
        typeof entry.source === 'string' && entry.source.startsWith('https://'),
        where,
      )
    }
  }
})

test('the repository contains no PDF file', async () => {
  const files = await walkFiles(repoRoot)
  const pdfs = files
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .map((file) => path.relative(repoRoot, file))
  assert.deepEqual(pdfs, [])
})

test('researched is true exactly when a details file exists, and a listed animal is marked listed', () => {
  const index = JSON.parse(records['index/species'])
  const checkRow = (row, where) => {
    assert.equal(row.researched, details.has(row.slug), `${where} ${row.slug}`)
  }
  for (const row of index.species) checkRow(row, 'index')
  for (const family of families) {
    const doc = JSON.parse(records[`family/${family.slug}`])
    for (const row of doc.species) checkRow(row, family.slug)
  }
  for (const order of JSON.parse(records['index/families']).orders) {
    const doc = JSON.parse(records[`order/${order.slug}`])
    for (const row of doc.species) checkRow(row, order.slug)
  }
  for (const row of list.species) {
    const doc = JSON.parse(records[`species/${row.slug}`])
    assert.equal(Boolean(doc.details), details.has(row.slug), row.slug)
    if (!doc.details) continue
    for (const field of REF_FIELDS) {
      const items = doc.details[field]
      assert.ok(Array.isArray(items), `${row.slug} ${field}`)
      for (const item of items) {
        const inList = Boolean(item.slug) && bySlug.has(item.slug)
        const where = `${row.slug} ${field} ${item.slug}`
        assert.equal(item.listed, inList, where)
        if (!inList) continue
        assert.equal(item.latin, bySlug.get(item.slug).latin, where)
      }
    }
  }
})

test('a species Afrikaans name matches the checklist, and a family name may be absent', () => {
  // A few details files capitalise the checklist name differently
  // ("Dakvlermuis" and "dakvlermuis"). Those files are edited elsewhere,
  // so the names must match ignoring case and this test does not lock
  // the spelling.
  const indexed = new Map(
    JSON.parse(records['index/species']).species.map((species) => [
      species.slug,
      species,
    ]),
  )
  for (const row of list.species) {
    assert.ok(nonEmpty(row.af), row.slug)
    const { doc } = details.get(row.slug)
    assert.ok(nonEmpty(doc.commonNames?.af), row.slug)
    assert.ok(sameName(doc.commonNames.af, row.af), row.slug)
    const published = JSON.parse(records[`species/${row.slug}`])
    assert.equal(published.af, row.af, row.slug)
    assert.equal(indexed.get(row.slug).af, row.af, row.slug)
  }
  for (const family of families) {
    const af = family.af
    assert.ok(af === null || nonEmpty(af), family.slug)
    const published = JSON.parse(records[`family/${family.slug}`])
    assert.equal(published.af ?? null, af, family.slug)
  }
})
