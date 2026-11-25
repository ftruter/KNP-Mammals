// /identify/sound: record a clip or open a recording, and see which Kruger
// mammals the recogniser hears. Adapted from KNP-birds src/client/identify.js.
// Recognition runs in identify-worker.js. Nothing leaves the device.

export const SAMPLE_RATE = 48000
export const WINDOW = SAMPLE_RATE * 3
export const HOP = WINDOW / 2
export const RECORD_SECONDS = 10
export const MAX_SECONDS = 60
/** At most this many 3-second windows are scored, the loudest that do not overlap. */
export const MAX_WINDOWS = 6
/**
 * The model gives raw scores (logits); these are the sigmoid of the raw
 * cut-offs 0.5 and 0.25 used in testing, about 62% and 56%.
 */
export const sigmoid = (value) => 1 / (1 + Math.exp(-value))
export const LIKELY = sigmoid(0.5)
export const POSSIBLE = sigmoid(0.25)
export const SHOWN = 3

const rms = (samples, start, length) => {
  let sum = 0
  for (let i = start; i < start + length; i += 1) sum += samples[i] * samples[i]
  return Math.sqrt(sum / length + 1e-12)
}

/**
 * The windows the recogniser scores, as in training and testing: up to six
 * 3-second windows that do not overlap, the loudest on a 1.5-second grid.
 * A clip shorter than 3 seconds is padded with silence on both sides.
 * Returns one Float32Array of `count` windows end to end.
 */
export const chooseWindows = (samples, max = MAX_WINDOWS) => {
  if (samples.length <= WINDOW) {
    const out = new Float32Array(WINDOW)
    out.set(samples, Math.floor((WINDOW - samples.length) / 2))
    return { samples: out, count: 1, starts: [0] }
  }
  const starts = []
  for (let start = 0; start + WINDOW <= samples.length; start += HOP)
    starts.push(start)
  if (starts[starts.length - 1] !== samples.length - WINDOW)
    starts.push(samples.length - WINDOW)
  let sum = 0
  for (const value of samples) sum += value
  const mean = sum / samples.length
  const centred = Float32Array.from(samples, (value) => value - mean)
  const loudness = starts.map((start) => rms(centred, start, WINDOW))
  const chosen = []
  for (const index of starts
    .map((_, i) => i)
    .sort((a, b) => loudness[b] - loudness[a] || a - b)) {
    if (
      chosen.every((other) => Math.abs(starts[index] - starts[other]) >= WINDOW)
    )
      chosen.push(index)
    if (chosen.length === max) break
  }
  chosen.sort((a, b) => a - b)
  const out = new Float32Array(chosen.length * WINDOW)
  chosen.forEach((index, at) =>
    out.set(
      samples.subarray(starts[index], starts[index] + WINDOW),
      at * WINDOW,
    ),
  )
  return {
    samples: out,
    count: chosen.length,
    starts: chosen.map((i) => starts[i]),
  }
}

/**
 * Faint-call normalisation, as in training: the window's mean is removed and
 * it is scaled so that its loudest sample is 0.9, with at most +40 dB of gain.
 * Changes `frame` in place and returns it.
 */
export const normalise = (frame, peak = 0.9, maxGainDb = 40) => {
  let sum = 0
  for (const value of frame) sum += value
  const mean = frame.length ? sum / frame.length : 0
  let loudest = 0
  for (let i = 0; i < frame.length; i += 1) {
    frame[i] -= mean
    loudest = Math.max(loudest, Math.abs(frame[i]))
  }
  const gain = Math.min(peak / (loudest + 1e-9), 10 ** (maxGainDb / 20))
  for (let i = 0; i < frame.length; i += 1) frame[i] *= gain
  return frame
}

/** Normalises every window of a packed set. */
export const normaliseWindows = (samples, count) => {
  for (let index = 0; index < count; index += 1)
    normalise(samples.subarray(index * WINDOW, (index + 1) * WINDOW))
  return samples
}

/**
 * One score per species from 0 to 1: the sigmoid of its best raw score over
 * the windows, as in testing.
 */
export const speciesScores = (scores, count, labels) => {
  const best = new Array(labels).fill(-Infinity)
  for (let index = 0; index < count; index += 1)
    for (let label = 0; label < labels; label += 1)
      best[label] = Math.max(best[label], scores[index * labels + label])
  return best.map((value) => (count ? sigmoid(value) : 0))
}

export const confidence = (score) =>
  score >= LIKELY ? 'likely' : score >= POSSIBLE ? 'possible' : 'unsure'

/**
 * What the page shows. `species` are the model's species in label order.
 *   species  up to three species scored "possible" or better, best first
 *   none     nothing reached "possible": background, or a sound it does not know
 */
export const rankResults = (scores, species) => {
  const ranked = species
    .map((item, index) => ({
      slug: item.slug,
      en: item.en,
      score: scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.en.localeCompare(b.en))
    .map((item) => ({ ...item, confidence: confidence(item.score) }))
  const candidates = ranked
    .filter((item) => item.score >= POSSIBLE)
    .slice(0, SHOWN)
  return candidates.length
    ? { kind: 'species', candidates }
    : { kind: 'none', candidates: [], closest: ranked[0] ?? null }
}

export const mixToMono = (channels) => {
  if (channels.length === 1) return channels[0]
  const mono = new Float32Array(channels[0].length)
  for (const channel of channels)
    for (let i = 0; i < mono.length; i += 1) mono[i] += channel[i]
  for (let i = 0; i < mono.length; i += 1) mono[i] /= channels.length
  return mono
}

export const joinChunks = (chunks) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const joined = new Float32Array(total)
  let offset = 0
  for (const chunk of chunks) {
    joined.set(chunk, offset)
    offset += chunk.length
  }
  return joined
}

export const mebibytes = (bytes) => (bytes / 1048576).toFixed(1)

export const WORD = {
  likely: 'Likely',
  possible: 'Possible',
  unsure: 'Not sure',
}

/** "Likely · 82%": the word and the score as a percentage. */
export const verdictText = (item) =>
  `${WORD[item.confidence]} · ${Math.round(item.score * 100)}%`

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
  const OfflineContext =
    window.OfflineAudioContext || window.webkitOfflineAudioContext
  const LiveContext = window.AudioContext || window.webkitAudioContext
  if (
    typeof WebAssembly !== 'object' ||
    typeof Worker !== 'function' ||
    !OfflineContext
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
  const record = part('record')
  const file = part('file')
  const countdown = part('countdown')
  const meter = part('meter')
  const level = part('level')
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
  const busy = (on) => {
    record.disabled = on
    file.disabled = on
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
    showProgress(null)
    capture.hidden = false
    say('Ready. Tap Record, or open a recording.')
  }

  const resample = async (samples, rate) => {
    if (rate === SAMPLE_RATE) return samples
    const frames = Math.ceil((samples.length * SAMPLE_RATE) / rate)
    const offline = new OfflineContext(1, frames, SAMPLE_RATE)
    const buffer = offline.createBuffer(1, samples.length, rate)
    buffer.getChannelData(0).set(samples)
    const source = offline.createBufferSource()
    source.buffer = buffer
    source.connect(offline.destination)
    source.start()
    return (await offline.startRendering()).getChannelData(0)
  }

  const decode = async (bytes) => {
    const offline = new OfflineContext(1, SAMPLE_RATE, SAMPLE_RATE)
    const audio = await new Promise((resolve, reject) => {
      const done = offline.decodeAudioData(bytes, resolve, reject)
      if (done && typeof done.catch === 'function') done.catch(reject)
    })
    const channels = []
    for (let i = 0; i < audio.numberOfChannels; i += 1)
      channels.push(audio.getChannelData(i))
    return resample(mixToMono(channels), audio.sampleRate)
  }

  const show = (result) => {
    const heading = part('results-heading')
    const summary = part('summary')
    if (result.kind === 'species') {
      list.replaceChildren(
        ...result.candidates
          .map((item) => resultCard(document, item))
          .filter(Boolean),
      )
      list.hidden = false
      heading.textContent = 'Closest matches'
      summary.textContent =
        'Compare the photo and play the reference call before you trust a name.'
      say(
        `Finished. ${result.candidates.length} ${result.candidates.length === 1 ? 'match' : 'matches'} listed below.`,
      )
    } else {
      list.replaceChildren()
      list.hidden = true
      heading.textContent = 'Not sure'
      summary.textContent =
        'No mammal call stood out. The recording may hold only background sound, or an animal this page does not know. Try again closer, out of the wind, with nobody talking.'
      say('Finished. Not sure.')
    }
    list.dispatchEvent(new CustomEvent('knp-cards', { bubbles: true }))
    results.hidden = false
    heading.focus()
  }

  const analyse = async (samples) => {
    const clip =
      samples.length > MAX_SECONDS * SAMPLE_RATE
        ? samples.slice(0, MAX_SECONDS * SAMPLE_RATE)
        : samples
    if (clip.length < SAMPLE_RATE) {
      say('That recording is shorter than one second. Record for longer.')
      return
    }
    const picked = chooseWindows(clip)
    normaliseWindows(picked.samples, picked.count)
    busy(true)
    results.hidden = true
    say('Listening to the recording on this device.')
    showProgress(0)
    try {
      const { scores, count } = await ask(
        { type: 'analyse', samples: picked.samples, count: picked.count },
        [picked.samples.buffer],
        ({ received, total }) => showProgress(received / total),
      )
      show(rankResults(speciesScores(scores, count, species.length), species))
    } catch (error) {
      console.error(error)
      say('The recording could not be analysed. Reload the page and try again.')
    } finally {
      showProgress(null)
      busy(false)
    }
  }

  const CANNOT_RECORD =
    'This browser cannot record here. Open a recording made with another app instead.'

  /** The microphone, with the browser's own processing off. */
  const openMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !LiveContext) {
      say(CANNOT_RECORD)
      return null
    }
    // Created inside the tap, before any await, so iOS lets it run.
    const context = new LiveContext()
    context.resume().catch(() => {})
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch {
      await context.close().catch(() => {})
      say(
        'The microphone is not available. Allow this site to use it, or open a recording instead.',
      )
      return null
    }
    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 2048
    source.connect(analyser)
    const close = async () => {
      for (const track of stream.getTracks()) track.stop()
      await context.close().catch(() => {})
    }
    return { context, stream, source, analyser, close }
  }

  /** Hands the microphone's samples to `onChunk` at the device's own rate. */
  const tapSamples = async ({ context, source }, onChunk) => {
    await context.audioWorklet.addModule(root.dataset.capture)
    const tap = new AudioWorkletNode(context, 'identify-capture', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 1,
      channelCountMode: 'explicit',
    })
    tap.port.onmessage = ({ data }) => onChunk(data)
    const silent = context.createGain()
    silent.gain.value = 0
    source.connect(tap)
    tap.connect(silent)
    silent.connect(context.destination)
  }

  const showLevel = (analyser, owner) => {
    const wave = new Float32Array(analyser.fftSize)
    const draw = () => {
      if (owner.closed) return
      analyser.getFloatTimeDomainData(wave)
      let sum = 0
      for (const value of wave) sum += value * value
      level.value = Math.min(1, Math.sqrt(sum / wave.length) * 6)
      owner.frame = requestAnimationFrame(draw)
    }
    draw()
  }

  let session = null
  const RECORD_LABEL = record.textContent

  const recording = (on) => {
    record.textContent = on ? 'Stop and identify' : RECORD_LABEL
    record.setAttribute('aria-pressed', on ? 'true' : 'false')
    record.classList.toggle('is-recording', on)
    countdown.hidden = !on
    meter.hidden = !on
    file.disabled = on
  }

  const finish = async () => {
    if (!session) return
    const { mic, chunks, recorder, timer, frame } = session
    session.closed = true
    session = null
    clearInterval(timer)
    cancelAnimationFrame(frame)
    recording(false)
    say('Recording stopped.')
    try {
      let samples
      if (recorder) {
        const blob = await new Promise((resolve) => {
          const parts = []
          recorder.addEventListener('dataavailable', (event) =>
            parts.push(event.data),
          )
          recorder.addEventListener('stop', () => resolve(new Blob(parts)))
          recorder.stop()
        })
        samples = await decode(await blob.arrayBuffer())
      } else {
        samples = await resample(joinChunks(chunks), mic.context.sampleRate)
      }
      await mic.close()
      await analyse(samples)
    } catch (error) {
      console.error(error)
      await mic.close()
      say('The recording could not be read. Try again.')
    } finally {
      busy(false)
    }
  }

  const start = async () => {
    busy(true)
    const mic = await openMicrophone()
    if (!mic) {
      busy(false)
      return
    }
    const chunks = []
    let recorder = null
    try {
      await tapSamples(mic, (chunk) => chunks.push(chunk))
    } catch {
      if (typeof MediaRecorder !== 'function') {
        await mic.close()
        busy(false)
        say(CANNOT_RECORD)
        return
      }
      recorder = new MediaRecorder(mic.stream)
      recorder.start()
    }
    const began = performance.now()
    const tick = () => {
      const left = RECORD_SECONDS - (performance.now() - began) / 1000
      countdown.textContent = `Recording. ${Math.max(0, Math.ceil(left))} seconds left.`
      if (left <= 0) finish()
    }
    session = { mic, chunks, recorder, timer: 0, frame: 0, closed: false }
    session.timer = setInterval(tick, 200)
    record.disabled = false
    recording(true)
    results.hidden = true
    tick()
    showLevel(mic.analyser, session)
    say(`Recording for up to ${RECORD_SECONDS} seconds.`)
  }

  record.addEventListener('click', () => (session ? finish() : start()))
  part('download').addEventListener('click', load)
  file.addEventListener('change', async () => {
    const chosen = file.files?.[0]
    file.value = ''
    if (!chosen) return
    busy(true)
    say('Reading the recording.')
    try {
      await analyse(await decode(await chosen.arrayBuffer()))
    } catch (error) {
      console.error(error)
      say('That file could not be read as sound. Try another recording.')
    } finally {
      busy(false)
    }
  })
  // Stop recording when the visitor leaves the page.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && session) finish()
  })

  if (await isSaved()) await load()
  else {
    consent.hidden = false
    say('')
  }
}

if (typeof document !== 'undefined') boot()
