import {
  ASSET_CACHE,
  NOT_FOUND_CACHE,
  PAGE_CACHE,
  REDIRECT_CACHE,
  kvCache,
} from './cache.js'
import { clientJs } from './client.js'
import { iconFiles } from './icon.js'
import {
  familiesHtml,
  familyHtml,
  orderHtml,
  ordersHtml,
  homeHtml,
  notFoundHtml,
  speciesHtml,
  speciesListHtml,
} from './html.js'
import {
  familiesMarkdown,
  familyMarkdown,
  orderMarkdown,
  ordersMarkdown,
  homeMarkdown,
  notFoundMarkdown,
  speciesListMarkdown,
  speciesMarkdown,
} from './markdown.js'
import {
  iconResponse,
  jsonBody,
  pageResponse,
  redirectResponse,
} from './respond.js'
import { readDocument } from './store.js'
import { css } from './style.js'

const RENDERERS = {
  home: { html: homeHtml, md: homeMarkdown },
  families: { html: familiesHtml, md: familiesMarkdown },
  orders: { html: ordersHtml, md: ordersMarkdown },
  order: { html: orderHtml, md: orderMarkdown },
  'species-list': { html: speciesListHtml, md: speciesListMarkdown },
  family: { html: familyHtml, md: familyMarkdown },
  species: { html: speciesHtml, md: speciesMarkdown },
}

const notFound = (route, origin, env) => {
  const { format } = route
  const body =
    format === 'json'
      ? jsonBody({ error: 'not_found', status: 404 })
      : format === 'md'
        ? notFoundMarkdown()
        : notFoundHtml({ path: route.pathname, origin })
  return pageResponse({
    body,
    status: 404,
    format,
    cache: kvCache(env, NOT_FOUND_CACHE),
  })
}

/** Renders one parsed route. The JSON view is the stored document. */
export const renderRoute = async (request, env, route) => {
  const url = new URL(request.url)
  const { origin } = url
  if (route.kind === 'redirect')
    return redirectResponse(route.location, REDIRECT_CACHE)
  if (route.kind === 'style')
    return pageResponse({ body: css, format: 'css', cache: ASSET_CACHE })
  if (route.kind === 'icon')
    return iconResponse(iconFiles[route.pathname], ASSET_CACHE)
  if (route.kind === 'script')
    return pageResponse({ body: clientJs, format: 'js', cache: ASSET_CACHE })

  const renderer = RENDERERS[route.kind]
  const found = renderer ? await readDocument(env.MAMMALS_KV, route.key) : null
  if (!found) return notFound(route, origin, env)

  const { format, pathname } = route
  const body =
    format === 'json'
      ? jsonBody(found.data)
      : format === 'md'
        ? renderer.md(found.data)
        : renderer.html(found.data, { origin, url })
  return pageResponse({
    body,
    format,
    cache: kvCache(env, PAGE_CACHE),
    path: pathname,
    origin,
  })
}
