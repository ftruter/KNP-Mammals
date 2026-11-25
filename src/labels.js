import { visibleText } from './visible.js'

/** Plain-text labels for stored values. A missing value gives ''. */

const number = new Intl.NumberFormat('en')

const isRange = (value) =>
  Number.isFinite(value?.min) && Number.isFinite(value?.max)

const span = (low, high) =>
  low === high
    ? number.format(low)
    : `${number.format(low)}–${number.format(high)}`

/** `{ low, high }` as "16,700–21,948". */
export const formatRange = (range) =>
  Number.isFinite(range?.low) && Number.isFinite(range?.high)
    ? span(range.low, range.high)
    : ''

/**
 * One measurement: `{ min, max }`, or `{ male, female }` holding one each.
 * "115–145 cm", or "males 165–290 kg, females 140–260 kg".
 */
export const measureLabel = (value, unit) => {
  if (isRange(value)) return `${span(value.min, value.max)} ${unit}`
  return [
    ['males', value?.male],
    ['females', value?.female],
  ]
    .filter(([, part]) => isRange(part))
    .map(([who, part]) => `${who} ${span(part.min, part.max)} ${unit}`)
    .join(', ')
}

const SIZE_FACTS = [
  ['Shoulder height', 'shoulderHeightCm', 'cm'],
  ['Head and body', 'headBodyLengthCm', 'cm'],
  ['Length', 'lengthCm', 'cm'],
  ['Tail', 'tailCm', 'cm'],
  ['Mass', 'massKg', 'kg'],
]

/** `[label, text]` for each measurement the species file records. */
export const sizeFacts = (size) =>
  SIZE_FACTS.map(([label, key, unit]) => [
    label,
    measureLabel(size?.[key], unit),
  ]).filter(([, text]) => text)

const sentenceCase = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : ''

/** "standing-side" becomes "Standing, side". */
export const viewLabel = (view) =>
  typeof view === 'string' ? sentenceCase(view.replaceAll('-', ', ')) : ''

const STATUS = { resident: 'Resident' }

export const statusLabel = (status) =>
  typeof status === 'string'
    ? STATUS[status] || sentenceCase(status.replaceAll('-', ' '))
    : ''

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Month numbers as names, or "All year" for all twelve. */
export const monthsLabel = (months) => {
  const list = (Array.isArray(months) ? months : []).filter(
    (month) => Number.isInteger(month) && month >= 1 && month <= 12,
  )
  if (list.length === 0) return ''
  if (new Set(list).size === 12) return 'All year'
  return list.map((month) => MONTHS[month - 1]).join(', ')
}

const CALL_TYPE = {
  call: 'Call',
  alarm: 'Alarm',
  contact: 'Contact',
  other: 'Other',
}

export const callTypeLabel = (type) => CALL_TYPE[type] || 'Call'

/**
 * Species whose recordings are shown without an observation or catalogue
 * number: black and white rhinoceros and Temminck's pangolin (the location
 * rule). Every other species keeps its xeno-canto catalogue number.
 */
export const NO_OBSERVATION_REFS = new Set([
  'ceratotherium-simum',
  'diceros-bicornis',
  'smutsia-temminckii',
])

/**
 * An iNaturalist or xeno-canto observation address: the observation page,
 * a photo file that points back at one, or a xeno-canto recording page.
 * Taxon pages, place pages and Wikimedia addresses are left alone.
 */
const OBSERVATION_REF =
  /inaturalist\.org\/(?:observations|photos)(?:\/|$)|inaturalist-open-data\.s3\.amazonaws\.com|(?:www\.)?static\.inaturalist\.org|xeno-canto\.org\/(?:XC)?\d+/i

const OBSERVATION_FIELDS = [
  'source',
  'sourceUrl',
  'fileUrl',
  'observation',
  'observation_id',
  'observationId',
]

export const isObservationRef = (value) =>
  typeof value === 'string' && OBSERVATION_REF.test(value)

/**
 * For the rhinos and the pangolin, drop observation addresses and ids from
 * a photograph or recording, and keep the author and the licence. Other
 * species are returned as they are. Wikimedia and licence URLs stay.
 */
export const withoutObservationRefs = (slug, item) => {
  if (!item || !NO_OBSERVATION_REFS.has(slug)) return item
  const out = { ...item }
  for (const field of OBSERVATION_FIELDS) {
    if (
      field in out &&
      (field.toLowerCase().startsWith('observation') ||
        isObservationRef(out[field]))
    )
      delete out[field]
  }
  if (
    typeof out.key === 'string' &&
    /^(?:xeno-canto|inaturalist)\//i.test(out.key) &&
    out.hosted !== true
  )
    delete out.key
  return out
}

/** Details as a visitor may see them: media for the three species is cleaned. */
export const publicDetails = (slug, details) => {
  if (!details || !NO_OBSERVATION_REFS.has(slug)) return details
  const images = Array.isArray(details.images)
    ? details.images.map((item) => withoutObservationRefs(slug, item))
    : details.images
  const calls = Array.isArray(details.calls)
    ? details.calls.map((call) =>
        Array.isArray(call?.recordings)
          ? {
              ...call,
              recordings: call.recordings.map((item) =>
                withoutObservationRefs(slug, item),
              ),
            }
          : call,
      )
    : details.calls
  return { ...details, images, calls }
}

/** `xeno-canto/XC1148048` gives `XC1148048`. Anything else gives ''. */
export const catalogueNumber = (key) => {
  const match = /^xeno-canto\/(XC\d+)$/.exec(typeof key === 'string' ? key : '')
  return match ? match[1] : ''
}

/**
 * Sentences in a call description that are about how the text or the
 * recording was put together, not about the voice: what the sources did not
 * say, which recording was attached, what the recordist did not label, a
 * grade, or a file name. They stay in the stored data and its gaps list.
 */
const CURATOR_SENTENCE = [
  /\bsources? (?:used|consulted)\b/i,
  /\bin this session\b|\bfor this file\b/i,
  /\b(?:recordings?|recordist|iNaturalist|xeno-canto)\b/i,
  /\bobservations? (?:does|do) not\b/i,
  /\bgrade [A-E]\b|\bfile ?names?\b|\bdate ?stamps?\b|\.(?:mp3|wav|m4a|ogg)\b/i,
]

/** A trailing clause that only says the sources gave nothing more. */
const CURATOR_CLAUSE =
  /,\s*(?:with)?out (?:a |any )?(?:further|more) description in the sources? (?:used|consulted)/i

/** Call text for a reader: the voice, without notes about the research. */
export const readerCallText = (value) => {
  const text = String(value ?? '')
    .replace(CURATOR_CLAUSE, '')
    .replaceAll(/\s+/g, ' ')
    .trim()
  if (!text) return ''
  return visibleText(
    text
      .split(/(?<=[.!?])\s+/)
      .filter(
        (sentence) => !CURATOR_SENTENCE.some((rule) => rule.test(sentence)),
      )
      .join(' '),
  )
}

/** "Least Concern (IUCN global, 2016)". */
export const conservationLabel = (status) => {
  if (typeof status?.status !== 'string' || !status.status) return ''
  const detail = [status.scope, status.asOf].filter(Boolean).join(', ')
  return detail ? `${status.status} (${detail})` : status.status
}

/** What the population aside prints, from the stored estimate. */
export const populationModel = (population) => {
  const range = formatRange(population?.estimate)
  const unit = typeof population?.unit === 'string' ? population.unit : ''
  return {
    range: range && unit ? `${range} ${unit}` : range,
    trend: typeof population?.trend === 'string' ? population.trend : 'unknown',
    confidence: population?.confidence || '',
    asOf: population?.asOf || '',
    notes: population?.notes || '',
    sources: Array.isArray(population?.sources) ? population.sources : [],
  }
}

/** A photograph may be shown from its source unless the licence forbids copies being changed. */
export const licenceForbidsDerivatives = (licence) =>
  typeof licence === 'string' && /\bND\b/i.test(licence)
