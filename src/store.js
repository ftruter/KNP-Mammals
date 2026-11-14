/** Reads one JSON document from KV. Returns null when the key is absent. */
export const readDocument = async (kv, key) => {
  if (!kv || typeof kv.get !== 'function') {
    const error = new Error('MAMMALS_KV binding is missing')
    error.code = 'NO_BINDING'
    throw error
  }
  const text = await kv.get(key, 'text')
  if (text == null) return null
  let data
  try {
    data = JSON.parse(text)
  } catch (cause) {
    const error = new Error(`KV value is not JSON: ${key}`)
    error.code = 'INVALID_JSON'
    error.cause = cause
    throw error
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    const error = new Error(`KV value is not a document: ${key}`)
    error.code = 'INVALID_JSON'
    throw error
  }
  return { text, data }
}
