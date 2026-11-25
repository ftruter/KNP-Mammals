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
 *   the `order` of each family         → order/<slug>, and `orders` in
 *                                        index/families
 *   data/species/details/<slug>.json   → merged into species/<slug> as
 *                                        `details`, when the file exists.
 *                                        Its similar, predators and prey
 *                                        gain names and `listed`. Its Kruger
 *                                        estimate is copied to the list rows.
 *                                        index/facts is one row per species
 *                                        from the same details.
 *   the species list and those details → index/credits
 *                                        index/search-samples is the photograph
 *                                        and call a search card shows
 *
 * Only the `species` list is published. `candidates` and `excluded` stay in
 * the repository. A species whose family is not in families.json, a
 * duplicate slug, or a details file with no listed species stops the run.
 * So does an image or recording whose licence is outside CC0, CC BY,
 * CC BY-SA, CC BY-NC and CC BY-NC-SA. A missing author, licence or source
 * is stored as null and logged. Nothing is written back to data/.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deriveOffline, OFFLINE_KEY } from '../src/offline.js'
import { buildFacts } from '../src/facts.js'
import { buildSearchSamples } from '../src/search-samples.js'

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

/** An order's slug is its Latin name in lower case. */
export const orderSlug = (order) =>
  String(order ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

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

const textOrNull = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

/**
 * CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA. A version is optional.
 * CC BY-NC stays distinct from CC BY-NC 4.0. ND and all-rights-reserved fail.
 */
const ALLOWED_MEDIA_LICENCE =
  /^(?:CC0(?: \d+\.\d+)?|CC BY(?:-NC)?(?:-SA)?(?: \d+\.\d+)?)$/

/**
 * One photograph or recording for index/credits.
 * Field names on the species file stay `license` and `source`.
 * A missing author, licence or source is null, and is logged with the slug
 * and key. A licence outside the allowed set throws.
 */
export const mediaCredit = (item, { slug = '', callType = null } = {}) => {
  const key = textOrNull(item?.key)
  const author = textOrNull(item?.author)
  const licence = textOrNull(item?.license ?? item?.licence)
  const sourceUrl = textOrNull(item?.source ?? item?.sourceUrl)
  const missing = [
    author ? '' : 'author',
    licence ? '' : 'licence',
    sourceUrl ? '' : 'source',
  ].filter(Boolean)
  if (missing.length)
    console.error(
      `credits: ${slug} ${key || '(no key)'} is missing ${missing.join(', ')}`,
    )
  if (licence && !ALLOWED_MEDIA_LICENCE.test(licence))
    throw new Error(
      `${slug} ${key || '(no key)'} has a licence outside the allowed set: ${licence}`,
    )
  const credit = {
    key,
    author,
    licence,
    licenceUrl: textOrNull(item?.licenceUrl),
    sourceUrl,
    aiGenerated:
      item?.aiGenerated === true
        ? true
        : item?.aiGenerated === false
          ? false
          : null,
    hosted:
      item?.hosted === true ? true : item?.hosted === false ? false : null,
  }
  const storedCall = textOrNull(callType)
  if (storedCall) credit.callType = storedCall
  return credit
}

const citedSources = (detail) => {
  const seen = new Set()
  const rows = []
  for (const bucket of [
    detail?.sources,
    detail?.population?.sources,
    detail?.conservationStatus?.sources,
  ]) {
    if (!Array.isArray(bucket)) continue
    for (const source of bucket) {
      const title = textOrNull(source?.title)
      if (!title) continue
      const url = textOrNull(source?.url)
      const identity = `${title}|${url || ''}`
      if (seen.has(identity)) continue
      seen.add(identity)
      rows.push({
        title,
        url,
        publisher: textOrNull(source?.publisher),
        year: Number.isInteger(source?.year) ? source.year : null,
      })
    }
  }
  return rows
}

const speciesCredit = (species, detail) => {
  if (!detail) return null
  const images = (Array.isArray(detail.images) ? detail.images : []).map(
    (image) => mediaCredit(image, { slug: species.slug }),
  )
  const recordings = (Array.isArray(detail.calls) ? detail.calls : []).flatMap(
    (call) =>
      (Array.isArray(call?.recordings) ? call.recordings : []).map(
        (recording) =>
          mediaCredit(recording, {
            slug: species.slug,
            callType: textOrNull(recording?.type) || textOrNull(call?.type),
          }),
      ),
  )
  const sources = citedSources(detail)
  if (!images.length && !recordings.length && !sources.length) return null
  return {
    slug: species.slug,
    scientificName:
      textOrNull(species.latin) || textOrNull(detail.scientificName),
    commonName: textOrNull(species.en) || textOrNull(detail.commonNames?.en),
    images,
    recordings,
    sources,
  }
}

const DATA_SOURCES = [
  {
    name: 'SANParks 2011 Kruger mammal checklist',
    url: 'https://web.archive.org/web/20110102164614/http://www.sanparks.org/parks/kruger/conservation/scientific/ff/mammal_checklist.pdf',
    links: [
      {
        label: 'Live checklist page',
        url: 'https://www.sanparks.org/parks/kruger/explore/fauna-flora/mammals/checklist',
      },
    ],
    usedFor:
      'Inclusion, English species names, and Afrikaans species names. Cite it. This page does not host the PDF.',
    licence: null,
    licenceUrl: null,
  },
  {
    name: 'iNaturalist, Kruger National Park, place 69020',
    url: 'https://www.inaturalist.org/places/69020',
    usedFor:
      'Taxonomy check, and the observation photographs and recordings listed below. Each file keeps its own licence.',
    licence: null,
    licenceUrl: null,
  },
  {
    name: 'Waterberg Bioquest, Soogdiere',
    url: 'https://waterberg-bioquest.co.za/soogdiere.html',
    usedFor: 'English family names. Not a Kruger inclusion list.',
    licence: null,
    licenceUrl: null,
  },
  {
    name: 'Afrikaans Wikipedia, Suider-Afrikaanse soogdiere en hul ordes',
    url: 'https://af.wikipedia.org/wiki/Suider-Afrikaanse_soogdiere_en_hul_ordes',
    usedFor: 'Afrikaans family names, only where that page states one.',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    name: '2016 SANBI / EWT Red List of Mammals',
    url: 'https://ewt.org/resources/mammal-red-list/',
    usedFor:
      'Conservation status and some population notes. Per-species assessments are cited under the species. This page does not host the PDFs.',
    licence: null,
    licenceUrl: null,
  },
  {
    name: "SANParks, Most recent counts of Kruger's wildlife and trends over time",
    url: 'https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf',
    usedFor:
      'Kruger counts where a details file cites that PDF. This page does not host it.',
    licence: null,
    licenceUrl: null,
  },
  {
    name: 'Wikimedia Commons, category Mammals of Kruger National Park',
    url: 'https://commons.wikimedia.org/wiki/Category:Mammals_of_Kruger_National_Park',
    usedFor: 'Photographs. Each file keeps its own licence, listed below.',
    licence: null,
    licenceUrl: null,
  },
  {
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Kruger_National_Park',
    usedFor: 'Fallback species text where a details file cites an article.',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
]

const TAXONOMY = {
  authority: '2011 SANParks checklist',
  summary:
    'The species list follows the 2011 SANParks checklist. Three recorded remaps: galagos are Galagidae; Cricetomys, Saccostomus, Dendromus and Steatomys are Nesomyidae; Miniopterus is Miniopteridae. Bats keep the 2011 names. English and Afrikaans species names come from that checklist. Afrikaans family names come only from the Afrikaans Wikipedia page Suider-Afrikaanse soogdiere en hul ordes, and a family with no stated name stays blank.',
}

const SITE = {
  repository: 'https://github.com/ftruter/KNP-Mammals',
  licence: null,
  licenceUrl: null,
  maintainer: 'ftruter',
  palette:
    'The green and gold are inspired by the SANParks green and the Springbok gold. The palette is colour inspiration only, with no implied endorsement.',
  affiliation: "This site isn't affiliated with SANParks.",
}

const NO_MEDIA_NOTE = 'No photos or recordings have been added so far.'

const copySource = (source) => {
  const copy = { ...source }
  if (source.links) copy.links = source.links.map((link) => ({ ...link }))
  return copy
}

/** Checklist sources, taxonomy, and every photograph, recording and citation. */
export const deriveCredits = (speciesList, details) => {
  const species = speciesList
    .map((species) => speciesCredit(species, details.get(species.slug)))
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.scientificName.localeCompare(b.scientificName, 'en') ||
        a.slug.localeCompare(b.slug),
    )
  const images = species.reduce((sum, group) => sum + group.images.length, 0)
  const recordings = species.reduce(
    (sum, group) => sum + group.recordings.length,
    0,
  )
  return {
    kind: 'credits',
    dataSources: DATA_SOURCES.map(copySource),
    taxonomy: { ...TAXONOMY },
    mediaNote: images === 0 && recordings === 0 ? NO_MEDIA_NOTE : null,
    species,
    site: { ...SITE },
  }
}

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
    checkSlug(orderSlug(family.order), `the order of ${family.slug}`)
    familyBySlug.set(family.slug, {
      ...family,
      orderSlug: orderSlug(family.order),
      species: [],
    })
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
      orderSlug: family.orderSlug,
    })
    documents.set(`species/${species.slug}`, {
      ...species,
      familyEn: family.en,
      orderSlug: family.orderSlug,
      ...(detail ? { details: resolveDetails(detail, speciesBySlug) } : {}),
    })
  }

  const familyIndex = []
  const orderBySlug = new Map()
  for (const family of familyBySlug.values()) {
    documents.set(`family/${family.slug}`, family)
    const row = {
      ...names(family),
      order: family.order,
      orderSlug: family.orderSlug,
      speciesCount: family.species.length,
    }
    familyIndex.push(row)
    if (!orderBySlug.has(family.orderSlug))
      orderBySlug.set(family.orderSlug, {
        slug: family.orderSlug,
        latin: family.order,
        families: [],
        species: [],
      })
    orderBySlug.get(family.orderSlug).families.push(row)
  }
  for (const row of speciesIndex)
    orderBySlug.get(row.orderSlug).species.push(row)
  const orders = []
  for (const order of orderBySlug.values()) {
    documents.set(`order/${order.slug}`, order)
    orders.push({
      slug: order.slug,
      latin: order.latin,
      familyCount: order.families.length,
      speciesCount: order.species.length,
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
  documents.set('index/facts', buildFacts(speciesIndex, details))
  documents.set('index/credits', deriveCredits(list.species, details))
  documents.set('index/search-samples', buildSearchSamples(details))
  return documents
}

/**
 * What scripts/publish-media.mjs wrote: copied photographs and clips, with
 * measured sizes. Null when the file has not been written. Nothing here is
 * written back under data/.
 */
export const readMirror = async (dataDir = DEFAULT_DATA_DIR) => {
  try {
    return JSON.parse(
      await readFile(path.join(dataDir, 'media', 'mirror.json'), 'utf8'),
    )
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

let reportedIconicGap = false

/** KV entries, sorted by key, as wrangler's bulk put expects them. */
export const collectEntries = async (dataDir = DEFAULT_DATA_DIR) => {
  const documents = deriveDocuments({
    families: await readJson(path.join(dataDir, 'families.json')),
    list: await readJson(path.join(dataDir, 'species-list.json')),
    details: await readDetails(dataDir),
  })
  const species = []
  const families = []
  const orders = []
  for (const [key, value] of documents) {
    if (key.startsWith('species/')) species.push(value)
    else if (key.startsWith('family/')) families.push(value)
    else if (key.startsWith('order/')) orders.push(value)
  }
  const offline = deriveOffline(
    species,
    families,
    orders,
    await readMirror(dataDir),
  )
  // No family ranking is stored. Leave the gap visible rather than invent one.
  if (offline.iconic.length === 0 && !reportedIconicGap) {
    reportedIconicGap = true
    console.warn(
      'index/offline: iconic is []. Family image and clip rows stay unavailable until a ranking is chosen.',
    )
  }
  documents.set(OFFLINE_KEY, offline)
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
