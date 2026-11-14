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
