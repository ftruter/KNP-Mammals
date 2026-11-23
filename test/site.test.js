import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NO_STORE, PAGE_CACHE } from '../src/cache.js'
import { escapeHtml, inlineText } from '../src/escape.js'
import { parseUrl } from '../src/route.js'
import { handleRequest } from '../src/worker.js'
import { fetchPage, loadStore, ORIGIN, workerEnv } from './helpers.js'

const { records } = await loadStore()
const store = new Map(Object.entries(records))
const env = workerEnv(records)
const origin = ORIGIN
const get = (path, init) => fetchPage(path, env, init)

const alternatesOf = (pathname) =>
  pathname === '/'
    ? { html: '/', md: '/.md', json: '/.json' }
    : { html: pathname, md: `${pathname}.md`, json: `${pathname}.json` }

const headValue = (html, pattern) => {
  const found = html.match(pattern)
  return found ? found[1] : ''
}

/**
 * Title, description, canonical, and the Markdown and JSON alternates.
 * A 200 page also sends those three in the Link header. A 404 puts them
 * in the HTML head only.
 */
const assertSeo = async (pathname, { title, description, status = 200 }) => {
  const response = await get(pathname)
  assert.equal(response.status, status, pathname)
  assert.match(response.headers.get('content-type'), /^text\/html/, pathname)
  const html = await response.text()
  const alts = alternatesOf(pathname)
  assert.equal(
    headValue(html, /<title>([^<]*)<\/title>/),
    escapeHtml(title),
    pathname,
  )
  assert.equal(
    headValue(html, /<meta name="description" content="([^"]*)">/),
    escapeHtml(description),
    pathname,
  )
  assert.equal(
    headValue(html, /<link rel="canonical" href="([^"]*)">/),
    origin + alts.html,
    pathname,
  )
  assert.equal(
    headValue(
      html,
      /<link rel="alternate" type="text\/markdown" href="([^"]*)"/,
    ),
    alts.md,
    pathname,
  )
  assert.equal(
    headValue(
      html,
      /<link rel="alternate" type="application\/json" href="([^"]*)"/,
    ),
    alts.json,
    pathname,
  )
  if (status !== 200) return
  assert.equal(
    response.headers.get('link'),
    [
      `<${origin}${alts.html}>; rel="canonical"`,
      `<${origin}${alts.md}>; rel="alternate"; type="text/markdown"`,
      `<${origin}${alts.json}>; rel="alternate"; type="application/json"`,
    ].join(', '),
    pathname,
  )
}

test('routes map to KV keys and formats', () => {
  const route = (path) => parseUrl(new URL(`${origin}${path}`))
  assert.deepEqual(route('/'), {
    kind: 'home',
    format: 'html',
    pathname: '/',
    key: 'index/families',
  })
  assert.equal(route('/.md').format, 'md')
  assert.equal(route('/.json').key, 'index/families')
  assert.equal(route('/families.md').kind, 'families')
  assert.equal(route('/app.js').kind, 'script')
  assert.equal(route('/species.json').key, 'index/species')
  assert.equal(route('/family/bovidae').key, 'family/bovidae')
  assert.equal(route('/orders').key, 'index/families')
  assert.equal(route('/order/carnivora.json').key, 'order/carnivora')
  assert.equal(
    route('/species/connochaetes-taurinus.md').key,
    'species/connochaetes-taurinus',
  )
  assert.equal(route('/species/Bad_Slug').kind, 'not-found')
  assert.equal(route('/family/bovidae/extra').kind, 'not-found')
  assert.equal(route('/family/bovidae/').location, '/family/bovidae')
})

test('home links to the lists and has three formats', async () => {
  const html = await get('/')
  assert.equal(html.status, 200)
  assert.equal(html.headers.get('cache-control'), PAGE_CACHE)
  assert.match(html.headers.get('content-type'), /^text\/html/)
  assert.match(html.headers.get('link'), /rel="canonical"/)
  const body = await html.text()
  const index = JSON.parse(store.get('index/families'))
  assert.match(body, /<a href="\/families">Families<\/a> <span>39<\/span>/)
  assert.match(
    body,
    /<script type="module" defer src="\/app\.js\?v=[0-9a-f]+">/,
  )

  const md = await get('/.md')
  assert.match(md.headers.get('content-type'), /^text\/markdown/)
  assert.match(await md.text(), /\(\/families\.md\)/)

  const json = await get('/.json')
  assert.deepEqual(await json.json(), index)
})

const column = (body, index) =>
  [...body.matchAll(/<tr data-latin="[^"]*">(.*?)<\/tr>/g)].map((row) =>
    [...row[1].matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/g)][index][1].replace(
      /<[^>]+>/g,
      '',
    ),
  )

test('the families table lists every family and sorts by the query', async () => {
  const index = JSON.parse(store.get('index/families'))
  const body = await (await get('/families')).text()
  for (const family of index.families)
    assert.ok(body.includes(`href="/family/${family.slug}"`), family.slug)
  const english = column(body, 0)
  assert.deepEqual(
    english,
    english
      .slice()
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
  )
  assert.match(
    body,
    /<th scope="col" aria-sort="ascending"><a href="\/families\?sort=en&amp;dir=desc">English <span class="sort-mark"/,
  )

  const byCount = await (await get('/families?sort=species&dir=desc')).text()
  const counts = column(byCount, 4).map(Number)
  assert.equal(counts[0], Math.max(...counts))
  assert.deepEqual(
    counts,
    counts.slice().sort((a, b) => b - a),
  )
  assert.match(
    byCount,
    /aria-sort="descending"><a href="\/families\?sort=species&amp;dir=asc"/,
  )

  const junk = await (await get('/families?sort=nope&dir=sideways')).text()
  assert.deepEqual(column(junk, 0), english)
})

test('orders have a list, a page each, and links from the other pages', async () => {
  const index = JSON.parse(store.get('index/families'))
  const home = await (await get('/')).text()
  assert.match(home, /<a href="\/orders">Orders<\/a> <span>14<\/span>/)

  const list = await (await get('/orders')).text()
  for (const order of index.orders)
    assert.ok(list.includes(`href="/order/${order.slug}"`), order.slug)
  const bySpecies = await (await get('/orders?sort=species&dir=desc')).text()
  assert.equal(column(bySpecies, 0)[0], 'Chiroptera')

  const page = await (await get('/order/carnivora')).text()
  assert.match(page, /<h1>Carnivora<\/h1>/)
  assert.match(page, /6 families and 27 species in Kruger\./)
  assert.ok(page.includes('href="/family/felidae"'))
  assert.ok(page.includes('href="/species/panthera-leo"'))
  assert.equal((await get('/order/nonsense')).status, 404)

  for (const path of [
    '/families',
    '/species',
    '/family/felidae',
    '/species/panthera-leo',
  ])
    assert.ok(
      (await (await get(path)).text()).includes(
        '<a href="/order/carnivora">Carnivora</a>',
      ),
      path,
    )
  assert.match(
    await (await get('/family/felidae.md')).text(),
    /Order: \[Carnivora\]\(\/order\/carnivora\.md\)/,
  )
})

test('species without an estimate sort last in either direction', async () => {
  for (const dir of ['asc', 'desc']) {
    const body = await (await get(`/species?sort=population&dir=${dir}`)).text()
    const cells = column(body, 5)
    const firstBlank = cells.indexOf('—')
    assert.ok(firstBlank > 0, dir)
    assert.ok(
      cells.slice(firstBlank).every((cell) => cell === '—'),
      dir,
    )
  }
})

test('every family and species page renders', async () => {
  const index = JSON.parse(store.get('index/species'))
  const paths = [
    '/families',
    '/orders',
    '/species',
    ...index.species.map((s) => `/species/${s.slug}`),
    ...[...store.keys()]
      .filter((key) => /^(family|order)\//.test(key))
      .map((key) => `/${key}`),
  ]
  for (const path of paths) {
    for (const suffix of ['', '.md', '.json']) {
      const response = await get(`${path}${suffix}`)
      assert.equal(response.status, 200, `${path}${suffix}`)
      assert.ok((await response.text()).length > 0)
    }
  }
})

test('a researched species page has photographs, facts and credits', async () => {
  const body = await (await get('/species/connochaetes-taurinus')).text()
  assert.match(body, /<h1>Blue wildebeest<\/h1>/)
  assert.match(body, /<p class="afrikaans">Blouwildebees<\/p>/)
  assert.match(body, /href="\/family\/bovidae"/)
  assert.match(
    body,
    /<figure class="plate">\s*<button type="button" class="zoom"/,
  )
  assert.match(
    body,
    /<img draggable="false" src="\/images\/[^"]+" alt="[^"]+" loading="lazy">/,
  )
  assert.equal(
    body.match(/<img /g).length - body.match(/loading="lazy"/g).length,
    1,
  )
  assert.match(body, /<details class="credit"/)
  assert.match(
    body,
    /<dt>Mass<\/dt><dd>males 165–290 kg, females 140–260 kg<\/dd>/,
  )
  assert.match(
    body,
    /<dd class="population"><details class="more"><summary>16,700–21,948 individuals<\/summary>/,
  )
  assert.match(body, /<a href="\/species\/panthera-leo">Lion<\/a>/)
  assert.ok(!body.includes('have not been published yet'))
  const md = await (await get('/species/connochaetes-taurinus.md')).text()
  assert.match(md, /## Photographs/)
  assert.match(md, /Mass: males 165–290 kg, females 140–260 kg/)
})

test("Juliana's golden mole shows the Imagined by Grok illustration", async () => {
  const caption =
    'Imagined by Grok. An illustration, not a photograph of a real animal.'
  const body = await (await get('/species/neamblysomus-julianae')).text()
  assert.match(body, /<span class="ai-label">AI-generated image<\/span>/)
  assert.ok(body.includes(caption))
  assert.match(
    body,
    /src="https:\/\/raw\.githubusercontent\.com\/ftruter\/KNP-Mammals\/main\/media\/images\/neamblysomus-julianae\/imagined-by-grok\.jpg"/,
  )
  const credit = body.match(/<details class="credit"[\s\S]*?<\/details>/)?.[0]
  assert.ok(credit)
  assert.match(credit, />Grok</)
  assert.match(credit, /CC0 1\.0/)
  assert.equal(credit.includes('Photograph, not AI-generated.'), false)
  assert.equal(
    body.includes('No photograph is stored for this species yet.'),
    false,
  )

  const md = await (await get('/species/neamblysomus-julianae.md')).text()
  assert.ok(md.includes(caption))
  assert.match(md, /Credit: Grok, CC0 1\.0/)
  assert.equal(md.includes('Photograph, not AI-generated.'), false)
})

test('a species with no account says so', async () => {
  // Every listed species now has a details file, so this stands in for one
  // that does not. It is not a species record.
  const index = JSON.parse(store.get('index/species'))
  assert.ok(index.species.every((species) => species.researched))
  const bare = {
    MAMMALS_KV: {
      get: async (key) =>
        key === 'species/no-account'
          ? JSON.stringify({
              slug: 'no-account',
              en: 'No account',
              latin: 'Sine specie',
              family: 'Cats',
              familySlug: 'felidae',
              familyEn: 'Cats',
              order: 'Carnivora',
              orderSlug: 'carnivora',
            })
          : null,
    },
  }
  const body = await (
    await handleRequest(new Request(`${origin}/species/no-account`), bare)
  ).text()
  assert.match(
    body,
    /The details for this species have not been published yet\./,
  )
  assert.ok(!body.includes('class="plate"'))
  assert.ok(!body.includes('class="population"'))
})

test('text from KV is escaped', async () => {
  const hostile = {
    MAMMALS_KV: {
      get: async () =>
        JSON.stringify({
          slug: 'x',
          en: '<script>alert(1)</script>',
          latin: 'A & b',
          order: 'O',
          species: [],
          sources: ['javascript:alert(1)', 'https://example.org/a'],
        }),
    },
  }
  const response = await handleRequest(
    new Request(`${origin}/family/x`),
    hostile,
  )
  const body = await response.text()
  assert.ok(!body.includes('<script>alert'))
  assert.ok(!body.includes('javascript:'))
  assert.match(body, /A &amp; b/)
  assert.match(body, /https:\/\/example\.org\/a/)
})

test('missing pages, other methods, redirects and the stylesheet', async () => {
  const missing = await get('/species/no-such-animal')
  assert.equal(missing.status, 404)
  assert.equal((await get('/nothing.json')).status, 404)

  const post = await get('/', { method: 'POST' })
  assert.equal(post.status, 405)
  assert.equal(post.headers.get('allow'), 'GET, HEAD')

  const redirect = await get('/species/?x=1')
  assert.equal(redirect.status, 301)
  assert.equal(redirect.headers.get('location'), '/species?x=1')

  const style = await get('/style.css')
  assert.match(style.headers.get('content-type'), /^text\/css/)
  assert.match(await style.text(), /--header-bg/)

  const script = await get('/app.js?v=1')
  assert.match(script.headers.get('content-type'), /^text\/javascript/)
  assert.match(await script.text(), /bindTables\(\)/)
  assert.match(
    script.headers.get('content-security-policy'),
    /script-src 'self'/,
  )
})

test('the site icon is linked and served in every size', async () => {
  const body = await (await get('/')).text()
  assert.match(
    body,
    /<link rel="icon" href="\/favicon\.svg\?v=[0-9a-f]+" type="image\/svg\+xml">/,
  )
  const types = {
    '/favicon.ico': 'image/x-icon',
    '/favicon.svg': 'image/svg+xml',
    '/apple-touch-icon.png': 'image/png',
    '/icon-192.png': 'image/png',
    '/icon-512.png': 'image/png',
    '/icon-maskable-512.png': 'image/png',
  }
  for (const [path, type] of Object.entries(types)) {
    const response = await get(`${path}?v=1`)
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('content-type'), type)
    const bytes = new Uint8Array(await response.arrayBuffer())
    assert.equal(String(bytes.length), response.headers.get('content-length'))
    if (type === 'image/png')
      assert.deepEqual([...bytes.slice(1, 4)], [0x50, 0x4e, 0x47], path)
  }
  const svg = await (await get('/favicon.svg')).text()
  assert.match(svg, /^<svg xmlns/)
  assert.ok(!svg.includes('M112 320'), 'the tab icon has no lettering')
})

test('a missing binding is a 500, not a crash', async () => {
  const response = await handleRequest(new Request(`${origin}/`), {})
  assert.equal(response.status, 500)
  assert.equal(response.headers.get('cache-control'), NO_STORE)
})

test('pages are not stored while a KV read may be stale', async () => {
  const fresh = { ...env, DATA_PUBLISHED_AT: String(Date.now()) }
  const response = await handleRequest(new Request(`${origin}/`), fresh)
  assert.equal(response.headers.get('cache-control'), NO_STORE)
  const old = { ...env, DATA_PUBLISHED_AT: String(Date.now() - 120_000) }
  const later = await handleRequest(new Request(`${origin}/`), old)
  assert.equal(later.headers.get('cache-control'), PAGE_CACHE)
})

test('published pages name themselves and their other formats', async () => {
  const family = JSON.parse(store.get('family/bovidae'))
  const order = JSON.parse(store.get('order/carnivora'))
  const species = JSON.parse(store.get('species/connochaetes-taurinus'))
  const familyWord = order.families.length === 1 ? 'family' : 'families'
  await assertSeo('/', {
    title: 'Mammals of Kruger National Park',
    description:
      'An open field guide to the mammals of Kruger National Park. For people and for AI agents.',
  })
  await assertSeo('/families', {
    title: 'Families · KNP Mammals',
    description: 'Mammal families in this field guide.',
  })
  await assertSeo('/orders', {
    title: 'Orders · KNP Mammals',
    description: 'Mammal orders in this field guide.',
  })
  await assertSeo('/species', {
    title: 'Species · KNP Mammals',
    description: 'Mammal species in this field guide.',
  })
  await assertSeo('/family/bovidae', {
    title: `${family.en} · KNP Mammals`,
    description: `${family.en} (${family.latin}) of Kruger National Park.`,
  })
  await assertSeo('/order/carnivora', {
    title: `${order.latin} · KNP Mammals`,
    description: `The order ${order.latin} in Kruger National Park: ${order.families.length} ${familyWord} and ${order.species.length} species.`,
  })
  await assertSeo(`/species/${species.slug}`, {
    title: `${species.en} (${species.latin}) · KNP Mammals`,
    description: inlineText(species.details?.summary || species.en),
  })
})

test('a missing page still publishes a title, description, and format links', async () => {
  await assertSeo('/species/no-such-animal', {
    title: 'Not found · KNP Mammals',
    description: 'That page is not published.',
    status: 404,
  })
})

// PLACEHOLDER. These routes are not built. Each assertion expects 404.
// The pull request that adds the page should change that row to the real
// response (and move the full checks into that feature's test file).
// /images and /audio already exist; they are covered in test/media.test.js.
test('routes that are not built yet are not found', async () => {
  const pending = [
    ['/credits', '#31'],
    ['/search', '#32'],
    ['/sitemap', '#33'],
    ['/sitemap.xml', '#33'],
    ['/robots.txt', '#33'],
    ['/llms.txt', '#34'],
    ['/ask-ai', '#34'],
    ['/.well-known/ard.json', '#34'],
    ['/mcp/server-card', '#34'],
    ['/offline', '#38'],
    ['/facts', '#39'],
    ['/identify/sound', '#40'],
    ['/identify/photo', '#40'],
  ]
  for (const [pathname, issue] of pending) {
    const response = await get(pathname)
    assert.equal(
      response.status,
      404,
      `${pathname} (${issue}) should stay 404 until that issue adds the route`,
    )
  }
})
