import clientJs from './client/app.js'
import { STYLE_PATH } from './route.js'
import { css } from './style.js'

/** A short hash of the script, so a changed script gets a new address. */
export const clientVersion = (source) => {
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

export { clientJs }
export const clientSrc = `/app.js?v=${clientVersion(clientJs)}`
/** The stylesheet is cached for a day, so its address changes with it too. */
export const styleSrc = `${STYLE_PATH}?v=${clientVersion(css)}`
