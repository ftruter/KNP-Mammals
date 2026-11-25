import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collectEntries, mediaCredit } from '../scripts/seed.mjs'
import { NO_STORE, PAGE_CACHE } from '../src/cache.js'
import { coverageSentence, factsCoverage } from '../src/facts.js'
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
      '</.well-known/ard.json>; rel="ard"; type="application/json"',
      '</llms.txt>; rel="describedby"; type="text/plain"',
      '</mcp/server-card>; rel="https://mammals.truter.world/rel/mcp-server-card"; type="application/mcp-server-card+json"',
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
  assert.equal(route('/facts').key, 'index/facts')
  assert.equal(route('/facts.md').format, 'md')
  assert.equal(route('/facts.json').key, 'index/facts')
  assert.equal(route('/facts/').location, '/facts')
  assert.equal(route('/vocab/colours').kind, 'not-found')
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
  assert.equal(route('/manifest.webmanifest').kind, 'web-manifest')
  assert.equal(route('/sw.js').kind, 'service-worker')
  assert.equal(route('/offline.js').kind, 'offline-script')
  assert.equal(route('/offline.json').kind, 'offline')
  assert.equal(route('/offline').kind, 'not-found')
  assert.equal(route('/offline.md').kind, 'not-found')
  assert.equal(
    route('/manifest.webmanifest/').location,
    '/manifest.webmanifest',
  )
  assert.equal(route('/sw.js/').location, '/sw.js')
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
  assert.match(body, /<a href="\/facts">Facts<\/a> <span>143<\/span>/)
  assert.match(
    body,
    /<footer class="site-footer">[\s\S]*<a href="\/facts">Facts<\/a>/,
  )
  assert.match(
    body,
    /<script type="module" defer src="\/app\.js\?v=[0-9a-f]+">/,
  )

  const md = await get('/.md')
  assert.match(md.headers.get('content-type'), /^text\/markdown/)
  const markdown = await md.text()
  assert.match(markdown, /\(https:\/\/mammals\.example\/families\.md\)/)
  assert.match(
    markdown,
    /\[Facts\]\(https:\/\/mammals\.example\/facts\.md\): 143/,
  )

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
    /Order: \[Carnivora\]\(https:\/\/mammals\.example\/order\/carnivora\.md\)/,
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
    /src="\/images\/neamblysomus-julianae\/imagined-by-grok\.jpg"/,
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

const ALLOWED_MEDIA_LICENCE =
  /^(?:CC0(?: \d+\.\d+)?|CC BY(?:-NC)?(?:-SA)?(?: \d+\.\d+)?)$/

test('the credits page lists sources, taxonomy and every file', async () => {
  const route = (path) => parseUrl(new URL(`${origin}${path}`))
  assert.deepEqual(route('/credits'), {
    kind: 'credits',
    format: 'html',
    pathname: '/credits',
    key: 'index/credits',
  })
  assert.equal(route('/credits.md').format, 'md')
  assert.equal(route('/credits.md').key, 'index/credits')
  assert.equal(route('/credits.json').format, 'json')
  assert.equal(route('/credits.json').key, 'index/credits')

  const response = await get('/credits')
  assert.equal(response.status, 200)
  const body = await response.text()
  const doc = JSON.parse(store.get('index/credits'))
  const images = doc.species.flatMap((group) => group.images)
  const recordings = doc.species.flatMap((group) => group.recordings)
  const ai = images.filter((image) => image.aiGenerated === true).length
  assert.equal(images.length - ai, 381)
  assert.equal(ai, 1)
  assert.equal(recordings.length, 12)
  assert.equal(doc.species.length, 143)
  assert.equal(
    doc.species.reduce((sum, group) => sum + group.sources.length, 0),
    753,
  )
  assert.equal(doc.mediaNote, null)
  assert.equal(doc.site.licence, null)
  assert.equal(doc.site.licenceUrl, null)
  assert.equal(doc.models, undefined)
  assert.match(body, /381 photographs and 1 AI-generated illustration/)
  assert.match(body, /12 recordings/)
  assert.match(body, /143 species sections/)
  for (const name of [
    'SANParks 2011 Kruger mammal checklist',
    'iNaturalist, Kruger National Park, place 69020',
    'Waterberg Bioquest, Soogdiere',
    'Suider-Afrikaanse soogdiere en hul ordes',
    '2016 SANBI / EWT Red List of Mammals',
    'wildlife and trends over time',
    'Wikimedia Commons, category Mammals of Kruger National Park',
    'Galagidae',
    'Nesomyidae',
    'Miniopteridae',
  ])
    assert.ok(body.includes(name), name)
  assert.match(body, /Bernard DUPONT/)
  assert.match(body, /CC BY-SA 2\.0/)
  assert.match(body, /Blue wildebeest/)
  assert.match(body, /AI-generated image/)
  assert.match(body, /Licence not recorded\./)
  assert.equal(body.includes('Apache'), false)
  assert.equal(
    body.includes(
      'Adult, H4-2 road north of Crocodile Bridge, Kruger National Park.',
    ),
    false,
  )
  assert.equal(
    body.includes(
      'Imagined by Grok. An illustration, not a photograph of a real animal.',
    ),
    false,
  )
  assert.equal(body.includes('kruger-skukuza.mp3'), false)
  assert.equal(body.includes('agujaceratops-shingwedzi.wav'), false)
  assert.match(body, /href="\/credits"/)
  assert.equal(body.includes('aria-current="page">Families'), false)
  assert.equal(body.includes('aria-current="page">Species'), false)

  for (const item of [...images, ...recordings]) {
    assert.match(item.licence, ALLOWED_MEDIA_LICENCE, item.key)
    assert.equal(Object.hasOwn(item, 'caption'), false)
  }
  assert.ok(recordings.some((item) => item.licence === 'CC BY-NC'))
  assert.ok(recordings.some((item) => item.key.endsWith('kruger-skukuza.mp3')))
  const wildebeest = doc.species.find(
    (group) => group.slug === 'connochaetes-taurinus',
  )
  assert.equal(wildebeest.images[0].author, 'Bernard DUPONT')
  assert.equal(wildebeest.images[0].licence, 'CC BY-SA 2.0')
  assert.equal(wildebeest.recordings[0].quality, 'A')
  assert.equal(wildebeest.recordings[0].callType, 'call')

  const names = doc.species.map((group) => group.scientificName)
  assert.deepEqual(
    names,
    names.slice().sort((a, b) => a.localeCompare(b, 'en')),
  )
  assert.deepEqual(await (await get('/credits.json')).json(), doc)

  const md = await (await get('/credits.md')).text()
  assert.match(md, /## Photographs and recordings and cited sources/)
  assert.equal(md.includes('kruger-skukuza.mp3'), false)
  assert.equal(md.includes('agujaceratops-shingwedzi.wav'), false)
  assert.equal(
    md.includes(
      'Adult, H4-2 road north of Crocodile Bridge, Kruger National Park.',
    ),
    false,
  )

  const home = await (await get('/')).text()
  assert.match(home, /href="\/credits"/)
  assert.match(
    await (await get('/.md')).text(),
    /\(https:\/\/mammals\.example\/credits\.md\)/,
  )
  const species = await (await get('/species/connochaetes-taurinus')).text()
  assert.match(species, /<details class="credit"/)
  assert.match(species, /href="\/credits"/)
})

test('a credits helper rejects an ND licence and does not invent an author', () => {
  assert.throws(
    () =>
      mediaCredit(
        {
          key: 'nd.jpg',
          author: 'A Person',
          license: 'CC BY-ND 4.0',
          source: 'https://example.org/nd',
          hosted: false,
        },
        { slug: 'fake-species' },
      ),
    /CC BY-ND 4\.0/,
  )
  const credit = mediaCredit(
    {
      key: 'x.jpg',
      license: 'CC BY 4.0',
      source: 'https://example.org/a',
      hosted: false,
      aiGenerated: false,
    },
    { slug: 'fake-species' },
  )
  assert.equal(credit.author, null)
  assert.equal(credit.licence, 'CC BY 4.0')
  assert.equal(JSON.stringify(credit).includes('Author not recorded'), false)
  assert.doesNotThrow(() =>
    mediaCredit(
      {
        key: 'nc.jpg',
        author: 'A Person',
        license: 'CC BY-NC',
        source: 'https://example.org/nc',
        hosted: false,
      },
      { slug: 'fake-species' },
    ),
  )
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

const rowCells = (body, latin) => {
  const row = body.match(new RegExp(`<tr data-latin="${latin}">(.*?)</tr>`))
  assert.ok(row, latin)
  return [...row[1].matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/g)].map((cell) =>
    cell[1].replace(/<[^>]+>/g, ''),
  )
}

test('the facts table lists stored measurements and leaves gaps blank', async () => {
  assert.equal((await get('/facts')).status, 200)
  assert.equal((await get('/facts.md')).status, 200)
  assert.equal((await get('/facts.json')).status, 200)
  assert.equal((await get('/vocab/colours')).status, 404)

  const doc = JSON.parse(store.get('index/facts'))
  assert.equal(doc.kind, 'facts')
  assert.equal(
    doc.note,
    'One row per species. null means this guide does not record the fact.',
  )
  assert.equal(doc.species.length, 143)
  assert.deepEqual(factsCoverage(doc), {
    species: 143,
    status: 123,
    shoulder: 36,
    headBody: 83,
    tail: 74,
    length: 15,
    mass: 108,
    conservation: 143,
    population: 21,
    sized: 118,
    unsized: 25,
  })
  assert.deepEqual(await (await get('/facts.json')).json(), doc)

  const masses = doc.species.map((species) => species.massKg).filter(Boolean)
  assert.equal(masses.filter((mass) => Number.isFinite(mass.min)).length, 81)
  assert.equal(masses.filter((mass) => mass.male || mass.female).length, 27)

  const wildebeest = doc.species.find(
    (species) => species.slug === 'connochaetes-taurinus',
  )
  assert.equal(wildebeest.familyEn, 'Antelopes and buffaloes')
  assert.equal(wildebeest.af, 'Blouwildebees')
  assert.equal(wildebeest.status, 'resident')
  assert.deepEqual(wildebeest.shoulderHeightCm, { min: 115, max: 145 })
  assert.equal(wildebeest.lengthCm, null)
  assert.deepEqual(wildebeest.massKg, {
    male: { min: 165, max: 290 },
    female: { min: 140, max: 260 },
  })
  assert.equal(wildebeest.conservationStatus.status, 'Least Concern')
  assert.equal(wildebeest.conservationStatus.asOf, 2016)
  assert.equal(
    wildebeest.conservationStatus.scope,
    'IUCN global, and the 2016 regional Red List for South Africa, Eswatini and Lesotho',
  )
  assert.equal(wildebeest.conservationStatus.sources, undefined)
  assert.deepEqual(wildebeest.population, { low: 16700, high: 21948 })

  const shrew = doc.species.find(
    (species) => species.slug === 'rhinolophus-swinnyi',
  )
  assert.equal(shrew.status, null)
  assert.equal(shrew.shoulderHeightCm, null)
  assert.equal(shrew.headBodyLengthCm, null)
  assert.equal(shrew.tailCm, null)
  assert.equal(shrew.lengthCm, null)
  assert.equal(shrew.massKg, null)
  assert.equal(shrew.population, null)

  const bat = doc.species.find(
    (species) => species.slug === 'miniopterus-natalensis',
  )
  assert.equal(bat.massKg, null)
  assert.equal(bat.headBodyLengthCm, null)
  assert.equal(bat.tailCm, null)

  const body = await (await get('/facts')).text()
  assert.match(
    body,
    /An em dash means this guide does not record the fact\. It does not mean zero\./,
  )
  assert.ok(body.includes(coverageSentence(doc)))
  assert.equal(body.match(/<tr data-latin="/g).length, 143)
  const nav = body.match(/<nav aria-label="Site">[\s\S]*?<\/nav>/)[0]
  assert.ok(!nav.includes('/facts'))
  assert.deepEqual(rowCells(body, 'Connochaetes taurinus'), [
    'Blue wildebeest',
    'Blouwildebees',
    'Antelopes and buffaloes',
    'Resident',
    '115–145',
    '170–240',
    '60–100',
    '—',
    'males 165–290, females 140–260',
    'Least Concern',
    '16,700–21,948',
  ])
  assert.equal(
    rowCells(body, 'Panthera pardus')[4],
    'males 60–70, females 57–64',
  )
  assert.deepEqual(rowCells(body, 'Rhinolophus swinnyi').slice(3, 9), [
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
  ])
  assert.equal(rowCells(body, 'Rhinolophus swinnyi')[10], '—')
  const batCells = rowCells(body, bat.scientificName)
  assert.equal(batCells[8], '—')
  assert.ok(!batCells.includes('0–0'))

  const english = column(body, 0)
  assert.deepEqual(
    english,
    english
      .slice()
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
  )

  for (const dir of ['asc', 'desc']) {
    const sorted = await (await get(`/facts?sort=mass&dir=${dir}`)).text()
    const massCells = column(sorted, 8)
    const firstBlank = massCells.indexOf('—')
    assert.ok(firstBlank > 0, dir)
    assert.ok(
      massCells.slice(firstBlank).every((cell) => cell === '—'),
      dir,
    )
    assert.equal(
      column(sorted, 0)[0],
      dir === 'desc' ? 'Elephant' : 'Banana bat',
    )
    const mark = dir === 'desc' ? 'asc' : 'desc'
    assert.match(
      sorted,
      new RegExp(
        `aria-sort="${dir === 'desc' ? 'descending' : 'ascending'}"><a href="/facts\\?sort=mass&amp;dir=${mark}"`,
      ),
    )
  }

  const md = await (await get('/facts.md')).text()
  assert.match(
    md,
    /\[Blue wildebeest\]\(https:\/\/mammals\.example\/species\/connochaetes-taurinus\.md\)/,
  )
  assert.match(md, /males 165–290, females 140–260/)
  assert.match(
    md,
    /An em dash means this guide does not record the fact\. It does not mean zero\./,
  )
  assert.ok(md.includes(coverageSentence(doc)))
})

test('a hostile fact from KV is escaped', async () => {
  const hostile = {
    MAMMALS_KV: {
      get: async () =>
        JSON.stringify({
          kind: 'facts',
          note: 'n',
          species: [
            {
              slug: 'x',
              scientificName: 'A & b',
              en: '<script>alert(1)</script>',
              af: 'a<b',
              familySlug: 'felidae',
              familyEn: 'Cats & dogs',
              status: '<img src=x onerror=alert(1)>',
              shoulderHeightCm: null,
              headBodyLengthCm: null,
              tailCm: null,
              lengthCm: null,
              massKg: null,
              conservationStatus: {
                status: '<b>bad</b>',
                scope: null,
                asOf: null,
              },
              population: null,
            },
          ],
        }),
    },
  }
  const body = await (
    await handleRequest(new Request(`${origin}/facts`), hostile)
  ).text()
  assert.ok(!body.includes('<script>alert'))
  assert.ok(!body.includes('<img'))
  assert.ok(!body.includes('<b>bad</b>'))
  assert.match(body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(body, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.match(body, /&lt;b&gt;bad&lt;\/b&gt;/)
  assert.match(body, /A &amp; b/)
  assert.match(body, /Cats &amp; dogs/)
  assert.match(body, /a&lt;b/)
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
    ['/offline', '#38'],
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
