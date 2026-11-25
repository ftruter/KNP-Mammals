// /identify/photo: take or open a photo and see which Kruger mammals it
// looks most like. Recognition runs in identify-worker.js. The photo is
// drawn on a canvas and never leaves the device.

export const SIZE = 288
/** The model was tested on the centre 88% of the photo's shorter side. */
export const CENTRE = 0.88
export const MAX_ZOOM = 3
export const LIKELY = 0.5
export const POSSIBLE = 0.25
export const SHOWN = 3

export const confidence = (score) =>
  score >= LIKELY ? 'likely' : score >= POSSIBLE ? 'possible' : 'unsure'

export const WORD = {
  likely: 'Likely',
  possible: 'Possible',
  unsure: 'Not sure',
}

/**
 * The square the recogniser looks at, in the photo's pixels: centred on
 * (`x`, `y`) as fractions of the photo, and kept inside it. At zoom 1 it is
 * the centre 88% of the shorter side, as in testing.
 */
export const cropSquare = (
  width,
  height,
  { x = 0.5, y = 0.5, zoom = 1 } = {},
) => {
  const side =
    (Math.min(width, height) * CENTRE) / Math.min(MAX_ZOOM, Math.max(1, zoom))
  const clamp = (value, room) => Math.min(Math.max(value, 0), room)
  return {
    left: clamp(x * width - side / 2, width - side),
    top: clamp(y * height - side / 2, height - side),
    side,
  }
}

/** RGBA bytes to the model's input: RGB values from 0 to 255, row by row. */
export const toRgb = (rgba) => {
  const pixels = new Float32Array((rgba.length / 4) * 3)
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    pixels[j] = rgba[i]
    pixels[j + 1] = rgba[i + 1]
    pixels[j + 2] = rgba[i + 2]
  }
  return pixels
}

/**
 * The three most likely species, best first. `scores` are in the model's
 * class order, the same as `species`. When even the best is below
 * "possible", the page says it is not sure and still shows the closest.
 */
export const rankResults = (scores, species) => {
  const ranked = species
    .map((item, index) => ({
      slug: item.slug,
      en: item.en,
      score: scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.en.localeCompare(b.en))
    .slice(0, SHOWN)
    .map((item) => ({ ...item, confidence: confidence(item.score) }))
  return {
    kind: ranked.length && ranked[0].score >= POSSIBLE ? 'species' : 'none',
    candidates: ranked,
  }
}

export const mebibytes = (bytes) => (bytes / 1048576).toFixed(1)

/** A result card: the page's template for the species, with its verdict. */
export const resultCard = (doc, item) => {
  const template = doc.querySelector(`#identify-card-${item.slug}`)
  if (!template) return null
  const card = template.content.firstElementChild.cloneNode(true)
  const verdict = card.querySelector('.identify-verdict')
  if (verdict) {
    verdict.replaceChildren()
    const word = doc.createElement('strong')
    word.textContent = WORD[item.confidence]
    verdict.append(word, ` · ${Math.round(item.score * 100)}%`)
  }
  return card
}

const boot = async () => {
  const root = document.querySelector('#identify')
  if (!root) return
  const part = (name) => root.querySelector(`#identify-${name}`)
  const note = document.querySelector('#identify-nojs')
  if (
    typeof WebAssembly !== 'object' ||
    typeof Worker !== 'function' ||
    typeof createImageBitmap !== 'function'
  ) {
    const reason = note?.querySelector('#identify-nojs-reason')
    if (reason) reason.textContent = 'This browser cannot run the recogniser.'
    return
  }
  if (note) note.hidden = true
  root.hidden = false

  const status = part('status')
  const progress = part('progress')
  const consent = part('consent')
  const capture = part('capture')
  const camera = part('camera')
  const file = part('file')
  const preview = part('preview')
  const canvas = part('canvas')
  const zoom = part('zoom')
  const results = part('results')
  const list = part('list')
  const species = JSON.parse(root.dataset.species || '[]')
  const modelUrl = root.dataset.model
  const modelBytes = Number(root.dataset.modelBytes)
  const downloadBytes = Number(root.dataset.downloadBytes)

  const say = (text) => {
    status.textContent = text
  }
  const showProgress = (value) => {
    progress.hidden = value == null
    if (value != null) progress.value = value
  }

  let worker = null
  let pending = null
  const ask = (message, transfer, onProgress) =>
    new Promise((resolve, reject) => {
      if (!worker) {
        worker = new Worker(root.dataset.worker)
        worker.addEventListener('message', ({ data }) => {
          if (!pending) return
          if (data.type === 'progress') pending.onProgress?.(data)
          else if (data.type === 'error') {
            pending.reject(new Error(data.message))
            pending = null
          } else {
            pending.resolve(data)
            pending = null
          }
        })
        worker.addEventListener('error', (event) => {
          pending?.reject(new Error(event.message || 'worker failed'))
          pending = null
        })
      }
      pending = { resolve, reject, onProgress }
      worker.postMessage(message, transfer ?? [])
    })

  const isSaved = async () => {
    try {
      for (const name of await window.caches.keys()) {
        const store = await window.caches.open(name)
        if (await store.match(new URL(modelUrl, location))) return true
      }
    } catch {
      // No Cache Storage: the visitor is asked first.
    }
    return false
  }

  let ready = false
  const load = async () => {
    consent.hidden = true
    say('Getting the recogniser ready.')
    showProgress(0)
    try {
      await ask(
        {
          type: 'load',
          model: modelUrl,
          runtime: root.dataset.runtime,
          modelBytes,
          downloadBytes,
          cacheName: root.dataset.cache,
          runtimeCache: root.dataset.runtimeCache,
          checks: JSON.parse(root.dataset.checks || '{}'),
        },
        [],
        ({ received, total }) => {
          showProgress(total ? received / total : 0)
          say(
            `Downloading the recogniser: ${mebibytes(received)} of ${mebibytes(total)} MiB.`,
          )
        },
      )
    } catch (error) {
      console.error(error)
      showProgress(null)
      consent.hidden = false
      say(
        'The recogniser could not be loaded. Check your connection, then try again.',
      )
      return
    }
    ready = true
    showProgress(null)
    capture.hidden = false
    say('Ready. Take a photo, or open one.')
  }

  // The photo in hand and where the square is.
  let photo = null
  let view = { x: 0.5, y: 0.5, zoom: 1 }

  const draw = () => {
    if (!photo) return
    const scale = Math.min(1, 720 / Math.max(photo.width, photo.height))
    canvas.width = Math.round(photo.width * scale)
    canvas.height = Math.round(photo.height * scale)
    const context = canvas.getContext('2d')
    context.drawImage(photo, 0, 0, canvas.width, canvas.height)
    const { left, top, side } = cropSquare(photo.width, photo.height, view)
    context.fillStyle = 'rgba(0, 0, 0, 0.45)'
    context.beginPath()
    context.rect(0, 0, canvas.width, canvas.height)
    context.rect(left * scale, top * scale, side * scale, side * scale)
    context.fill('evenodd')
    context.strokeStyle = '#ffffff'
    context.lineWidth = 3
    context.strokeRect(left * scale, top * scale, side * scale, side * scale)
  }

  const show = (result) => {
    const heading = part('results-heading')
    const summary = part('summary')
    list.replaceChildren(
      ...result.candidates
        .map((item) => resultCard(document, item))
        .filter(Boolean),
    )
    list.hidden = result.candidates.length === 0
    if (result.kind === 'species') {
      heading.textContent = 'Closest matches'
      summary.textContent =
        'Compare the photos and read the species page before you trust a name.'
      say(`Finished. ${result.candidates[0].en} is the closest match.`)
    } else {
      heading.textContent = 'Not sure'
      summary.textContent =
        'The photo does not look much like any one of the mammals this page knows. It may show another animal, or the animal may be too small, too dark or hidden. Move or enlarge the square, or try another photo. These are the closest, for what they are worth:'
      say('Finished. Not sure.')
    }
    list.dispatchEvent(new CustomEvent('knp-cards', { bubbles: true }))
    results.hidden = false
  }

  let running = false
  let again = false
  const identify = async () => {
    if (!photo || !ready) return
    if (running) {
      again = true
      return
    }
    running = true
    try {
      const { left, top, side } = cropSquare(photo.width, photo.height, view)
      const square = document.createElement('canvas')
      square.width = SIZE
      square.height = SIZE
      const context = square.getContext('2d', { willReadFrequently: true })
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(photo, left, top, side, side, 0, 0, SIZE, SIZE)
      const pixels = toRgb(context.getImageData(0, 0, SIZE, SIZE).data)
      const { scores } = await ask({ type: 'classify', pixels, size: SIZE }, [
        pixels.buffer,
      ])
      show(rankResults(scores, species))
    } catch (error) {
      console.error(error)
      say('The photo could not be analysed. Reload the page and try again.')
    } finally {
      running = false
      if (again) {
        again = false
        identify()
      }
    }
  }

  const open = async (input) => {
    const chosen = input.files?.[0]
    input.value = ''
    if (!chosen) return
    say('Reading the photo.')
    try {
      photo?.close?.()
      photo = await createImageBitmap(chosen, {
        imageOrientation: 'from-image',
      })
    } catch (error) {
      console.error(error)
      say('That file could not be read as a photo. Try another.')
      return
    }
    view = { x: 0.5, y: 0.5, zoom: 1 }
    zoom.value = '1'
    preview.hidden = false
    draw()
    say('Looking at the photo on this device.')
    await identify()
  }

  camera.addEventListener('change', () => open(camera))
  file.addEventListener('change', () => open(file))
  // A tap on the photo moves the square there.
  canvas.addEventListener('click', (event) => {
    if (!photo) return
    const box = canvas.getBoundingClientRect()
    view = {
      ...view,
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    }
    const { left, top, side } = cropSquare(photo.width, photo.height, view)
    view.x = (left + side / 2) / photo.width
    view.y = (top + side / 2) / photo.height
    draw()
    identify()
  })
  zoom.addEventListener('input', () => {
    view = { ...view, zoom: Number(zoom.value) || 1 }
    draw()
    identify()
  })
  part('reset').addEventListener('click', () => {
    view = { x: 0.5, y: 0.5, zoom: 1 }
    zoom.value = '1'
    draw()
    identify()
  })
  part('download').addEventListener('click', load)

  if (await isSaved()) await load()
  else {
    consent.hidden = false
    say('')
  }
}

if (typeof document !== 'undefined') boot()
