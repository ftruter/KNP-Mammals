import { safeHttpUrl } from './escape.js'
import {
  NO_OBSERVATION_REFS,
  isObservationRef,
  licenceForbidsDerivatives,
} from './labels.js'
import { alternates, objectPublicPath, parseUrl } from './route.js'

// What an installed copy can keep on the device, with the size of every
// file. scripts/seed.mjs imports this module, so it must not import the
// browser scripts. src/offline-app.js does that. The photograph and clip
// choice lives here. The recognisers' files are listed in src/identify.js.

export const WEB_MANIFEST_PATH = '/manifest.webmanifest'
export const SERVICE_WORKER_PATH = '/sw.js'
export const OFFLINE_SCRIPT_PATH = '/offline.js'
export const OFFLINE_PATH = '/offline'
export const OFFLINE_KEY = 'index/offline'

/** The Cache Storage cache the panel keeps photographs and clips in. */
export const MEDIA_CACHE = 'offline-media'
/** A download larger than this is asked about when the connection may be mobile data. */
export const LARGE_DOWNLOAD_BYTES = 50 * 1048576

/**
 * Static HTML pages saved with the guide, besides one page per order, family
 * and species. Add a path when that page exists. A path this Worker does not
 * serve is left out, so a route that is still being built is not cached as
 * a 404.
 */
export const GUIDE_PAGES = [
  '/',
  '/families',
  '/orders',
  '/species',
  '/facts',
  '/credits',
  '/ask-ai',
  '/sitemap',
  '/identify',
  '/identify/photo',
  '/identify/sound',
]

const ASSET_KINDS = new Set([
  'not-found',
  'redirect',
  'style',
  'script',
  'icon',
  'image',
  'audio',
  'offline-script',
  'service-worker',
  'web-manifest',
  'offline',
  'model',
  'identify-script',
])

/** True when `pathname` is an HTML page this Worker serves. */
export const guidePageServed = (pathname) => {
  let route
  try {
    route = parseUrl(new URL(pathname, 'https://mammals.truter.world'))
  } catch {
    return false
  }
  return route.format === 'html' && !ASSET_KINDS.has(route.kind)
}

/** The JSON document for an HTML page: `/` is `/.json`, others append `.json`. */
export const jsonPathFor = (pathname) => alternates(pathname).json

/** True when `pathname` is a JSON page this Worker serves, not an asset. */
export const guideDataServed = (pathname) => {
  let route
  try {
    route = parseUrl(new URL(pathname, 'https://mammals.truter.world'))
  } catch {
    return false
  }
  return route.format === 'json' && !ASSET_KINDS.has(route.kind)
}

/**
 * JSON documents saved with the guide, in page order, each path once.
 * They are small, so there is no download option for them. Unserved
 * paths are left out, as with HTML pages, so a 404 is not cached.
 */
export const selectGuideData = (pages = []) => {
  const paths = []
  const seen = new Set()
  for (const page of pages) {
    const json = jsonPathFor(page)
    if (!json || seen.has(json) || !guideDataServed(json)) continue
    seen.add(json)
    paths.push(json)
  }
  return paths
}

let reportedSkipped = false

/** Guide pages from the list that this Worker actually serves, in that order. */
export const selectGuidePages = (paths = GUIDE_PAGES) => {
  const pages = []
  const skipped = []
  for (const pathname of paths) {
    if (guidePageServed(pathname)) pages.push(pathname)
    else skipped.push(pathname)
  }
  if (skipped.length > 0 && !reportedSkipped) {
    reportedSkipped = true
    console.warn(
      `index/offline: not saved, these pages are not served: ${skipped.join(', ')}`,
    )
  }
  return pages
}

/** A is best. An unrated recording ranks below every grade and can still be the only clip. */
const QUALITY_RANK = { A: 5, B: 4, C: 3, D: 2, E: 1 }

const list = (value) => (Array.isArray(value) ? value : [])

const imagesOf = (species) => list(species?.details?.images ?? species?.images)

const callsOf = (species) => list(species?.details?.calls ?? species?.calls)

/** The stored file URL when it is HTTPS. An ND or non-HTTPS file is refused. */
const httpsFile = (item) => {
  if (licenceForbidsDerivatives(item?.license)) return null
  if (typeof item?.fileUrl !== 'string' || typeof item?.key !== 'string')
    return null
  if (!item.key) return null
  const url = safeHttpUrl(item.fileUrl)
  return url?.startsWith('https:') ? item.fileUrl : null
}

/**
 * The first photograph the species page can show, and the same-origin
 * address of its hosted copy. Later photographs are not used once one can
 * be shown.
 */
export const displayImage = (species) => {
  for (const image of imagesOf(species)) {
    const chosen = hostedCopy('images', image)
    if (chosen) return chosen
  }
  return null
}

/**
 * The best-graded recording the species page can play, and the same-origin
 * address of its hosted copy. Ties keep the species file's order.
 */
export const bestRecording = (species) => {
  let best = null
  for (const call of callsOf(species)) {
    for (const recording of list(call?.recordings)) {
      const chosen = hostedCopy('audio', recording)
      if (!chosen) continue
      const rank = QUALITY_RANK[recording.quality] ?? 0
      if (!best || rank > best.rank) best = { rank, ...chosen }
    }
  }
  return best
}

/**
 * A measured copy from data/media/mirror.json. The pack address is
 * `/images/<key>` or `/audio/<key>`, the object the site already serves.
 * A file is left out when the mirror is missing, the byte size is not a
 * positive integer, or `source` is no longer this file's `fileUrl`. A
 * hosted file is that same-origin object, not a second copy under `offline/`.
 */
const hostedCopy = (group, item) => {
  if (licenceForbidsDerivatives(item?.license)) return null
  const url = objectPublicPath(group, item?.key)
  if (!url) return null
  const upstream = httpsFile(item)
  if (item?.hosted === true) return { item, url, upstream }
  return upstream ? { item, url, upstream } : null
}

const measured = (mirror, group, chosen, slug) => {
  if (!chosen) return null
  const entry = mirror?.[group]?.[chosen.item.key]
  if (!entry) return null
  if (chosen.upstream && entry.source !== chosen.upstream) return null
  if (!Number.isInteger(entry.bytes) || entry.bytes <= 0) return null
  const raw = chosen.upstream || entry.source
  const alias =
    raw && !(NO_OBSERVATION_REFS.has(slug) && isObservationRef(raw))
      ? raw
      : null
  return { url: chosen.url, bytes: entry.bytes, ...(alias ? { alias } : {}) }
}

const pagePaths = (docs, section) =>
  list(docs)
    .map((doc) =>
      typeof doc?.slug === 'string' ? `/${section}/${doc.slug}` : '',
    )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

/**
 * The index/offline document. `iconic` stays empty until a family ranking
 * is chosen, so the family rows have nothing to list. Species rows do not
 * depend on it. One photograph and one clip per species, not the gallery.
 */
export const deriveOffline = (
  speciesDocs,
  familyDocs,
  orderDocs = [],
  mirror = null,
) => {
  const images = []
  const clips = []
  for (const species of list(speciesDocs)) {
    if (typeof species?.slug !== 'string') continue
    const image = measured(
      mirror,
      'images',
      displayImage(species),
      species.slug,
    )
    if (image) images.push({ slug: species.slug, ...image })
    const clip = measured(mirror, 'audio', bestRecording(species), species.slug)
    if (clip) clips.push({ slug: species.slug, ...clip })
  }
  const bySlug = (a, b) => a.slug.localeCompare(b.slug)
  return {
    kind: 'offline',
    pages: [
      ...selectGuidePages(),
      ...pagePaths(orderDocs, 'order'),
      ...pagePaths(familyDocs, 'family'),
      ...pagePaths(speciesDocs, 'species'),
    ],
    iconic: [],
    images: images.sort(bySlug),
    clips: clips.sort(bySlug),
  }
}
