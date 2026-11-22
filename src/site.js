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
  familiesHtml,
  familyHtml,
  orderHtml,
  ordersHtml,
  homeHtml,
  notFoundHtml,
  renderSitemapHtml,
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
  renderSitemapMarkdown,
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
import {
  buildSitemap,
  robotsTxt,
  sitemapEntries,
  sitemapLastmod,
  sitemapXml,
} from './sitemap.js'
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

const renderSitemap = async (env, route, origin) => {
  const families = await readDocument(env.MAMMALS_KV, 'index/families')
  const species = await readDocument(env.MAMMALS_KV, 'index/species')
  const tree = buildSitemap(families?.data ?? null, species?.data ?? null)
  if (route.kind === 'sitemap')
    return pageResponse({
      body: sitemapXml(origin, tree, sitemapLastmod(env.DATA_PUBLISHED_AT)),
      format: 'html',
      contentType: 'application/xml; charset=utf-8',
      cache: kvCache(env, PAGE_CACHE),
    })
  const entries = sitemapEntries(tree)
  const { format, pathname } = route
  const body =
    format === 'json'
      ? jsonBody({ kind: 'sitemap', title: 'Sitemap', entries })
      : format === 'md'
        ? renderSitemapMarkdown(entries)
        : renderSitemapHtml(entries, { origin })
  return pageResponse({
    body,
    format,
    cache: kvCache(env, PAGE_CACHE),
    path: pathname,
    origin,
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
  if (route.kind === 'robots')
    return pageResponse({
      body: robotsTxt(origin),
      format: 'html',
      contentType: 'text/plain; charset=utf-8',
      cache: ASSET_CACHE,
    })
  if (route.kind === 'sitemap' || route.kind === 'sitemap-page')
    return renderSitemap(env, route, origin)

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
