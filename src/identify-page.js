import { identifySrc } from './client.js'
import { creditHtml } from './credit.js'
import { escapeHtml, inlineText } from './escape.js'
import {
  HOME_IDENTIFY,
  SHORT_NAME,
  crumbs,
  layout,
  playLabel,
  playerHtml,
} from './html.js'
import {
  IDENTIFY_PATH,
  IDENTIFY_PHOTO_PATH,
  IDENTIFY_SOUND_PATH,
  LIKELY,
  SOUND_LIKELY,
  SOUND_POSSIBLE,
  PHOTO_CACHE,
  PHOTO_MODEL,
  POSSIBLE,
  PRIVACY_NOTE,
  RUNTIME_CACHE,
  SOUND_CACHE,
  SOUND_MODEL,
  cardSample,
  downloadBytes,
  mebibytes,
  modelChecks,
  photoBase,
  runtimeBase,
  soundBase,
} from './identify.js'

const list = (value) => (Array.isArray(value) ? value : [])
const percent = (value) =>
  typeof value === 'number' ? `${Math.round(value * 100)}%` : null
const count = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-GB') : null

const DOWNLOAD_LEAD =
  'The recogniser runs on this device, so it is downloaded once and then kept here. After that it needs no signal. In the installed app you can also save it for offline use with the other downloads on the home page.'
const NO_JS = 'This page needs JavaScript and WebAssembly to recognise animals.'

// ---- What the pages say about accuracy, from the stored test results ----

/** The photo recogniser's test, in plain words. Gaps are left out. */
export const photoAccuracy = (test) => {
  const lines = []
  if (test?.photos && test.top1 != null)
    lines.push(
      `On ${count(test.photos)} photos held back from training, the first answer was right for ${percent(test.top1)}${test.top3 != null ? ` and the right species was in the first three for ${percent(test.top3)}` : ''}.`,
    )
  if (test?.dayTop1 != null && test?.nightTop1 != null)
    lines.push(
      `Daylight photos: ${percent(test.dayTop1)} right (${count(test.dayPhotos)} photos). Night photos: ${percent(test.nightTop1)} right (${count(test.nightPhotos)} photos).`,
    )
  const high = test?.byScore?.['atLeast0.5']
  const mid = test?.byScore?.['from0.25to0.5']
  const low = test?.byScore?.['below0.25']
  if (high?.photos && mid?.photos && low?.photos && test.photos)
    lines.push(
      `When the first answer was marked likely (${percent(LIKELY)} or more), it was right ${percent(high.right / high.photos)} of the time; possible (${percent(POSSIBLE)} to ${percent(LIKELY)}), ${percent(mid.right / mid.photos)}; not sure (below ${percent(POSSIBLE)}), ${percent(low.right / low.photos)}.`,
    )
  if (test?.note) lines.push(test.note)
  return lines
}

const range = (values) => {
  const shown = values.filter((value) => typeof value === 'number')
  if (!shown.length) return null
  const low = Math.min(...shown)
  const high = Math.max(...shown)
  return low === high ? percent(low) : `${percent(low)} to ${percent(high)}`
}

/** The sound recogniser's test, in plain words. Gaps are left out. */
export const soundAccuracy = (test) => {
  const conditions = test?.conditions ?? {}
  const pick = (prefix) =>
    Object.entries(conditions)
      .filter(([name]) => name.startsWith(prefix))
      .map(([, value]) => value?.top1)
  const lines = []
  if (test?.clips && conditions.clean?.top1 != null)
    lines.push(
      `On ${count(test.clips)} recordings held back from training, the first answer was right for ${percent(conditions.clean.top1)} of clean clips${conditions.clean.top3 != null ? `, and the right species was in the first three for ${percent(conditions.clean.top3)}` : ''}.`,
    )
  const wind = range(pick('wind '))
  const talk = range(pick('chatter '))
  if (wind || talk)
    lines.push(
      `With wind mixed in, the first answer was right for ${wind ?? 'an unmeasured share'}; with people talking nearby, ${talk ?? 'an unmeasured share'}. The louder the noise, the worse it does.`,
    )
  const noise = test?.noiseOnly
  if (noise?.segments && noise.falseAlarmPossible != null)
    lines.push(
      `On ${count(noise.segments)} stretches of noise with no mammal in them, it wrongly named a species as possible or likely ${percent(noise.falseAlarmPossible)} of the time, and as likely ${percent(noise.falseAlarmLikely)}.`,
    )
  if (test?.note) lines.push(test.note)
  return lines
}

// ---- Result cards, one template per species ----

const cardHtml = (item, { call }) => {
  const sample = cardSample(item.sample, item)
  const name = item.en || item.latin
  const image = sample.image
    ? `<figure class="identify-plate">
<img src="${escapeHtml(sample.image.src)}" alt="${escapeHtml(sample.image.alt)}" loading="lazy" decoding="async" width="160" height="120">
<figcaption>${sample.image.ai ? '<span class="ai-label">AI-generated image</span> ' : ''}${creditHtml(sample.image.credit, sample.image.src)}</figcaption>
</figure>`
    : '<p class="identify-plate identify-noplate">No photo yet.</p>'
  const sound =
    call && sample.call
      ? `<div class="identify-call">${playerHtml(sample.call.src, playLabel(sample.call.type), name)}${sample.call.ai ? '<span class="ai-label">AI-generated recording</span> ' : ''}${creditHtml(sample.call.credit, sample.call.src)}</div>`
      : ''
  const af = item.af
    ? ` · <span class="afrikaans">${escapeHtml(item.af)}</span>`
    : ''
  return `<template id="identify-card-${escapeHtml(item.slug)}"><li class="identify-result">
${image}
<div class="identify-body">
<h3><a href="/species/${escapeHtml(item.slug)}">${escapeHtml(name)}</a></h3>
<p><span class="latin">${escapeHtml(item.latin)}</span>${af}</p>
<p class="identify-verdict"></p>
${sound}
</div>
</li></template>`
}

const speciesList = (summary, items) =>
  items.length === 0
    ? ''
    : `<details class="identify-coverage">
<summary>${escapeHtml(summary)}</summary>
<ul>
${items.map((item) => `<li><a href="/species/${escapeHtml(item.slug)}">${escapeHtml(item.en || item.latin)}</a> <span class="latin">${escapeHtml(item.latin)}</span></li>`).join('\n')}
</ul>
</details>`

const bullets = (lines) =>
  lines.length
    ? `<ul>\n${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('\n')}\n</ul>`
    : ''

const rootData = ({ model, base, cache, species, capture = false }) => {
  const data = {
    worker: identifySrc('/identify-worker.js'),
    ...(capture ? { capture: identifySrc('/identify-capture.js') } : {}),
    runtime: runtimeBase,
    model: base + model.file,
    'model-bytes': model.bytes,
    'download-bytes': downloadBytes(model),
    cache,
    'runtime-cache': RUNTIME_CACHE,
    checks: JSON.stringify(modelChecks(model)),
    species: JSON.stringify(species.map(({ slug, en }) => ({ slug, en }))),
  }
  return Object.entries(data)
    .map(([key, value]) => ` data-${key}="${escapeHtml(String(value))}"`)
    .join('')
}

const consentHtml = (model) => `<div id="identify-consent" hidden>
<h2>Download the recogniser</h2>
<p>${escapeHtml(DOWNLOAD_LEAD)}</p>
<button type="button" id="identify-download" class="identify-button">Download the recogniser (about ${mebibytes(downloadBytes(model))} MiB)</button>
</div>
<progress id="identify-progress" class="identify-progress" max="1" value="0" aria-label="Progress" hidden></progress>`

const resultsHtml = `<section id="identify-results" aria-labelledby="identify-results-heading" hidden>
<h2 id="identify-results-heading" tabindex="-1">Closest matches</h2>
<p id="identify-summary"></p>
<ol id="identify-list" class="identify-list"></ol>
</section>`

const noJsHtml = `<p id="identify-nojs" class="identify-note"><span id="identify-nojs-reason">${escapeHtml(NO_JS)}</span> You can still <a href="/search">search by name</a> or browse the <a href="/species">species list</a>.</p>`

const creditsNote = (doc) => {
  const photos = doc?.credits?.photos
  const sounds = doc?.credits?.sounds
  const parts = []
  if (photos?.count && photos?.photographers)
    parts.push(
      `${count(photos.count)} iNaturalist photos by ${count(photos.photographers)} photographers`,
    )
  if (sounds?.count && sounds?.recordists)
    parts.push(
      `${count(sounds.count)} recordings by ${count(sounds.recordists)} recordists on iNaturalist and xeno-canto`,
    )
  return parts.length
    ? `<p>The recognisers were trained on ${escapeHtml(parts.join(' and '))}. Thank you to all of them. Every photo and recording, the noise collections used in training, and the models' licence are on the <a href="/credits#recognisers">credits page</a>.</p>`
    : '<p>See the <a href="/credits#recognisers">credits page</a> for the training data and the models’ licence.</p>'
}

// ---- /identify/photo ----

const PHOTO_TITLE = 'Identify a mammal by photo'
const PHOTO_INTRO =
  'Take a photo of a mammal, or open one you took earlier, and this page shows the three Kruger species it looks most like. Each result links to the species page, so you can compare.'
const PHOTO_TIPS =
  'Fill as much of the frame with the animal as you can. Side views work best. Very dark, blurred or distant animals are hard.'
export const PHOTO_READING = [
  'Each match is marked likely, possible or not sure, with a score out of 100%. None is certain: compare the photos and read the species page before you trust a name.',
  'When even the closest match is below 25%, the page says “Not sure”. The photo may show an animal this page does not know, or too little of the animal to tell.',
  'The recogniser looks only inside the square on your photo. Tap the photo to move the square onto the animal, and zoom in when it is small.',
]

export const renderIdentifyPhotoHtml = (doc, { origin }) => {
  const photo = doc?.photo ?? {}
  const species = list(photo.species)
  const main = `
<h1>${PHOTO_TITLE}</h1>
<p>${escapeHtml(PHOTO_INTRO)}</p>
<p class="identify-privacy">${escapeHtml(PRIVACY_NOTE)}</p>
${noJsHtml}
<section id="identify" class="identify" hidden${rootData({ model: PHOTO_MODEL, base: photoBase, cache: PHOTO_CACHE, species })}>
<p id="identify-status" class="identify-status" role="status" aria-live="polite"></p>
${consentHtml(PHOTO_MODEL)}
<div id="identify-capture" hidden>
<h2>Take or open a photo</h2>
<div class="identify-actions">
<label class="identify-button identify-big identify-pick">Take a photo<input type="file" id="identify-camera" class="visually-hidden" accept="image/*" capture="environment"></label>
<label class="identify-button identify-quiet identify-pick">Open a photo<input type="file" id="identify-file" class="visually-hidden" accept="image/*"></label>
</div>
<p>${escapeHtml(PHOTO_TIPS)}</p>
<figure id="identify-preview" class="identify-preview" hidden>
<canvas id="identify-canvas" class="identify-canvas" aria-label="Your photo, with the square the recogniser looks at"></canvas>
<figcaption>Tap the photo to move the square onto the animal.</figcaption>
<p class="identify-zoom"><label for="identify-zoom">Zoom in</label> <input type="range" id="identify-zoom" min="1" max="3" step="0.1" value="1"> <button type="button" id="identify-reset" class="identify-button identify-quiet">Reset</button></p>
</figure>
</div>
${resultsHtml}
</section>
<h2 id="reading">How to read the results</h2>
${bullets(PHOTO_READING)}
<details class="more identify-more"><summary>How well it works</summary>
${bullets(photoAccuracy(photo.test))}
</details>
<h2 id="coverage">What it can recognise</h2>
<p>${escapeHtml(`It knows ${species.length} of the mammals in this guide. Others may be shown as the closest match, so always check.`)}</p>
${speciesList(`The ${species.length} species it knows`, species)}
<p>${escapeHtml(doc?.bats ?? '')}</p>
<h2 id="credits">Credits</h2>
${creditsNote(doc)}
${species.map((item) => cardHtml(item, { call: false })).join('\n')}`
  return layout({
    title: `Identify by photo · ${SHORT_NAME}`,
    description:
      'Take or open a photo of a mammal and see the three closest Kruger National Park species. Recognition runs on your device.',
    origin,
    path: IDENTIFY_PHOTO_PATH,
    nav: 'identify-photo',
    crumbs: crumbs([
      { href: IDENTIFY_PATH, label: 'Identify' },
      { href: IDENTIFY_PHOTO_PATH, label: 'By photo', current: true },
    ]),
    main,
    scripts: [identifySrc('/identify-photo.js')],
  })
}

// ---- /identify/sound ----

const SOUND_TITLE = 'Identify a mammal by sound'
const SOUND_INTRO =
  'Record a mammal calling, or open a recording you made earlier, and this page shows which Kruger species it sounds most like. Each result links to the species page and has a reference call, so you can compare by ear.'
const SOUND_TIPS =
  'Point the phone at the animal and keep still. Wind, engines and talking make recognition worse. Recording stops by itself after 10 seconds.'
export const SOUND_READING = [
  'Up to three matches are shown, each marked likely or possible, with a score out of 100%. None is certain: play the reference call before you trust a name.',
  `When no species reaches ${percent(SOUND_POSSIBLE)}, the page says “Not sure”: the recording probably holds only background sound, or an animal this page does not know. ${percent(SOUND_LIKELY)} or more is marked likely.`,
  'The loudest 3-second stretches of the recording are scored, up to six of them. Faint calls are made louder first, so a distant call can still be heard.',
]

export const renderIdentifySoundHtml = (doc, { origin }) => {
  const sound = doc?.sound ?? {}
  const species = list(sound.species)
  const main = `
<h1>${SOUND_TITLE}</h1>
<p>${escapeHtml(SOUND_INTRO)}</p>
<p class="identify-privacy">${escapeHtml(PRIVACY_NOTE)}</p>
${noJsHtml}
<section id="identify" class="identify" hidden${rootData({ model: SOUND_MODEL, base: soundBase, cache: SOUND_CACHE, species, capture: true })}>
<p id="identify-status" class="identify-status" role="status" aria-live="polite"></p>
${consentHtml(SOUND_MODEL)}
<div id="identify-capture" hidden>
<h2>Record or open a recording</h2>
<div class="identify-actions">
<button type="button" id="identify-record" class="identify-button identify-big" aria-pressed="false">Record</button>
<label class="identify-button identify-quiet identify-pick">Open a recording<input type="file" id="identify-file" class="visually-hidden" accept="audio/*"></label>
</div>
<p id="identify-countdown" class="identify-countdown" hidden></p>
<p id="identify-meter" hidden><label for="identify-level">Sound level</label> <meter id="identify-level" min="0" max="1" value="0"></meter></p>
<p>${escapeHtml(SOUND_TIPS)}</p>
</div>
${resultsHtml}
</section>
<h2 id="reading">How to read the results</h2>
${bullets(SOUND_READING)}
<details class="more identify-more"><summary>How well it works</summary>
${bullets(soundAccuracy(sound.test))}
</details>
<h2 id="coverage">What it can recognise</h2>
<p>${escapeHtml(`It knows the calls of ${species.length} mammals so far. Any other call may be shown as the closest match or as not sure.`)}</p>
${speciesList(`The ${species.length} species it knows`, species)}
<p>${escapeHtml(doc?.bats ?? '')}</p>
<h2 id="credits">Credits</h2>
${creditsNote(doc)}
${species.map((item) => cardHtml(item, { call: true })).join('\n')}`
  return layout({
    title: `Identify by sound · ${SHORT_NAME}`,
    description:
      'Record a mammal call, or open a recording, and see the closest Kruger National Park species. Recognition runs on your device.',
    origin,
    path: IDENTIFY_SOUND_PATH,
    nav: 'identify-sound',
    crumbs: crumbs([
      { href: IDENTIFY_PATH, label: 'Identify' },
      { href: IDENTIFY_SOUND_PATH, label: 'By sound', current: true },
    ]),
    main,
    scripts: [identifySrc('/identify-sound.js')],
  })
}

// ---- /identify ----

const INDEX_TITLE = 'Identify a mammal'
const INDEX_INTRO =
  'Two recognisers that run on your phone or computer: one for photos and one for calls. Both work without a signal once they are downloaded.'

export const renderIdentifyHtml = (doc, { origin }) => {
  const main = `
<h1>${INDEX_TITLE}</h1>
<p>${escapeHtml(INDEX_INTRO)}</p>
<ul class="home-actions">
${HOME_IDENTIFY.map((action) => `<li><a class="home-action" href="${action.href}">${action.icon}<span class="home-action-copy"><span class="home-action-title">${escapeHtml(action.name)}</span><span class="home-action-text">${escapeHtml(action.description)}</span></span></a></li>`).join('\n')}
</ul>
<p class="identify-privacy">${escapeHtml(PRIVACY_NOTE)}</p>
<h2>What they know</h2>
<p>${escapeHtml(`The photo recogniser knows ${list(doc?.photo?.species).length} species and the sound recogniser ${list(doc?.sound?.species).length}.`)}</p>
<p>${escapeHtml(doc?.bats ?? '')}</p>
<h2>Credits</h2>
${creditsNote(doc)}`
  return layout({
    title: `Identify · ${SHORT_NAME}`,
    description:
      'Identify a Kruger National Park mammal from a photo or a recording. Recognition runs on your device.',
    origin,
    path: IDENTIFY_PATH,
    nav: '',
    crumbs: crumbs([{ href: IDENTIFY_PATH, label: 'Identify', current: true }]),
    main,
  })
}

// ---- Markdown and JSON ----

const mdSpecies = (item) =>
  `- [${inlineText(item.en || item.latin)}](/species/${item.slug}.md) (*${inlineText(item.latin)}*)`

const AGENT_NOTE =
  'This is an interactive page for people. It needs a browser with JavaScript and WebAssembly. An agent cannot run it from this document. What follows describes it.'

const mdPage = ({
  title,
  intro,
  reading,
  accuracy,
  species,
  doc,
  tips,
  base,
  model,
}) => `# ${title}

${intro}

${AGENT_NOTE}

## How it works

- ${PRIVACY_NOTE}
- ${DOWNLOAD_LEAD} The download is about ${mebibytes(downloadBytes(model))} MiB.
- ${tips}
- The model and the LiteRT.js runtime are served from this site under \`${base}\` and \`${runtimeBase}\`. The model's licence is CC BY-NC-SA 4.0: [${base}LICENSE.md](${base}LICENSE.md).

## How to read the results

${reading.map((line) => `- ${line}`).join('\n')}

## How well it works

${accuracy.map((line) => `- ${line}`).join('\n') || 'Not measured.'}

## What it can recognise (${species.length})

${species.map(mdSpecies).join('\n') || 'None.'}

${doc?.bats ?? ''}

Credits for the training data are on [the credits page](/credits.md).
`

export const identifyPhotoMarkdown = (doc) =>
  mdPage({
    title: PHOTO_TITLE,
    intro: PHOTO_INTRO,
    reading: PHOTO_READING,
    accuracy: photoAccuracy(doc?.photo?.test),
    species: list(doc?.photo?.species),
    doc,
    tips: `The photo is cropped to a square (the centre 88% of its shorter side, unless the visitor moves or zooms it), scaled to ${PHOTO_MODEL.inputSize} by ${PHOTO_MODEL.inputSize} pixels and scored once.`,
    base: photoBase,
    model: PHOTO_MODEL,
  })

export const identifySoundMarkdown = (doc) =>
  mdPage({
    title: SOUND_TITLE,
    intro: SOUND_INTRO,
    reading: SOUND_READING,
    accuracy: soundAccuracy(doc?.sound?.test),
    species: list(doc?.sound?.species),
    doc,
    tips: `The recording is resampled to 48 kHz mono. Up to six of its loudest 3-second windows that do not overlap are scored. ${doc?.sound?.preprocessing ?? ''} A species scores its best window.`,
    base: soundBase,
    model: SOUND_MODEL,
  })

export const identifyMarkdown = (doc) => `# ${INDEX_TITLE}

${INDEX_INTRO}

- [Identify by photo](${IDENTIFY_PHOTO_PATH}.md): ${list(doc?.photo?.species).length} species.
- [Identify by sound](${IDENTIFY_SOUND_PATH}.md): ${list(doc?.sound?.species).length} species.

${PRIVACY_NOTE}

${doc?.bats ?? ''}
`

const plainSpecies = (items) =>
  list(items).map(({ slug, en, af, latin }) => ({ slug, en, af, latin }))

const assets = (model, base) => ({
  model: base + model.file,
  bytes: model.bytes,
  sha256: model.sha256,
  description: `${base}${model === PHOTO_MODEL ? 'photo' : 'sound'}-model.json`,
  licence: `${base}LICENSE.md`,
  runtime: runtimeBase,
  downloadBytes: downloadBytes(model),
})

export const identifyPhotoJson = (doc) => {
  const { species, ...photo } = doc?.photo ?? {}
  return {
    kind: 'identify-photo',
    title: PHOTO_TITLE,
    summary: PHOTO_INTRO,
    privacy: PRIVACY_NOTE,
    reading: PHOTO_READING,
    thresholds: { likely: LIKELY, possible: POSSIBLE },
    model: photo,
    assets: assets(PHOTO_MODEL, photoBase),
    species: plainSpecies(species),
    bats: doc?.bats ?? null,
    credits: doc?.credits ?? null,
  }
}

export const identifySoundJson = (doc) => {
  const { species, ...sound } = doc?.sound ?? {}
  return {
    kind: 'identify-sound',
    title: SOUND_TITLE,
    summary: SOUND_INTRO,
    privacy: PRIVACY_NOTE,
    reading: SOUND_READING,
    thresholds: { likely: SOUND_LIKELY, possible: SOUND_POSSIBLE },
    model: sound,
    assets: assets(SOUND_MODEL, soundBase),
    species: plainSpecies(species),
    bats: doc?.bats ?? null,
    credits: doc?.credits ?? null,
  }
}

export const identifyJson = (doc) => ({
  kind: 'identify',
  title: INDEX_TITLE,
  summary: INDEX_INTRO,
  pages: { photo: IDENTIFY_PHOTO_PATH, sound: IDENTIFY_SOUND_PATH },
  photoSpecies: plainSpecies(doc?.photo?.species),
  soundSpecies: plainSpecies(doc?.sound?.species),
  bats: doc?.bats ?? null,
  credits: doc?.credits ?? null,
})
