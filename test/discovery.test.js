import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { collectEntries } from '../scripts/seed.mjs'
import { ASSET_CACHE, NO_STORE, PAGE_CACHE } from '../src/cache.js'
import { ARD_LINK, DISCOVERY_LINK, linkHeader } from '../src/head.js'
import { absoluteLinks } from '../src/markdown.js'
import { ASK_AI_EXAMPLES, aiPrompt } from '../src/prompt.js'
import { handleRequest } from '../src/worker.js'

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const get = (path, init, requestEnv = env) =>
  handleRequest(new Request(`${origin}${path}`, init), requestEnv)

const pageLinks = (path) => {
  const html = path
  const md = path === '/' ? '/.md' : `${path}.md`
  const json = path === '/' ? '/.json' : `${path}.json`
  return linkHeader([
    `<${origin}${html}>; rel="canonical"`,
    `<${origin}${md}>; rel="alternate"; type="text/markdown"`,
    `<${origin}${json}>; rel="alternate"; type="application/json"`,
  ])
}

const schema = JSON.parse(
  await readFile(
    new URL('./fixtures/ard-entry.schema.json', import.meta.url),
    'utf8',
  ),
)

const entryErrors = (item) => {
  const fields = schema.$defs.EntryFields.properties
  const required = schema.$defs.ArdEntry.required
  const errors = []
  for (const key of required) {
    if (typeof item[key] !== 'string' || item[key] === '')
      errors.push(`missing ${key}`)
  }
  const pattern = new RegExp(fields.identifier.pattern)
  if (typeof item.identifier !== 'string' || !pattern.test(item.identifier))
    errors.push('identifier')
  const hasUrl = Object.hasOwn(item, 'url')
  const hasData = Object.hasOwn(item, 'data')
  if (hasUrl === hasData) errors.push('url/data')
  if (hasUrl) {
    try {
      const url = new URL(item.url)
      if (url.protocol !== 'https:' && url.protocol !== 'http:')
        errors.push('url')
    } catch {
      errors.push('url')
    }
  }
  for (const key of ['representativeQueries', 'capabilities', 'tags']) {
    if (!Object.hasOwn(item, key)) continue
    const value = item[key]
    if (!Array.isArray(value) || value.some((part) => typeof part !== 'string'))
      errors.push(key)
  }
  if (
    Object.hasOwn(item, 'description') &&
    typeof item.description !== 'string'
  )
    errors.push('description')
  return errors.join(', ')
}

const unescapeHtml = (text) =>
  text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')

test('llms.txt states the mammal rules and only real routes', async () => {
  const response = await get('/llms.txt')
  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('content-type'),
    'text/plain; charset=utf-8',
  )
  assert.equal(response.headers.get('cache-control'), ASSET_CACHE)
  assert.equal(response.headers.get('link'), DISCOVERY_LINK)
  const body = await response.text()
  for (const phrase of [
    'A missing fact stays null',
    '2011 checklist for species',
    'estimate.low',
    'estimate.high',
    'Do not copy or host SANParks or EWT PDFs',
    'CC BY-NC-SA',
    'waterhole',
    "Juliana's golden mole",
    'Empty details means the account is not published',
    `${origin}/.md`,
    `${origin}/orders`,
    `${origin}/order/<slug>`,
    `${origin}/families`,
    `${origin}/family/<slug>`,
    `${origin}/species`,
    `${origin}/species/<slug>`,
    `${origin}/ask-ai`,
    `${origin}/.well-known/ard.json`,
    `${origin}/.well-known/ai-catalog.json`,
    `${origin}/.json`,
  ])
    assert.ok(body.includes(phrase), phrase)
  for (const absent of [
    '/identify/photo',
    '/facts',
    '/mcp',
    '/search',
    '/credits',
    '/sitemap',
    '/vocab/colours',
    'microphone',
    'camera',
    'Agentmap',
  ])
    assert.equal(body.includes(absent), false, absent)
  assert.doesNotMatch(body, /\b143\b/)
  assert.equal(body.includes('143 species'), false)

  const redirect = await get('/LLMS.TXT?x=1')
  assert.equal(redirect.status, 301)
  assert.equal(redirect.headers.get('location'), '/llms.txt?x=1')
  assert.equal(redirect.headers.get('link'), DISCOVERY_LINK)
  assert.equal((await get('/llms.txt/')).headers.get('location'), '/llms.txt')
})

test('ARD and the predecessor catalog share entries from the indexes', async () => {
  assert.deepEqual(schema.$defs.ArdEntry.required, [
    'identifier',
    'displayName',
    'type',
  ])
  const settled = {
    ...env,
    DATA_PUBLISHED_AT: String(Date.now() - 120_000),
  }
  const ardResponse = await get('/.well-known/ard.json', {}, settled)
  const catalogResponse = await get('/.well-known/ai-catalog.json', {}, settled)
  assert.equal(ardResponse.status, 200)
  assert.equal(catalogResponse.status, 200)
  assert.equal(
    ardResponse.headers.get('content-type'),
    'application/json; charset=utf-8',
  )
  assert.equal(ardResponse.headers.get('cache-control'), PAGE_CACHE)
  assert.equal(catalogResponse.headers.get('cache-control'), PAGE_CACHE)
  assert.equal(ardResponse.headers.get('link'), DISCOVERY_LINK)
  assert.doesNotMatch(ardResponse.headers.get('link'), /rel="alternate"/)
  const ard = await ardResponse.json()
  const catalog = await catalogResponse.json()
  assert.equal(catalog.specVersion, '1.0')
  assert.equal(catalog.host.documentationUrl, `${origin}/llms.txt`)
  assert.equal(catalog.host.displayName, 'Mammals of Kruger National Park')
  assert.deepEqual(catalog.entries, ard.entries)
  assert.deepEqual(
    ard.entries.map((item) => item.identifier),
    [
      'urn:air:mammals.truter.world:guide:home',
      'urn:air:mammals.truter.world:guide:families',
      'urn:air:mammals.truter.world:guide:orders',
      'urn:air:mammals.truter.world:guide:species',
    ],
  )
  const families = JSON.parse(store.get('index/families'))
  const species = JSON.parse(store.get('index/species'))
  assert.equal(families.counts.species, 143)
  assert.equal(families.counts.families, 39)
  assert.equal(families.counts.orders, 14)
  const home = ard.entries[0]
  assert.match(home.description, /143 species/)
  assert.match(home.description, /39 families/)
  assert.match(home.description, /14 orders/)
  assert.match(home.description, /\/llms\.txt/)
  assert.match(home.description, /does not list individual species/)
  assert.equal(
    ard.entries.some((item) => item.url.endsWith('/llms.txt')),
    false,
  )
  assert.equal(
    ard.entries.some((item) => item.type === 'text/plain'),
    false,
  )
  const familyEntry = ard.entries[1]
  const asked = familyEntry.representativeQueries
    .join(' ')
    .match(/Afrikaans name of the ([A-Za-z]+) family/)
  assert.ok(asked, 'a stored family is named in a sample question')
  const family = families.families.find((row) => row.latin === asked[1])
  assert.equal(typeof family.af, 'string')
  assert.ok(family.af.trim())
  const speciesEntry = ard.entries[3]
  const speciesAsked = speciesEntry.representativeQueries
    .join(' ')
    .match(/Afrikaans name of ([A-Z][a-z]+ [a-z]+)/)
  assert.ok(speciesAsked)
  const row = species.species.find((item) => item.latin === speciesAsked[1])
  assert.equal(typeof row.af, 'string')
  assert.ok(row.af.trim())
  for (const item of ard.entries) {
    assert.equal(entryErrors(item), '', item.identifier)
    assert.match(item.identifier, /^urn:air:mammals\.truter\.world:/)
    assert.ok(item.representativeQueries.length >= 2)
    assert.ok(item.representativeQueries.length <= 5)
    const url = new URL(item.url)
    assert.equal(url.origin, origin)
    const resource = await get(url.pathname, {}, settled)
    assert.equal(resource.status, 200, item.url)
    const type = resource.headers.get('content-type').split(';')[0].trim()
    assert.equal(type, item.type, item.url)
  }
  const storedHome = await (await get('/.json')).json()
  assert.deepEqual(storedHome, families)
  assert.doesNotMatch(JSON.stringify(ard), /\/mcp/)
  assert.doesNotMatch(JSON.stringify(ard), /\/search/)
})

test('a missing index is omitted and not replaced with a made-up count', async () => {
  const errors = []
  const original = console.error
  console.error = (...args) => {
    errors.push(args.map(String).join(' '))
  }
  try {
    const speciesOnly = {
      MAMMALS_KV: {
        get: async (key) => (key === 'index/species' ? store.get(key) : null),
      },
    }
    const ard = await (
      await get('/.well-known/ard.json', {}, speciesOnly)
    ).json()
    assert.deepEqual(
      ard.entries.map((item) => item.identifier),
      ['urn:air:mammals.truter.world:guide:species'],
    )
    assert.equal(JSON.stringify(ard).includes('39 families'), false)
    assert.ok(errors.some((line) => line.includes('index/families')))

    const neither = { MAMMALS_KV: { get: async () => null } }
    const empty = await (await get('/.well-known/ard.json', {}, neither)).json()
    assert.deepEqual(empty.entries, [])
    const catalog = await (
      await get('/.well-known/ai-catalog.json', {}, neither)
    ).json()
    assert.deepEqual(catalog.entries, [])
    assert.equal(catalog.specVersion, '1.0')
    assert.ok(errors.some((line) => line.includes('index/species')))
  } finally {
    console.error = original
  }
})

test('the manifest is no-store while a KV publish may still be stale', async () => {
  const fresh = { ...env, DATA_PUBLISHED_AT: String(Date.now()) }
  const first = await get('/.well-known/ard.json', {}, fresh)
  assert.equal(first.headers.get('cache-control'), NO_STORE)
  const guide = await get('/llms.txt', {}, fresh)
  assert.equal(guide.headers.get('cache-control'), ASSET_CACHE)
})

test('ask-ai prints one prompt and does not call a model', async () => {
  const prompt = aiPrompt(origin)
  for (const url of [
    `${origin}/.md`,
    `${origin}/species.md`,
    `${origin}/families.md`,
    `${origin}/orders.md`,
  ])
    assert.ok(prompt.includes(url), url)
  assert.match(prompt, /Kruger National Park/)
  assert.match(prompt, /not from the guide/)
  assert.match(prompt, /estimate\.low/)
  assert.match(prompt, /waterhole/)
  assert.doesNotMatch(prompt, /\/search/)
  assert.doesNotMatch(prompt, /\/mcp/)
  assert.doesNotMatch(prompt, /(^|\s)\/[a-z]/m)
  for (const example of ASK_AI_EXAMPLES)
    assert.equal(/camp|road|waterhole/i.test(example), false, example)

  const json = await (await get('/ask-ai.json')).json()
  assert.equal(json.prompt, prompt)
  assert.deepEqual(json.examples, ASK_AI_EXAMPLES)
  assert.equal(json.pages.md, `${origin}/ask-ai.md`)
  const markdown = await (await get('/ask-ai.md')).text()
  assert.ok(markdown.includes(`\`\`\`text\n${prompt}\n\`\`\``))
  const response = await get('/ask-ai')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), ASSET_CACHE)
  const html = await response.text()
  const pre = html.match(
    /<pre class="ask-ai-prompt"[^>]*data-copy-text>([\s\S]*?)<\/pre>/,
  )
  assert.ok(pre, 'the prompt is in a <pre>')
  assert.equal(unescapeHtml(pre[1]), prompt)
  assert.match(
    html,
    /<button class="copy-button" type="button" data-copy-button hidden>Copy prompt<\/button>/,
  )
  assert.match(html, /data-copy-manual>Select all of the text/)
  assert.match(html, /<a href="\/ask-ai" aria-current="page">Ask your AI<\/a>/)
  assert.equal((await get('/ask-ai', { method: 'POST' })).status, 405)
  assert.equal((await get('/mcp', { method: 'POST' })).status, 405)

  const local = 'http://localhost:8787'
  const localJson = await (
    await handleRequest(new Request(`${local}/ask-ai.json`), env)
  ).json()
  assert.ok(localJson.prompt.includes(`${local}/.md`))
  assert.equal(localJson.prompt.includes('mammals.truter.world'), false)
})

test('the home page, footer and head advertise the guide', async () => {
  const html = await (await get('/')).text()
  assert.match(html, /<a href="\/ask-ai">Ask your AI about these mammals<\/a>/)
  assert.match(html, /<a href="\/llms\.txt">llms\.txt<\/a>/)
  assert.match(html, /class="for-agents"><a href="\/llms\.txt">For agents<\/a>/)
  assert.match(
    html,
    new RegExp(ARD_LINK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  )
  assert.equal(html.includes('rel="ai-catalog"'), false)
  const markdown = await (await get('/.md')).text()
  assert.match(markdown, /## Answering questions from this guide/)
  assert.ok(markdown.includes(`${origin}/species.md`))
  assert.ok(markdown.includes(`${origin}/families.md`))
  assert.ok(markdown.includes(`${origin}/orders.md`))
  assert.doesNotMatch(markdown, /\/search/)
  assert.doesNotMatch(markdown, /\/mcp/)
})

test('markdown links are absolute', async () => {
  for (const pathname of [
    '/.md',
    '/ask-ai.md',
    '/species.md',
    '/families.md',
    '/orders.md',
    '/species/connochaetes-taurinus.md',
    '/family/felidae.md',
    '/missing.md',
  ]) {
    const body = await (await get(pathname)).text()
    assert.doesNotMatch(body, /\]\(\/(?!\/)/, pathname)
  }
  assert.equal(
    absoluteLinks(
      '[a](/x) [b](https://e.org/y) [c](//e.org/z) [d](#top)',
      origin,
    ),
    `[a](${origin}/x) [b](https://e.org/y) [c](//e.org/z) [d](#top)`,
  )
})

test('the discovery Link header is on pages and errors, not on assets', async () => {
  const pages = [
    ['/', pageLinks('/')],
    ['/.md', pageLinks('/')],
    ['/.json', pageLinks('/')],
    [
      '/species/connochaetes-taurinus',
      pageLinks('/species/connochaetes-taurinus'),
    ],
    ['/missing.md', pageLinks('/missing')],
  ]
  for (const [pathname, expected] of pages) {
    const response = await get(pathname)
    assert.equal(response.headers.get('link'), expected, pathname)
  }
  const missing = await get('/species/no-such-animal')
  assert.equal(missing.status, 404)
  assert.ok(missing.headers.get('link').endsWith(DISCOVERY_LINK))
  assert.match(
    await missing.text(),
    new RegExp(ARD_LINK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  )
  const denied = await get('/', { method: 'POST' })
  assert.equal(denied.status, 405)
  assert.ok(denied.headers.get('link').endsWith(DISCOVERY_LINK))
  assert.match(await denied.text(), /rel="ard"/)
  const crashed = await handleRequest(new Request(`${origin}/`), {})
  assert.equal(crashed.status, 500)
  assert.ok(crashed.headers.get('link').endsWith(DISCOVERY_LINK))
  assert.match(await crashed.text(), /rel="ard"/)
  for (const pathname of [
    '/style.css',
    '/app.js',
    '/favicon.ico',
    '/images/missing.jpg',
    '/audio/missing.mp3',
  ]) {
    const response = await get(pathname)
    assert.equal(response.headers.get('link'), null, pathname)
  }
})
