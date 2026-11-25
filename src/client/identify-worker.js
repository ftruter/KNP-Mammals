// Recognition worker for /identify/photo and /identify/sound. Adapted from
// KNP-birds src/client/identify-worker.js.
//
// A classic worker, not a module worker: LiteRT.js loads its wasm glue with
// importScripts(), which module workers do not have. The runtime itself is
// pulled in with dynamic import(), which classic workers do support.
//
// Messages in:  { type: 'load', model, runtime, modelBytes, downloadBytes,
//                 cacheName, runtimeCache, checks }
//               { type: 'analyse', samples, count }   (sound: count windows
//                                                     of 144,000 samples)
//               { type: 'classify', pixels, size }    (photo)
// Messages out: { type: 'progress', received, total }
//               { type: 'ready' }
//               { type: 'result', scores, count, timing }
//               { type: 'error', message }
//
// `model` is the model's address and `runtime` the LiteRT.js folder. The
// model is kept in Cache Storage under `cacheName`
// (identify-<page>-<version>) and the runtime under `runtimeCache`, which
// both pages share. Older versions of the same cache are deleted.

const WINDOW = 144000

let infer = null
let build = null
let runs = []

const timing = () => ({
  runs,
  total: runs.reduce((sum, ms) => sum + ms, 0),
  build,
})

const openStore = async (name) => {
  try {
    if (!self.caches || !name) return null
    const prefix = name.split('-').slice(0, 2).join('-') + '-'
    for (const key of await self.caches.keys())
      if (key.startsWith(prefix) && key !== name) await self.caches.delete(key)
    return await self.caches.open(name)
  } catch {
    return null
  }
}

const hex = (buffer) =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

/**
 * Whether `bytes` are the file the page expects. A copy that was put
 * together wrongly on the device still loads, and then answers with
 * nonsense, so a saved model or runtime is checked every time it is used.
 */
const intact = async (bytes, sha256) => {
  if (!sha256 || !self.crypto?.subtle) return true
  return hex(await self.crypto.subtle.digest('SHA-256', bytes)) === sha256
}

/** Removes every saved copy of `url`, so the next fetch goes to the network. */
const purge = async (url) => {
  try {
    for (const name of await self.caches.keys())
      await (await self.caches.open(name)).delete(url)
  } catch {
    // Without Cache Storage there is no saved copy to remove.
  }
}

/** The model bytes, from Cache Storage when they are there and intact. */
const modelBytes = async (url, store, count, sha256) => {
  const saved = store ? await store.match(url) : null
  if (saved) {
    const kept = new Uint8Array(await saved.arrayBuffer())
    if (await intact(kept, sha256)) return kept
    await purge(url)
  }
  // The service worker may answer from a copy the download panel saved.
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} fetching the model`)
  const reader = response.body.getReader()
  const chunks = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    count(value.length)
  }
  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  if (!(await intact(bytes, sha256))) {
    await purge(url)
    throw new Error('The model did not arrive intact')
  }
  if (store)
    await store
      .put(
        url,
        new Response(bytes, {
          headers: { 'content-type': 'application/octet-stream' },
        }),
      )
      .catch(() => {})
  return bytes
}

/** A copy of a response that reports each chunk's size as it is read. */
const counted = (response, count) => {
  if (!response.body || typeof TransformStream !== 'function') return response
  const meter = new TransformStream({
    transform(chunk, controller) {
      count(chunk.length)
      controller.enqueue(chunk)
    },
  })
  return new Response(response.body.pipeThrough(meter), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

/**
 * Keeps the runtime's own downloads in Cache Storage as well, checks the
 * wasm builds, and counts them towards the download progress.
 */
const cacheRuntimeFetches = (root, store, count, checks = {}) => {
  const network = self.fetch.bind(self)
  self.fetch = async (input, init) => {
    const url = new URL(
      typeof input === 'string' ? input : input.url,
      self.location.href,
    ).href
    if (!url.startsWith(root) || (init?.method ?? 'GET') !== 'GET')
      return network(input, init)
    if (url.endsWith('.wasm'))
      build = url.includes('_compat_') ? 'baseline' : 'relaxed-simd'
    const saved = store ? await store.match(url) : null
    const sha256 = checks[url]
    if (saved && !sha256) return saved
    if (saved) {
      const kept = await saved.arrayBuffer()
      if (await intact(kept, sha256))
        return new Response(kept, { headers: saved.headers })
      await purge(url)
    }
    let response = await network(input, init)
    if (!response.ok) return response
    if (sha256) {
      let bytes = await response.arrayBuffer()
      if (!(await intact(bytes, sha256))) {
        await purge(url)
        response = await network(input, init)
        if (!response.ok) return response
        bytes = await response.arrayBuffer()
        if (!(await intact(bytes, sha256)))
          throw new Error(`${url} did not arrive intact`)
      }
      count(bytes.byteLength)
      const headers = { 'content-type': response.headers.get('content-type') }
      if (store)
        store
          .put(url, new Response(bytes.slice(0), { headers }))
          .catch(() => {})
      return new Response(bytes, { headers })
    }
    if (store) store.put(url, response.clone()).catch(() => {})
    return url.endsWith('.wasm') ? counted(response, count) : response
  }
}

const load = async ({
  model,
  runtime,
  modelBytes: expected,
  downloadBytes,
  cacheName,
  runtimeCache,
  checks: given = {},
}) => {
  const checks = Object.fromEntries(
    Object.entries(given).map(([address, sha256]) => [
      new URL(address, self.location.href).href,
      sha256,
    ]),
  )
  const modelUrl = new URL(model, self.location.href).href
  const root = new URL(runtime, self.location.href).href
  const store = await openStore(cacheName)
  const shared = await openStore(runtimeCache)
  const total = downloadBytes || expected
  let received = 0
  const count = (more) => {
    received = Math.min(total, received + more)
    self.postMessage({ type: 'progress', received, total })
  }
  const bytes = await modelBytes(modelUrl, store, count, checks[modelUrl])
  cacheRuntimeFetches(root, shared, count, checks)
  const { loadLiteRt, loadAndCompile, Tensor } = await import(
    `${root}litert.mjs`
  )
  // In a worker the glue looks for its .wasm beside the worker script unless
  // it is told where the runtime folder is.
  self.Module = { locateFile: (file) => root + file }
  await loadLiteRt(root)
  if (received > 0) count(total - received)
  const compiled = await loadAndCompile(bytes, { accelerator: 'wasm' })
  infer = async (values, shape) => {
    const started = performance.now()
    const input = new Tensor(values, shape)
    const output = await compiled.run(input)
    input.delete()
    const result = output[0].toTypedArray().slice()
    for (const tensor of output) tensor.delete()
    runs.push(performance.now() - started)
    return result
  }
}

/**
 * Raw scores (logits) for each window. The page has already normalised each
 * window, as in training, and turns the scores into 0 to 1 itself.
 */
const analyse = async ({ samples, count }) => {
  if (!infer) throw new Error('The recogniser is not loaded')
  let scores = null
  let labels = 0
  for (let index = 0; index < count; index += 1) {
    const frame = samples.slice(index * WINDOW, (index + 1) * WINDOW)
    const out = await infer(frame, [1, WINDOW])
    if (!scores) {
      labels = out.length
      scores = new Float32Array(count * labels)
    }
    scores.set(out, index * labels)
    self.postMessage({ type: 'progress', received: index + 1, total: count })
  }
  return scores ?? new Float32Array(0)
}

/**
 * One photo: `size` x `size` RGB values from 0 to 255, row by row. Scaling
 * and the final softmax are inside the model file.
 */
const classify = async ({ pixels, size }) => {
  if (!infer) throw new Error('The recogniser is not loaded')
  if (pixels.length !== size * size * 3)
    throw new Error('The photo is not the size the recogniser expects')
  return infer(pixels, [1, size, size, 3])
}

self.addEventListener('message', async ({ data }) => {
  try {
    if (data.type === 'load') {
      if (!infer) await load(data)
      self.postMessage({ type: 'ready' })
    } else if (data.type === 'analyse') {
      runs = []
      const scores = await analyse(data)
      self.postMessage(
        { type: 'result', scores, count: data.count, timing: timing() },
        [scores.buffer],
      )
    } else if (data.type === 'classify') {
      runs = []
      const scores = await classify(data)
      self.postMessage({ type: 'result', scores, count: 1, timing: timing() }, [
        scores.buffer,
      ])
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: String(error?.message ?? error),
    })
  }
})
