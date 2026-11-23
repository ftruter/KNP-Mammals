/**
 * The /facts table. One row per listed species, from the measurements and
 * statuses already stored. A missing fact is null. It is not zero.
 * Read by scripts/seed.mjs, which builds index/facts, and by the page.
 */
import { escapeHtml } from './escape.js'
import { formatRange, measureLabel, statusLabel } from './labels.js'

export const FACTS_NOTE =
  'One row per species. null means this guide does not record the fact.'

export const FACTS_INTRO =
  'One row for each listed species. An em dash means this guide does not record the fact. It does not mean zero.'

const textOf = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const isRange = (value) =>
  Number.isFinite(value?.min) && Number.isFinite(value?.max)

const copyRange = (value) => ({ min: value.min, max: value.max })

/**
 * A stored range, or a male/female pair of ranges. Both bounds are required.
 * `{ min: null, max: null }`, and a max with no min, are unrecorded.
 */
const measurement = (value) => {
  if (isRange(value)) return copyRange(value)
  const male = isRange(value?.male) ? copyRange(value.male) : null
  const female = isRange(value?.female) ? copyRange(value.female) : null
  if (!male && !female) return null
  return {
    ...(male ? { male } : {}),
    ...(female ? { female } : {}),
  }
}

const boundsOf = (value) => {
  if (isRange(value)) return [value.min, value.max]
  return [value?.male, value?.female]
    .filter(isRange)
    .flatMap((part) => [part.min, part.max])
}

/** The middle of every recorded bound. Not stored on the row. */
const measurementMidpoint = (value) => {
  const bounds = boundsOf(value)
  if (!bounds.length) return null
  return bounds.reduce((sum, bound) => sum + bound, 0) / bounds.length
}

/** The same text as measureLabel, without the unit the column heading names. */
const measureCell = (value, unit) => {
  const labelled = measureLabel(value, unit)
  return labelled ? labelled.replaceAll(` ${unit}`, '') : ''
}

const conservation = (value) => {
  const status = textOf(value?.status)
  if (!status) return null
  return {
    status,
    scope: textOf(value.scope),
    asOf:
      typeof value.asOf === 'number' && Number.isFinite(value.asOf)
        ? value.asOf
        : null,
  }
}

const factsRow = (row, detail) => {
  const size = detail?.size
  return {
    slug: row.slug,
    scientificName: textOf(detail?.scientificName) ?? row.latin,
    en: textOf(detail?.commonNames?.en) ?? textOf(row.en) ?? row.latin,
    af: textOf(detail?.commonNames?.af),
    familySlug: row.familySlug,
    familyEn: row.familyEn,
    status: textOf(detail?.status),
    shoulderHeightCm: measurement(size?.shoulderHeightCm),
    headBodyLengthCm: measurement(size?.headBodyLengthCm),
    tailCm: measurement(size?.tailCm),
    lengthCm: measurement(size?.lengthCm),
    massKg: measurement(size?.massKg),
    conservationStatus: conservation(detail?.conservationStatus),
    population: row.population
      ? { low: row.population.low, high: row.population.high }
      : null,
  }
}

const byName = (a, b) =>
  a.en.localeCompare(b.en, 'en', { sensitivity: 'base' }) ||
  a.scientificName.localeCompare(b.scientificName, 'en', {
    sensitivity: 'base',
  })

/** index/facts. `rows` are the species index rows; `details` is keyed by slug. */
export const buildFacts = (rows, details) => ({
  kind: 'facts',
  note: FACTS_NOTE,
  species: rows.map((row) => factsRow(row, details.get(row.slug))).sort(byName),
})

const blank = '—'

const measureColumn = (id, label, key, unit) => ({
  id,
  label,
  numeric: true,
  value: (row) => measurementMidpoint(row[key]),
  html: (row) => escapeHtml(measureCell(row[key], unit) || blank),
  md: (row) => measureCell(row[key], unit) || blank,
})

const populationMidpoint = (range) =>
  Number.isFinite(range?.low) && Number.isFinite(range?.high)
    ? (range.low + range.high) / 2
    : null

/** Rows the sortable table can order. Latin is the scientific name. */
export const factsTableRows = (doc) =>
  (Array.isArray(doc?.species) ? doc.species : []).map((row) => ({
    ...row,
    latin: row.scientificName,
  }))

export const FACTS_COLUMNS = [
  {
    id: 'en',
    label: 'English',
    value: (row) => textOf(row.en),
    html: (row) =>
      `<a href="/species/${escapeHtml(row.slug)}">${escapeHtml(row.en)}</a>`,
    md: (row) => `[${row.en}](/species/${row.slug}.md)`,
    rowHeader: true,
  },
  {
    id: 'af',
    label: 'Afrikaans',
    value: (row) => textOf(row.af),
    html: (row) => escapeHtml(row.af || blank),
    md: (row) => row.af || blank,
  },
  {
    id: 'family',
    label: 'Family',
    value: (row) => textOf(row.familyEn),
    html: (row) =>
      `<a href="/family/${escapeHtml(row.familySlug)}">${escapeHtml(row.familyEn || blank)}</a>`,
    md: (row) => `[${row.familyEn}](/family/${row.familySlug}.md)`,
  },
  {
    id: 'status',
    label: 'Kruger status',
    value: (row) => textOf(statusLabel(row.status)),
    html: (row) => escapeHtml(statusLabel(row.status) || blank),
    md: (row) => statusLabel(row.status) || blank,
  },
  measureColumn('shoulder', 'Shoulder height (cm)', 'shoulderHeightCm', 'cm'),
  measureColumn('head-body', 'Head and body (cm)', 'headBodyLengthCm', 'cm'),
  measureColumn('tail', 'Tail (cm)', 'tailCm', 'cm'),
  measureColumn('length', 'Length (cm)', 'lengthCm', 'cm'),
  measureColumn('mass', 'Mass (kg)', 'massKg', 'kg'),
  {
    id: 'conservation',
    label: 'Conservation',
    value: (row) => textOf(row.conservationStatus?.status),
    html: (row) => escapeHtml(textOf(row.conservationStatus?.status) || blank),
    md: (row) => textOf(row.conservationStatus?.status) || blank,
  },
  {
    id: 'population',
    label: 'Kruger population',
    numeric: true,
    value: (row) => populationMidpoint(row.population),
    html: (row) => escapeHtml(formatRange(row.population) || blank),
    md: (row) => formatRange(row.population) || blank,
  },
]

const SIZE_KEYS = [
  'shoulderHeightCm',
  'headBodyLengthCm',
  'tailCm',
  'lengthCm',
  'massKg',
]

/** How many rows record each fact. */
export const factsCoverage = (doc) => {
  const rows = Array.isArray(doc?.species) ? doc.species : []
  const count = (key) => rows.filter((row) => row[key] != null).length
  const sized = rows.filter((row) =>
    SIZE_KEYS.some((key) => row[key] != null),
  ).length
  return {
    species: rows.length,
    status: count('status'),
    shoulder: count('shoulderHeightCm'),
    headBody: count('headBodyLengthCm'),
    tail: count('tailCm'),
    length: count('lengthCm'),
    mass: count('massKg'),
    conservation: count('conservationStatus'),
    population: count('population'),
    sized,
    unsized: rows.length - sized,
  }
}

export const coverageSentence = (doc) => {
  const c = factsCoverage(doc)
  return `Of ${c.species} species, ${c.status} have a Kruger status, ${c.shoulder} a shoulder height, ${c.headBody} a head-and-body length, ${c.tail} a tail length, ${c.length} a length, ${c.mass} a mass, ${c.conservation} a conservation status and ${c.population} a Kruger population. ${c.sized} have at least one size; ${c.unsized} have none.`
}
