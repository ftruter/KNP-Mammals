import { NO_STORE } from './cache.js'
import { alternates } from './route.js'

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-language': 'en',
}

/** No scripts yet. Add script-src 'self' when the first one is served. */
const PAGE_CSP =
  "default-src 'none'; style-src 'self'; img-src 'self' https:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"

export const CONTENT_TYPES = {
  html: 'text/html; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  json: 'application/json; charset=utf-8',
  css: 'text/css; charset=utf-8',
}

export const jsonBody = (value) => `${JSON.stringify(value, null, 2)}\n`

const baseHeaders = (format, cache) => {
  const headers = new Headers(SECURITY)
  headers.set('content-type', CONTENT_TYPES[format] || CONTENT_TYPES.html)
  headers.set('content-security-policy', PAGE_CSP)
  headers.set('cache-control', cache)
  headers.set('access-control-allow-origin', '*')
  return headers
}

/** `path` and `origin` add canonical and alternate Link headers. */
export const pageResponse = ({
  body,
  status = 200,
  format,
  cache,
  path,
  origin,
}) => {
  const headers = baseHeaders(format, cache)
  if (path && origin) {
    const alts = alternates(path)
    headers.set(
      'link',
      [
        `<${origin}${alts.html}>; rel="canonical"`,
        `<${origin}${alts.md}>; rel="alternate"; type="text/markdown"`,
        `<${origin}${alts.json}>; rel="alternate"; type="application/json"`,
      ].join(', '),
    )
  }
  return new Response(body, { status, headers })
}

export const redirectResponse = (location, cache) => {
  const headers = baseHeaders('html', cache)
  headers.delete('content-type')
  headers.set('location', location)
  return new Response(null, { status: 301, headers })
}

const plainError = (format, status, error, title, message) => {
  if (format === 'json') return jsonBody({ error, status, message })
  if (format === 'md') return `# ${title}\n\n${message}\n`
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${title} · KNP Mammals</title></head>
<body><h1>${title}</h1><p>${message}</p><p><a href="/">Home</a></p></body></html>\n`
}

export const methodNotAllowed = (format) => {
  const headers = baseHeaders(format, NO_STORE)
  headers.set('allow', 'GET, HEAD')
  return new Response(
    plainError(
      format,
      405,
      'method_not_allowed',
      'Method not allowed',
      'Use GET.',
    ),
    { status: 405, headers },
  )
}

export const serverError = (format) =>
  new Response(
    plainError(
      format,
      500,
      'server_error',
      'Something went wrong',
      'This page could not be rendered.',
    ),
    { status: 500, headers: baseHeaders(format, NO_STORE) },
  )
