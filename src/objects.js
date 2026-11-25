import { MODEL_CACHE, OBJECT_CACHE } from './cache.js'
import { MODEL_KEYS } from './identify.js'
import { objectResponse } from './respond.js'

const TYPE_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
}

/** Stored content type when it is image or audio, otherwise the key's extension. */
export const mediaType = (object, key) => {
  const meta =
    object?.httpMetadata?.contentType?.split(';')[0]?.trim().toLowerCase() ?? ''
  if (meta.startsWith('image/') || meta.startsWith('audio/')) return meta
  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  return TYPE_EXT[ext] || 'application/octet-stream'
}

const openObject = async (bucket, key) =>
  !bucket || typeof bucket.get !== 'function' ? null : bucket.get(key)

/**
 * A photograph or recording. A `Range` header is answered in part, so a
 * player can seek.
 */
export const objectHttpResponse = async (bucket, key, rangeHeader = null) => {
  const wanted = parseRange(rangeHeader)
  const part = wanted ? await openPart(bucket, key, wanted) : null
  const object = part ?? (await openObject(bucket, key))
  if (!object || !object.body) return null
  const type = mediaType(object, key)
  const filename = (key.split('/').pop() || 'file').replaceAll(/["\r\n\\]/g, '')
  const disposition =
    type === 'application/octet-stream'
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`
  return objectResponse({
    body: object.body,
    contentType: type,
    cache: OBJECT_CACHE,
    etag: object.httpEtag || '',
    size: object.size,
    disposition,
    ranges: true,
    range: part ? sentRange(part, wanted) : null,
  })
}

const MODEL_EXT = {
  tflite: 'application/octet-stream',
  wasm: 'application/wasm',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
}

/**
 * A recogniser file from `models/<version>/`. Only the files src/identify.js
 * lists are served, each with the type its name gives.
 */
export const modelHttpResponse = async (bucket, key, rangeHeader = null) => {
  if (!MODEL_KEYS.has(key)) return null
  const type = MODEL_EXT[key.split('.').pop()?.toLowerCase() ?? '']
  if (!type) return null
  const wanted = parseRange(rangeHeader)
  const part = wanted ? await openPart(bucket, key, wanted) : null
  const object = part ?? (await openObject(bucket, key))
  if (!object || !object.body) return null
  return objectResponse({
    body: object.body,
    contentType: type,
    cache: MODEL_CACHE,
    etag: object.httpEtag || '',
    size: object.size,
    script: type.startsWith('text/javascript'),
    ranges: true,
    range: part ? sentRange(part, wanted) : null,
  })
}

/**
 * `bytes=<first>-<last>` or `bytes=<first>-`. Anything else is the whole file.
 */
export const parseRange = (header) => {
  const match = /^bytes=(\d+)-(\d*)$/.exec(String(header ?? '').trim())
  if (!match) return null
  const offset = Number(match[1])
  const last = match[2] === '' ? null : Number(match[2])
  if (!Number.isSafeInteger(offset)) return null
  if (last != null && (!Number.isSafeInteger(last) || last < offset))
    return null
  return { offset, ...(last == null ? {} : { length: last - offset + 1 }) }
}

const openPart = async (bucket, key, range) => {
  if (!bucket || typeof bucket.get !== 'function') return null
  try {
    const object = await bucket.get(key, { range })
    return object?.body && object.range ? object : null
  } catch {
    return null
  }
}

const sentRange = (object, wanted) => {
  const offset = object.range.offset ?? wanted.offset
  return {
    offset,
    length: object.range.length ?? object.size - offset,
  }
}
