/**
 * Agentic Resource Discovery for this guide. One manifest, built from the
 * KV indexes once per request. No per-page manifest, and no entry for a
 * document this Worker does not serve.
 *
 * Identifiers stay on mammals.truter.world on every host. url values use
 * the request origin. An index that is missing is omitted, and the miss
 * is logged. A count is never filled in by hand.
 */
import { SERVER_CARD_PATH } from './mcp.js'

const CONTEXT = 'https://agenticresourcediscovery.org/context/v1'
const PUBLISHER = 'mammals.truter.world'

const entry = ({
  identifier,
  displayName,
  type,
  url,
  description,
  capabilities,
  representativeQueries,
  tags,
}) => ({
  '@context': CONTEXT,
  identifier: `urn:air:${PUBLISHER}:${identifier}`,
  displayName,
  type,
  url,
  description,
  capabilities,
  representativeQueries,
  tags,
})

const plural = (count, one, many) => (count === 1 ? one : many)

const integer = (value) => (Number.isInteger(value) ? value : null)

const asArray = (value) => (Array.isArray(value) ? value : null)

const logMissing = (key) => {
  console.error(JSON.stringify({ message: 'ARD index missing', key }))
}

const storedName = (row) =>
  typeof row?.af === 'string' && row.af.trim() ? row : null

const countPhrase = (count, one, many) =>
  count == null ? '' : `${count} ${plural(count, one, many)}`

const joinCounts = (parts) => {
  const present = parts.filter(Boolean)
  if (present.length === 0) return ''
  if (present.length === 1) return present[0]
  return `${present.slice(0, -1).join(', ')} and ${present.at(-1)}`
}

const homeEntry = (origin, doc) => {
  const speciesCount = integer(doc.counts?.species)
  const familyCount = integer(doc.counts?.families)
  const orderCount = integer(doc.counts?.orders)
  const counts = joinCounts([
    countPhrase(speciesCount, 'species', 'species'),
    countPhrase(familyCount, 'family', 'families'),
    countPhrase(orderCount, 'order', 'orders'),
  ])
  return entry({
    identifier: 'guide:home',
    displayName: 'Kruger mammal guide home',
    type: 'application/json',
    url: `${origin}/.json`,
    description: [
      'Stored JSON for the home page of the Kruger National Park mammal guide.',
      'It is the index/families document: counts, an orders array, and a families array.',
      'It does not list individual species.',
      counts
        ? `The stored counts are ${counts}.`
        : 'Counts that are not stored in that document are left out.',
      `The agent guide at ${origin}/llms.txt explains how to fetch HTML, Markdown and JSON, and the rules for missing facts, Afrikaans names, population figures, licences and captions.`,
    ].join(' '),
    capabilities: ['EntryPoint', 'SpeciesCount', 'FamilyCount', 'OrderCount'],
    representativeQueries: [
      'How many mammal species, families and orders are on the Kruger National Park list?',
      'Where is the stored JSON for the Kruger mammal guide?',
      'Which orders are in the Kruger mammal guide?',
    ],
    tags: ['kruger', 'mammals', 'field-guide'],
  })
}

const familiesEntry = (origin, doc) => {
  const families = asArray(doc.families)
  const count = integer(doc.counts?.families) ?? families?.length ?? null
  const named = families?.filter(storedName).length
  const namedFamily = families?.find(storedName)
  const asked = namedFamily?.latin || namedFamily?.en
  return entry({
    identifier: 'guide:families',
    displayName: 'Kruger mammal families',
    type: 'application/json',
    url: `${origin}/families.json`,
    description: [
      'JSON for the families page of the Kruger National Park mammal guide.',
      'It is the same stored index/families document as the home JSON.',
      'The families array lists each family with its English name, Latin name, Afrikaans name or null, order, and species count.',
      count == null
        ? ''
        : `It lists ${countPhrase(count, 'family', 'families')}.`,
      named == null
        ? ''
        : `${named} ${plural(named, 'family has', 'families have')} an Afrikaans name stored.`,
    ]
      .filter(Boolean)
      .join(' '),
    capabilities: ['FamilyIndex', 'AfrikaansNames'],
    representativeQueries: [
      'Which mammal families are on the Kruger National Park list?',
      asked
        ? `What is the Afrikaans name of the ${asked} family?`
        : 'Which Kruger mammal families have an Afrikaans name stored?',
      'Which Kruger mammal families have a species count stored?',
    ],
    tags: ['kruger', 'mammals', 'families'],
  })
}

const ordersEntry = (origin, doc) => {
  const orders = asArray(doc.orders)
  const count = integer(doc.counts?.orders) ?? orders?.length ?? null
  const order = orders?.find((row) => row?.latin)
  return entry({
    identifier: 'guide:orders',
    displayName: 'Kruger mammal orders',
    type: 'application/json',
    url: `${origin}/orders.json`,
    description: [
      'JSON for the orders page of the Kruger National Park mammal guide.',
      'It is the same stored index/families document as the home JSON.',
      'The orders array lists each order with its Latin name, slug, family count and species count.',
      count == null ? '' : `It lists ${countPhrase(count, 'order', 'orders')}.`,
    ]
      .filter(Boolean)
      .join(' '),
    capabilities: ['OrderIndex'],
    representativeQueries: [
      'Which mammal orders are on the Kruger National Park list?',
      order
        ? `How many families are in the ${order.latin} order?`
        : 'How many families does a Kruger mammal order list?',
      'Where is the list of Kruger mammal orders?',
    ],
    tags: ['kruger', 'mammals', 'orders'],
  })
}

const speciesEntry = (origin, doc) => {
  const species = asArray(doc.species)
  const named = species?.filter(storedName).length
  const withRange = species?.filter(
    (row) =>
      Number.isFinite(row?.population?.low) &&
      Number.isFinite(row?.population?.high),
  ).length
  const namedSpecies = species?.find(storedName)
  const asked = namedSpecies?.latin || namedSpecies?.en
  return entry({
    identifier: 'guide:species',
    displayName: 'Kruger mammal species',
    type: 'application/json',
    url: `${origin}/species.json`,
    description: [
      'Species index for the Kruger National Park mammal guide.',
      'It is the stored index/species document: a species array, not a map keyed by scientific name.',
      'Each row has English, Latin and Afrikaans names, family, order, a population range when one is stored, or null, and whether a full account is published.',
      species
        ? `It lists ${countPhrase(species.length, 'species', 'species')}.`
        : '',
      named == null
        ? ''
        : `${named} ${plural(named, 'species has', 'species have')} an Afrikaans name stored.`,
      withRange == null
        ? ''
        : `${withRange} ${plural(withRange, 'species has', 'species have')} a population range.`,
    ]
      .filter(Boolean)
      .join(' '),
    capabilities: ['SpeciesIndex', 'AfrikaansNames', 'PopulationEstimates'],
    representativeQueries: [
      'Which mammal species are on the Kruger National Park list?',
      asked
        ? `What is the Afrikaans name of ${asked}?`
        : 'Which Kruger mammal species have an Afrikaans name stored?',
      'Which Kruger mammals have a stored population range?',
    ],
    tags: ['kruger', 'mammals', 'species'],
  })
}

const searchEntry = (origin, doc) => {
  const species = asArray(doc?.species)
  const named = species?.find(storedName)
  const asked = named?.latin || named?.en
  return entry({
    identifier: 'mcp:field-guide',
    displayName: 'KNP Mammals search',
    type: 'application/mcp-server-card+json',
    url: `${origin}${SERVER_CARD_PATH}`,
    description:
      'MCP server card for a public read-only search of Kruger mammal records by scientific, English or Afrikaans name. The card names the streamable HTTP endpoint. It is not itself the transport.',
    capabilities: ['search'],
    representativeQueries: [
      'Which Kruger mammals are in the cat family?',
      asked
        ? `Find the Kruger record for ${asked}`
        : 'Find a Kruger mammal by its scientific name',
      'Search Kruger mammals by Afrikaans name',
    ],
    tags: ['kruger', 'mammals', 'search', 'mcp'],
  })
}

const document = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null

export const discoveryDocuments = ({ origin, familiesIndex, speciesIndex }) => {
  const families = document(familiesIndex)
  const species = document(speciesIndex)
  const entries = []
  if (families) {
    entries.push(
      homeEntry(origin, families),
      familiesEntry(origin, families),
      ordersEntry(origin, families),
    )
  } else logMissing('index/families')
  if (species) entries.push(speciesEntry(origin, species))
  else logMissing('index/species')
  entries.push(searchEntry(origin, species))
  return {
    ard: { entries },
    catalog: {
      specVersion: '1.0',
      host: {
        displayName: 'Mammals of Kruger National Park',
        documentationUrl: `${origin}/llms.txt`,
      },
      entries,
    },
  }
}
