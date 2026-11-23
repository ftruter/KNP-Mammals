import {
  ASSET_CACHE,
  NOT_FOUND_CACHE,
  PAGE_CACHE,
  REDIRECT_CACHE,
  kvCache,
} from './cache.js'
import { objectHttpResponse } from './objects.js'
import { clientJs } from './client.js'
import { iconFiles } from './icon.js'
import {
  creditsHtml,
  familiesHtml,
  familyHtml,
  orderHtml,
  ordersHtml,
  homeHtml,
  notFoundHtml,
  renderSearchHtml,
  speciesHtml,
  speciesListHtml,
} from './html.js'
import {
  creditsMarkdown,
  familiesMarkdown,
  familyMarkdown,
  orderMarkdown,
  ordersMarkdown,
  homeMarkdown,
  notFoundMarkdown,
  searchMarkdown,
  speciesListMarkdown,
  speciesMarkdown,
} from './markdown.js'
import {
  iconResponse,
  jsonBody,
  pageResponse,
  plainResponse,
  redirectResponse,
} from './respond.js'
import { searchSuffix } from './route.js'
import { SEARCH_LIMIT, loadSearchRecords, searchRecords } from './search.js'
import { readDocument } from './store.js'
import { css } from './style.js'

const RENDERERS = {
  home: { html: homeHtml, md: homeMarkdown },
  credits: { html: creditsHtml, md: creditsMarkdown },
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

const renderObject = async (request, env, key) => {
  const response = await objectHttpResponse(
    env?.IMAGES,
    key,
    request.headers.get('range'),
  )
  if (response) return response
  return plainResponse({
    body: 'Not found\n',
    status: 404,
    cache: NOT_FOUND_CACHE,
  })
}

/**
 * Search has no single KV document. It reads the two indexes inside
 * `loadSearchRecords`, so it must not fall through to the 404 below.
 */
const renderSearch = async (env, route, origin) => {
  const query = route.query || ''
  const found = query
    ? searchRecords(
        await loadSearchRecords(env.MAMMALS_KV),
        query,
        SEARCH_LIMIT,
        origin,
      )
    : null
  const { format, pathname } = route
  const body =
    format === 'json'
      ? jsonBody({
          kind: 'search',
          query,
          limit: SEARCH_LIMIT,
          total: found?.total ?? 0,
          results: found?.results ?? [],
        })
      : format === 'md'
        ? searchMarkdown({ query, found })
        : renderSearchHtml({ origin, query, found })
  return pageResponse({
    body,
    format,
    cache: kvCache(env, PAGE_CACHE),
    path: pathname,
    origin,
    search: searchSuffix(query),
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
  if (route.kind === 'image' || route.kind === 'audio')
    return renderObject(request, env, route.objectKey)
  if (route.kind === 'search') return renderSearch(env, route, origin)

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
