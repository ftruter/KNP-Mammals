import {
  ASSET_CACHE,
  NOT_FOUND_CACHE,
  PAGE_CACHE,
  REDIRECT_CACHE,
  kvCache,
} from './cache.js'
import {
  familyHtml,
  homeHtml,
  notFoundHtml,
  speciesHtml,
  speciesListHtml,
} from './html.js'
import {
  familyMarkdown,
  homeMarkdown,
  notFoundMarkdown,
  speciesListMarkdown,
  speciesMarkdown,
} from './markdown.js'
import { jsonBody, pageResponse, redirectResponse } from './respond.js'
import { readDocument } from './store.js'
import { css } from './style.js'

const RENDERERS = {
  home: { html: homeHtml, md: homeMarkdown },
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
  const { origin } = new URL(request.url)
  if (route.kind === 'redirect')
    return redirectResponse(route.location, REDIRECT_CACHE)
  if (route.kind === 'style')
    return pageResponse({ body: css, format: 'css', cache: ASSET_CACHE })

  const renderer = RENDERERS[route.kind]
  const found = renderer ? await readDocument(env.MAMMALS_KV, route.key) : null
  if (!found) return notFound(route, origin, env)

  const { format, pathname } = route
  const body =
    format === 'json'
      ? jsonBody(found.data)
      : format === 'md'
        ? renderer.md(found.data)
        : renderer.html(found.data, { path: pathname, origin })
  return pageResponse({
    body,
    format,
    cache: kvCache(env, PAGE_CACHE),
    path: pathname,
    origin,
  })
}
