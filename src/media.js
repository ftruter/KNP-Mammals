import { safeHttpUrl } from './escape.js'
import { licenceForbidsDerivatives } from './labels.js'
import { objectPublicPath } from './route.js'

/**
 * Where a page loads one photograph or recording from.
 * `hosted: true` uses `/images/<key>` or `/audio/<key>`. Otherwise `fileUrl`.
 * An ND licence is not shown. Returns null when there is nothing to load.
 */
export const mediaSrc = (item, group) => {
  if (licenceForbidsDerivatives(item?.license)) return null
  if (item?.hosted === true) {
    const src = objectPublicPath(group, item?.key)
    if (src) return { src, onSite: true }
  }
  const src = safeHttpUrl(item?.fileUrl)
  return src ? { src, onSite: false } : null
}
