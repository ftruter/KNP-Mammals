const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const STYLE_PATH = '/style.css'
export const SCRIPT_PATH = '/app.js'
/** The site icon in every size. Built by scripts/build-icons.mjs. */
export const ICON_PATHS = [
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
]

/**
 * Browser scripts for /identify/photo and /identify/sound: one for each page,
 * the Web Worker both pages run the recogniser in, and the sound page's
 * audio worklet.
 */
export const IDENTIFY_SCRIPTS = [
  '/identify-photo.js',
  '/identify-sound.js',
  '/identify-worker.js',
  '/identify-capture.js',
]

export const SEARCH_PATH = '/search'
export const SEARCH_MAX = 200

/** Trims, collapses whitespace and caps a search query from the URL. */
export const searchQuery = (raw) =>
  String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SEARCH_MAX)
    .trim()

export const searchSuffix = (query) =>
  query ? `?${new URLSearchParams({ q: query })}` : ''

/**
 * The three views of one page: HTML, Markdown and the stored JSON.
 * `suffix` keeps a search query on the canonical and alternate links.
 */
export const alternates = (pathname, suffix = '') =>
  pathname === '/'
    ? { html: '/', md: '/.md', json: '/.json' }
    : {
        html: `${pathname}${suffix}`,
        md: `${pathname}.md${suffix}`,
        json: `${pathname}.json${suffix}`,
      }

const splitFormat = (rawPath) => {
  for (const format of ['md', 'json']) {
    const suffix = `.${format}`
    if (rawPath.endsWith(suffix))
      return { format, pathname: rawPath.slice(0, -suffix.length) || '/' }
  }
  return { format: 'html', pathname: rawPath }
}

const notFound = (format, pathname) => ({ kind: 'not-found', format, pathname })

const objectRoute = (kind, pathname, prefix) => {
  const key = safeObjectKey(pathname.slice(`/${prefix}/`.length))
  if (!key) return notFound('html', pathname)
  return { kind, format: 'html', pathname, objectKey: key }
}

/**
 * An R2 object key from a URL path or a stored key. Rejects `..`, an empty
 * segment, a backslash, and a leading or trailing slash.
 */
export const safeObjectKey = (raw) => {
  let key
  try {
    key = decodeURIComponent(raw)
  } catch {
    return null
  }
  if (
    !key ||
    key.startsWith('/') ||
    key.endsWith('/') ||
    key.includes('\\') ||
    key.includes('\0')
  )
    return null
  const parts = key.split('/')
  if (parts.some((part) => part === '' || part === '.' || part === '..'))
    return null
  return key
}

/** `/images/<key>` or `/audio/<key>` for a stored key, or '' when it is unsafe. */
export const objectPublicPath = (group, key) => {
  if (group !== 'images' && group !== 'audio') return ''
  const safe = safeObjectKey(typeof key === 'string' ? key : '')
  if (!safe) return ''
  return `/${group}/${safe
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

/**
 * Maps a URL to a route. `key` is the KV document the page is rendered from.
 * A trailing slash redirects to the same path without it.
 */
export const parseUrl = (url) => {
  const rawPath = url.pathname
  if (rawPath === STYLE_PATH)
    return { kind: 'style', format: 'css', pathname: rawPath }
  if (ICON_PATHS.includes(rawPath))
    return { kind: 'icon', format: 'icon', pathname: rawPath }
  if (rawPath === SCRIPT_PATH)
    return { kind: 'script', format: 'js', pathname: rawPath }
  if (rawPath === '/offline.js')
    return { kind: 'offline-script', format: 'js', pathname: rawPath }
  if (rawPath === '/sw.js')
    return { kind: 'service-worker', format: 'js', pathname: rawPath }
  if (IDENTIFY_SCRIPTS.includes(rawPath))
    return { kind: 'identify-script', format: 'js', pathname: rawPath }
  // A recogniser file. Its name may end in .json or .md, so it is matched
  // before the format is split off.
  if (rawPath.startsWith('/models/')) {
    const key = safeObjectKey(rawPath.slice(1))
    return key
      ? { kind: 'model', format: 'html', pathname: rawPath, objectKey: key }
      : notFound('html', rawPath)
  }
  if (rawPath === '/manifest.webmanifest')
    return { kind: 'web-manifest', format: 'html', pathname: rawPath }
  const llmsPath =
    rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath
  if (llmsPath.toLowerCase() === '/llms.txt') {
    return rawPath === '/llms.txt'
      ? { kind: 'llms', format: 'html', pathname: '/llms.txt' }
      : {
          kind: 'redirect',
          format: 'html',
          pathname: '/llms.txt',
          location: '/llms.txt' + url.search,
        }
  }
  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    const pathname = rawPath.slice(0, -1)
    return {
      kind: 'redirect',
      format: 'html',
      pathname,
      location: pathname + url.search,
    }
  }

  if (
    rawPath === '/.well-known/ard.json' ||
    rawPath === '/.well-known/ai-catalog.json'
  ) {
    return {
      kind: rawPath.endsWith('/ard.json') ? 'ard' : 'ai-catalog',
      format: 'json',
      pathname: rawPath,
    }
  }

  if (rawPath === '/mcp/server-card')
    return { kind: 'server-card', format: 'json', pathname: rawPath }

  const { format, pathname } = splitFormat(rawPath)
  // The list of what an installed copy can keep. It has a JSON form only.
  if (pathname === '/offline')
    return format === 'json'
      ? { kind: 'offline', format, pathname, key: 'index/offline' }
      : notFound(format, pathname)
  if (format === 'html' && pathname.startsWith('/images/'))
    return objectRoute('image', pathname, 'images')
  if (format === 'html' && pathname.startsWith('/audio/'))
    return objectRoute('audio', pathname, 'audio')
  if (pathname === '/')
    return { kind: 'home', format, pathname, key: 'index/families' }
  if (pathname === '/families')
    return { kind: 'families', format, pathname, key: 'index/families' }
  if (pathname === '/orders')
    return { kind: 'orders', format, pathname, key: 'index/families' }
  if (pathname === '/species')
    return { kind: 'species-list', format, pathname, key: 'index/species' }
  if (format === 'html' && pathname === '/robots.txt')
    return { kind: 'robots', format: 'html', pathname: '/robots.txt' }
  if (format === 'html' && pathname === '/sitemap.xml')
    return { kind: 'sitemap', format: 'html', pathname: '/sitemap.xml' }
  if (pathname === '/sitemap')
    return { kind: 'sitemap-page', format, pathname: '/sitemap' }
  if (pathname === '/ask-ai') return { kind: 'ask-ai', format, pathname }
  if (pathname === '/identify')
    return { kind: 'identify', format, pathname, key: 'index/identify' }
  if (pathname === '/identify/photo')
    return { kind: 'identify-photo', format, pathname, key: 'index/identify' }
  if (pathname === '/identify/sound')
    return { kind: 'identify-sound', format, pathname, key: 'index/identify' }
  if (pathname === '/facts')
    return { kind: 'facts', format, pathname, key: 'index/facts' }
  if (pathname === '/credits')
    return { kind: 'credits', format, pathname, key: 'index/credits' }
  if (pathname === SEARCH_PATH)
    return {
      kind: 'search',
      format,
      pathname,
      query: searchQuery(url.searchParams.get('q')),
    }

  const [, section, slug, ...rest] = pathname.split('/')
  if (rest.length > 0 || !slug || !SLUG.test(slug))
    return notFound(format, pathname)
  if (section === 'family')
    return { kind: 'family', format, pathname, key: `family/${slug}` }
  if (section === 'order')
    return { kind: 'order', format, pathname, key: `order/${slug}` }
  if (section === 'species')
    return { kind: 'species', format, pathname, key: `species/${slug}` }
  return notFound(format, pathname)
}
