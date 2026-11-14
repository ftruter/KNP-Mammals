import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { deploy, deployWorkerArgs } from '../scripts/deploy.mjs'
import {
  dataVersion,
  namespaceIsSet,
  planKvUpdate,
  publishKv,
} from '../scripts/publish-kv.mjs'
import { collectEntries, deriveDocuments } from '../scripts/seed.mjs'

const readData = async (name) =>
  JSON.parse(await readFile(new URL(`../data/${name}`, import.meta.url)))

test('the payload matches the counts recorded in species-list.json', async () => {
  const list = await readData('species-list.json')
  const entries = await collectEntries()
  const count = (prefix) =>
    entries.filter((entry) => entry.key.startsWith(prefix)).length
  assert.equal(count('species/'), list.counts.species)
  assert.equal(count('family/'), list.counts.families)
  const index = JSON.parse(
    entries.find((entry) => entry.key === 'index/families').value,
  )
  assert.equal(index.counts.species, list.counts.species)
  assert.equal(index.counts.families, list.counts.families)
  assert.equal(index.counts.orders, list.counts.orders)
  assert.equal(index.orders.length, list.counts.orders)
  assert.equal(count('order/'), list.counts.orders)
  for (const order of index.orders) {
    const doc = JSON.parse(
      entries.find((entry) => entry.key === `order/${order.slug}`).value,
    )
    assert.equal(
      doc.species.length,
      list.counts.byOrder[order.latin],
      order.latin,
    )
    assert.equal(doc.species.length, order.speciesCount)
    assert.equal(doc.families.length, order.familyCount)
  }
  const listed = index.families.reduce(
    (sum, family) => sum + family.speciesCount,
    0,
  )
  assert.equal(listed, list.counts.species)
})

test('candidates and excluded species are not published', async () => {
  const list = await readData('species-list.json')
  const keys = new Set((await collectEntries()).map((entry) => entry.key))
  const published = new Set(list.species.map((species) => species.slug))
  for (const species of [...list.candidates, ...list.excluded]) {
    if (published.has(species.slug)) continue
    assert.ok(!keys.has(`species/${species.slug}`), species.slug)
  }
})

test('bad data stops the run', () => {
  const families = [
    { slug: 'felidae', latin: 'Felidae', en: 'Cats', order: 'Carnivora' },
  ]
  const lion = {
    slug: 'panthera-leo',
    latin: 'Panthera leo',
    en: 'Lion',
    familySlug: 'felidae',
  }
  const run = (species, details) =>
    deriveDocuments({ families, list: { species }, details })
  assert.throws(() => run([{ ...lion, familySlug: 'canidae' }]), /canidae/)
  assert.throws(() => run([lion, lion]), /duplicate species/)
  assert.throws(() => run([{ ...lion, slug: 'Panthera Leo' }]), /bad slug/)
  assert.throws(
    () => run([lion], new Map([['panthera-pardus', {}]])),
    /panthera-pardus/,
  )
  const documents = run(
    [lion],
    new Map([['panthera-leo', { summary: 'A cat.' }]]),
  )
  assert.equal(documents.get('species/panthera-leo').details.summary, 'A cat.')
  assert.equal(documents.get('family/felidae').species[0].af, null)
  assert.equal(documents.get('family/felidae').species[0].researched, true)
})

test('details gain names for the animals they point at', () => {
  const families = [
    { slug: 'felidae', latin: 'Felidae', en: 'Cats', order: 'Carnivora' },
  ]
  const cat = (slug, latin, en) => ({ slug, latin, en, familySlug: 'felidae' })
  const details = new Map([
    [
      'panthera-leo',
      {
        similar: [{ slug: 'panthera-pardus', note: 'Spotted.' }],
        predators: [{ slug: null, en: 'Nile crocodile' }, { slug: 'no-such' }],
        population: { unit: 'individuals', estimate: { low: 1, high: 3 } },
      },
    ],
  ])
  const documents = deriveDocuments({
    families,
    list: {
      species: [
        cat('panthera-leo', 'Panthera leo', 'Lion'),
        cat('panthera-pardus', 'Panthera pardus', 'Leopard'),
      ],
    },
    details,
  })
  const lion = documents.get('species/panthera-leo')
  assert.deepEqual(lion.details.similar, [
    {
      slug: 'panthera-pardus',
      note: 'Spotted.',
      en: 'Leopard',
      latin: 'Panthera pardus',
      listed: true,
    },
  ])
  assert.deepEqual(
    lion.details.predators.map((item) => item.listed),
    [false, false],
  )
  const rows = documents.get('index/species').species
  assert.deepEqual(rows[0].population, { low: 1, high: 3 })
  assert.equal(rows[1].population, null)
})

test('a publish plan deletes only managed keys that are gone', () => {
  const entries = [{ key: 'species/a', value: '{}' }]
  const plan = planKvUpdate(entries, [
    'species/a',
    'species/b',
    'order/gone',
    'other/c',
  ])
  assert.deepEqual(plan.delete, ['order/gone', 'species/b'])
  assert.equal(planKvUpdate(entries, null).delete, null)
})

test('a dry run reports the keys and calls nothing', async () => {
  let out = ''
  const result = await publishKv({
    dryRun: true,
    run: () => assert.fail('wrangler must not run'),
    stdout: (text) => (out += text),
  })
  const report = JSON.parse(out)
  assert.equal(report.dataVersion, result.version)
  assert.equal(report.dataVersion, dataVersion(await collectEntries()))
  assert.equal(report.binding, 'MAMMALS_KV')
})

test('the namespace placeholder is recognised', () => {
  assert.equal(namespaceIsSet('id = "REPLACE_WITH_KV_NAMESPACE_ID"'), false)
  assert.equal(namespaceIsSet(`id = "${'a'.repeat(32)}"`), true)
})

test('deploy passes the data version and publish time to wrangler', async () => {
  const version = 'a'.repeat(64)
  const calls = []
  await deploy({
    publish: async () => ({ version, publishedAt: 5 }),
    run: async (args) => calls.push(args),
  })
  assert.deepEqual(calls, [deployWorkerArgs(version, 5)])
  assert.ok(calls[0].includes(`DATA_VERSION:${version}`))
  assert.throws(() => deployWorkerArgs('nope', 5))
})
