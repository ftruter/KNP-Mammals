import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collectEntries } from '../scripts/seed.mjs'
import { PAGE_CACHE } from '../src/cache.js'
import { parseUrl, searchQuery } from '../src/route.js'
import {
  fold,
  loadSearchRecords,
  recordsFromIndexes,
  searchRecords,
  searchText,
} from '../src/search.js'
import { handleRequest } from '../src/worker.js'

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (path, init) =>
  handleRequest(new Request(`${origin}${path}`, init), env)

const route = (path) => parseUrl(new URL(`${origin}${path}`))

const slugOf = (result) => new URL(result.pages.html).pathname.split('/').at(-1)

test('search routes parse q in every format', () => {
  for (const [path, format] of [
    ['/search', 'html'],
    ['/search.md', 'md'],
    ['/search.json', 'json'],
  ]) {
    const parsed = route(`${path}?q=%20lion%20`)
    assert.equal(parsed.kind, 'search')
    assert.equal(parsed.format, format)
    assert.equal(parsed.pathname, '/search')
    assert.equal(parsed.query, 'lion')
  }
  assert.equal(route('/search').query, '')
  assert.equal(searchQuery('x'.repeat(500)).length, 200)
  assert.equal(route('/search/?q=leeu').kind, 'redirect')
  assert.equal(route('/search/?q=leeu').location, '/search?q=leeu')
})

test('folding ignores case and diacritics, and ties break by scientific name', () => {
  assert.equal(fold('Éland'), 'eland')
  const records = recordsFromIndexes(
    {
      species: [
        { slug: 'zebra-zed', latin: 'Zebra zed', en: 'Same', af: null },
        { slug: 'aard-aaa', latin: 'Aardvark aaa', en: 'Same', af: 'Éland' },
      ],
    },
    { families: [] },
  )
  const found = searchRecords(records, 'eland', 10, origin)
  assert.equal(found.total, 1)
  assert.equal(found.results[0].afrikaansName, 'Éland')
  const tied = searchRecords(records, 'same', 10, origin)
  assert.deepEqual(tied.results.map(slugOf), ['aard-aaa', 'zebra-zed'])
})

test('names are scored without account text, and the page cap is 50', () => {
  const species = [
    {
      slug: 'noted',
      latin: 'Notus notus',
      en: 'Plain',
      af: null,
      notes: 'fossorial camp coordinate',
    },
    ...Array.from({ length: 60 }, (_, index) => ({
      slug: `broad-${index}`,
      latin: `Broadname ${String(index).padStart(2, '0')}`,
      en: `Broadname ${index}`,
      af: null,
    })),
  ]
  const records = recordsFromIndexes({ species }, { families: [] })
  assert.equal(searchRecords(records, 'fossorial', 10, origin).total, 0)
  assert.equal(searchRecords(records, 'camp', 10, origin).total, 0)
  const broad = searchRecords(records, 'broadname', 50, origin)
  assert.equal(broad.total, 60)
  assert.equal(broad.results.length, 50)
  const text = searchText('plain', searchRecords(records, 'plain', 5, origin))
  assert.match(text, /1 of 1 matches/)
  assert.match(text, /Notus notus — Plain/)
  assert.match(text, /\/species\/noted/)
})

test('published names find the lion, the wildebeest and the cat family', async () => {
  const lionQueries = ['lion', 'Leeu', 'Panthera leo', 'mammal lion']
  for (const query of lionQueries) {
    const data = await (
      await get(`/search.json?q=${encodeURIComponent(query)}`)
    ).json()
    assert.equal(slugOf(data.results[0]), 'panthera-leo', query)
  }
  for (const query of ['Blouwildebees', 'wildebeest', 'Connochaetes']) {
    const data = await (
      await get(`/search.json?q=${encodeURIComponent(query)}`)
    ).json()
    assert.ok(
      data.results.some((result) => slugOf(result) === 'connochaetes-taurinus'),
      query,
    )
  }
  for (const query of ['Cats', 'katfamilie', 'Felidae']) {
    const data = await (
      await get(`/search.json?q=${encodeURIComponent(query)}`)
    ).json()
    const family = data.results.find((result) => slugOf(result) === 'felidae')
    assert.equal(family?.kind, 'family', query)
    assert.equal(family.afrikaansName, 'katfamilie')
  }
  const aardvark = await (await get('/search.json?q=Orycteropodidae')).json()
  const family = aardvark.results.find(
    (result) => slugOf(result) === 'orycteropodidae',
  )
  assert.equal(family.kind, 'family')
  assert.equal(family.scientificName, 'Orycteropodidae')
  assert.equal(family.afrikaansName, null)
  assert.equal(family.pages.html, `${origin}/family/orycteropodidae`)
  assert.equal(family.pages.markdown, `${origin}/family/orycteropodidae.md`)
  assert.equal(family.pages.json, `${origin}/family/orycteropodidae.json`)
})

test('search reads the two indexes and still matches a species with no account', async () => {
  const speciesIndex = JSON.parse(store.get('index/species'))
  speciesIndex.species.push({
    slug: 'no-account',
    latin: 'Sine specie',
    en: 'No account',
    af: null,
    researched: false,
  })
  const keys = []
  const watched = {
    MAMMALS_KV: {
      get: async (key) => {
        keys.push(key)
        if (key === 'index/species') return JSON.stringify(speciesIndex)
        return store.get(key) ?? null
      },
    },
  }
  const response = await handleRequest(
    new Request(`${origin}/search.json?q=${encodeURIComponent('Sine specie')}`),
    watched,
  )
  const data = await response.json()
  assert.equal(response.status, 200)
  assert.equal(slugOf(data.results[0]), 'no-account')
  assert.equal(data.results[0].englishName, 'No account')
  assert.deepEqual(keys.sort(), ['index/families', 'index/species'])
  const golden = await (await get('/search.json?q=golden')).json()
  for (const slug of [
    'chrysochloridae',
    'calcochloris-obtusirostris',
    'neamblysomus-julianae',
  ])
    assert.ok(
      golden.results.some((result) => slugOf(result) === slug),
      slug,
    )
  assert.equal((await (await get('/search.json?q=fossorial')).json()).total, 0)
  assert.equal((await (await get('/search.json?q=nyadu')).json()).total, 0)
  const place = await (await get('/search.json?q=southwestern')).json()
  assert.ok(
    place.results.every((result) => slugOf(result) !== 'neamblysomus-julianae'),
  )
  assert.equal((await (await get('/search.json?q=Carnivora')).json()).total, 0)
})

test('a search page lists names, escapes a miss, and caps the list', async () => {
  const response = await get('/search?q=%20lion%20')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), PAGE_CACHE)
  assert.match(response.headers.get('content-type'), /^text\/html/)
  assert.match(
    response.headers.get('link'),
    /<https:\/\/mammals\.example\/search\?q=lion>; rel="canonical"/,
  )
  assert.match(response.headers.get('link'), /\/search\.md\?q=lion>/)
  assert.match(response.headers.get('link'), /\/search\.json\?q=lion>/)
  const html = await response.text()
  assert.match(html, /<meta name="robots" content="noindex">/)
  assert.match(html, /<h2 id="search-count">\d+ results? for “lion”<\/h2>/)
  assert.match(html, /<a href="\/species\/panthera-leo">Lion<\/a>/)
  assert.match(html, /<span class="latin">Panthera leo<\/span>/)
  assert.match(html, /<span class="afrikaans">Leeu<\/span>/)
  assert.match(html, /name="q" value="lion"/)
  assert.match(html, /href="\/search\.md\?q=lion"/)
  assert.doesNotMatch(html, /search-snippets/)

  const empty = await get('/search')
  assert.equal(empty.status, 200)
  const emptyHtml = await empty.text()
  assert.match(emptyHtml, /<h1>Search<\/h1>/)
  assert.match(
    emptyHtml,
    /Type an English, Afrikaans or Latin name, or a family, into the search box\./,
  )
  assert.doesNotMatch(emptyHtml, /search-results/)
  assert.match(emptyHtml, /<meta name="robots" content="noindex">/)
  assert.match(
    empty.headers.get('link'),
    /<https:\/\/mammals\.example\/search>; rel="canonical"/,
  )
  assert.doesNotMatch(empty.headers.get('link'), /q=/)

  const hostile = await get('/search?q=%3Cb%3Equetzal%3C%2Fb%3E')
  assert.equal(hostile.status, 200)
  const hostileHtml = await hostile.text()
  assert.match(hostileHtml, /0 results for “&lt;b&gt;quetzal&lt;\/b&gt;”/)
  assert.match(hostileHtml, /No mammal matched “&lt;b&gt;quetzal&lt;\/b&gt;”/)
  assert.match(hostileHtml, /<a href="\/species">species<\/a>/)
  assert.match(hostileHtml, /<a href="\/families">families<\/a>/)
  assert.doesNotMatch(hostileHtml, /<b>quetzal/)

  const none = await (await get('/search.json?q=quetzal')).json()
  assert.deepEqual(
    {
      kind: none.kind,
      query: none.query,
      limit: none.limit,
      total: none.total,
      results: none.results,
    },
    { kind: 'search', query: 'quetzal', limit: 50, total: 0, results: [] },
  )

  const long = 'y'.repeat(500)
  const cut = await (await get(`/search.json?q=${long}`)).json()
  assert.equal(cut.query.length, 200)
  assert.equal(cut.query, 'y'.repeat(200))
})

test('markdown and json hits use species and family paths', async () => {
  const md = await get('/search.md?q=lion')
  assert.match(md.headers.get('content-type'), /^text\/markdown/)
  assert.match(md.headers.get('link'), /\/search\.md\?q=lion>/)
  const text = await md.text()
  assert.match(text, /^# Search\n/)
  assert.match(text, /## \d+ results? for “lion”/)
  assert.match(
    text,
    /- Species: \[Lion\]\(\/species\/panthera-leo\.md\) — \*Panthera leo\* · Leeu/,
  )
  const family = await (await get('/search.md?q=Felidae')).text()
  assert.match(
    family,
    /- Family: \[Cats\]\(\/family\/felidae\.md\) — \*Felidae\* · katfamilie/,
  )
  const missed = await (await get('/search.md?q=quetzal')).text()
  assert.match(missed, /## 0 results for “quetzal”/)
  assert.match(missed, /\[species\]\(\/species\.md\)/)
  assert.match(missed, /\[families\]\(\/families\.md\)/)

  const data = await (await get('/search.json?q=lion')).json()
  const lion = data.results.find((result) => slugOf(result) === 'panthera-leo')
  assert.deepEqual(Object.keys(lion).sort(), [
    'afrikaansName',
    'englishName',
    'kind',
    'pages',
    'scientificName',
  ])
  assert.equal(lion.kind, 'species')
  assert.equal(lion.scientificName, 'Panthera leo')
  assert.equal(lion.englishName, 'Lion')
  assert.equal(lion.afrikaansName, 'Leeu')
  assert.deepEqual(lion.pages, {
    html: `${origin}/species/panthera-leo`,
    markdown: `${origin}/species/panthera-leo.md`,
    json: `${origin}/species/panthera-leo.json`,
  })
})

test('the home page links to search and every html page has the header form', async () => {
  const home = await (await get('/')).text()
  assert.ok(
    home.indexOf('href="/species"') < home.indexOf('href="/search"'),
    'Search follows Species',
  )
  assert.match(home, /<a href="\/search">Search<\/a>/)
  assert.doesNotMatch(home, /<meta name="robots" content="noindex">/)
  const md = await (await get('/.md')).text()
  assert.match(md, /\[Search\]\(\/search\.md\)/)
  assert.ok(md.indexOf('(/species.md)') < md.indexOf('(/search.md)'))

  for (const path of [
    '/',
    '/family/felidae',
    '/species/panthera-leo',
    '/no-such-page',
  ]) {
    const html = await (await get(path)).text()
    const form = html.indexOf(
      '<form class="site-search" role="search" method="get" action="/search">',
    )
    const input = html.indexOf(
      '<input id="site-search-q" type="search" name="q"',
    )
    const nav = html.indexOf('<nav aria-label="Site">')
    assert.ok(form > html.indexOf('<div class="brand">'), path)
    assert.ok(input > form && input < nav, path)
    assert.match(html, /placeholder="Search mammals"/, path)
    assert.match(html, /Type <kbd>\/<\/kbd> to search/, path)
    assert.match(
      html,
      /<button class="site-search-submit" type="submit">Search<\/button>/,
      path,
    )
  }
  const species = await (await get('/species?q=lion')).text()
  assert.match(species, /name="q" value=""/)
  const redirect = await get('/search/?q=leeu')
  assert.equal(redirect.status, 301)
  assert.equal(redirect.headers.get('location'), '/search?q=leeu')
})

test('more than 50 hits show the first 50', async () => {
  const species = Array.from({ length: 51 }, (_, index) => ({
    slug: `broadname-${String(index).padStart(2, '0')}`,
    latin: `Broadname ${String(index).padStart(2, '0')}`,
    en: `Broadname ${index}`,
    af: null,
  }))
  const broadEnv = {
    MAMMALS_KV: {
      get: async (key) => {
        if (key === 'index/species') return JSON.stringify({ species })
        if (key === 'index/families') return JSON.stringify({ families: [] })
        return null
      },
    },
  }
  const response = await handleRequest(
    new Request(`${origin}/search?q=broadname`),
    broadEnv,
  )
  const html = await response.text()
  assert.match(html, /Showing the first 50\./)
  const data = await (
    await handleRequest(
      new Request(`${origin}/search.json?q=broadname`),
      broadEnv,
    )
  ).json()
  assert.equal(data.total, 51)
  assert.equal(data.results.length, 50)
  assert.equal(data.limit, 50)
  const markdown = await (
    await handleRequest(
      new Request(`${origin}/search.md?q=broadname`),
      broadEnv,
    )
  ).text()
  assert.match(markdown, /Showing the first 50\./)
})

test('a missing binding fails a query and still serves the blank page', async () => {
  await assert.rejects(loadSearchRecords(null), /MAMMALS_KV binding is missing/)
  const blank = await handleRequest(new Request(`${origin}/search`), {})
  assert.equal(blank.status, 200)
  const query = await handleRequest(new Request(`${origin}/search?q=lion`), {})
  assert.equal(query.status, 500)
})
