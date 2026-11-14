import { clientVersion } from './client.js'
import { faviconSvg, iconBase64 } from './icons.generated.js'

/** The name under the icon on a phone's home screen. */
export const APP_NAME = 'Mammals of KNP'

const bytes = (base64) =>
  Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))

const contentType = (path) =>
  path.endsWith('.ico') ? 'image/x-icon' : 'image/png'

/** Path to `{ body, contentType }` for every size of the site icon. */
export const iconFiles = {
  '/favicon.svg': {
    body: new TextEncoder().encode(faviconSvg),
    contentType: 'image/svg+xml',
  },
  ...Object.fromEntries(
    Object.entries(iconBase64).map(([path, base64]) => [
      path,
      { body: bytes(base64), contentType: contentType(path) },
    ]),
  ),
}

/** Changes when the drawing does, so a cached icon is not kept past a redesign. */
export const iconVersion = clientVersion(
  faviconSvg + Object.values(iconBase64).join(''),
)

/**
 * The .ico is for browsers that do not take an SVG icon. `sizes` on it stops
 * browsers that do from preferring it.
 */
export const ICON_LINKS = `<meta name="application-name" content="${APP_NAME}">
<meta name="apple-mobile-web-app-title" content="${APP_NAME}">
<link rel="icon" href="/favicon.ico?v=${iconVersion}" sizes="32x32">
<link rel="icon" href="/favicon.svg?v=${iconVersion}" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${iconVersion}">`
