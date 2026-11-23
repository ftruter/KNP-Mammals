export const ARD_LINK =
  '<link rel="ard" type="application/json" href="/.well-known/ard.json">'

export const CANONICAL_ORIGIN = 'https://mammals.truter.world'

/** The origin a page was asked on, or the canonical one when none is given. */
export const siteOrigin = (origin) =>
  typeof origin === 'string' && /^https?:\/\//.test(origin)
    ? origin.replace(/\/$/, '')
    : CANONICAL_ORIGIN

/**
 * ARD v0.91 defines rel="ard" for the manifest. RFC 6892 defines
 * rel="describedby" for a document that describes the context.
 * There is no rel="ai-catalog" link: the predecessor file is still
 * served, and clients that want it fetch the path.
 */
export const DISCOVERY_LINK = [
  '</.well-known/ard.json>; rel="ard"; type="application/json"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(', ')

export const linkHeader = (pageLinks = []) =>
  pageLinks.length === 0
    ? DISCOVERY_LINK
    : `${pageLinks.join(', ')}, ${DISCOVERY_LINK}`
