import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SUPPORTED_PROTOCOL_VERSIONS } from '@modelcontextprotocol/server'
import { collectEntries } from '../scripts/seed.mjs'
import { MCP_HOSTS, SEARCH_DESCRIPTION } from '../src/mcp.js'
import worker, { handleRequest } from '../src/worker.js'

const origin = 'https://mammals.truter.world'
const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = {
  MAMMALS_KV: { get: async (key) => store.get(key) ?? null },
  DATA_VERSION: 'mcp-test',
}
const ctx = { waitUntil() {}, passThroughOnException() {} }

const rpcMessage = (response, text) => {
  const type = response.headers.get('content-type') || ''
  if (type.includes('text/event-stream')) {
    return text
      .split('\n')
      .filter((line) => line.startsWith('data: '))
      .map((line) => JSON.parse(line.slice('data: '.length)))
      .at(-1)
  }
  return JSON.parse(text)
}

const postMcp = async (requestEnv, body, headers = {}) => {
  const response = await worker.fetch(
    new Request(`${origin}/mcp`, {
      method: 'POST',
      headers: {
        host: 'mammals.truter.world',
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        ...headers,
      },
      body: JSON.stringify(body),
    }),
    requestEnv,
    ctx,
  )
  const text = await response.text()
  return {
    response,
    text,
    message: response.status === 200 ? rpcMessage(response, text) : null,
  }
}

const callSearch = (requestEnv, args) =>
  postMcp(requestEnv, {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'search', arguments: args },
  })

const first = (call) => call.message.result.structuredContent.results[0]

test('initialize and tools/list expose only the public search tool', async () => {
  const initialized = await postMcp(env, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'knp-test', version: '0' },
    },
  })
  assert.equal(initialized.response.status, 200)
  assert.equal(
    initialized.message.result.serverInfo.name,
    'mammals.truter.world/field-guide',
  )
  const listed = await postMcp(env, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  })
  const tools = listed.message.result.tools
  assert.deepEqual(
    tools.map((tool) => tool.name),
    ['search'],
  )
  assert.equal(tools[0].description, SEARCH_DESCRIPTION)
  assert.match(tools[0].description, /public read-only/i)
  assert.match(tools[0].description, /KNP mammal records/)
  assert.equal(tools[0].annotations.readOnlyHint, true)
  assert.equal(tools[0].annotations.destructiveHint, false)
  assert.equal(tools[0].annotations.openWorldHint, false)
})

test('search finds mammals by scientific, English and Afrikaans name', async () => {
  const lion = await callSearch(env, { query: 'lion' })
  assert.equal(lion.response.status, 200)
  assert.equal(lion.message.result.isError, undefined)
  const hit = first(lion)
  assert.equal(hit.kind, 'species')
  assert.equal(hit.scientificName, 'Panthera leo')
  assert.equal(hit.englishName, 'Lion')
  assert.equal(hit.afrikaansName, 'Leeu')
  assert.equal(hit.pages.html, `${origin}/species/panthera-leo`)
  assert.equal(hit.pages.markdown, `${origin}/species/panthera-leo.md`)
  assert.equal(hit.pages.json, `${origin}/species/panthera-leo.json`)
  assert.equal(lion.message.result.structuredContent.limit, 10)
  const page = await handleRequest(new Request(hit.pages.html), env)
  assert.equal(page.status, 200)

  assert.equal(
    first(await callSearch(env, { query: 'Connochaetes taurinus' }))
      .englishName,
    'Blue wildebeest',
  )
  assert.equal(
    first(await callSearch(env, { query: 'blouwildebees' })).scientificName,
    'Connochaetes taurinus',
  )
  // Names compare without diacritics and case.
  assert.equal(
    first(await callSearch(env, { query: 'JULIANA SE GOUEMOL' }))
      .scientificName,
    'Neamblysomus julianae',
  )

  const miss = await callSearch(env, { query: 'zzzznotamammal' })
  assert.equal(miss.message.result.structuredContent.total, 0)
  assert.deepEqual(miss.message.result.structuredContent.results, [])
  assert.match(miss.message.result.content[0].text, /no published/i)
  assert.equal(miss.message.result.isError, undefined)

  const limited = await callSearch(env, { query: 'rhinoceros', limit: 1 })
  assert.equal(limited.message.result.structuredContent.results.length, 1)
  assert.ok(limited.message.result.structuredContent.total > 1)
})

test('the tool agrees with /search.json on order', async () => {
  const query = 'rhinoceros'
  const tool = await callSearch(env, { query })
  const page = await (
    await handleRequest(new Request(`${origin}/search.json?q=${query}`), env)
  ).json()
  const fromTool = tool.message.result.structuredContent.results.map(
    (hit) => hit.pages.html,
  )
  assert.ok(fromTool.length >= 2)
  const text = JSON.stringify(page)
  let at = -1
  for (const url of fromTool) {
    const next = text.indexOf(new URL(url).pathname, at + 1)
    assert.ok(next > at, url)
    at = next
  }
})

test('results carry names and page URLs only, so protected species leak no place', async () => {
  const allowed = [
    'kind',
    'scientificName',
    'englishName',
    'afrikaansName',
    'pages',
  ]
  const protectedNames = [
    'white rhinoceros',
    'black rhinoceros',
    'Smutsia temminckii',
  ]
  for (const query of protectedNames) {
    const call = await callSearch(env, { query })
    assert.equal(call.response.status, 200, query)
    const hit = first(call)
    assert.deepEqual(Object.keys(hit).sort(), [...allowed].sort(), query)
    assert.deepEqual(Object.keys(hit.pages).sort(), [
      'html',
      'json',
      'markdown',
    ])
    assert.doesNotMatch(
      call.text,
      /inaturalist|xeno-canto|observation|latitude|longitude|caption|camp|road|waterhole/i,
      query,
    )
  }
  assert.equal(
    first(await callSearch(env, { query: 'white rhinoceros' })).scientificName,
    'Ceratotherium simum',
  )
  assert.equal(
    first(await callSearch(env, { query: 'Smutsia temminckii' })).englishName,
    'Pangolin',
  )
})

test('search rejects bad input and a broken store without leaking internals', async () => {
  const blank = await callSearch(env, { query: '   ' })
  assert.equal(blank.response.status, 200)
  assert.equal(blank.message.result.isError, true)
  assert.match(blank.message.result.content[0].text, /text query/)

  const long = 'x'.repeat(201)
  const tooLong = await callSearch(env, { query: long })
  assert.equal(tooLong.message?.result?.isError ?? true, true)
  assert.equal(tooLong.text.includes(long), false)

  const huge = await callSearch(env, { query: 'lion', limit: 26 })
  assert.equal(huge.message?.result?.isError ?? true, true)
  const zero = await callSearch(env, { query: 'lion', limit: 0 })
  assert.equal(zero.message?.result?.isError ?? true, true)
  const fractional = await callSearch(env, { query: 'lion', limit: 1.5 })
  assert.equal(fractional.message?.result?.isError ?? true, true)
  const max = await callSearch(env, { query: 'a', limit: 25 })
  assert.equal(max.message.result.isError, undefined)

  const errors = []
  const original = console.error
  console.error = (...args) => errors.push(args.map(String).join(' '))
  try {
    const broken = {
      MAMMALS_KV: {
        async get() {
          throw new Error('secret token kv-down')
        },
      },
    }
    const failed = await callSearch(broken, { query: 'lion' })
    assert.equal(failed.message.result.isError, true)
    assert.match(failed.message.result.content[0].text, /unavailable/)
    for (const leak of ['secret token', 'kv-down', 'MAMMALS_KV'])
      assert.equal(failed.text.includes(leak), false, leak)
  } finally {
    console.error = original
  }
})

test('the MCP host and origin checks reject other sites', async () => {
  const list = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }
  assert.equal(
    (await postMcp(env, list, { host: 'evil.example' })).response.status,
    403,
  )
  assert.equal(
    (await postMcp(env, list, { origin: 'https://evil.example' })).response
      .status,
    403,
  )
  assert.equal(
    (await postMcp(env, list, { origin: 'https://birds.truter.world' }))
      .response.status,
    403,
  )
  assert.equal((await postMcp(env, list, { origin })).response.status, 200)
  assert.equal(
    (await postMcp(env, list, { origin: 'http://localhost:8787' })).response
      .status,
    200,
  )
  assert.deepEqual(MCP_HOSTS, [
    'mammals.truter.world',
    'localhost',
    '127.0.0.1',
    '[::1]',
  ])
})

test('the server card describes the transport and the installed protocol versions', async () => {
  const response = await handleRequest(
    new Request(`${origin}/mcp/server-card`),
    env,
  )
  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('content-type'),
    'application/mcp-server-card+json; charset=utf-8',
  )
  assert.equal(
    response.headers
      .get('link')
      .includes('rel="https://mammals.truter.world/rel/mcp-server-card"'),
    true,
  )
  const card = await response.json()
  assert.equal(
    card.$schema,
    'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  )
  assert.equal(card.name, 'mammals.truter.world/field-guide')
  assert.ok(card.description.length <= 100)
  assert.match(card.description, /public read-only/i)
  assert.equal(card.repository.url, 'https://github.com/ftruter/KNP-Mammals')
  assert.equal(card.remotes.length, 1)
  assert.equal(card.remotes[0].type, 'streamable-http')
  assert.equal(card.remotes[0].url, `${origin}/mcp`)
  assert.deepEqual(card.remotes[0].supportedProtocolVersions, [
    ...SUPPORTED_PROTOCOL_VERSIONS,
  ])
  assert.equal(card.remotes[0].headers, undefined)
  // The card needs no KV, and the site routes around it do not change.
  const noStore = await handleRequest(
    new Request(`${origin}/mcp/server-card`),
    {},
  )
  assert.equal(noStore.status, 200)
  assert.equal(
    (await handleRequest(new Request(`${origin}/mcp/server-card.md`), env))
      .status,
    404,
  )
  assert.equal(
    (
      await handleRequest(
        new Request(`${origin}/mcp/server-card`, { method: 'POST' }),
        env,
      )
    ).status,
    405,
  )
})

test('ordinary pages still go through the Worker entry point', async () => {
  const response = await worker.fetch(new Request(`${origin}/`), env, ctx)
  assert.equal(response.status, 200)
  const post = await worker.fetch(
    new Request(`${origin}/species`, { method: 'POST' }),
    env,
    ctx,
  )
  assert.equal(post.status, 405)
})
