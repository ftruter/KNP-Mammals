import { inlineText, safeHttpUrl } from './escape.js'
import { visitorDetails } from './visible.js'
import { siteOrigin } from './head.js'
import { mediaSrc } from './media.js'
import {
  ABOUT,
  APPROXIMATE_LABEL,
  SITE_NAME,
  UNPUBLISHED_SPECIES,
  progressSentence,
} from './html.js'
import { SITEMAP_INTRO } from './sitemap.js'
import {
  NO_OBSERVATION_REFS,
  isObservationRef,
  callTypeLabel,
  catalogueNumber,
  conservationLabel,
  monthsLabel,
  populationModel,
  readerCallText,
  sizeFacts,
  statusLabel,
  viewLabel,
} from './labels.js'
import {
  ASK_AI_EXAMPLES,
  ASK_AI_EXPECT,
  ASK_AI_INTRO,
  ASK_AI_TITLE,
  answeringMarkdown,
  aiPrompt,
} from './prompt.js'
import {
  FACTS_COLUMNS,
  FACTS_INTRO,
  coverageSentence,
  factsTableRows,
} from './facts.js'
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

export const homeMarkdown = (doc, origin) => `# ${SITE_NAME}

An open field guide to the mammals of Kruger National Park. ${progressSentence(doc.counts)}

${ABOUT}

- [Orders](/orders.md): ${doc.counts.orders}
- [Families](/families.md): ${doc.counts.families}
- [Species](/species.md): ${doc.counts.species}
- [Facts](/facts.md): ${doc.counts.species}
- [Credits](/credits.md)
- [Search](/search.md): add \`?q=\` and a name, for example [/search.md?q=lion](/search.md?q=lion)

Every page has a \`.md\` and a \`.json\` view at the same address.

${answeringMarkdown(origin)}
`

/**
 * Writes every root-relative link target out in full. Several chat AIs open
 * only a URL they have seen complete, so `](/species/x)` is a dead end for them.
 */
export const absoluteLinks = (markdown, origin) =>
  markdown.replace(/\]\(\/(?!\/)/g, `](${siteOrigin(origin)}/`)

export const askAiMarkdown = (origin) => `# ${ASK_AI_TITLE}

${ASK_AI_INTRO}

This page is for people. If you are an AI and a reader pasted the prompt below into your chat, do what it says.

## The prompt

\`\`\`text
${aiPrompt(origin)}
\`\`\`

## Then ask it anything

Every question is taken to be about Kruger. For example:

${ASK_AI_EXAMPLES.map((item) => `- ${item}`).join('\n')}

## What to expect

${ASK_AI_EXPECT.map((item) => `- ${item}`).join('\n')}
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

export const factsMarkdown = (doc) => `# Facts

${FACTS_INTRO}

${coverageSentence(doc)}

${tableMarkdown({
  columns: FACTS_COLUMNS,
  rows: factsTableRows(doc),
  empty: 'No species are listed.',
})}

${SORT_NOTE}
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

const creditBits = (item, shown, slug = '') => {
  const credit = [
    item?.author ? one(item.author) : 'author not recorded',
    item?.license ? one(item.license) : 'licence not recorded',
  ].join(', ')
  const source = NO_OBSERVATION_REFS.has(slug) ? '' : safeHttpUrl(item?.source)
  const number = NO_OBSERVATION_REFS.has(slug) ? '' : catalogueNumber(item?.key)
  return [
    `Credit: ${credit}`,
    source ? `[Source](${source})` : '',
    number ? `xeno-canto catalogue number: ${number}` : '',
    filePhrase(shown),
  ]
    .filter(Boolean)
    .join('. ')
}

const imageLine = (image, slug = '') => {
  const what = [viewLabel(image?.view), image?.caption]
    .filter(Boolean)
    .map(one)
    .join('. ')
  const credit = creditBits(image, mediaSrc(image, 'images'), slug)
  return [what, credit].filter(Boolean).join('. ')
}

const callLine = (call, slug = '') => {
  const text = one(readerCallText(call?.description))
  const files = listed(call?.recordings).map((recording) =>
    creditBits(recording, mediaSrc(recording, 'audio'), slug),
  )
  if (!text && files.length === 0) return ''
  return `**${callTypeLabel(call?.type)}.**${text ? ` ${text}` : ''}${files.length ? ` ${files.join(' ')}` : ''}`
}

const publishedSpecies = (doc, details) => {
  details = visitorDetails(details)
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
    section(
      'Calls',
      bullets(
        listed(details.calls)
          .map((call) => callLine(call, doc.slug))
          .filter(Boolean),
      ),
    ),
    section('Similar species', bullets(listed(details.similar).map(animal))),
    section(
      'Photographs',
      bullets(
        listed(details.images).map((image) => imageLine(image, doc.slug)),
      ),
    ),
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

const countPhrase = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural}`

const imageCountPhrase = (images) => {
  const ai = images.filter((image) => image?.aiGenerated === true).length
  const photos = images.length - ai
  const parts = []
  if (photos) parts.push(countPhrase(photos, 'photograph', 'photographs'))
  if (ai)
    parts.push(
      countPhrase(
        ai,
        'AI-generated illustration',
        'AI-generated illustrations',
      ),
    )
  return parts.length ? parts.join(' and ') : '0 photographs'
}

const mdLink = (url, label) => {
  const href = safeHttpUrl(url)
  return href ? `[${one(label)}](${href})` : one(label)
}

const mdLicence = (item, missing) => {
  const name = typeof item?.licence === 'string' ? item.licence.trim() : ''
  const href = safeHttpUrl(item?.licenceUrl)
  if (!name && !href) return missing
  return `Licence: ${href ? mdLink(href, name || 'Licence terms') : one(name)}.`
}

const mdSource = (value) => {
  const text = typeof value === 'string' ? value.trim() : ''
  const href = safeHttpUrl(text)
  if (!text) return 'Source not recorded.'
  if (!href) return `Source: ${one(text)}.`
  return `Source: ${mdLink(href, href)}.`
}

const MD_CALL = {
  call: 'Call',
  alarm: 'Alarm',
  contact: 'Contact',
  other: 'Other',
}

const mdCreditLine = (item, kind, slug = '') => {
  const ai =
    item?.aiGenerated === true
      ? `${kind === 'recording' ? 'AI-generated recording' : 'AI-generated image'}. `
      : ''
  const author = item?.author
    ? `Author: ${one(item.author)}. `
    : 'Author not recorded. '
  const callType =
    typeof item?.callType === 'string' && item.callType.trim()
      ? `${one(MD_CALL[item.callType.trim()] || item.callType.trim())}. `
      : ''
  const number =
    kind === 'recording' && !NO_OBSERVATION_REFS.has(slug)
      ? catalogueNumber(item?.key)
      : ''
  const catalogue = number ? ` xeno-canto catalogue number: ${number}.` : ''
  const sourceUrl =
    NO_OBSERVATION_REFS.has(slug) && isObservationRef(item?.sourceUrl)
      ? ''
      : item?.sourceUrl
  return `${callType}${ai}${author}${mdLicence(item, 'Licence not recorded.')} ${mdSource(sourceUrl)}${catalogue}`
}

const mdCitation = (source) =>
  [
    mdLink(source?.url, source?.title || 'Untitled source'),
    source?.publisher ? one(source.publisher) : '',
    source?.year != null ? String(source.year) : '',
  ]
    .filter(Boolean)
    .join('. ')

const mdCreditList = (items, heading, kind, slug = '') =>
  !items.length
    ? ''
    : `#### ${heading}

${items
  .map(
    (item) =>
      `- ${kind === 'source' ? mdCitation(item) : mdCreditLine(item, kind, slug)}`,
  )
  .join('\n')}`

const mdDataSource = (source) => {
  const links = listed(source?.links)
    .map((link) =>
      safeHttpUrl(link?.url) ? mdLink(link.url, link.label || link.url) : '',
    )
    .filter(Boolean)
  const lines = [
    `- ${mdLink(source?.url, source?.name || 'Untitled source')}`,
    '',
    `  ${one(source?.usedFor || '')}`,
  ]
  if (links.length) lines.push('', `  Also: ${links.join('. ')}.`)
  lines.push('', `  ${mdLicence(source, 'Licence not recorded.')}`)
  return lines.join('\n')
}

const mdSpeciesCredit = (group) =>
  `### [${one(group.commonName || group.scientificName)}](/species/${group.slug}.md) (_${one(group.scientificName || '')}_)

${mdCreditList(listed(group.images), 'Photographs', 'image', group.slug)}
${mdCreditList(listed(group.recordings), 'Recordings', 'recording', group.slug)}
${mdCreditList(listed(group.sources), 'Sources', 'source')}`

const mdSite = (site) => {
  if (!site) return ''
  const handle = typeof site.maintainer === 'string' ? site.maintainer : ''
  const maintainer = /^[A-Za-z0-9-]+$/.test(handle)
    ? `[${handle}](https://github.com/${handle})`
    : one(handle)
  return `## This site

The code is at ${mdLink(site.repository, site.repository || '')}. ${mdLicence(site, 'Licence not recorded.')}

Built and maintained by ${maintainer}.

${one(site.palette || '')}

${one(site.affiliation || '')}`
}

const mdLicences = (licences) =>
  Object.entries(licences ?? {})
    .map(([name, n]) => `${n} ${name.toUpperCase().replace(/^CC-/, 'CC ')}`)
    .join(', ')

const mdRecognisers = (rec) => {
  if (!rec) return ''
  const lines = []
  if (rec.photos?.count)
    lines.push(
      `- Photo recogniser: trained on ${rec.photos.count} photos of ${rec.photos.species} species by ${rec.photos.photographers} photographers on iNaturalist (${mdLicences(rec.photos.licences)}).${rec.photos.list ? ` [Every photo, its photographer and its licence](${rec.photos.list}).` : ''}`,
    )
  if (rec.sounds?.count)
    lines.push(
      `- Sound recogniser: trained on ${rec.sounds.count} recordings of ${rec.sounds.species} species by ${rec.sounds.recordists} recordists on iNaturalist and xeno-canto (${mdLicences(rec.sounds.licences)}).${rec.sounds.list ? ` [Every recording, its recordist and its licence](${rec.sounds.list}).` : ''}`,
    )
  for (const item of listed(rec.noise))
    lines.push(
      `- [${one(item.name)}](${item.url}), ${one(item.authors)} (${item.year}). ${one(item.licence)}. ${one(item.usedFor)}.`,
    )
  for (const model of listed(rec.models))
    if (model.base?.name)
      lines.push(
        `- [${one(model.name)}](${model.page}.md) built on [${one(model.base.name)}](${model.base.url})${model.base.authors ? ` by ${one(model.base.authors)}` : ''} (${one(model.base.licence)}). Licence: [${model.licenceFile}](${model.licenceFile}).`,
      )
  if (rec.runtime?.name)
    lines.push(
      `- Both run in the browser with [${one(rec.runtime.name)} ${rec.runtime.version}](${rec.runtime.url}) (${one(rec.runtime.licence)}).`,
    )
  return `## Recognisers

Thank you to every photographer and recordist whose work trained the photo and sound recognisers. The recognisers are released under ${rec.licence?.name ?? 'a licence that is not recorded'}.

${lines.join('\n')}

${rec.note ? one(rec.note) : ''}

${rec.bats ? one(rec.bats) : ''}
`
}

export const creditsMarkdown = (doc) => {
  const sources = listed(doc?.dataSources)
  const groups = listed(doc?.species)
  const images = groups.flatMap((group) => listed(group.images))
  const recordings = groups.flatMap((group) => listed(group.recordings))
  const note =
    doc?.mediaNote ||
    (groups.length ? '' : 'No photos or recordings have been added so far.')
  return `# Credits

Checklists and references used for the family and species lists, the taxonomy those names follow, and credit for every photograph, recording and cited source.

This page lists ${imageCountPhrase(images)}, ${countPhrase(recordings.length, 'recording', 'recordings')}, and ${countPhrase(groups.length, 'species section', 'species sections')}.

## Data sources

${sources.length ? sources.map(mdDataSource).join('\n\n') : 'No data sources are recorded.'}

## Taxonomy

**${one(doc?.taxonomy?.authority || '')}.** ${one(doc?.taxonomy?.summary || '')}

## Photographs and recordings and cited sources

${note}

${groups.map(mdSpeciesCredit).join('\n\n')}

${mdRecognisers(doc?.recognisers)}
${mdSite(doc?.site)}
`
}

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
- [Sitemap](/sitemap.md)
`

const mdHref = (href) => (href === '/' ? '/.md' : `${href}.md`)

const markdownItems = (items, depth) =>
  items
    .map((item) => {
      const latin = item.latin ? ` (*${item.latin}*)` : ''
      const line = `${'  '.repeat(depth)}- [${item.name}](${mdHref(item.href)})${latin}`
      return item.children?.length
        ? `${line}\n${markdownItems(item.children, depth + 1)}`
        : line
    })
    .join('\n')

export const renderSitemapMarkdown = (entries) => `# Sitemap

${SITEMAP_INTRO} [Sitemap XML](/sitemap.xml) lists each HTML page once.

${markdownItems(entries, 0)}
`
