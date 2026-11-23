import { clientSrc, clientVersion, offlineSrc, styleSrc } from './client.js'
import { APP_NAME, iconVersion } from './icon.js'
import {
  LARGE_DOWNLOAD_BYTES,
  MEDIA_CACHE,
  WEB_MANIFEST_PATH,
} from './offline.js'
import { palette } from './style.js'

// The installable web app: the web app manifest, the tags that point at
// it, and the document the download panel reads. No photo or sound model.
// Those wait for a recogniser.

export const THEME_COLOUR = palette.light.headerBg
export const MANIFEST_TYPE = 'application/manifest+json; charset=utf-8'

export const webManifest = () => ({
  id: '/',
  name: 'Mammals of Kruger National Park',
  short_name: APP_NAME,
  description:
    'A field guide to the mammals of Kruger National Park. An installed copy can open the pages saved on the device.',
  lang: 'en',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  theme_color: THEME_COLOUR,
  background_color: palette.light.bg,
  icons: [
    {
      src: `/icon-192.png?v=${iconVersion}`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `/icon-512.png?v=${iconVersion}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `/icon-maskable-512.png?v=${iconVersion}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
})

/** The tags that make "Add to Home Screen" open the site as an app. */
export const INSTALL_LINKS = `<link rel="manifest" href="${WEB_MANIFEST_PATH}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${palette.dark.headerBg}">
<meta name="theme-color" content="${THEME_COLOUR}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">`

const CATEGORIES = [
  {
    id: 'family-images',
    label: 'Images for families (one image for each of up to three species)',
    includedIn: 'species-images',
  },
  { id: 'species-images', label: 'Images for species (one image each)' },
  {
    id: 'family-clips',
    label:
      'Sound clips for families (one clip for each of up to three species)',
    includedIn: 'species-clips',
  },
  { id: 'species-clips', label: 'Sound clips for species' },
]

const shellFiles = () => [
  styleSrc,
  clientSrc,
  offlineSrc,
  WEB_MANIFEST_PATH,
  `/favicon.ico?v=${iconVersion}`,
  `/favicon.svg?v=${iconVersion}`,
  `/apple-touch-icon.png?v=${iconVersion}`,
  `/icon-192.png?v=${iconVersion}`,
  `/icon-512.png?v=${iconVersion}`,
  `/icon-maskable-512.png?v=${iconVersion}`,
]

/**
 * What /offline.json serves. Every file is listed once. A file shared by
 * the family row and the species row is stored once. `signature` changes
 * when a row's files change, which is how the panel offers an update.
 */
export const offlineManifest = (doc, version = '') => {
  const files = []
  const at = new Map()
  const add = (file) => {
    if (!at.has(file.url)) {
      at.set(file.url, files.length)
      files.push(file)
    }
    return at.get(file.url)
  }
  const media = (items) => {
    const indexes = []
    const seen = new Set()
    for (const item of Array.isArray(items) ? items : []) {
      const index = add({
        url: item.url,
        bytes: item.bytes,
        cache: MEDIA_CACHE,
        alias: item.alias,
      })
      if (seen.has(index)) continue
      seen.add(index)
      indexes.push(index)
    }
    return indexes
  }
  const iconic = new Set(Array.isArray(doc?.iconic) ? doc.iconic : [])
  const images = Array.isArray(doc?.images) ? doc.images : []
  const clips = Array.isArray(doc?.clips) ? doc.clips : []
  const members = {
    'family-images': media(images.filter((item) => iconic.has(item.slug))),
    'species-images': media(images),
    'family-clips': media(clips.filter((item) => iconic.has(item.slug))),
    'species-clips': media(clips),
  }
  const shell = shellFiles()
  const pages = Array.isArray(doc?.pages) ? doc.pages : ['/']
  return {
    kind: 'offline',
    version: clientVersion(
      [version, ...shell, ...pages, JSON.stringify(doc ?? null)].join('\n'),
    ),
    largeBytes: LARGE_DOWNLOAD_BYTES,
    shell,
    pages,
    files,
    categories: CATEGORIES.map((category) => {
      const indexes = members[category.id]
      return {
        ...category,
        files: indexes,
        signature: clientVersion(
          indexes
            .map((index) => `${files[index].url} ${files[index].bytes}`)
            .join('\n'),
        ),
      }
    }),
  }
}
