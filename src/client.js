import clientJs from './client/app.js'
import offlineJs from './client/offline.js'
import serviceWorkerJs from './client/sw.js'
import identifyPhotoJs from './client/identify-photo.js'
import identifySoundJs from './client/identify-sound.js'
import identifyWorkerJs from './client/identify-worker.js'
import identifyCaptureJs from './client/identify-capture.js'
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

export { clientJs, offlineJs, serviceWorkerJs }
export const clientSrc = `/app.js?v=${clientVersion(clientJs)}`
/** The installed app's page script: the download panel and the saved pages. */
export const offlineSrc = `/offline.js?v=${clientVersion(offlineJs)}`
/** The stylesheet is cached for a day, so its address changes with it too. */
export const styleSrc = `${STYLE_PATH}?v=${clientVersion(css)}`

/** Path to source for the /identify/photo and /identify/sound scripts. */
export const identifyScripts = {
  '/identify-photo.js': identifyPhotoJs,
  '/identify-sound.js': identifySoundJs,
  '/identify-worker.js': identifyWorkerJs,
  '/identify-capture.js': identifyCaptureJs,
}

/** A versioned address for one of them. */
export const identifySrc = (path) =>
  `${path}?v=${clientVersion(identifyScripts[path])}`
