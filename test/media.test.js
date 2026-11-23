import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { OBJECT_CACHE } from '../src/cache.js'
import { parseUrl, safeObjectKey } from '../src/route.js'
import { handleRequest } from '../src/worker.js'
import { collectEntries } from '../scripts/seed.mjs'
import { licenceAllowed } from '../scripts/publish-media.mjs'

const entries = await collectEntries()
const store = new Map(entries.map(({ key, value }) => [key, value]))
const env = { MAMMALS_KV: { get: async (key) => store.get(key) ?? null } }
const origin = 'https://mammals.example'
const route = (pathname) => parseUrl(new URL(`${origin}${pathname}`))

const CHEETAH = '/images/acinonyx-jubatus/kruger-female-side.jpg'
const WILDEBEEST_CALL = '/audio/xeno-canto/XC1148048'
const FINER_PLACE =
  /\b(camp|picnic|gate|bridge|dam|waterhole|river|drift|kop|Skukuza|Satara|Letaba|Olifants|Punda|Shingwedzi|Mopani|Berg-en-Dal|Pretoriuskop|Lower Sabie|Crocodile Bridge|Malelane|Phalaborwa|Afsaal|Nwanetsi|Mlondozi|Timbavati|S\d{1,3}|H\d{1,2})\b/i

test('image and audio routes keep the object key and reject unsafe keys', () => {
  assert.equal(
    route(CHEETAH).objectKey,
    'acinonyx-jubatus/kruger-female-side.jpg',
  )
  assert.equal(route(CHEETAH).kind, 'image')
  assert.equal(route(WILDEBEEST_CALL).objectKey, 'xeno-canto/XC1148048')
  assert.equal(route(WILDEBEEST_CALL).kind, 'audio')

  const slash = route(`${CHEETAH}/`)
  assert.equal(slash.kind, 'redirect')
  assert.equal(slash.objectKey, undefined)
  assert.equal(route(`${WILDEBEEST_CALL}/`).objectKey, undefined)

  for (const pathname of [
    '/images/../secret.jpg',
    '/images/foo/../../etc/passwd',
    '/images/foo%2F..%2Fsecret.jpg',
    '/images//kruger.jpg',
    '/images/foo//bar.jpg',
    '/images/foo%5Cbar.jpg',
  ]) {
    const parsed = route(pathname)
    assert.equal(parsed.objectKey, undefined, pathname)
    assert.notEqual(parsed.kind, 'image', pathname)
    assert.notEqual(parsed.kind, 'audio', pathname)
  }
  assert.equal(safeObjectKey('a/../b.jpg'), null)
  assert.equal(safeObjectKey('a/./b.jpg'), null)
  assert.equal(safeObjectKey('a//b.jpg'), null)
  assert.equal(safeObjectKey('a\\b.jpg'), null)
})

test('a bucket object is served with its type, range, and a long cache', async () => {
  const bytes = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8])
  const seen = []
  const bucket = {
    async get(key, options) {
      seen.push(key)
      if (key === 'missing.jpg') return null
      const start = options?.range?.offset ?? 0
      const end =
        options?.range?.length == null
          ? bytes.length
          : start + options.range.length
      const slice = bytes.slice(start, end)
      const contentType =
        key === 'call.mp3' ? 'application/octet-stream' : 'image/jpeg'
      return {
        body: (options?.range ? slice : bytes).slice(),
        size: bytes.length,
        httpEtag: '"etag1"',
        httpMetadata: { contentType },
        ...(options?.range
          ? { range: { offset: start, length: slice.length } }
          : {}),
      }
    },
  }
  const withBucket = { ...env, IMAGES: bucket }
  const whole = await handleRequest(
    new Request(`${origin}/images/pic.jpg`),
    withBucket,
  )
  assert.equal(whole.status, 200)
  assert.equal(whole.headers.get('content-type'), 'image/jpeg')
  assert.equal(whole.headers.get('accept-ranges'), 'bytes')
  assert.equal(whole.headers.get('cache-control'), OBJECT_CACHE)
  assert.equal(whole.headers.get('content-length'), '8')
  assert.match(whole.headers.get('content-disposition'), /^inline;/)
  assert.equal(whole.headers.get('x-content-type-options'), 'nosniff')
  assert.match(
    whole.headers.get('content-security-policy'),
    /script-src 'none'/,
  )
  assert.deepEqual([...new Uint8Array(await whole.arrayBuffer())], [...bytes])

  const part = await handleRequest(
    new Request(`${origin}/images/pic.jpg`, {
      headers: { range: 'bytes=2-4' },
    }),
    withBucket,
  )
  assert.equal(part.status, 206)
  assert.equal(part.headers.get('content-range'), 'bytes 2-4/8')
  assert.equal(part.headers.get('content-length'), '3')
  assert.equal(part.headers.get('accept-ranges'), 'bytes')
  assert.deepEqual([...new Uint8Array(await part.arrayBuffer())], [3, 4, 5])

  const clip = await handleRequest(
    new Request(`${origin}/audio/call.mp3`),
    withBucket,
  )
  assert.equal(clip.status, 200)
  assert.equal(clip.headers.get('content-type'), 'audio/mpeg')

  const plain = await handleRequest(
    new Request(`${origin}/images/epomophorus-wahlbergi/perched-side`),
    {
      IMAGES: {
        async get() {
          return {
            body: bytes,
            size: bytes.length,
            httpMetadata: { contentType: 'image/jpeg' },
          }
        },
      },
    },
  )
  assert.equal(plain.headers.get('content-type'), 'image/jpeg')

  const missing = await handleRequest(
    new Request(`${origin}/images/missing.jpg`),
    withBucket,
  )
  assert.equal(missing.status, 404)
  assert.ok(seen.includes('missing.jpg'))
})

const withHosted = (value, hosted) => {
  const doc = JSON.parse(value)
  for (const image of doc.details?.images ?? []) image.hosted = hosted
  for (const call of doc.details?.calls ?? []) {
    for (const recording of call.recordings ?? []) recording.hosted = hosted
  }
  return JSON.stringify(doc)
}

const unhostedEnv = {
  MAMMALS_KV: {
    get: async (key) => {
      const value = store.get(key) ?? null
      if (key !== 'species/connochaetes-taurinus' || value == null) return value
      return withHosted(value, false)
    },
  },
}

test('no bucket is a 404 and an unhosted page still hotlinks', async () => {
  const missing = await handleRequest(new Request(`${origin}${CHEETAH}`), env)
  assert.equal(missing.status, 404)
  assert.equal(missing.headers.get('content-type'), 'text/plain; charset=utf-8')

  const html = await (
    await handleRequest(
      new Request(`${origin}/species/connochaetes-taurinus`),
      unhostedEnv,
    )
  ).text()
  assert.match(html, /src="https:\/\/thumb\.wikimedia\.org\//)
  assert.match(html, /src="https:\/\/xeno-canto\.org\//)
  assert.match(html, /It loads from thumb\.wikimedia\.org/)
  assert.match(html, /It loads from xeno-canto\.org/)
  assert.equal(html.includes('src="/images/'), false)
  assert.equal(html.includes('src="/audio/'), false)
  assert.equal(html.includes('Saved on this site: yes'), false)

  const md = await (
    await handleRequest(
      new Request(`${origin}/species/connochaetes-taurinus.md`),
      unhostedEnv,
    )
  ).text()
  assert.match(md, /https:\/\/thumb\.wikimedia\.org\//)
  assert.match(md, /It loads from thumb\.wikimedia\.org/)
  assert.match(md, /https:\/\/xeno-canto\.org\//)
  assert.match(md, /Bernard DUPONT/)
  assert.match(md, /CC BY-SA 2\.0/)
  assert.equal(md.includes('](/images/'), false)
  assert.equal(md.includes('](/audio/'), false)
})

test('hosted media points at this site and an ND licence is not shown', async () => {
  const hostedEnv = {
    MAMMALS_KV: {
      get: async (key) => {
        if (key !== 'species/connochaetes-taurinus')
          return store.get(key) ?? null
        const doc = JSON.parse(withHosted(store.get(key), false))
        doc.details.images[0].hosted = true
        const call = doc.details.calls.find((item) => item.recordings?.length)
        call.recordings[0].hosted = true
        doc.details.images.push({
          key: 'connochaetes-taurinus/nd.jpg',
          fileUrl: 'https://example.test/nd-photo.jpg',
          license: 'CC BY-ND 4.0',
          hosted: true,
          author: 'N D',
          source: 'https://example.test/nd-photo',
          view: 'standing-side',
        })
        call.recordings.push({
          key: 'xeno-canto/ND1',
          fileUrl: 'https://example.test/nd-call.mp3',
          license: 'CC BY-NC-ND 4.0',
          hosted: true,
          author: 'N D',
          source: 'https://example.test/nd-call',
        })
        return JSON.stringify(doc)
      },
    },
  }
  const html = await (
    await handleRequest(
      new Request(`${origin}/species/connochaetes-taurinus`),
      hostedEnv,
    )
  ).text()
  assert.match(html, /src="\/images\/connochaetes-taurinus\/kruger-front\.jpg"/)
  assert.match(html, /src="\/audio\/xeno-canto\/XC1148048"/)
  assert.match(html, /Saved on this site: yes/)
  assert.match(html, /src="https:\/\/thumb\.wikimedia\.org\//)
  assert.match(html, /It loads from thumb\.wikimedia\.org/)
  assert.match(html, /Photograph not shown/)
  assert.equal(html.includes('https://example.test/nd-photo.jpg'), false)
  assert.equal(html.includes('https://example.test/nd-call.mp3'), false)
  assert.equal(
    html.includes('src="/images/connochaetes-taurinus/nd.jpg"'),
    false,
  )
  assert.equal(html.includes('src="/audio/xeno-canto/ND1"'), false)
  assert.equal(html.includes('<audio controls preload="none" src=""'), false)

  const md = await (
    await handleRequest(
      new Request(`${origin}/species/connochaetes-taurinus.md`),
      hostedEnv,
    )
  ).text()
  assert.match(
    md,
    /\]\(https:\/\/mammals\.example\/images\/connochaetes-taurinus\/kruger-front\.jpg\)/,
  )
  assert.match(
    md,
    /\]\(https:\/\/mammals\.example\/audio\/xeno-canto\/XC1148048\)/,
  )
  assert.match(md, /Saved on this site: yes/)
  assert.match(md, /Bernard DUPONT/)
  assert.match(md, /CC BY-SA 2\.0/)
  assert.match(
    md,
    /https:\/\/commons\.wikimedia\.org\/wiki\/File:Blue_Wildebeest_/,
  )
  assert.match(md, /https:\/\/thumb\.wikimedia\.org\//)
  assert.match(md, /It loads from thumb\.wikimedia\.org/)
  assert.equal(md.includes('https://example.test/nd-photo.jpg'), false)
  assert.equal(md.includes('https://example.test/nd-call.mp3'), false)
  assert.equal(md.includes('/images/connochaetes-taurinus/nd.jpg'), false)
  assert.equal(md.includes('/audio/xeno-canto/ND1'), false)
})

test('stored licences are allowed and media keys do not collide', async () => {
  const dir = path.join('data', 'species', 'details')
  const names = (await readdir(dir)).filter((name) => name.endsWith('.json'))
  const keys = []
  for (const name of names) {
    const doc = JSON.parse(await readFile(path.join(dir, name), 'utf8'))
    const items = [
      ...(Array.isArray(doc.images) ? doc.images : []),
      ...(Array.isArray(doc.calls) ? doc.calls : []).flatMap((call) =>
        Array.isArray(call.recordings) ? call.recordings : [],
      ),
    ]
    for (const item of items) {
      assert.equal(
        licenceAllowed(item.license),
        true,
        `${name} ${item.license}`,
      )
      assert.equal(typeof item.key, 'string', name)
      keys.push(item.key)
    }
  }
  assert.equal(new Set(keys).size, keys.length)
})

test('rhino and pangolin captions name no place finer than Kruger', async () => {
  for (const name of [
    'ceratotherium-simum.json',
    'diceros-bicornis.json',
    'smutsia-temminckii.json',
  ]) {
    const doc = JSON.parse(
      await readFile(path.join('data', 'species', 'details', name), 'utf8'),
    )
    const captions = (doc.images ?? []).map((image) => image.caption)
    assert.ok(captions.length > 0, name)
    for (const caption of captions) {
      assert.match(caption, /Kruger National Park/, `${name}: ${caption}`)
      assert.doesNotMatch(caption, FINER_PLACE, `${name}: ${caption}`)
    }
  }
})
