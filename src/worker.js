import { parseUrl } from './route.js'
import { methodNotAllowed, serverError } from './respond.js'
import { renderRoute } from './site.js'

export const handleRequest = async (request, env) => {
  const url = new URL(request.url)
  let format = 'html'
  try {
    const route = parseUrl(url)
    format = route.format
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return methodNotAllowed(format, url.origin)
    return await renderRoute(request, env, route)
  } catch (error) {
    console.error(
      JSON.stringify({
        message: 'request failed',
        path: url.pathname,
        error: error instanceof Error ? error.message : String(error),
      }),
    )
    return serverError(format, url.origin)
  }
}

export default {
  fetch: handleRequest,
}
