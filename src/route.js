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

/** The three views of one page: HTML, Markdown and the stored JSON. */
export const alternates = (pathname) =>
  pathname === '/'
    ? { html: '/', md: '/.md', json: '/.json' }
    : { html: pathname, md: `${pathname}.md`, json: `${pathname}.json` }

const splitFormat = (rawPath) => {
  for (const format of ['md', 'json']) {
    const suffix = `.${format}`
    if (rawPath.endsWith(suffix))
      return { format, pathname: rawPath.slice(0, -suffix.length) || '/' }
  }
  return { format: 'html', pathname: rawPath }
}

const notFound = (format, pathname) => ({ kind: 'not-found', format, pathname })

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
  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    const pathname = rawPath.slice(0, -1)
    return {
      kind: 'redirect',
      format: 'html',
      pathname,
      location: pathname + url.search,
    }
  }

  const { format, pathname } = splitFormat(rawPath)
  if (pathname === '/')
    return { kind: 'home', format, pathname, key: 'index/families' }
  if (pathname === '/families')
    return { kind: 'families', format, pathname, key: 'index/families' }
  if (pathname === '/orders')
    return { kind: 'orders', format, pathname, key: 'index/families' }
  if (pathname === '/species')
    return { kind: 'species-list', format, pathname, key: 'index/species' }

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
