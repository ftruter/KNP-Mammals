import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'
import { loadSearchRecords, searchRecords } from '../src/search.js'
import { fetchPage, loadStore, repoRoot, workerEnv } from './helpers.js'

const { records } = await loadStore()
const env = workerEnv(records)
const ORIGIN = 'https://mammals.test'
const body = async (pathname) => (await fetchPage(pathname, env)).text()
const speciesJson = await body('/species.json')
const familiesJson = await body('/families.json')
const speciesRows = JSON.parse(speciesJson).species
const familyRows = JSON.parse(familiesJson).families

const swSource = await readFile(path.join(repoRoot, 'src/client/sw.js'), 'utf8')

/** A fake Cache Storage holding `{ cacheName: { url: body } }`. */
const fakeCaches = (contents) => {
  const names = Object.keys(contents)
  const open = async (name) => ({
    match: async (url, { ignoreSearch = false } = {}) => {
      const wanted = new URL(url)
      for (const [key, value] of Object.entries(contents[name] ?? {})) {
        const have = new URL(key, ORIGIN)
        if (
          have.pathname === wanted.pathname &&
          (ignoreSearch || have.search === wanted.search)
        )
          return new Response(value, {
            headers: { 'content-type': 'text/html' },
          })
      }
      return undefined
    },
    keys: async () =>
      Object.keys(contents[name] ?? {}).map(
        (key) => new Request(new URL(key, ORIGIN)),
      ),
    put: async () => {},
  })
  return { keys: async () => names, open }
}

/** Runs the worker script and returns what it answers for one request. */
const answer = async (cacheContents, url, { online = false, mode } = {}) => {
  const handlers = {}
  const self = {
    addEventListener: (type, handler) => (handlers[type] = handler),
    location: { origin: ORIGIN },
    caches: fakeCaches(cacheContents),
    skipWaiting() {},
    clients: { claim: async () => {} },
  }
  vm.runInNewContext(swSource, {
    self,
    Response,
    Headers,
    URL,
    URLSearchParams,
    fetch: async () => {
      if (!online) throw new TypeError('offline')
      return new Response('online', { status: 200 })
    },
    setTimeout,
    console,
  })
  let responded
  await new Promise((resolve) => {
    handlers.fetch({
      request: {
        url,
        method: 'GET',
        mode: mode ?? 'navigate',
        headers: new Headers(),
      },
      respondWith: (promise) => {
        responded = promise
        resolve()
      },
      waitUntil() {},
    })
  })
  const response = await responded
  return { response, text: await response.text() }
}

const pages = (extra = {}) => ({
  'offline-pages-1': {
    '/species.json': speciesJson,
    '/families.json': familiesJson,
    '/style.css?v=abc': 'body{}',
    '/favicon.svg?v=1': '<svg/>',
    '/species': 'x',
    '/families': 'x',
    '/': 'x',
    ...Object.fromEntries(
      [...speciesRows.map((row) => `/species/${row.slug}`)].map((key) => [
        key,
        'x',
      ]),
    ),
    ...Object.fromEntries(
      familyRows.map((row) => [`/family/${row.slug}`, 'x']),
    ),
    ...extra,
  },
})

test('with no signal, a search is answered from the saved name lists', async () => {
  const { response, text } = await answer(
    pages(),
    `${ORIGIN}/search?q=wildebeest`,
  )
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.match(
    text,
    /<h2 id="search-count">\d+ results? for “wildebeest”<\/h2>/,
  )
  assert.match(
    text,
    /<a href="\/species\/connochaetes-taurinus">Blue wildebeest<\/a>/,
  )
  assert.match(text, /<span class="latin">Connochaetes taurinus<\/span>/)
  assert.match(text, /no photographs or calls/)
  assert.match(text, /<link rel="stylesheet" href="\/style\.css\?v=abc">/)
  assert.match(text, /name="q" value="wildebeest"/)
  assert.match(text, /<nav aria-label="Breadcrumb">/)
  assert.doesNotMatch(text, /No signal/)
})

test('the saved search ranks and finds exactly as the server does', async () => {
  const live = await loadSearchRecords(env.MAMMALS_KV)
  for (const query of [
    'lion',
    'leeu',
    'golden mole',
    'panthera',
    'hyaena',
    'bat',
    'rat',
    'what mammals live in kruger',
    'Éland',
    'Sciuridae',
  ]) {
    const expected = searchRecords(live, query, 50, ORIGIN)
    const { text } = await answer(
      pages(),
      `${ORIGIN}/search?q=${encodeURIComponent(query)}`,
    )
    const shown = [...text.matchAll(/<h3><a href="([^"]+)">/g)].map(
      (found) => found[1],
    )
    assert.deepEqual(
      shown,
      expected.results.map((result) => new URL(result.pages.html).pathname),
      query,
    )
    assert.match(
      text,
      new RegExp(
        `${expected.total} ${expected.total === 1 ? 'result' : 'results'} for|No mammal matched`,
      ),
      query,
    )
  }
})

test('a match that is not saved is counted and not linked', async () => {
  const cache = pages()
  delete cache['offline-pages-1']['/species/connochaetes-taurinus']
  const { text } = await answer(cache, `${ORIGIN}/search?q=wildebeest`)
  assert.doesNotMatch(text, /href="\/species\/connochaetes-taurinus"/)
  assert.match(text, /but that page is not saved on this device|more name/)
})

test('another search is never answered from a saved search page', async () => {
  const cache = pages({ '/search?q=lion': '<p>saved lion search</p>' })
  const { text } = await answer(cache, `${ORIGIN}/search?q=zebra`)
  assert.doesNotMatch(text, /saved lion search/)
  assert.match(text, /“zebra”/)
})

test('a blank or hostile query is handled and escaped', async () => {
  const blank = await answer(pages(), `${ORIGIN}/search`)
  assert.match(blank.text, /Type an English, Afrikaans or Latin name/)
  const hostile = await answer(
    pages(),
    `${ORIGIN}/search?q=${encodeURIComponent('<b>quetzal</b>')}`,
  )
  assert.doesNotMatch(hostile.text, /<b>quetzal/)
  assert.match(hostile.text, /No mammal matched “&lt;b&gt;quetzal&lt;\/b&gt;”/)
  assert.match(hostile.text, /browse the <a href="\/species">species<\/a>/)
})

test('with no name lists saved, search says so on the styled page', async () => {
  const { response, text } = await answer(
    { 'offline-pages-1': { '/style.css?v=abc': 'body{}' } },
    `${ORIGIN}/search?q=lion`,
  )
  assert.equal(response.status, 503)
  assert.match(text, /The mammal names are not saved on this device/)
  assert.match(text, /<header class="site-header">/)
  assert.doesNotMatch(text, /Search saved mammals/)
})

test('any other page with no signal is a styled page with a way on', async () => {
  const { response, text } = await answer(
    pages(),
    `${ORIGIN}/species/not-saved-here`,
  )
  assert.equal(response.status, 503)
  assert.match(text, /<title>No signal · KNP Mammals<\/title>/)
  assert.match(text, /<link rel="stylesheet" href="\/style\.css\?v=abc">/)
  assert.match(text, /<header class="site-header">/)
  assert.match(text, /<a href="\/search">Search saved mammals<\/a>/)
  assert.match(text, /<a href="\/species">Species<\/a>/)
  assert.match(text, /<a href="\/families">Families<\/a>/)
  assert.doesNotMatch(text, /Check the spelling/)
})

test('with nothing saved the no-signal page still has a way home', async () => {
  const { response, text } = await answer({}, `${ORIGIN}/species/lion`)
  assert.equal(response.status, 503)
  assert.match(text, /No signal/)
  assert.match(text, /<a href="\/">Home<\/a>/)
})

test('a signal still gets the server page, and other requests still fail', async () => {
  const live = await answer(pages(), `${ORIGIN}/search?q=lion`, {
    online: true,
  })
  assert.equal(live.text, 'online')
  await assert.rejects(
    answer(pages(), `${ORIGIN}/data.json`, { mode: 'cors' }),
    /offline/,
  )
})

/** The page script, run against a small stand-in for the document. */
const runPage = async ({
  pathname = '/species/panthera-leo',
  search = '',
  standalone = true,
  stored = {},
  crumbs = true,
}) => {
  const source = (
    await readFile(path.join(repoRoot, 'src/client/app.js'), 'utf8')
  ).replace('export const compareSortKeys', 'const compareSortKeys')
  const inserted = []
  const el = (tag) => ({
    tag,
    attrs: {},
    kids: [],
    setAttribute(name, value) {
      this.attrs[name] = value
    },
    append(child) {
      this.kids.push(child)
    },
  })
  const crumbNav = {
    after: (node) => inserted.push(['after', node]),
  }
  const wrap = { prepend: (node) => inserted.push(['prepend', node]) }
  const storage = { ...stored }
  vm.runInNewContext(source, {
    document: {
      createElement: el,
      querySelectorAll: () => [],
      querySelector: (selector) =>
        selector === 'nav[aria-label="Breadcrumb"]' && crumbs
          ? crumbNav
          : selector === 'main .wrap'
            ? wrap
            : null,
      addEventListener() {},
      documentElement: { classList: { add() {} } },
    },
    window: {
      location: {
        origin: ORIGIN,
        href: ORIGIN + pathname + search,
        pathname,
        search,
      },
      navigator: { standalone: false },
      matchMedia: (query) => ({
        matches: standalone && query.includes('standalone'),
      }),
      requestAnimationFrame: (fn) => fn(),
      addEventListener() {},
      localStorage: {
        getItem: (key) => storage[key] ?? null,
        setItem: (key, value) => (storage[key] = value),
      },
    },
    URL,
    URLSearchParams,
    console,
  })
  return { inserted, storage }
}

test('the installed app puts a way back to the last search on a page', async () => {
  const { inserted } = await runPage({
    stored: { 'knp-mammals-last-search': 'golden mole' },
  })
  assert.equal(inserted.length, 1)
  const [where, item] = inserted[0]
  assert.equal(where, 'after')
  assert.equal(item.attrs.className ?? item.className, 'search-return')
  const link = item.kids[0]
  assert.equal(link.attrs.href, '/search?q=golden+mole')
  assert.equal(link.textContent, '← Back to search results for “golden mole”')
})

test('with no search yet the way back is the search page, and pages with no crumbs get it first', async () => {
  const { inserted } = await runPage({ crumbs: false, pathname: '/' })
  assert.equal(inserted[0][0], 'prepend')
  const link = inserted[0][1].kids[0]
  assert.equal(link.attrs.href, '/search')
  assert.equal(link.textContent, '← Search')
})

test('a browser tab has no extra link, and the search page remembers its query', async () => {
  const tab = await runPage({ standalone: false })
  assert.equal(tab.inserted.length, 0)
  const search = await runPage({
    pathname: '/search',
    search: '?q=%20leeu%20',
  })
  assert.equal(search.inserted.length, 0)
  assert.equal(search.storage['knp-mammals-last-search'], 'leeu')
  const blank = await runPage({ pathname: '/search', search: '' })
  assert.equal(blank.storage['knp-mammals-last-search'], undefined)
})
