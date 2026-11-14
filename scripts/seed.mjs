/**
 * The KV payload for data/.
 *
 *   node scripts/seed.mjs
 *   pnpm run kv:dry-run
 *   pnpm run deploy
 *
 * Nothing under data/ is rewritten. The payload is derived on each run:
 *
 *   data/families.json                 → family/<slug>, index/families
 *   data/species-list.json (species)   → species/<slug>, index/species
 *   data/species/details/<slug>.json   → merged into species/<slug> as
 *                                        `details`, when the file exists.
 *                                        Its similar, predators and prey
 *                                        gain names and `listed`. Its Kruger
 *                                        estimate is copied to the list rows.
 *
 * Only the `species` list is published. `candidates` and `excluded` stay in
 * the repository. A species whose family is not in families.json, a
 * duplicate slug, or a details file with no listed species stops the run.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const DEFAULT_DATA_DIR = path.join(root, 'data')

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

const readDetails = async (dataDir) => {
  const dir = path.join(dataDir, 'species', 'details')
  let names
  try {
    names = await readdir(dir)
  } catch (error) {
    if (error.code === 'ENOENT') return new Map()
    throw error
  }
  const details = new Map()
  for (const name of names.filter((n) => n.endsWith('.json')).sort()) {
    details.set(name.slice(0, -5), await readJson(path.join(dir, name)))
  }
  return details
}

const checkSlug = (slug, what) => {
  if (typeof slug !== 'string' || !SLUG.test(slug))
    throw new Error(`${what} has a bad slug: ${JSON.stringify(slug)}`)
}

const names = ({ slug, latin, en, af }) => ({
  slug,
  latin,
  en,
  af: af ?? null,
})

const range = (estimate) =>
  Number.isFinite(estimate?.low) && Number.isFinite(estimate?.high)
    ? { low: estimate.low, high: estimate.high }
    : null

/** The Kruger estimate for a list row, or null when none is recorded. */
const listPopulation = (detail) =>
  detail?.population?.unit === 'individuals'
    ? range(detail.population.estimate)
    : null

/**
 * Names for the slugs a details file points at (similar, predators, prey).
 * `listed` says whether this guide has a page for the animal.
 */
const resolveRefs = (items, bySlug) =>
  (Array.isArray(items) ? items : []).map((item) => {
    const hit = item?.slug ? bySlug.get(item.slug) : null
    return hit
      ? { ...item, en: item.en ?? hit.en, latin: hit.latin, listed: true }
      : { ...item, listed: false }
  })

const resolveDetails = (detail, bySlug) => ({
  ...detail,
  similar: resolveRefs(detail.similar, bySlug),
  predators: resolveRefs(detail.predators, bySlug),
  prey: resolveRefs(detail.prey, bySlug),
})

/** Builds every KV document from the parsed data files. */
export const deriveDocuments = ({ families, list, details = new Map() }) => {
  if (!Array.isArray(families)) throw new Error('families.json is not a list')
  if (!Array.isArray(list?.species))
    throw new Error('species-list.json has no species list')

  const familyBySlug = new Map()
  for (const family of families) {
    checkSlug(family.slug, 'family')
    if (familyBySlug.has(family.slug))
      throw new Error(`duplicate family ${family.slug}`)
    familyBySlug.set(family.slug, { ...family, species: [] })
  }

  const speciesBySlug = new Map()
  for (const species of list.species) {
    checkSlug(species.slug, 'species')
    if (speciesBySlug.has(species.slug))
      throw new Error(`duplicate species ${species.slug}`)
    speciesBySlug.set(species.slug, species)
  }
  for (const slug of details.keys()) {
    if (!speciesBySlug.has(slug))
      throw new Error(
        `data/species/details/${slug}.json has no species in species-list.json`,
      )
  }

  const documents = new Map()
  const speciesIndex = []
  for (const species of list.species) {
    const family = familyBySlug.get(species.familySlug)
    if (!family)
      throw new Error(
        `${species.slug} names family ${species.familySlug}, which is not in families.json`,
      )
    const detail = details.get(species.slug)
    const row = {
      ...names(species),
      population: listPopulation(detail),
      researched: Boolean(detail),
    }
    family.species.push(row)
    speciesIndex.push({
      ...row,
      family: family.latin,
      familyEn: family.en,
      familySlug: family.slug,
      order: family.order,
    })
    documents.set(`species/${species.slug}`, {
      ...species,
      familyEn: family.en,
      ...(detail ? { details: resolveDetails(detail, speciesBySlug) } : {}),
    })
  }

  const familyIndex = []
  const orders = []
  for (const family of familyBySlug.values()) {
    documents.set(`family/${family.slug}`, family)
    if (!orders.includes(family.order)) orders.push(family.order)
    familyIndex.push({
      ...names(family),
      order: family.order,
      speciesCount: family.species.length,
    })
  }

  documents.set('index/families', {
    counts: {
      species: speciesIndex.length,
      families: familyBySlug.size,
      orders: orders.length,
      researched: speciesIndex.filter((row) => row.researched).length,
    },
    orders,
    families: familyIndex,
  })
  documents.set('index/species', { species: speciesIndex })
  return documents
}

/** KV entries, sorted by key, as wrangler's bulk put expects them. */
export const collectEntries = async (dataDir = DEFAULT_DATA_DIR) => {
  const documents = deriveDocuments({
    families: await readJson(path.join(dataDir, 'families.json')),
    list: await readJson(path.join(dataDir, 'species-list.json')),
    details: await readDetails(dataDir),
  })
  return [...documents]
    .map(([key, value]) => ({ key, value: JSON.stringify(value) }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  collectEntries()
    .then((entries) => process.stdout.write(`${JSON.stringify(entries)}\n`))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exitCode = 1
    })
}
