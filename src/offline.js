import { safeHttpUrl } from './escape.js'
import { licenceForbidsDerivatives } from './labels.js'
import { objectPublicPath, parseUrl } from './route.js'

// What an installed copy can keep on the device, with the size of every
// file. scripts/seed.mjs imports this module, so it must not import the
// browser scripts. src/offline-app.js does that. The photograph and clip
// choice lives here: mammals has no src/identify.js.

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
export const GUIDE_PAGES = ['/', '/families', '/orders', '/species']

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
    const upstream = httpsFile(image)
    const url = upstream ? objectPublicPath('images', image.key) : ''
    if (upstream && url) return { item: image, url, upstream }
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
      const upstream = httpsFile(recording)
      const url = upstream ? objectPublicPath('audio', recording.key) : ''
      if (!upstream || !url) continue
      const rank = QUALITY_RANK[recording.quality] ?? 0
      if (!best || rank > best.rank)
        best = { rank, item: recording, url, upstream }
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
const measured = (mirror, group, chosen) => {
  if (!chosen) return null
  const entry = mirror?.[group]?.[chosen.item.key]
  if (!entry || entry.source !== chosen.upstream) return null
  if (!Number.isInteger(entry.bytes) || entry.bytes <= 0) return null
  return { url: chosen.url, bytes: entry.bytes, alias: chosen.upstream }
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
    const image = measured(mirror, 'images', displayImage(species))
    if (image) images.push({ slug: species.slug, ...image })
    const clip = measured(mirror, 'audio', bestRecording(species))
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
