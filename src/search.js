import { readDocument } from './store.js'

/** How many hits a search page shows. Callers can pass a smaller limit. */
export const SEARCH_LIMIT = 50

/**
 * Words that are not a name. `mammal` and `mammals` are included so a
 * question such as "mammal lion" still matches the lion. `golden` is not
 * here: it is part of real names ("golden mole", "Golden moles").
 */
const STOP = new Set([
  'a',
  'an',
  'the',
  'of',
  'in',
  'on',
  'and',
  'or',
  'not',
  'for',
  'to',
  'is',
  'are',
  'was',
  'were',
  'what',
  'which',
  'who',
  'how',
  'does',
  'do',
  'with',
  'from',
  'by',
  'at',
  'this',
  'that',
  'into',
  'about',
  'near',
  'bird',
  'birds',
  'mammal',
  'mammals',
  'kruger',
  'national',
  'park',
  'knp',
  'live',
  'lives',
  'living',
  'find',
  'search',
  'show',
  'list',
])

/** Lower case, with diacritics removed, for comparing names. */
export const fold = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

const textOrNull = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const wordsOf = (text) =>
  fold(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

const wordHit = (text, token) => {
  const folded = fold(text)
  if (!folded || !token) return false
  if (folded.includes(token)) return true
  return wordsOf(folded).some(
    (word) =>
      word.startsWith(token) || (token.startsWith(word) && word.length >= 4),
  )
}

const contentTokens = (query) => {
  const parts = fold(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3)
  const useful = parts.filter((token) => !STOP.has(token))
  return useful.length > 0 ? useful : parts
}

const rows = (doc, key) => (Array.isArray(doc?.[key]) ? doc[key] : [])

const recordFromRow = (kind, row) => {
  const slug = typeof row?.slug === 'string' ? row.slug : ''
  if (!slug) return null
  return {
    kind,
    slug,
    scientificName: textOrNull(row?.latin) ?? '',
    en: textOrNull(row?.en) ?? '',
    af: textOrNull(row?.af),
  }
}

/**
 * Species and family records from the two index documents. Only the stored
 * names are kept. Orders, notes, captions and account text are left out.
 */
export const recordsFromIndexes = (speciesIndex, familiesIndex) =>
  [
    ...rows(speciesIndex, 'species').map((row) =>
      recordFromRow('species', row),
    ),
    ...rows(familiesIndex, 'families').map((row) =>
      recordFromRow('family', row),
    ),
  ].filter(Boolean)

/** Reads `index/species` and `index/families`. Two KV reads, no further fan-out. */
export const loadSearchRecords = async (kv) => {
  if (!kv || typeof kv.get !== 'function') {
    const error = new Error('MAMMALS_KV binding is missing')
    error.code = 'NO_BINDING'
    throw error
  }
  const [speciesIndex, familiesIndex] = await Promise.all([
    readDocument(kv, 'index/species'),
    readDocument(kv, 'index/families'),
  ])
  return recordsFromIndexes(speciesIndex?.data, familiesIndex?.data)
}

const nameFields = (record) =>
  [record.scientificName, record.en, record.af].filter(Boolean)

/**
 * Exact folded name, then a name that starts with the query, then a name
 * that contains it, then a word hit. Names only: habitat and account text
 * are not on the record, so they cannot add to the score.
 */
const scoreRecord = (record, query, tokens) => {
  const names = nameFields(record).map(fold)
  let phrase = 0
  for (const name of names) {
    if (name === query) phrase = Math.max(phrase, 400)
    else if (query.length >= 3 && name.startsWith(query))
      phrase = Math.max(phrase, 300)
    else if (query.length >= 3 && name.includes(query))
      phrase = Math.max(phrase, 200)
  }
  let nameTokens = 0
  for (const token of tokens) {
    if (nameFields(record).some((name) => wordHit(name, token))) nameTokens += 1
  }
  const score = phrase + nameTokens * 40
  return score > 0 ? score : 0
}

const pagesFor = (origin, record) => {
  const path =
    record.kind === 'family'
      ? `/family/${record.slug}`
      : `/species/${record.slug}`
  return {
    html: `${origin}${path}`,
    markdown: `${origin}${path}.md`,
    json: `${origin}${path}.json`,
  }
}

/**
 * Ranks `records` for `rawQuery` and returns at most `limit` hits.
 * `origin` is the site origin used in each hit's page URLs.
 * Ties break by scientific name.
 */
export const searchRecords = (records, rawQuery, limit, origin) => {
  const query = fold(rawQuery).replace(/\s+/g, ' ').trim()
  const tokens = contentTokens(query)
  const ranked = []
  for (const record of records) {
    const score = scoreRecord(record, query, tokens)
    if (score > 0) ranked.push({ record, score })
  }
  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      a.record.scientificName.localeCompare(b.record.scientificName, 'en', {
        sensitivity: 'base',
      }),
  )
  const results = ranked.slice(0, limit).map(({ record }) => ({
    kind: record.kind,
    scientificName: record.scientificName,
    englishName: record.en,
    afrikaansName: record.af,
    pages: pagesFor(origin, record),
  }))
  return { total: ranked.length, results }
}

/** Plain text for a caller that wants the same hits without a page. */
export const searchText = (query, found) => {
  if (found.total === 0)
    return `No published Kruger mammal record matched "${String(query ?? '').trim()}".`
  const lines = found.results.map((result) => {
    const names = [
      result.scientificName,
      result.englishName,
      result.afrikaansName,
    ]
      .filter(Boolean)
      .join(' — ')
    return [names, result.pages.html, result.pages.markdown, result.pages.json]
      .filter(Boolean)
      .join(' ')
  })
  const text = `${found.results.length} of ${found.total} matches.\n${lines.join('\n')}`
  return text.length <= 12000 ? text : `${text.slice(0, 11999)}…`
}
