/**
 * Visitor-facing prose. Curator gap wording such as "not found in the
 * sources used here" is omitted at render time. Stored species files
 * and the "Not yet recorded" gap list are unchanged.
 */

const LATIN_ABBREV = /(?:\b(?:al|e\.g|i\.e|etc|vs|sp|spp|cf)\.)$/i
const INITIAL = /(?:^|[^\p{L}])[A-Z]\.$/u
const UNIT_END = /\d\s*(?:c?m|mm|km|ha|g|kg|mg)\.$/i

const isAbbrevEnd = (text) => {
  if (UNIT_END.test(text)) return false
  return LATIN_ABBREV.test(text) || INITIAL.test(text)
}

/** Split on sentence-ending punctuation, keeping abbreviations together. */
export const splitSentences = (text) => {
  const parts = String(text)
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
  const out = []
  let buf = ''
  for (const chunk of parts) {
    buf = buf ? `${buf} ${chunk}` : chunk
    if (/[.!?]$/.test(buf) && !isAbbrevEnd(buf)) {
      out.push(buf)
      buf = ''
    }
  }
  if (buf) out.push(buf)
  return out
}

const SOURCES =
  /\b(?:in the (?:text )?sources(?:\s+used(?:\s+here)?)?|in the sources consulted(?:\s+(?:for this file|in this session))?|on the pages used|from the sources(?:\s+consulted)?|among the (?:EWT )?sources(?:\s+used)?|in those sources|in the accounts used|in this session)\b/i

const CONJ = /^(.*?),\s+(but|although|though)\s+(.*)$/is

/**
 * A clause whose only information is that a fact was not sourced, or
 * that a field was left as a placeholder. Present-tense "is not found"
 * in a habitat (the animal does not occur there) is not a gap.
 */
export const isGapSentence = (text) => {
  const value = String(text ?? '').trim()
  if (!value) return false
  if (/\bplaceholders?\b/i.test(value)) return true
  if (/\b(?:was|were)\s+not\s+found\b/i.test(value)) return true
  if (/\bno\b[\s\S]{0,200}\b(?:was|were)\s+found\b/i.test(value)) return true
  if (/\bcould not be found\b/i.test(value)) return true
  if (/\b(?:was|were)\s+not\s+entered\b/i.test(value)) return true
  if (
    /\bno\b[\s\S]{0,200}\b(?:was|were)\s+entered\b/i.test(value) &&
    SOURCES.test(value)
  )
    return true
  if (
    /\bnot\s+(?:described|given|published|stated|listed|verified|entered)\b/i.test(
      value,
    ) &&
    SOURCES.test(value)
  )
    return true
  if (/\bwithout a further description in the sources\b/i.test(value))
    return true
  if (
    /\b(?:left null|is omitted|are omitted|are left empty|is an empty list)\b/i.test(
      value,
    ) &&
    /\b(?:sources|rather than inferred|so (?:those|that|the))\b/i.test(value)
  )
    return true
  if (
    /^(?:(?:and|so|and so)\s+)?(?:that|those|this|these|the)\b[\s\S]{0,80}\b(?:is|are)\s+not\s+entered\b/i.test(
      value,
    ) &&
    value.length < 180
  )
    return true
  return false
}

const splitClauses = (sentence) =>
  String(sentence)
    .split(/\s*;\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      const found = part.match(CONJ)
      if (found && (isGapSentence(found[1]) || isGapSentence(found[3]))) {
        return [found[1].trim(), found[3].trim()]
      }
      return [part]
    })

const sentenceCase = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text

/**
 * The same prose with curator-gap sentences (and gap clauses joined by
 * a semicolon, "but", "although" or "though") removed. Returns '' when
 * nothing visible remains.
 */
export const visibleText = (text) => {
  if (typeof text !== 'string') return ''
  const trimmed = text.trim()
  if (!trimmed) return ''
  const kept = []
  for (const sentence of splitSentences(trimmed)) {
    const clauses = splitClauses(sentence)
    const visible = []
    for (const clause of clauses) {
      if (isGapSentence(clause)) continue
      visible.push(
        !visible.length && clauses[0] !== clause
          ? sentenceCase(clause)
          : clause,
      )
    }
    if (visible.length) {
      const sentence = visible.join('; ')
      kept.push(/[.!?]$/.test(sentence) ? sentence : `${sentence}.`)
    }
  }
  return kept.join(' ').replace(/\s+/g, ' ').trim()
}

const listed = (value) => (Array.isArray(value) ? value : [])

const withVisibleNote = (item) => {
  if (!item || typeof item !== 'object') return item
  if (typeof item.note !== 'string') return item
  const note = visibleText(item.note)
  return note ? { ...item, note } : { ...item, note: '' }
}

const withVisibleCaption = (image) => {
  if (!image || typeof image !== 'object') return image
  if (typeof image.caption !== 'string') return image
  return { ...image, caption: visibleText(image.caption) }
}

export const visibleNotes = (notes) =>
  listed(notes)
    .map((note) => ({ ...note, note: visibleText(note?.note) }))
    .filter((note) => note.note)

export const visibleAnimals = (items) => listed(items).map(withVisibleNote)

/**
 * A copy of a species details object safe to render. Gap lists and
 * research notes stay as stored.
 */
export const visitorDetails = (details) => {
  if (!details || typeof details !== 'object') return details
  return {
    ...details,
    summary: visibleText(details.summary),
    description: visibleText(details.description),
    habits: visibleText(details.habits),
    habitat: visibleText(details.habitat),
    young: visibleText(details.young),
    diet: details.diet
      ? { ...details.diet, summary: visibleText(details.diet.summary) }
      : details.diet,
    population: details.population
      ? {
          ...details.population,
          notes: visibleText(details.population.notes),
        }
      : details.population,
    size: details.size
      ? { ...details.size, note: visibleText(details.size.note) }
      : details.size,
    conservationStatus: details.conservationStatus
      ? {
          ...details.conservationStatus,
          scope: visibleText(details.conservationStatus.scope),
        }
      : details.conservationStatus,
    viewNotes: visibleNotes(details.viewNotes),
    similar: visibleAnimals(details.similar),
    predators: visibleAnimals(details.predators),
    prey: visibleAnimals(details.prey),
    images: listed(details.images).map(withVisibleCaption),
  }
}
