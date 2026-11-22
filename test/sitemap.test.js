import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { collectEntries } from '../scripts/seed.mjs'
import { ASSET_CACHE, NO_STORE, PAGE_CACHE } from '../src/cache.js'
import { parseUrl } from '../src/route.js'
import {
  SITEMAP_LASTMOD_FALLBACK,
  SITEMAP_ROUTES,
  buildSitemap,
  sitemapEntries,
  sitemapLastmod,
  sitemapPaths,
  sitemapXml,
} from '../src/sitemap.js'
import { handleRequest } from '../src/worker.js'

const compare = (left, right) =>
  String(left ?? '').localeCompare(String(right ?? ''), 'en', {
    sensitivity: 'base',
  })

const byLabel = (a, b) =>
  compare(a.en || a.latin, b.en || b.latin) || compare(a.latin, b.latin)

const gapsDuring = (fn) => {
  const lines = []
  const original = console.error
  console.error = (line) => {
    lines.push(String(line))
  }
  try {
    return { result: fn(), lines }
  } finally {
    console.error = original
  }
}

const fixture = {
  orders: [
    { slug: 'chiroptera', latin: 'Chiroptera' },
    { slug: 'carnivora', latin: 'Carnivora' },
    { latin: '   ' },
  ],
  families: [
    { slug: 'felidae', en: 'Cats', latin: 'Felidae', orderSlug: 'carnivora' },
    { slug: 'canidae', en: 'Dogs', latin: 'Canidae', orderSlug: 'carnivora' },
    {
      slug: 'vespertilionidae',
      en: 'Vesper bats',
      latin: 'Vespertilionidae',
      orderSlug: 'chiroptera',
    },
    {
      slug: 'molossidae',
      en: 'Free-tailed bats',
      latin: 'Molossidae',
      orderSlug: 'chiroptera',
    },
    { slug: 'zzz', en: 'Bats', latin: 'Zzzidae', orderSlug: 'chiroptera' },
    { slug: 'aaa', en: 'Bats', latin: 'Aaaidae', orderSlug: 'chiroptera' },
    { slug: 'nomenidae', latin: 'Nomenidae', orderSlug: 'carnivora' },
    { en: '   ' },
  ],
}

const speciesRows = [
  {
    slug: 'panthera-leo',
    en: 'Lion',
    latin: 'Panthera leo',
    familySlug: 'felidae',
  },
  {
    slug: 'panthera-pardus',
    en: 'Leopard',
    latin: 'Panthera pardus',
    familySlug: 'felidae',
  },
  { slug: 'z-bat', en: 'Serotine', latin: 'Zzz', familySlug: 'aaa' },
  { slug: 'a-bat', en: 'Serotine', latin: 'Aaa', familySlug: 'aaa' },
  {
    slug: 'latin-only',
    latin: 'Latinus only',
    familySlug: 'canidae',
  },
  { slug: 'panthera-leo', en: 'Lion again', latin: 'Panthera leo' },
  { slug: 'nameless' },
  {},
]

const built = gapsDuring(() =>
  buildSitemap(
    { orders: fixture.orders, families: fixture.families },
    { species: speciesRows },
  ),
)
const tree = built.result

test('orders sort by Latin, and families and species by English', () => {
  assert.deepEqual(
    tree.orders.map((order) => order.name),
    ['Carnivora', 'Chiroptera'],
  )
  assert.deepEqual(
    tree.orders[0].families.map((family) => family.name),
    ['Cats', 'Dogs', 'Nomenidae'],
  )
  assert.deepEqual(
    tree.orders[1].families.map((family) => family.name),
    ['Bats', 'Bats', 'Free-tailed bats', 'Vesper bats'],
  )
  assert.deepEqual(
    tree.orders[1].families.map((family) => family.latin),
    ['Aaaidae', 'Zzzidae', 'Molossidae', 'Vespertilionidae'],
  )
  assert.deepEqual(
    tree.families
      .find((family) => family.href === '/family/felidae')
      .species.map((species) => species.name),
    ['Leopard', 'Lion'],
  )
  assert.deepEqual(
    tree.families
      .find((family) => family.href === '/family/aaa')
      .species.map((species) => species.latin),
    ['Aaa', 'Zzz'],
  )
  assert.equal(
    tree.orders.every((order) =>
      order.families.every((family) => !family.species),
    ),
    true,
  )
})

test('a row with no English name uses its Latin name', () => {
  const family = tree.families.find((item) => item.href === '/family/nomenidae')
  assert.equal(family.name, 'Nomenidae')
  const species = tree.species.find(
    (item) => item.href === '/species/latin-only',
  )
  assert.equal(species.name, 'Latinus only')
  assert.equal(species.latin, 'Latinus only')
})

test('a row with no slug and no names is omitted, and a duplicate href is once', () => {
  const hrefs = [
    ...tree.orders.map((order) => order.href),
    ...tree.families.map((family) => family.href),
    ...tree.species.map((species) => species.href),
  ]
  assert.equal(hrefs.includes('/species/nameless'), false)
  assert.equal(new Set(hrefs).size, hrefs.length)
  assert.equal(
    tree.species.filter((species) => species.href === '/species/panthera-leo')
      .length,
    1,
  )
  assert.equal(
    tree.species.find((species) => species.href === '/species/panthera-leo')
      .name,
    'Lion',
  )
  const gaps = built.lines.map((line) => JSON.parse(line))
  assert.equal(
    gaps.every((gap) => gap.message === 'sitemap gap' && gap.path && gap.error),
    true,
  )
  assert.equal(
    gaps.some((gap) => gap.error === 'slug, Latin, and English are missing'),
    true,
  )
  assert.equal(
    gaps.some(
      (gap) =>
        gap.path === '/species/panthera-leo' && gap.error === 'repeated slug',
    ),
    true,
  )
})

test('sitemap paths follow the route list and list each page once', () => {
  assert.deepEqual(
    SITEMAP_ROUTES.map((route) => route.href),
    ['/', '/sitemap', '/orders', '/families', '/species'],
  )
  assert.equal(
    SITEMAP_ROUTES.some((route) => route.href === '/search'),
    false,
  )
  assert.deepEqual(sitemapPaths(tree), [
    '/',
    '/sitemap',
    '/orders',
    '/order/carnivora',
    '/order/chiroptera',
    '/families',
    '/family/aaa',
    '/species/a-bat',
    '/species/z-bat',
    '/family/zzz',
    '/family/felidae',
    '/species/panthera-pardus',
    '/species/panthera-leo',
    '/family/canidae',
    '/species/latin-only',
    '/family/molossidae',
    '/family/nomenidae',
    '/family/vespertilionidae',
    '/species',
  ])
  const entries = sitemapEntries(tree)
  assert.deepEqual(
    entries.map((entry) => entry.name),
    ['Home', 'Sitemap', 'Orders', 'Families', 'Species'],
  )
  assert.equal('latin' in entries[2].children[0], false)
  assert.equal(entries[2].children[0].children[0].children, undefined)
})

test('sitemap lastmod is a UTC date, or the fallback', () => {
  assert.equal(sitemapLastmod(Date.UTC(2026, 10, 22, 23, 30)), '2026-11-22')
  assert.equal(sitemapLastmod(Date.UTC(2026, 0, 2, 0, 30)), '2026-01-02')
  for (const value of [undefined, '', 'not-a-date', 0, -1])
    assert.equal(sitemapLastmod(value), SITEMAP_LASTMOD_FALLBACK)
})

test('sitemap xml has one loc and one lastmod per url', () => {
  const xml = sitemapXml('https://mammals.example', tree, '2026-03-02')
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  assert.match(
    xml,
    /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/,
  )
  const blocks = xml.split('<url>').slice(1)
  assert.equal(blocks.length, sitemapPaths(tree).length)
  for (const block of blocks) {
    assert.equal((block.match(/<loc>/g) || []).length, 1)
    assert.equal((block.match(/<lastmod>/g) || []).length, 1)
    assert.match(block, /<lastmod>2026-03-02<\/lastmod>/)
  }
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  )
  assert.equal(new Set(locs).size, locs.length)
  assert.equal(locs[0], 'https://mammals.example/')
  assert.equal(xml.includes('.md'), false)
  assert.equal(xml.includes('/search'), false)
})

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (path, init) =>
  handleRequest(new Request(`${origin}${path}`, init), env)

const locsOf = (xml) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

test('robots.txt allows crawlers and points at the sitemap', async () => {
  const robots = await get('/robots.txt')
  assert.equal(robots.status, 200)
  assert.equal(robots.headers.get('content-type'), 'text/plain; charset=utf-8')
  assert.equal(robots.headers.get('cache-control'), ASSET_CACHE)
  assert.equal(robots.headers.get('link'), null)
  assert.equal(robots.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(
    await robots.text(),
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  )
  const fresh = await handleRequest(new Request(`${origin}/robots.txt`), {
    ...env,
    DATA_PUBLISHED_AT: String(Date.now()),
  })
  assert.equal(fresh.headers.get('cache-control'), ASSET_CACHE)
  const head = await get('/robots.txt', { method: 'HEAD' })
  assert.equal(head.status, 200)
  const post = await get('/robots.txt', { method: 'POST' })
  assert.equal(post.status, 405)
  assert.equal((await get('/robots.txt.json')).status, 404)
  assert.equal((await get('/robots.txt.md')).status, 404)
  const slash = await get('/robots.txt/')
  assert.equal(slash.status, 301)
  assert.equal(slash.headers.get('location'), '/robots.txt')
})

test('the xml sitemap lists each live HTML page once', async () => {
  const families = JSON.parse(store.get('index/families'))
  const species = JSON.parse(store.get('index/species'))
  assert.equal(families.orders.length, 14)
  assert.equal(families.families.length, 39)
  assert.equal(species.species.length, 143)
  const original = console.error
  const lines = []
  console.error = (line) => {
    lines.push(String(line))
  }
  let xml
  try {
    const response = await get('/sitemap.xml')
    assert.equal(response.status, 200)
    assert.equal(
      response.headers.get('content-type'),
      'application/xml; charset=utf-8',
    )
    assert.equal(response.headers.get('cache-control'), PAGE_CACHE)
    assert.equal(response.headers.get('link'), null)
    xml = await response.text()
  } finally {
    console.error = original
  }
  assert.equal(
    lines.some((line) => line.includes('sitemap gap')),
    false,
  )
  const locs = locsOf(xml)
  const orders = families.orders
    .slice()
    .sort((a, b) => compare(a.latin, b.latin))
  const familyRows = families.families.slice().sort(byLabel)
  const members = new Map()
  for (const row of species.species) {
    const group = members.get(row.familySlug) ?? []
    group.push(row)
    members.set(row.familySlug, group)
  }
  for (const group of members.values()) group.sort(byLabel)
  const expected = ['/', '/sitemap', '/orders']
  for (const order of orders) expected.push(`/order/${order.slug}`)
  expected.push('/families')
  const seen = new Set()
  for (const family of familyRows) {
    expected.push(`/family/${family.slug}`)
    for (const row of members.get(family.slug) ?? []) {
      expected.push(`/species/${row.slug}`)
      seen.add(row.slug)
    }
  }
  expected.push('/species')
  for (const row of species.species.slice().sort(byLabel)) {
    if (!seen.has(row.slug)) expected.push(`/species/${row.slug}`)
  }
  assert.deepEqual(
    locs,
    expected.map((path) => origin + path),
  )
  assert.equal(new Set(locs).size, locs.length)
  const list = JSON.parse(
    await readFile(
      new URL('../data/species-list.json', import.meta.url),
      'utf8',
    ),
  )
  for (const row of [...list.candidates, ...list.excluded])
    assert.equal(
      locs.some((loc) => loc.endsWith(`/species/${row.slug}`)),
      false,
      row.slug,
    )
  for (const loc of locs) {
    const path = new URL(loc).pathname
    assert.equal(path.endsWith('.md'), false, path)
    assert.equal(path.endsWith('.json'), false, path)
    assert.equal(path.includes('/search'), false, path)
    assert.equal(
      ['/style.css', '/app.js', '/credits', '/facts', '/ask-ai'].includes(path),
      false,
      path,
    )
  }
  assert.equal((xml.match(/<lastmod>/g) || []).length, locs.length)
  assert.equal(
    xml.includes(`<lastmod>${SITEMAP_LASTMOD_FALLBACK}</lastmod>`),
    true,
  )
})

test('the html, markdown, and json sitemaps list the same pages', async () => {
  const html = await (await get('/sitemap')).text()
  assert.match(html, /<h1>Sitemap<\/h1>/)
  assert.match(html, /href="\/sitemap" aria-current="page"/)
  assert.match(html, /<a href="\/sitemap\.xml">Sitemap XML<\/a>/)
  const nav = html.match(/<ul class="nav-list">[\s\S]*?<\/ul>/)[0]
  assert.equal(nav.includes('Sitemap'), false)
  const footer = html.slice(html.indexOf('<footer'))
  assert.match(footer, /href="\/sitemap" aria-current="page"/)
  const ordersAt = html.indexOf('href="/orders"')
  const familiesAt = html.indexOf('href="/families"')
  assert.equal(html.slice(ordersAt, familiesAt).includes('/species/'), false)
  assert.match(html, /href="\/order\/carnivora">Carnivora<\/a>/)
  assert.equal(
    /href="\/order\/carnivora">Carnivora<\/a>\s*<span class="sitemap-latin"/.test(
      html,
    ),
    false,
  )
  const families = JSON.parse(store.get('index/families'))
  const species = JSON.parse(store.get('index/species'))
  for (const order of families.orders)
    assert.ok(html.includes(`href="/order/${order.slug}"`), order.slug)
  for (const family of families.families)
    assert.ok(html.includes(`href="/family/${family.slug}"`), family.slug)
  for (const row of species.species)
    assert.ok(html.includes(`href="/species/${row.slug}"`), row.slug)

  const family = await (await get('/family/felidae')).text()
  assert.match(family, /<footer[\s\S]*href="\/sitemap"/)
  assert.equal(
    family.slice(family.indexOf('<footer')).includes('aria-current="page"'),
    false,
  )
  const missing = await (await get('/no-such-page')).text()
  assert.match(missing, /<a href="\/sitemap">Sitemap<\/a>/)

  const markdown = await (await get('/sitemap.md')).text()
  assert.match(markdown, /\[Carnivora\]\(\/order\/carnivora\.md\)/)
  const felidae = families.families.find((row) => row.slug === 'felidae')
  assert.match(
    markdown,
    new RegExp(
      `\\[${felidae.en}\\]\\(/family/felidae\\.md\\) \\(\\*${felidae.latin}\\*\\)`,
    ),
  )
  assert.equal(markdown.includes('https://'), false)
  const headers = await get('/sitemap')
  assert.match(headers.headers.get('link'), /rel="canonical"/)
  assert.match((await get('/sitemap.md')).headers.get('link'), /sitemap\.md/)
  assert.match(
    (await get('/sitemap.json')).headers.get('link'),
    /sitemap\.json/,
  )

  const json = await (await get('/sitemap.json')).json()
  assert.equal(json.kind, 'sitemap')
  assert.equal(json.title, 'Sitemap')
  assert.deepEqual(
    json.entries.map((entry) => entry.name),
    ['Home', 'Sitemap', 'Orders', 'Families', 'Species'],
  )
  assert.equal(
    json.entries
      .find((entry) => entry.name === 'Orders')
      .children.some((order) => 'latin' in order),
    false,
  )
  assert.equal(json.entries[0].href, '/')
  const redirect = await get('/sitemap/')
  assert.equal(redirect.status, 301)
  assert.equal(redirect.headers.get('location'), '/sitemap')
})

test('lastmod and cache follow DATA_PUBLISHED_AT', async () => {
  const publishedAt = Date.UTC(2024, 4, 6, 15)
  const dated = await handleRequest(new Request(`${origin}/sitemap.xml`), {
    ...env,
    DATA_PUBLISHED_AT: String(publishedAt),
  })
  const xml = await dated.text()
  const lastmods = xml.match(/<lastmod>[^<]+<\/lastmod>/g)
  assert.ok(lastmods.length > 1)
  assert.equal(
    lastmods.every((item) => item === '<lastmod>2024-05-06</lastmod>'),
    true,
  )
  assert.equal(dated.headers.get('cache-control'), PAGE_CACHE)
  const fresh = await handleRequest(new Request(`${origin}/sitemap`), {
    ...env,
    DATA_PUBLISHED_AT: String(Date.now()),
  })
  assert.equal(fresh.headers.get('cache-control'), NO_STORE)
  const old = await handleRequest(new Request(`${origin}/sitemap.xml`), {
    ...env,
    DATA_PUBLISHED_AT: String(Date.now() - 120_000),
  })
  assert.equal(old.headers.get('cache-control'), PAGE_CACHE)
})

test('a missing index is logged and the fixed urls are still served', async () => {
  const lines = []
  const original = console.error
  console.error = (line) => {
    lines.push(String(line))
  }
  try {
    const response = await handleRequest(new Request(`${origin}/sitemap.xml`), {
      MAMMALS_KV: { get: async () => null },
    })
    assert.equal(response.status, 200)
    assert.deepEqual(locsOf(await response.text()), [
      `${origin}/`,
      `${origin}/sitemap`,
      `${origin}/orders`,
      `${origin}/families`,
      `${origin}/species`,
    ])
  } finally {
    console.error = original
  }
  const gaps = lines.map((line) => JSON.parse(line))
  assert.deepEqual(gaps.map((gap) => gap.path).sort(), [
    'index/families',
    'index/species',
  ])
})

test('robots and sitemap routes are parsed before a slug', () => {
  const route = (path) => parseUrl(new URL(`${origin}${path}`))
  assert.equal(route('/robots.txt').kind, 'robots')
  assert.equal(route('/sitemap.xml').kind, 'sitemap')
  assert.deepEqual(route('/sitemap.md'), {
    kind: 'sitemap-page',
    format: 'md',
    pathname: '/sitemap',
  })
  assert.equal(route('/sitemap.xml.json').kind, 'not-found')
})
