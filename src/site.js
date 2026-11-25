import { discoveryDocuments } from './ard.js'
import { CARD_MEDIA_TYPE, serverCard } from './mcp.js'
import {
  ASSET_CACHE,
  NOT_FOUND_CACHE,
  PAGE_CACHE,
  REDIRECT_CACHE,
  kvCache,
} from './cache.js'
import { modelHttpResponse, objectHttpResponse } from './objects.js'
import {
  clientJs,
  identifyScripts,
  offlineJs,
  serviceWorkerJs,
} from './client.js'
import {
  identifyJson,
  identifyMarkdown,
  identifyPhotoJson,
  identifyPhotoMarkdown,
  identifySoundJson,
  identifySoundMarkdown,
  renderIdentifyHtml,
  renderIdentifyPhotoHtml,
  renderIdentifySoundHtml,
} from './identify-page.js'
import { OFFLINE_KEY } from './offline.js'
import { MANIFEST_TYPE, offlineManifest, webManifest } from './offline-app.js'
import { iconFiles } from './icon.js'
import {
  askAiHtml,
  factsPageHtml,
  creditsHtml,
  familiesHtml,
  familyHtml,
  orderHtml,
  ordersHtml,
  homeHtml,
  notFoundHtml,
  renderSitemapHtml,
  renderSearchHtml,
  speciesHtml,
  speciesListHtml,
} from './html.js'
import {
  absoluteLinks,
  askAiMarkdown,
  factsMarkdown,
  creditsMarkdown,
  familiesMarkdown,
  familyMarkdown,
  orderMarkdown,
  ordersMarkdown,
  homeMarkdown,
  notFoundMarkdown,
  renderSitemapMarkdown,
  searchMarkdown,
  speciesListMarkdown,
  speciesMarkdown,
} from './markdown.js'
import {
  ASK_AI_EXAMPLES,
  ASK_AI_PATH,
  ASK_AI_TITLE,
  aiPrompt,
} from './prompt.js'
import { llmsTxt } from './static.js'
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
import { alternates, searchSuffix } from './route.js'
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
  facts: { html: factsPageHtml, md: factsMarkdown },
  family: { html: familyHtml, md: familyMarkdown },
  species: { html: speciesHtml, md: speciesMarkdown },
}

/** The three identify pages: their HTML, Markdown and JSON, from `index/identify`. */
const IDENTIFY_PAGES = {
  identify: {
    html: renderIdentifyHtml,
    md: identifyMarkdown,
    json: identifyJson,
  },
  'identify-photo': {
    html: renderIdentifyPhotoHtml,
    md: identifyPhotoMarkdown,
    json: identifyPhotoJson,
  },
  'identify-sound': {
    html: renderIdentifySoundHtml,
    md: identifySoundMarkdown,
    json: identifySoundJson,
    microphone: true,
  },
}

const renderIdentify = async (env, route, origin) => {
  const page = IDENTIFY_PAGES[route.kind]
  const found = await readDocument(env.MAMMALS_KV, route.key)
  if (!found) return notFound(route, origin, env)
  const { format, pathname } = route
  const body =
    format === 'json'
      ? jsonBody(page.json(found.data))
      : format === 'md'
        ? absoluteLinks(page.md(found.data), origin)
        : page.html(found.data, { origin })
  return pageResponse({
    body,
    format,
    cache: kvCache(env, PAGE_CACHE),
    path: pathname,
    origin,
    identify: format === 'html' && route.kind !== 'identify',
    microphone: format === 'html' && Boolean(page.microphone),
  })
}

const renderModel = async (request, env, key) => {
  const response = await modelHttpResponse(
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

const notFound = (route, origin, env) => {
  const { format } = route
  const body =
    format === 'json'
      ? jsonBody({ error: 'not_found', status: 404 })
      : format === 'md'
        ? absoluteLinks(notFoundMarkdown(), origin)
        : notFoundHtml({ path: route.pathname, origin })
  return pageResponse({
    body,
    status: 404,
    format,
    cache: kvCache(env, NOT_FOUND_CACHE),
    path: route.pathname,
    origin,
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

/**
 * /offline.json: pages and media an installed copy can keep. The lists come
 * from KV. The shell addresses are this Worker's own. A missing document
 * still answers, with the shell and empty media lists.
 */
const renderOffline = async (env) => {
  const found = await readDocument(env.MAMMALS_KV, OFFLINE_KEY)
  const version = env?.DATA_VERSION == null ? '' : String(env.DATA_VERSION)
  return pageResponse({
    body: jsonBody(offlineManifest(found?.data ?? null, version)),
    format: 'json',
    cache: kvCache(env, PAGE_CACHE),
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
        await loadSearchRecords(env.MAMMALS_KV, {
          samples: route.format === 'html',
        }),
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
  if (route.kind === 'identify-script')
    return pageResponse({
      body: identifyScripts[route.pathname],
      format: 'js',
      cache: ASSET_CACHE,
      // A worker runs under the policy on its own response.
      identify: route.pathname === '/identify-worker.js',
    })
  if (route.kind === 'model') return renderModel(request, env, route.objectKey)
  if (IDENTIFY_PAGES[route.kind]) return renderIdentify(env, route, origin)
  if (route.kind === 'offline-script')
    return pageResponse({ body: offlineJs, format: 'js', cache: ASSET_CACHE })
  if (route.kind === 'service-worker')
    return pageResponse({
      body: serviceWorkerJs,
      format: 'js',
      cache: ASSET_CACHE,
      serviceWorker: true,
    })
  if (route.kind === 'web-manifest')
    return pageResponse({
      body: jsonBody(webManifest()),
      format: 'html',
      cache: ASSET_CACHE,
      contentType: MANIFEST_TYPE,
    })
  if (route.kind === 'offline') return renderOffline(env)
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
  if (route.kind === 'llms')
    return pageResponse({
      body: llmsTxt(origin),
      format: 'html',
      contentType: 'text/plain; charset=utf-8',
      cache: ASSET_CACHE,
    })
  if (route.kind === 'server-card')
    return pageResponse({
      body: jsonBody(serverCard(origin)),
      format: 'json',
      cache: ASSET_CACHE,
      contentType: `${CARD_MEDIA_TYPE}; charset=utf-8`,
    })
  if (route.kind === 'ard' || route.kind === 'ai-catalog')
    return renderDiscovery(env, origin, route.kind)
  if (route.kind === 'ask-ai') return renderAskAi(route.format, origin)
  if (route.kind === 'search') return renderSearch(env, route, origin)

  const renderer = RENDERERS[route.kind]
  const found = renderer ? await readDocument(env.MAMMALS_KV, route.key) : null
  if (!found) return notFound(route, origin, env)

  const { format, pathname } = route
  const body =
    format === 'json'
      ? jsonBody(found.data)
      : format === 'md'
        ? absoluteLinks(renderer.md(found.data, origin), origin)
        : renderer.html(found.data, { origin, url })
  return pageResponse({
    body,
    format,
    cache: kvCache(env, PAGE_CACHE),
    path: pathname,
    origin,
  })
}

const renderAskAi = (format, origin) => {
  if (format === 'json') {
    const alts = alternates(ASK_AI_PATH)
    return pageResponse({
      body: jsonBody({
        prompt: aiPrompt(origin),
        title: ASK_AI_TITLE,
        examples: ASK_AI_EXAMPLES,
        pages: {
          html: origin + alts.html,
          md: origin + alts.md,
          json: origin + alts.json,
        },
      }),
      format,
      cache: ASSET_CACHE,
      path: ASK_AI_PATH,
      origin,
    })
  }
  return pageResponse({
    body:
      format === 'md'
        ? absoluteLinks(askAiMarkdown(origin), origin)
        : askAiHtml({ origin }),
    format,
    cache: ASSET_CACHE,
    path: ASK_AI_PATH,
    origin,
  })
}

const renderDiscovery = async (env, origin, kind) => {
  const [families, species] = await Promise.all([
    readDocument(env.MAMMALS_KV, 'index/families'),
    readDocument(env.MAMMALS_KV, 'index/species'),
  ])
  const docs = discoveryDocuments({
    origin,
    familiesIndex: families?.data,
    speciesIndex: species?.data,
  })
  return pageResponse({
    body: jsonBody(kind === 'ard' ? docs.ard : docs.catalog),
    format: 'json',
    cache: kvCache(env, PAGE_CACHE),
  })
}
