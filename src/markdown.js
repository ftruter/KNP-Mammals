import { inlineText, safeHttpUrl } from './escape.js'
import { mediaSrc } from './media.js'
import {
  ABOUT,
  APPROXIMATE_LABEL,
  SITE_NAME,
  UNPUBLISHED_SPECIES,
  progressSentence,
} from './html.js'
import {
  callTypeLabel,
  conservationLabel,
  monthsLabel,
  populationModel,
  sizeFacts,
  statusLabel,
  viewLabel,
} from './labels.js'
import {
  FAMILY_COLUMNS,
  FAMILY_SPECIES_COLUMNS,
  ORDER_COLUMNS,
  ORDER_FAMILY_COLUMNS,
  ORDER_SPECIES_COLUMNS,
  SORT_NOTE,
  SPECIES_COLUMNS,
  tableMarkdown,
} from './lists.js'

const listed = (value) => (Array.isArray(value) ? value : [])

const one = (value) => inlineText(value)

const bullets = (items) => items.map((item) => `- ${item}`).join('\n')

const section = (heading, body) => (body ? `## ${heading}\n\n${body}\n` : '')

export const homeMarkdown = (doc) => `# ${SITE_NAME}

An open field guide to the mammals of Kruger National Park. ${progressSentence(doc.counts)}

${ABOUT}

- [Orders](/orders.md): ${doc.counts.orders}
- [Families](/families.md): ${doc.counts.families}
- [Species](/species.md): ${doc.counts.species}
- [Search](/search.md): add \`?q=\` and a name, for example [/search.md?q=lion](/search.md?q=lion)

Every page has a \`.md\` and a \`.json\` view at the same address.
`

const orderLink = (doc) =>
  doc.orderSlug
    ? `[${one(doc.order)}](/order/${doc.orderSlug}.md)`
    : one(doc.order)

export const ordersMarkdown = (doc) => `# Orders

An order is the group above the family.

${tableMarkdown({ columns: ORDER_COLUMNS, rows: doc.orders, empty: 'No orders are listed.' })}
`

export const orderMarkdown = (doc) => `# ${one(doc.latin)}

An order with ${doc.families.length} ${doc.families.length === 1 ? 'family' : 'families'} and ${doc.species.length} species in Kruger. All orders: [/orders.md](/orders.md).

## Families

${tableMarkdown({ columns: ORDER_FAMILY_COLUMNS, rows: listed(doc.families), empty: 'No families are listed for this order.' })}

## Species

${tableMarkdown({ columns: ORDER_SPECIES_COLUMNS, rows: listed(doc.species), empty: 'No species are listed for this order.' })}
`

export const familiesMarkdown = (doc) => `# Families

${tableMarkdown({ columns: FAMILY_COLUMNS, rows: doc.families, empty: 'No families are listed.' })}

${SORT_NOTE}
`

export const speciesListMarkdown = (doc) => `# Species

${tableMarkdown({ columns: SPECIES_COLUMNS, rows: doc.species, empty: 'No species are listed.' })}

The population is the approximate number in Kruger, where an estimate is recorded. ${SORT_NOTE}
`

export const familyMarkdown = (doc) => {
  const sources = listed(doc.sources).map(safeHttpUrl).filter(Boolean)
  return `# ${one(doc.en)}

- Latin: *${one(doc.latin)}*
- Afrikaans: ${doc.af ? one(doc.af) : '—'}
- Order: ${orderLink(doc)}

## Species in Kruger

${tableMarkdown({ columns: FAMILY_SPECIES_COLUMNS, rows: listed(doc.species), empty: 'No species are listed for this family.' })}

${section('Sources', bullets(sources.map((href) => `<${href}>`)))}`
}

const sourceLine = (source) => {
  const url = safeHttpUrl(source?.url)
  const title = one(source?.title || 'Untitled source')
  return [
    url ? `[${title}](${url})` : title,
    source?.publisher ? one(source.publisher) : '',
    source?.year ? String(source.year) : '',
  ]
    .filter(Boolean)
    .join('. ')
}

const animal = (item) => {
  const label = one(item?.en || item?.latin || item?.slug || 'Unnamed')
  const link =
    item?.listed && item.slug ? `[${label}](/species/${item.slug}.md)` : label
  return item?.note ? `${link}. ${one(item.note)}` : link
}

const filePhrase = (shown) => {
  if (!shown) return ''
  const where = shown.onSite
    ? 'Saved on this site: yes.'
    : `Saved on this site: no. It loads from ${new URL(shown.src).hostname}.`
  return `[File](${shown.src}). ${where}`
}

const creditBits = (item, shown) => {
  const credit = [
    item?.author ? one(item.author) : 'author not recorded',
    item?.license ? one(item.license) : 'licence not recorded',
  ].join(', ')
  const source = safeHttpUrl(item?.source)
  return [
    `Credit: ${credit}`,
    source ? `[Source](${source})` : '',
    filePhrase(shown),
  ]
    .filter(Boolean)
    .join('. ')
}

const imageLine = (image) => {
  const what = [viewLabel(image?.view), image?.caption]
    .filter(Boolean)
    .map(one)
    .join('. ')
  const credit = creditBits(image, mediaSrc(image, 'images'))
  return [what, credit].filter(Boolean).join('. ')
}

const callLine = (call) => {
  const files = listed(call?.recordings).map((recording) =>
    creditBits(recording, mediaSrc(recording, 'audio')),
  )
  return `**${callTypeLabel(call?.type)}.** ${one(call?.description || '')}${files.length ? ` ${files.join(' ')}` : ''}`
}

const publishedSpecies = (doc, details) => {
  const population = populationModel(details.population)
  const facts = [
    ['Status', statusLabel(details.status)],
    ['Months in Kruger', monthsLabel(details.monthsPresent)],
    ['Conservation status', conservationLabel(details.conservationStatus)],
    ...sizeFacts(details.size),
    ['Habitat', details.habitat ? one(details.habitat) : ''],
  ].filter(([, value]) => value)
  const predators = listed(details.predators).map(animal)
  const prey = listed(details.prey).map(animal)
  return [
    `${one(details.summary || '')}\n`,
    `${bullets(facts.map(([label, value]) => `${label}: ${value}`))}\n`,
    section(
      'Population',
      [
        `${APPROXIMATE_LABEL}: ${population.range || 'no numeric estimate yet'}. Trend: ${population.trend}.`,
        population.notes ? one(population.notes) : '',
        population.asOf ? `As of ${population.asOf}.` : '',
        bullets(population.sources.map(sourceLine)),
      ]
        .filter(Boolean)
        .join('\n\n'),
    ),
    section('Description', one(details.description || '')),
    section(
      'What to look for',
      bullets(
        listed(details.viewNotes).map(
          (note) => `**${viewLabel(note?.view)}.** ${one(note?.note || '')}`,
        ),
      ),
    ),
    section('Habits', one(details.habits || '')),
    section('Diet', one(details.diet?.summary || '')),
    section('Young', one(details.young || '')),
    section('Predators', bullets(predators)),
    section('Prey', bullets(prey)),
    section('Calls', bullets(listed(details.calls).map(callLine))),
    section('Similar species', bullets(listed(details.similar).map(animal))),
    section('Photographs', bullets(listed(details.images).map(imageLine))),
    section('Not yet recorded', bullets(listed(details.gaps).map(one))),
    section('Sources', bullets(listed(details.sources).map(sourceLine))),
  ]
    .filter(Boolean)
    .join('\n')
}

const unpublishedSpecies = (doc) => {
  const evidence = doc.inclusionEvidence || {}
  const facts = [
    evidence.sanparks2011 === true ? 'SANParks 2011 checklist: listed' : '',
    evidence.sanparks2011 === false
      ? 'SANParks 2011 checklist: not listed'
      : '',
    Number.isInteger(evidence.inatResearchGrade)
      ? `iNaturalist research-grade records in the park: ${evidence.inatResearchGrade}`
      : '',
  ].filter(Boolean)
  return [
    `${UNPUBLISHED_SPECIES}\n`,
    facts.length ? `${bullets(facts)}\n` : '',
    section('Research notes', bullets(listed(doc.notes).map(one))),
  ]
    .filter(Boolean)
    .join('\n')
}

export const speciesMarkdown = (doc) => `# ${one(doc.en)}

- Latin: *${one(doc.latin)}*
- Afrikaans: ${doc.af ? one(doc.af) : '—'}
- Family: [${one(doc.familyEn || doc.family)}](/family/${doc.familySlug}.md)
- Order: ${orderLink(doc)}

${doc.details ? publishedSpecies(doc, doc.details) : unpublishedSpecies(doc)}`

const mdQuery = (query) => inlineText(query).replace(/[\\`*_[\]<>#|]/g, '\\$&')

const searchHit = (result) => {
  const path = new URL(result.pages.html).pathname
  const title = one(result.englishName || result.scientificName)
  const names = [
    result.scientificName ? `*${one(result.scientificName)}*` : '',
    result.afrikaansName ? one(result.afrikaansName) : '',
  ]
    .filter(Boolean)
    .join(' · ')
  const kind = result.kind === 'family' ? 'Family' : 'Species'
  return `- ${kind}: [${title}](${path}.md)${names ? ` — ${names}` : ''}`
}

export const searchMarkdown = ({ query, found }) => {
  const shown = mdQuery(query)
  let body
  if (!query) {
    body =
      'Add `?q=` to search by an English, Afrikaans or Latin name, or a family, for example [/search.md?q=lion](/search.md?q=lion).'
  } else if (!found || found.total === 0) {
    body = `## 0 results for “${shown}”\n\nNo mammal matched “${shown}”. Browse the [species](/species.md) and [families](/families.md).`
  } else {
    const more =
      found.total > found.results.length
        ? `\n\nShowing the first ${found.results.length}.`
        : ''
    const count = `${found.total} ${found.total === 1 ? 'result' : 'results'}`
    body = `## ${count} for “${shown}”${more}\n\n${found.results.map(searchHit).join('\n')}`
  }
  return `# Search\n\n${body}\n`
}

export const notFoundMarkdown = () => `# Not found

No page is published at this address.

- [Home](/.md)
- [Orders](/orders.md)
- [Families](/families.md)
- [Species](/species.md)
`
