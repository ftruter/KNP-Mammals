export const PAGE_CACHE =
  'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
export const NOT_FOUND_CACHE =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
export const ASSET_CACHE =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
export const OBJECT_CACHE =
  'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400'
/** A recogniser file. Its address names its version, so it never changes. */
export const MODEL_CACHE = 'public, max-age=31536000, immutable'
export const REDIRECT_CACHE = 'public, max-age=3600, s-maxage=86400'
export const NO_STORE = 'no-store'

/**
 * KV reads keep a previous value for the default cacheTtl, 60 seconds.
 * The extra 10 seconds covers clock skew between the build and the edge.
 * While this window is open, responses are no-store so a stale KV read
 * cannot be frozen into Workers Caching for s-maxage.
 */
export const KV_CONSISTENCY_MS = 70_000

export const kvReadMayBeStale = (env, now = Date.now()) => {
  const publishedAt = Number(env?.DATA_PUBLISHED_AT)
  return Number.isFinite(publishedAt) && publishedAt > 0
    ? now - publishedAt < KV_CONSISTENCY_MS
    : false
}

/** The Cache-Control for a response rendered from KV. */
export const kvCache = (env, cache, now) =>
  kvReadMayBeStale(env, now) ? NO_STORE : cache
