import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  BUCKET,
  download,
  loadSpeciesDetails,
  mediaPlan,
  publishMedia,
  sniff,
} from '../scripts/publish-media.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0xd9])
const mp3 = Buffer.from('ID3fake')
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

const responseFor = (url) => {
  const address = String(url)
  if (address.endsWith('.html'))
    return new Response('<html>not a picture</html>', {
      headers: { 'content-type': 'image/jpeg' },
    })
  if (address.endsWith('.mp3'))
    return new Response(mp3, {
      headers: { 'content-type': 'application/octet-stream' },
    })
  return new Response(jpeg, { headers: { 'content-type': 'image/png' } })
}

const fixture = () => [
  {
    slug: 'a',
    images: [
      {
        key: 'a/one.jpg',
        fileUrl: 'https://cdn.test/one.jpg',
        license: 'CC BY 4.0',
        hosted: false,
      },
      {
        key: 'a/plain.jpg',
        fileUrl: 'http://cdn.test/plain.jpg',
        license: 'CC BY 4.0',
        hosted: false,
      },
      {
        key: 'a/nd.jpg',
        fileUrl: 'https://cdn.test/nd.jpg',
        license: 'CC BY-ND 4.0',
        hosted: false,
      },
      {
        key: 'a/page.html',
        fileUrl: 'https://cdn.test/page.html',
        license: 'CC BY-SA 4.0',
        hosted: false,
      },
    ],
    calls: [
      {
        recordings: [
          {
            key: 'inaturalist/1',
            fileUrl: 'https://cdn.test/1.mp3',
            license: 'CC BY-NC 4.0',
            hosted: false,
          },
        ],
      },
    ],
  },
]

test('sniff names the bytes and ignores a source label', async () => {
  assert.equal(sniff(jpeg), 'image/jpeg')
  assert.equal(sniff(Buffer.from([0x89, 0x50, 0x4e, 0x47])), 'image/png')
  assert.equal(sniff(Buffer.from('GIF89a')), 'image/gif')
  assert.equal(sniff(mp3), 'audio/mpeg')
  assert.equal(
    sniff(Buffer.concat([Buffer.alloc(4), Buffer.from('ftypM4A ')])),
    'audio/mp4',
  )
  assert.equal(sniff(Buffer.from('<html></html>')), null)

  const item = {
    group: 'images',
    key: 'a/one.jpg',
    source: 'https://cdn.test/one.jpg',
  }
  await assert.rejects(
    () =>
      download(
        item,
        async () =>
          new Response('<html></html>', {
            headers: { 'content-type': 'text/html' },
          }),
      ),
    /text\/html/,
  )
  await assert.rejects(
    () =>
      download(
        item,
        async () =>
          new Response('<html>not jpeg</html>', {
            headers: { 'content-type': 'image/jpeg' },
          }),
      ),
    /expected image\//,
  )
  const file = await download(
    item,
    async () =>
      new Response(jpeg, { headers: { 'content-type': 'image/png' } }),
  )
  assert.equal(file.contentType, 'image/jpeg')
})

test('the plan keeps https media and skips ND and non-https URLs', () => {
  const { items, skipped } = mediaPlan(fixture())
  assert.deepEqual(
    items.map((item) => `${item.group} ${item.key}`),
    ['audio inaturalist/1', 'images a/one.jpg', 'images a/page.html'],
  )
  assert.ok(
    skipped.some(
      (item) => item.key === 'a/plain.jpg' && item.reason === 'not https',
    ),
  )
  assert.ok(
    skipped.some(
      (item) => item.key === 'a/nd.jpg' && item.reason === 'licence',
    ),
  )
})

test('plans all 382 photographs and 12 recordings and does not fetch them', async () => {
  const { items, skipped } = mediaPlan(await loadSpeciesDetails())
  assert.equal(items.filter((item) => item.group === 'images').length, 382)
  assert.equal(items.filter((item) => item.group === 'audio').length, 12)
  assert.equal(skipped.length, 0)

  const dir = await mkdtemp(path.join(tmpdir(), 'knp-media-plan-'))
  let fetched = false
  const result = await publishMedia({
    dryRun: true,
    mirrorFile: path.join(dir, 'mirror.json'),
    fetcher: () => {
      fetched = true
      throw new Error('network')
    },
    run: () => {
      throw new Error('wrangler')
    },
    log: () => {},
  })
  assert.equal(fetched, false)
  assert.equal(
    result.plan.filter((item) => item.group === 'images').length,
    382,
  )
  assert.equal(result.plan.filter((item) => item.group === 'audio').length, 12)
  await rm(dir, { recursive: true, force: true })
})

test('a copy records the sniffed type and sha256 and skips a mirrored URL', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'knp-media-copy-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const mirrorFile = path.join(dir, 'mirror.json')
  const docs = fixture().map((doc) => ({
    ...doc,
    images: doc.images.filter((image) => image.key !== 'a/page.html'),
  }))
  await writeFile(
    mirrorFile,
    `${JSON.stringify({
      note: 'test',
      images: {
        'a/one.jpg': {
          bytes: 1,
          sha256: 'abc',
          contentType: 'image/jpeg',
          source: 'https://cdn.test/one.jpg',
        },
        'old/gone.jpg': {
          bytes: 1,
          sha256: 'abc',
          contentType: 'image/jpeg',
          source: 'https://cdn.test/old.jpg',
        },
        'offline/keep.jpg': {
          bytes: 1,
          sha256: 'abc',
          contentType: 'image/jpeg',
          source: 'https://cdn.test/off.jpg',
        },
      },
      audio: {
        'models/keep.mp3': {
          bytes: 1,
          sha256: 'abc',
          contentType: 'audio/mpeg',
          source: 'https://cdn.test/model.mp3',
        },
      },
    })}\n`,
  )
  const calls = []
  const fetched = []
  const result = await publishMedia({
    species: docs,
    mirrorFile,
    fetcher: async (url, init) => {
      fetched.push({ url: String(url), method: init?.method ?? 'GET' })
      return responseFor(url)
    },
    run: async (args) => {
      calls.push(args)
    },
    log: () => {},
  })
  assert.deepEqual(
    fetched.map((item) => item.url),
    ['https://cdn.test/1.mp3'],
  )
  assert.equal(docs[0].images[0].hosted, false)
  assert.equal(result.copied.length, 1)
  assert.equal(result.copied[0].key, 'inaturalist/1')
  const put = calls.find((args) => args[1] === 'object' && args[2] === 'put')
  assert.equal(put[3], `${BUCKET}/inaturalist/1`)
  assert.equal(put[put.indexOf('--content-type') + 1], 'audio/mpeg')
  assert.ok(put.includes('--remote'))
  assert.equal(put.includes('--local'), false)
  const deleted = calls.find((args) => args[2] === 'delete')
  assert.equal(deleted[3], `${BUCKET}/old/gone.jpg`)
  assert.equal(
    calls.some((args) => String(args[3]).includes('offline/')),
    false,
  )
  assert.equal(
    calls.some((args) => String(args[3]).includes('models/')),
    false,
  )

  const mirror = JSON.parse(await readFile(mirrorFile, 'utf8'))
  assert.equal(mirror.images['a/one.jpg'].source, 'https://cdn.test/one.jpg')
  assert.equal(mirror.images['old/gone.jpg'], undefined)
  assert.ok(mirror.images['offline/keep.jpg'])
  assert.ok(mirror.audio['models/keep.mp3'])
  assert.deepEqual(mirror.audio['inaturalist/1'], {
    bytes: mp3.length,
    sha256: sha256(mp3),
    contentType: 'audio/mpeg',
    source: 'https://cdn.test/1.mp3',
  })
  assert.equal(mirror.audio['inaturalist/1'].hosted, undefined)
})

test('a failed file stays unhosted and out of the mirror', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'knp-media-fail-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const docs = [
    {
      slug: 'a',
      images: [
        {
          key: 'a/page.html',
          fileUrl: 'https://cdn.test/page.html',
          license: 'CC0',
          hosted: false,
        },
      ],
      calls: [],
    },
  ]
  await assert.rejects(
    () =>
      publishMedia({
        species: docs,
        mirrorFile: path.join(dir, 'mirror.json'),
        fetcher: async (url) => responseFor(url),
        run: async () => {
          throw new Error('wrangler should not run')
        },
        log: () => {},
      }),
    /were not copied/,
  )
  assert.equal(docs[0].images[0].hosted, false)
  const mirror = JSON.parse(
    await readFile(path.join(dir, 'mirror.json'), 'utf8'),
  )
  assert.deepEqual(mirror.images, {})
  assert.deepEqual(mirror.audio, {})
})

test('--measure sends HEAD requests and does not upload', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'knp-media-measure-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const methods = []
  const result = await publishMedia({
    measureOnly: true,
    species: [
      {
        slug: 'a',
        images: [
          {
            key: 'a/one.jpg',
            fileUrl: 'https://cdn.test/one.jpg',
            license: 'CC BY 4.0',
            hosted: false,
          },
          {
            key: 'a/two.jpg',
            fileUrl: 'https://cdn.test/two.jpg',
            license: 'CC BY 4.0',
            hosted: false,
          },
        ],
        calls: [],
      },
    ],
    mirrorFile: path.join(dir, 'mirror.json'),
    fetcher: async (url, init) => {
      methods.push(init?.method ?? 'GET')
      const length = String(url).endsWith('one.jpg') ? '100' : null
      const headers = length ? { 'content-length': length } : {}
      return new Response(null, { status: 200, headers })
    },
    run: async () => {
      throw new Error('wrangler')
    },
    log: () => {},
  })
  assert.deepEqual(methods, ['HEAD', 'HEAD'])
  assert.equal(result.totals.images, 100)
  assert.equal(result.unknown, 1)
  await assert.rejects(() => readFile(path.join(dir, 'mirror.json')))
})

test('--local uploads locally and does not write the mirror', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'knp-media-local-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const calls = []
  await publishMedia({
    local: true,
    limit: 1,
    species: fixture().map((doc) => ({
      ...doc,
      images: doc.images.filter((image) => image.key === 'a/one.jpg'),
      calls: doc.calls,
    })),
    mirrorFile: path.join(dir, 'mirror.json'),
    fetcher: async (url) => responseFor(url),
    run: async (args) => {
      calls.push(args)
    },
    log: () => {},
  })
  assert.equal(calls.length, 1)
  assert.ok(calls[0].includes('--local'))
  assert.equal(calls[0].includes('--remote'), false)
  await assert.rejects(() => readFile(path.join(dir, 'mirror.json')))
})

test('the dry-run command plans 382 photographs and 12 recordings', async () => {
  const child = spawn(
    process.execPath,
    ['scripts/publish-media.mjs', '--dry-run'],
    { cwd: root },
  )
  let out = ''
  let err = ''
  child.stdout.on('data', (chunk) => {
    out += chunk
  })
  child.stderr.on('data', (chunk) => {
    err += chunk
  })
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })
  assert.equal(err, '')
  assert.equal(code, 0)
  assert.match(
    out,
    /394 files in the plan \(382 photographs, 12 clips\); 0 to copy, 0 old copies to delete/,
  )
})
