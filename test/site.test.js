import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collectEntries } from '../scripts/seed.mjs'
import { NO_STORE, PAGE_CACHE } from '../src/cache.js'
import { parseUrl } from '../src/route.js'
import { handleRequest } from '../src/worker.js'

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (path, init) =>
  handleRequest(new Request(`${origin}${path}`, init), env)

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
  assert.equal(route('/species.json').key, 'index/species')
  assert.equal(route('/family/bovidae').key, 'family/bovidae')
  assert.equal(
    route('/species/connochaetes-taurinus.md').key,
    'species/connochaetes-taurinus',
  )
  assert.equal(route('/species/Bad_Slug').kind, 'not-found')
  assert.equal(route('/family/bovidae/extra').kind, 'not-found')
  assert.equal(route('/family/bovidae/').location, '/family/bovidae')
})

test('home lists every family in three formats', async () => {
  const html = await get('/')
  assert.equal(html.status, 200)
  assert.equal(html.headers.get('cache-control'), PAGE_CACHE)
  assert.match(html.headers.get('content-type'), /^text\/html/)
  assert.match(html.headers.get('link'), /rel="canonical"/)
  const body = await html.text()
  const index = JSON.parse(store.get('index/families'))
  for (const order of index.orders)
    for (const family of order.families)
      assert.ok(body.includes(`href="/family/${family.slug}"`), family.slug)

  const md = await get('/.md')
  assert.match(md.headers.get('content-type'), /^text\/markdown/)
  assert.match(await md.text(), /\(\/family\/bovidae\.md\)/)

  const json = await get('/.json')
  assert.deepEqual(await json.json(), index)
})

test('every family and species page renders', async () => {
  const index = JSON.parse(store.get('index/species'))
  const paths = [
    '/species',
    ...index.species.map((s) => `/species/${s.slug}`),
    ...[...store.keys()]
      .filter((key) => key.startsWith('family/'))
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

test('a species page shows its names and links to its family', async () => {
  const body = await (await get('/species/connochaetes-taurinus')).text()
  assert.match(body, /<h1>Blue wildebeest<\/h1>/)
  assert.match(body, /Blouwildebees/)
  assert.match(body, /href="\/family\/bovidae"/)
})

test('text from KV is escaped', async () => {
  const hostile = {
    MAMMALS_KV: {
      get: async () =>
        JSON.stringify({
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
  assert.ok(!body.includes('<script>'))
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
