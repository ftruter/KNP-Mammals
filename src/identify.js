import { creditModel } from './credit.js'
import { NO_OBSERVATION_REFS, viewLabel } from './labels.js'
import { mediaSrc } from './media.js'
import { sampleFor } from './search-samples.js'

// The two recognisers: /identify/photo and /identify/sound. Both run in the
// visitor's browser with LiteRT.js. scripts/seed.mjs imports this module to
// build `index/identify`, so it must not import the browser scripts.

export const IDENTIFY_PATH = '/identify'
export const IDENTIFY_PHOTO_PATH = '/identify/photo'
export const IDENTIFY_SOUND_PATH = '/identify/sound'
export const IDENTIFY_KEY = 'index/identify'

/**
 * The files live in R2 under `models/<version>/` and are served from
 * `/models/<version>/<file>` with an immutable cache, so a new model or
 * runtime is a new version, never an overwrite. scripts/publish-models.mjs
 * checks every size and SHA-256 below before it uploads anything.
 *
 * LiteRT.js picks one wasm build per browser: `internal` where relaxed SIMD
 * is available, `compat` elsewhere. A visitor downloads one of them. The
 * runtime is the one KNP Birds uses, byte for byte.
 */
export const MODEL_PREFIX = 'models'

export const RUNTIME = {
  version: 'litert-2.6.0',
  files: [
    {
      file: 'litert.mjs',
      bytes: 100876,
      sha256:
        '7739dfa2e93aa74f82c3939a7eab1ff2b1fe20425578b6941ab327df733da4f4',
    },
    { file: 'litert_wasm_internal.js', bytes: 278825 },
    {
      file: 'litert_wasm_internal.wasm',
      bytes: 11131135,
      sha256:
        '13db768de5c7a087517e46a0172c81102a7983bd159e6e47b0a0b933bae60014',
    },
    { file: 'litert_wasm_compat_internal.js', bytes: 279036 },
    {
      file: 'litert_wasm_compat_internal.wasm',
      bytes: 10948854,
      sha256:
        '4190033238e53ec86b832bad4649851ad111025c226c1688cfae20e1f8fe8926',
    },
  ],
}

export const PHOTO_MODEL = {
  version: 'knp-mammals-photo-1',
  file: 'knp-mammals-photo-int8.tflite',
  bytes: 9270256,
  sha256: 'f58f53fdb08b09cb654ba767d0d6eee5f605fb6c367dd37dde434cc519b6b707',
  inputSize: 288,
}

export const SOUND_MODEL = {
  version: 'knp-mammals-sound-1',
  file: 'knp-mammals-sound-norm-fp16.tflite',
  bytes: 13693856,
  sha256: '7c738e4f72b50e13cc3de8e9944cfeb5a29d8d49c247149a5bf518a58a8f1fdc',
}

/** Files published beside each model: its description and its licence. */
export const MODEL_EXTRAS = {
  [PHOTO_MODEL.version]: ['photo-model.json', 'LICENSE.md'],
  [SOUND_MODEL.version]: ['sound-model.json', 'LICENSE.md'],
}

const base = (version) => `/${MODEL_PREFIX}/${version}/`
export const runtimeBase = base(RUNTIME.version)
export const photoBase = base(PHOTO_MODEL.version)
export const soundBase = base(SOUND_MODEL.version)

/** Cache Storage names. The runtime is kept once and both pages use it. */
export const RUNTIME_CACHE = `identify-runtime-${RUNTIME.version}`
export const PHOTO_CACHE = `identify-photo-${PHOTO_MODEL.version}`
export const SOUND_CACHE = `identify-sound-${SOUND_MODEL.version}`

/** Scores at or above these are "likely" and "possible". Below is "not sure". */
export const LIKELY = 0.5
export const POSSIBLE = 0.25
export const SHOWN = 3

/**
 * The sound model gives raw scores (logits). The page turns them into scores
 * from 0 to 1 with a sigmoid. Testing used raw cut-offs of 0.5 and 0.25,
 * which are these scores.
 */
export const sigmoid = (value) => 1 / (1 + Math.exp(-value))
export const SOUND_LIKELY = sigmoid(0.5)
export const SOUND_POSSIBLE = sigmoid(0.25)

export const BATS_NOTE =
  'Bats are omitted from photo recognition because of a lack of quality training data, and from sound recognition because consumer phones cannot record ultrasonic sound.'

export const PRIVACY_NOTE =
  'Recognition runs on this device. Nothing you photograph or record is uploaded or kept: it is gone when you leave or reload the page.'

export const LICENCE = {
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}

export const RUNTIME_CREDIT = {
  name: 'LiteRT.js',
  version: '2.6.0',
  licence: 'Apache-2.0',
  url: 'https://www.npmjs.com/package/@litertjs/core',
}

/** Bytes as mebibytes (1 MiB = 1,048,576 bytes) to one decimal place. */
export const mebibytes = (bytes) => (bytes / 1048576).toFixed(1)

const largestWasm = RUNTIME.files
  .filter((item) => item.file.endsWith('.wasm'))
  .reduce((largest, item) => (item.bytes > largest.bytes ? item : largest))

/**
 * The runtime one visitor downloads: the module, one wasm build and its
 * loader. The larger build is counted, so the figure is never too low.
 */
export const runtimeBytes =
  RUNTIME.files[0].bytes +
  largestWasm.bytes +
  RUNTIME.files.find(
    (item) => item.file === largestWasm.file.replace(/\.wasm$/, '.js'),
  ).bytes

export const downloadBytes = (model) => model.bytes + runtimeBytes

/** The SHA-256 a page expects of its model and of each wasm build, by address. */
export const modelChecks = (model) => ({
  [base(model.version) + model.file]: model.sha256,
  ...Object.fromEntries(
    RUNTIME.files
      .filter((item) => item.sha256)
      .map((item) => [runtimeBase + item.file, item.sha256]),
  ),
})

/** Every file that may be served under /models/, by R2 key. */
export const MODEL_KEYS = new Set([
  ...RUNTIME.files.map(
    (item) => `${MODEL_PREFIX}/${RUNTIME.version}/${item.file}`,
  ),
  ...[PHOTO_MODEL, SOUND_MODEL].flatMap((model) => [
    `${MODEL_PREFIX}/${model.version}/${model.file}`,
    ...MODEL_EXTRAS[model.version].map(
      (file) => `${MODEL_PREFIX}/${model.version}/${file}`,
    ),
  ]),
])

const text = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

/** The photograph and call a result card shows, ready to draw. */
export const cardSample = (stored, row) => {
  const image = stored?.image ? mediaSrc(stored.image, 'images') : null
  const call = stored?.call ? mediaSrc(stored.call, 'audio') : null
  return {
    image: image
      ? {
          src: image.src,
          alt:
            text(stored.image.alt) ||
            `${row.en || row.latin}: ${viewLabel(stored.image.view)}`,
          ai: stored.image.aiGenerated === true,
          credit: creditModel(stored.image, 'image', image),
        }
      : null,
    call: call
      ? {
          src: call.src,
          type: text(stored.call.type),
          ai: stored.call.aiGenerated === true,
          credit: creditModel(stored.call, 'recording', call, {
            catalogue: !NO_OBSERVATION_REFS.has(row.slug),
          }),
        }
      : null,
  }
}

/**
 * For the rhinos and the pangolin a card names the photographer or recordist
 * and the licence, but links to no observation, so it gives away no place.
 * A file that is not copied to this site is left out for them, because its
 * address points back at the observation.
 */
export const withoutPlace = (slug, sample) => {
  if (!sample || !NO_OBSERVATION_REFS.has(slug)) return sample
  const strip = (item) =>
    item && item.hosted
      ? Object.fromEntries(
          Object.entries(item).filter(
            ([field]) => field !== 'source' && field !== 'fileUrl',
          ),
        )
      : null
  const image = strip(sample.image)
  const call = strip(sample.call)
  if (!image && !call) return null
  return { ...(image ? { image } : {}), ...(call ? { call } : {}) }
}

const share = (value) =>
  typeof value === 'number' ? Math.round(value * 1000) / 1000 : null

/**
 * `index/identify`: what both pages need, from data/identify/ and the
 * species list. Every class of both models must be a listed species; a bat
 * in either stops the run, because bats are left out on purpose.
 */
export const deriveIdentify = ({
  photoModel,
  soundModel,
  credits,
  speciesBySlug,
  familyBySlug = new Map(),
  details = new Map(),
}) => {
  const species = (slug, model) => {
    const row = speciesBySlug.get(slug)
    if (!row)
      throw new Error(
        `data/identify/${model}-model.json names ${slug}, which is not in species-list.json`,
      )
    const family = familyBySlug.get(row.familySlug)
    if (family?.order === 'Chiroptera')
      throw new Error(`${slug} is a bat: bats are left out of ${model}`)
    const sample = withoutPlace(slug, sampleFor(details.get(slug)) ?? null)
    return {
      slug,
      en: row.en,
      af: row.af ?? null,
      latin: row.latin,
      ...(sample ? { sample } : {}),
    }
  }
  const check = (model, expected, name) => {
    if (model?.file !== expected.file || model?.sha256 !== expected.sha256)
      throw new Error(
        `data/identify/${name}-model.json does not match the ${name} model in src/identify.js`,
      )
  }
  check(photoModel, PHOTO_MODEL, 'photo')
  check(soundModel, SOUND_MODEL, 'sound')
  const test = photoModel.test
  return {
    kind: 'identify',
    photo: {
      version: photoModel.version,
      inputSize: photoModel.inputSize,
      base: photoModel.base,
      training: photoModel.training,
      licence: LICENCE,
      test: {
        photos: test.photos,
        top1: share(test.top1),
        top3: share(test.top3),
        top1MeanOverSpecies: share(test.top1MeanOverSpecies),
        dayPhotos: test.dayPhotos,
        dayTop1: share(test.dayTop1),
        nightPhotos: test.nightPhotos,
        nightTop1: share(test.nightTop1),
        byScore: test.byScore,
        note: test.note,
      },
      species: photoModel.classes.map((slug) => species(slug, 'photo')),
    },
    sound: {
      version: soundModel.version,
      sampleRate: soundModel.sampleRate,
      window: soundModel.window,
      preprocessing: soundModel.preprocessing,
      base: soundModel.base,
      training: soundModel.training,
      licence: LICENCE,
      test: soundModel.test,
      species: soundModel.labels.map((slug) => species(slug, 'sound')),
    },
    credits,
    bats: BATS_NOTE,
    runtime: RUNTIME_CREDIT,
  }
}

const REPOSITORY = 'https://github.com/ftruter/KNP-Mammals/blob/main/'

/**
 * The recognisers' part of the credits page: who made the training data,
 * the noise collections, the base models and the licence. The photo and
 * recording lists are in the repository, one row each.
 */
export const recognisersCredit = (identify) => {
  const credits = identify?.credits ?? {}
  const listUrl = (file) => (file ? REPOSITORY + file : null)
  return {
    licence: LICENCE,
    models: [
      {
        page: IDENTIFY_PHOTO_PATH,
        name: 'Photo recogniser',
        base: identify?.photo?.base ?? null,
        licenceFile: `${photoBase}LICENSE.md`,
      },
      {
        page: IDENTIFY_SOUND_PATH,
        name: 'Sound recogniser',
        base: identify?.sound?.base ?? null,
        licenceFile: `${soundBase}LICENSE.md`,
      },
    ],
    photos: credits.photos
      ? { ...credits.photos, list: listUrl(credits.photos.list) }
      : null,
    sounds: credits.sounds
      ? { ...credits.sounds, list: listUrl(credits.sounds.list) }
      : null,
    noise: Array.isArray(credits.noise) ? credits.noise : [],
    runtime: RUNTIME_CREDIT,
    note: credits.note ?? null,
    bats: BATS_NOTE,
  }
}
