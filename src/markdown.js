import { inlineText, safeHttpUrl } from './escape.js'
import { SITE_NAME, STATUS_NOTE } from './html.js'

/** Table cells: one line, with the characters that would break a row escaped. */
const cell = (value) =>
  value
    ? inlineText(value).replaceAll('\\', '\\\\').replaceAll('|', '\\|')
    : '-'

const table = (head, rows) =>
  [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')

const link = (text, href) => `[${cell(text)}](${href})`

export const homeMarkdown = (doc) => {
  const { counts, orders } = doc
  const sections = orders.map(
    (order) =>
      `## ${inlineText(order.order)}\n\n${table(
        ['English', 'Afrikaans', 'Latin', 'Species'],
        order.families.map((family) => [
          link(family.en, `/family/${family.slug}.md`),
          cell(family.af),
          cell(family.latin),
          String(family.speciesCount),
        ]),
      )}`,
  )
  return `# ${SITE_NAME}

${counts.species} species in ${counts.families} families and ${counts.orders} orders. ${STATUS_NOTE}

All species: [/species.md](/species.md). Every page also has a \`.json\` view.

${sections.join('\n\n')}
`
}

export const speciesListMarkdown = (doc) => `# Species

${doc.species.length} species, in checklist order.

${table(
  ['English', 'Afrikaans', 'Latin', 'Family', 'Order'],
  doc.species.map((species) => [
    link(species.en, `/species/${species.slug}.md`),
    cell(species.af),
    cell(species.latin),
    link(species.family, `/family/${species.familySlug}.md`),
    cell(species.order),
  ]),
)}
`

export const familyMarkdown = (doc) => {
  const sources = (Array.isArray(doc.sources) ? doc.sources : [])
    .map(safeHttpUrl)
    .filter(Boolean)
  return `# ${inlineText(doc.en)}

- Latin: ${inlineText(doc.latin)}
- Afrikaans: ${cell(doc.af)}
- Order: ${inlineText(doc.order)}

## Species

${table(
  ['English', 'Afrikaans', 'Latin'],
  doc.species.map((species) => [
    link(species.en, `/species/${species.slug}.md`),
    cell(species.af),
    cell(species.latin),
  ]),
)}
${sources.length > 0 ? `\n## Sources\n\n${sources.map((href) => `- <${href}>`).join('\n')}\n` : ''}`
}

export const speciesMarkdown = (doc) => {
  const evidence = doc.inclusionEvidence || {}
  const notes = Array.isArray(doc.notes) ? doc.notes : []
  const summary =
    typeof doc.details?.summary === 'string'
      ? inlineText(doc.details.summary)
      : STATUS_NOTE
  return `# ${inlineText(doc.en)}

${summary}

- Latin: ${inlineText(doc.latin)}
- Afrikaans: ${cell(doc.af)}
- Family: ${link(doc.family, `/family/${doc.familySlug}.md`)}
- Order: ${inlineText(doc.order)}
- SANParks 2011 checklist: ${evidence.sanparks2011 === true ? 'listed' : evidence.sanparks2011 === false ? 'not listed' : 'not recorded'}
- iNaturalist research-grade records in the park: ${Number.isInteger(evidence.inatResearchGrade) ? evidence.inatResearchGrade : 'not recorded'}
${notes.length > 0 ? `\n## Research notes\n\n${notes.map((note) => `- ${inlineText(note)}`).join('\n')}\n` : ''}`
}

export const notFoundMarkdown = () => `# Not found

There is no page at this address. Families: [/.md](/.md). Species: [/species.md](/species.md).
`
