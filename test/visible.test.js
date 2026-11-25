import assert from 'node:assert/strict'
import { test } from 'node:test'
import { speciesHtml } from '../src/html.js'
import { speciesMarkdown } from '../src/markdown.js'
import {
  isGapSentence,
  splitSentences,
  visibleText,
  visitorDetails,
} from '../src/visible.js'
import { loadStore, ORIGIN } from './helpers.js'

const { records } = await loadStore()

const withoutGapLog = {
  html: (text) =>
    text.replace(
      /<details class="more"><summary>Not yet recorded<\/summary>[\s\S]*?<\/details>/,
      '',
    ),
  md: (text) =>
    text.replace(/## Not yet recorded\n\n[\s\S]*?(?=\n## |\s*$)/, ''),
}

const loadSpecies = (slug) => JSON.parse(records[`species/${slug}`])

test('visible text drops curator-gap sentences and keeps real content', () => {
  assert.equal(
    visibleText(
      'A single calf is born after a gestation of about 8 to 8.5 months. Exact calving months for Kruger were not found in the sources used here.',
    ),
    'A single calf is born after a gestation of about 8 to 8.5 months.',
  )
  assert.equal(
    visibleText(
      'A detailed description of the call was not found in the sources used here.',
    ),
    '',
  )
  assert.equal(visibleText('No Kruger population figure was found.'), '')
  assert.equal(
    visibleText(
      'No Kruger population figure was found. The EWT assessment notes that the species occurs in Kruger.',
    ),
    'The EWT assessment notes that the species occurs in Kruger.',
  )
  assert.equal(
    visibleText(
      'Juveniles have shorter ear tufts. No Kruger-specific birth-month range was entered from the sources consulted in this session.',
    ),
    'Juveniles have shorter ear tufts.',
  )
  assert.equal(
    visibleText(
      'Adults, Mapungubwe National Park. No live Kruger photograph with a reusable licence was found.',
    ),
    'Adults, Mapungubwe National Park.',
  )
  assert.equal(visibleText(null), '')
  assert.equal(visibleText(''), '')
  assert.equal(visibleText('  '), '')
})

test('a present-tense habitat "is not found" is not a gap', () => {
  const habitat =
    'Open woodlands and wooded savanna. It is not found in highly arid areas or in dense riparian vegetation. It occurs in the eastern Lowveld, including Kruger National Park.'
  assert.equal(
    isGapSentence(
      'It is not found in highly arid areas or in dense riparian vegetation.',
    ),
    false,
  )
  assert.equal(visibleText(habitat), habitat)
})

test('sentence splitting keeps abbreviations and splits after units', () => {
  assert.deepEqual(
    splitSentences(
      'Wikipedia, citing Kingdon et al. (2013), says breeding takes place in the wet season. The appearance of the young was not described in the sources consulted.',
    ),
    [
      'Wikipedia, citing Kingdon et al. (2013), says breeding takes place in the wet season.',
      'The appearance of the young was not described in the sources consulted.',
    ],
  )
  assert.deepEqual(
    splitSentences(
      'Wikipedia gives a mass of 30 g. A sourced description of coat colour was not found in the accounts used.',
    ),
    [
      'Wikipedia gives a mass of 30 g.',
      'A sourced description of coat colour was not found in the accounts used.',
    ],
  )
  assert.deepEqual(
    splitSentences(
      'It is found from sea level to 1,550 m. A Kruger-specific habitat account was not found.',
    ),
    [
      'It is found from sea level to 1,550 m.',
      'A Kruger-specific habitat account was not found.',
    ],
  )
})

test('a mixed sentence keeps the fact and drops the gap clause', () => {
  assert.equal(
    visibleText(
      'It is recorded from Kruger National Park, but a Kruger-specific habitat account was not found.',
    ),
    'It is recorded from Kruger National Park.',
  )
  assert.equal(
    visibleText(
      'A species-level IUCN global assessment for Giraffa giraffa was not found in the sources used; Wikipedia notes that IUCN accepted four giraffe species in 2025.',
    ),
    'Wikipedia notes that IUCN accepted four giraffe species in 2025.',
  )
  assert.equal(
    visibleText(
      'No shoulder height or sexed numerical split was found, although Animal Diversity Web says the breeding pair are the largest animals.',
    ),
    'Animal Diversity Web says the breeding pair are the largest animals.',
  )
})

test('visitor details do not change the stored object or the gap list', () => {
  const young =
    'Juveniles have shorter ear tufts. No Kruger-specific birth-month range was entered from the sources consulted in this session.'
  const details = {
    young,
    gaps: ['No Kruger-specific birth-month range was found.'],
    research: { note: 'No Kruger population figure was found.' },
    calls: [
      {
        type: 'call',
        description:
          'A detailed description of the call was not found in the sources used here.',
      },
    ],
  }
  const before = structuredClone(details)
  const shown = visitorDetails(details)
  assert.equal(shown.young, 'Juveniles have shorter ear tufts.')
  assert.deepEqual(shown.gaps, details.gaps)
  assert.equal(shown.research.note, details.research.note)
  assert.deepEqual(details, before)
  assert.equal(
    shown.calls[0].description,
    'A detailed description of the call was not found in the sources used here.',
  )
})

test('an empty or placeholder Young section is omitted, and mixed content stays', async () => {
  const shrew = loadSpecies('crocidura-cyanea')
  assert.equal(shrew.details.young, undefined)
  const shrewHtml = speciesHtml(shrew, { origin: ORIGIN })
  const shrewMd = speciesMarkdown(shrew)
  assert.doesNotMatch(shrewHtml, /<h2>Young<\/h2>/)
  assert.doesNotMatch(shrewMd, /^## Young$/m)

  const wildebeest = loadSpecies('connochaetes-taurinus')
  assert.match(wildebeest.details.young, /not found in the sources used here/)
  const html = withoutGapLog.html(speciesHtml(wildebeest, { origin: ORIGIN }))
  const md = withoutGapLog.md(speciesMarkdown(wildebeest))
  assert.match(html, /<h2>Young<\/h2>/)
  assert.match(
    html,
    /A single calf is born after a gestation of about 8 to 8.5 months/,
  )
  assert.doesNotMatch(html, /not found in the sources used here/)
  assert.match(md, /^## Young$/m)
  assert.match(
    md,
    /A single calf is born after a gestation of about 8 to 8.5 months/,
  )
  assert.doesNotMatch(md, /not found in the sources used here/)
})

test('the stored JSON and the gap list still carry the curator wording', async () => {
  const wildebeest = loadSpecies('connochaetes-taurinus')
  assert.match(
    wildebeest.details.young,
    /Exact calving months for Kruger were not found in the sources used here/,
  )
  const json = records['species/connochaetes-taurinus']
  assert.match(
    json,
    /Exact calving months for Kruger were not found in the sources used here/,
  )
  const html = speciesHtml(wildebeest, { origin: ORIGIN })
  const md = speciesMarkdown(wildebeest)
  assert.match(html, /<summary>Not yet recorded<\/summary>/)
  assert.match(html, /No Kruger-specific calving-month range was found/)
  assert.match(md, /## Not yet recorded/)
  assert.match(md, /No Kruger-specific calving-month range was found/)
})

test('a population note that is only a gap is omitted, and a similar-species gap note is left off', () => {
  const genet = loadSpecies('genetta-fieldiana')
  assert.equal(
    genet.details.population.notes,
    'No Kruger population figure was found.',
  )
  const html = withoutGapLog.html(speciesHtml(genet, { origin: ORIGIN }))
  const md = withoutGapLog.md(speciesMarkdown(genet))
  assert.doesNotMatch(html, /No Kruger population figure was found/)
  assert.doesNotMatch(md, /No Kruger population figure was found/)
  assert.match(html, /No numeric estimate yet/)

  const sengi = loadSpecies('elephantulus-myurus')
  const comparison = sengi.details.similar.find((item) =>
    /was not found in the sources used/.test(item?.note || ''),
  )
  assert.ok(comparison)
  const sengiHtml = withoutGapLog.html(speciesHtml(sengi, { origin: ORIGIN }))
  assert.match(sengiHtml, /<h2>Similar species<\/h2>/)
  assert.doesNotMatch(sengiHtml, /was not found in the sources used/)
})

test('no species page shows curator gap wording outside the gap list', () => {
  const index = JSON.parse(records['index/species'])
  for (const row of index.species) {
    const doc = loadSpecies(row.slug)
    const html = withoutGapLog.html(speciesHtml(doc, { origin: ORIGIN }))
    const md = withoutGapLog.md(speciesMarkdown(doc))
    for (const [label, text] of [
      ['html', html],
      ['md', md],
    ]) {
      const prose = text
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<style[\s\S]*?<\/style>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&\w+;/g, ' ')
      for (const sentence of splitSentences(prose.replace(/\s+/g, ' '))) {
        assert.equal(
          isGapSentence(sentence),
          false,
          `${row.slug} ${label}: ${sentence}`,
        )
      }
    }
  }
})
