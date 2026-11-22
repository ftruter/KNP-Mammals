import { clientSrc, styleSrc } from './client.js'
import { ARD_LINK } from './head.js'
import { ICON_LINKS } from './icon.js'
import { creditHtml, creditModel } from './credit.js'
import { escapeHtml, inlineText, safeHttpUrl } from './escape.js'
import {
  callTypeLabel,
  conservationLabel,
  monthsLabel,
  populationModel,
  sizeFacts,
  statusLabel,
  viewLabel,
} from './labels.js'
import { mediaSrc } from './media.js'
import {
  FAMILY_COLUMNS,
  FAMILY_SPECIES_COLUMNS,
  ORDER_COLUMNS,
  ORDER_FAMILY_COLUMNS,
  ORDER_SPECIES_COLUMNS,
  SPECIES_COLUMNS,
  tableHtml,
} from './lists.js'
import {
  ASK_AI_EXAMPLES,
  ASK_AI_EXPECT,
  ASK_AI_INTRO,
  ASK_AI_PATH,
  ASK_AI_TITLE,
  HOME_ASK_AI,
  aiPrompt,
} from './prompt.js'
import { alternates } from './route.js'

export const SITE_NAME = 'Mammals of Kruger National Park'
export const SHORT_NAME = 'KNP Mammals'
export const BIRDS_URL = 'https://birds.truter.world'
export const ABOUT =
  'The guide is written for people and for AI agents. Pages are rendered on the server. JavaScript is optional: sorting and photo zoom still work from the links and the page when it is off.'
export const UNPUBLISHED_SPECIES =
  'The details for this species have not been published yet.'
export const APPROXIMATE_LABEL = 'Approximate number in Kruger'

export const progressSentence = (counts) =>
  `The list has ${counts.species} species in ${counts.families} families and ${counts.orders} orders. ${counts.researched} of the species have a full account so far; the rest are listed by name.`

const NAV = [
  ['families', '/families', 'Families'],
  ['species', '/species', 'Species'],
  ['ask-ai', '/ask-ai', 'Ask your AI'],
  ['agents', '/llms.txt', 'For agents'],
]

const listed = (value) => (Array.isArray(value) ? value : [])

const paragraphs = (text) =>
  String(text ?? '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join('\n')

export const crumbs = (items) =>
  !items?.length
    ? ''
    : `<nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="/">Home</a></li>${items
        .map((item) =>
          item.current
            ? `<li aria-current="page">${escapeHtml(item.label)}</li>`
            : `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`,
        )
        .join('')}</ol></nav>`

export const layout = ({
  title,
  description,
  origin,
  path,
  nav,
  crumbs: crumbHtml,
  main,
}) => {
  const alts = alternates(path)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(origin + alts.html)}">
<link rel="alternate" type="text/markdown" href="${escapeHtml(alts.md)}" title="Markdown">
<link rel="alternate" type="application/json" href="${escapeHtml(alts.json)}" title="JSON">
${ARD_LINK}
${ICON_LINKS}
<link rel="stylesheet" href="${styleSrc}">
<script type="module" defer src="${clientSrc}"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap mast">
<div class="brand">
<p class="site-name"><a href="/">${SHORT_NAME}</a></p>
<p class="site-tag">Kruger National Park</p>
</div>
<nav aria-label="Site">
<ul class="nav-list">
${NAV.map(([key, href, label]) => `<li${key === 'agents' ? ' class="for-agents"' : ''}><a href="${href}"${nav === key ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n')}
</ul>
</nav>
</div>
</header>
<main id="main" tabindex="-1">
<div class="wrap">
${crumbHtml || ''}
${main}
</div>
</main>
<footer class="site-footer">
<div class="wrap">
<div class="footer-grid">
<p>${SITE_NAME}</p>
<p><a href="${BIRDS_URL}" title="Switch to our sister site">Birds</a> · <a href="/llms.txt">llms.txt</a> · <a href="${escapeHtml(alts.md)}">Markdown</a> · <a href="${escapeHtml(alts.json)}">JSON</a></p>
</div>
</div>
</footer>
</body>
</html>
`
}

export const homeHtml = (doc, { origin }) => {
  const { counts } = doc
  const main = `
<h1>${SITE_NAME}</h1>
<nav aria-label="Browse the guide">
<ul class="browse-links">
<li><a href="/orders">Orders</a> <span>${counts.orders}</span></li>
<li><a href="/families">Families</a> <span>${counts.families}</span></li>
<li><a href="/species">Species</a> <span>${counts.species}</span></li>
</ul>
</nav>
<p class="ask-ai-link"><a href="${HOME_ASK_AI.href}">${escapeHtml(HOME_ASK_AI.name)}</a>: ${escapeHtml(HOME_ASK_AI.description)}</p>
<h2>What a full account covers</h2>
<ol class="compare-list">
<li>Photographs from the front, the side and the back</li>
<li>Size and mass, for males and females where they differ</li>
<li>Habits, diet and young</li>
<li>Predators and prey</li>
<li>Calls, with recordings where one could be found</li>
<li>Similar species and how to tell them apart</li>
</ol>
<h2>About this guide</h2>
<p>An open field guide to the mammals of Kruger National Park. ${escapeHtml(progressSentence(counts))}</p>
<p>The list follows the 2011 SANParks checklist for the park. Species with no Kruger records, and animals that live only around rest camps because they arrived with people, are left out.</p>
<p>${escapeHtml(ABOUT)}</p>`
  return layout({
    title: SITE_NAME,
    description:
      'An open field guide to the mammals of Kruger National Park. For people and for AI agents.',
    origin,
    path: '/',
    nav: 'home',
    crumbs: '',
    main,
  })
}

export const familiesHtml = (doc, { origin, url }) =>
  layout({
    title: `Families · ${SHORT_NAME}`,
    description: 'Mammal families in this field guide.',
    origin,
    path: '/families',
    nav: 'families',
    crumbs: crumbs([{ label: 'Families', current: true }]),
    main: `
<h1>Families</h1>
<p>The guide lists ${doc.families.length} families. The list is alphabetical by English name.</p>
${tableHtml({
  caption: 'Families',
  columns: FAMILY_COLUMNS,
  rows: doc.families,
  path: '/families',
  query: url,
  empty: 'No families are listed.',
})}
`,
  })

export const speciesListHtml = (doc, { origin, url }) =>
  layout({
    title: `Species · ${SHORT_NAME}`,
    description: 'Mammal species in this field guide.',
    origin,
    path: '/species',
    nav: 'species',
    crumbs: crumbs([{ label: 'Species', current: true }]),
    main: `
<h1>Species</h1>
<p>The guide lists ${doc.species.length} species. The list is alphabetical by English name.</p>
${tableHtml({
  caption:
    'Species. The population is the approximate number in Kruger, where an estimate is recorded.',
  columns: SPECIES_COLUMNS,
  rows: doc.species,
  path: '/species',
  query: url,
  empty: 'No species are listed.',
})}
`,
  })

const linkList = (heading, urls) => {
  const links = listed(urls).map(safeHttpUrl).filter(Boolean)
  return links.length === 0
    ? ''
    : `<h2>${heading}</h2>
<ul>
${links.map((href) => `<li><a href="${escapeHtml(href)}">${escapeHtml(href)}</a></li>`).join('\n')}
</ul>`
}

/** The order's name, linked to its page when the document carries its slug. */
const orderLink = (doc) =>
  doc.orderSlug
    ? `<a href="/order/${escapeHtml(doc.orderSlug)}">${escapeHtml(doc.order)}</a>`
    : escapeHtml(doc.order || '')

export const ordersHtml = (doc, { origin, url }) =>
  layout({
    title: `Orders · ${SHORT_NAME}`,
    description: 'Mammal orders in this field guide.',
    origin,
    path: '/orders',
    nav: '',
    crumbs: crumbs([{ label: 'Orders', current: true }]),
    main: `
<h1>Orders</h1>
<p>The guide lists ${doc.orders.length} orders. An order is the group above the family: the cats and the dogs are families in the order Carnivora. The list is alphabetical.</p>
${tableHtml({
  caption: 'Orders',
  columns: ORDER_COLUMNS,
  rows: doc.orders,
  path: '/orders',
  query: url,
  empty: 'No orders are listed.',
})}
`,
  })

const countLabel = (count, one, many) => `${count} ${count === 1 ? one : many}`

export const orderHtml = (doc, { origin, url }) =>
  layout({
    title: `${doc.latin} · ${SHORT_NAME}`,
    description: `The order ${doc.latin} in Kruger National Park: ${countLabel(doc.families.length, 'family', 'families')} and ${doc.species.length} species.`,
    origin,
    path: `/order/${doc.slug}`,
    nav: '',
    crumbs: crumbs([
      { href: '/orders', label: 'Orders' },
      { label: doc.latin, current: true },
    ]),
    main: `
<p class="kicker">Order</p>
<h1>${escapeHtml(doc.latin)}</h1>
<p>${countLabel(doc.families.length, 'family', 'families')} and ${doc.species.length} species in Kruger.</p>
<h2>Families</h2>
${tableHtml({
  caption: 'Families',
  columns: ORDER_FAMILY_COLUMNS,
  rows: listed(doc.families),
  path: `/order/${doc.slug}`,
  query: url,
  empty: 'No families are listed for this order.',
})}
<h2>Species</h2>
${tableHtml({
  caption:
    'Species. The population is the approximate number in Kruger, where an estimate is recorded.',
  columns: ORDER_SPECIES_COLUMNS,
  rows: listed(doc.species),
  path: `/order/${doc.slug}`,
  query: url,
  empty: 'No species are listed for this order.',
})}
`,
  })

export const familyHtml = (doc, { origin, url }) =>
  layout({
    title: `${doc.en} · ${SHORT_NAME}`,
    description: `${doc.en} (${doc.latin}) of Kruger National Park.`,
    origin,
    path: `/family/${doc.slug}`,
    nav: 'families',
    crumbs: crumbs([
      { href: '/families', label: 'Families' },
      { label: doc.en, current: true },
    ]),
    main: `
<p class="kicker">Family · ${orderLink(doc)}</p>
<h1>${escapeHtml(doc.en)}</h1>
<p class="latin">${escapeHtml(doc.latin)}</p>
${doc.af ? `<p class="afrikaans">${escapeHtml(doc.af)}</p>` : ''}
<h2>Species in Kruger</h2>
${tableHtml({
  caption: 'Species in Kruger',
  columns: FAMILY_SPECIES_COLUMNS,
  rows: listed(doc.species),
  path: `/family/${doc.slug}`,
  query: url,
  empty: 'No species are listed for this family.',
})}
${linkList('Sources', doc.sources)}
`,
  })

const sourcesHtml = (sources) => {
  const list = listed(sources)
  if (!list.length) return '<p>No sources cited yet.</p>'
  return `<ol>
${list
  .map((source) => {
    const url = safeHttpUrl(source?.url)
    const title = escapeHtml(source?.title || 'Untitled source')
    const bits = [
      url ? `<a href="${escapeHtml(url)}">${title}</a>` : title,
      source?.publisher ? escapeHtml(source.publisher) : '',
      source?.year ? escapeHtml(String(source.year)) : '',
    ].filter(Boolean)
    return `<li>${bits.join('. ')}</li>`
  })
  .join('\n')}
</ol>`
}

const sentence = (text) => `${String(text).replace(/\.$/, '')}.`

const plateHtml = (doc, image, lead = false) => {
  const shown = mediaSrc(image, 'images')
  const src = shown?.src || ''
  const detail = [viewLabel(image?.view), image?.caption]
    .filter(Boolean)
    .map((part) => escapeHtml(sentence(part)))
    .join(' ')
  const caption = [
    image?.aiGenerated
      ? '<span class="ai-label">AI-generated image</span>'
      : '',
    detail,
    creditHtml(creditModel(image, 'image', shown), src),
  ]
    .filter(Boolean)
    .join(' ')
  const alt = image?.alt || `${doc.en}: ${viewLabel(image?.view)}`
  return src
    ? `<figure class="plate">
<button type="button" class="zoom" aria-pressed="false" aria-label="Zoom photograph">
<img draggable="false" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${lead ? '' : ' loading="lazy"'}>
</button>
<figcaption>${caption}</figcaption>
</figure>`
    : `<figure class="plate">
<figcaption>Photograph not shown: its licence does not allow it. ${caption}</figcaption>
</figure>`
}

const recordingHtml = (recording) => {
  const shown = mediaSrc(recording, 'audio')
  const src = shown?.src || ''
  return `<div class="recording">${src ? `<audio controls preload="none" src="${escapeHtml(src)}"></audio>` : ''}${creditHtml(creditModel(recording, 'recording', shown), src)}</div>`
}

const callsHtml = (calls) =>
  calls.length === 0
    ? ''
    : `<h2>Calls</h2>
<ul class="call-list">
${calls.map((call) => `<li><span class="call-type">${escapeHtml(callTypeLabel(call?.type))}</span> ${escapeHtml(call?.description || '')}${listed(call?.recordings).map(recordingHtml).join('')}</li>`).join('\n')}
</ul>`

const animalHtml = (item) => {
  const label = escapeHtml(item?.en || item?.latin || item?.slug || 'Unnamed')
  return item?.listed && item.slug
    ? `<a href="/species/${escapeHtml(item.slug)}">${label}</a>`
    : label
}

const animalsHtml = (heading, items) =>
  items.length === 0
    ? ''
    : `<h3>${heading}</h3>
<ul>
${items.map((item) => `<li>${animalHtml(item)}${item?.note ? `. ${escapeHtml(item.note)}` : ''}</li>`).join('\n')}
</ul>`

const similarHtml = (items) =>
  items.length === 0
    ? ''
    : `<h2>Similar species</h2>
<ul>
${items.map((item) => `<li>${animalHtml(item)}. ${escapeHtml(item?.note || '')}</li>`).join('\n')}
</ul>`

const viewNotesHtml = (notes) =>
  notes.length === 0
    ? ''
    : `<h2>What to look for</h2>
<ul>
${notes
  .map((note) => {
    const who = [note?.age, note?.sex]
      .filter((part) => part && part !== 'any')
      .join(' ')
    const label = [viewLabel(note?.view), who].filter(Boolean).join(', ')
    return `<li><strong>${escapeHtml(label)}.</strong> ${escapeHtml(note?.note || '')}</li>`
  })
  .join('\n')}
</ul>`

const section = (heading, text) =>
  text ? `<h2>${heading}</h2>\n${paragraphs(text)}` : ''

const moreHtml = (summaryHtml, detailHtml) =>
  `<details class="more"><summary>${summaryHtml}</summary>
${detailHtml}
</details>`

/**
 * The population as one row of the facts list: the figure in view, and the
 * trend, notes, confidence, year and sources behind it.
 */
const populationRowHtml = (population) => {
  const model = populationModel(population)
  const state = [
    `Trend: ${escapeHtml(model.trend)}.`,
    model.confidence ? `Confidence: ${escapeHtml(model.confidence)}.` : '',
    model.asOf ? `As of ${escapeHtml(String(model.asOf))}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const detail = [
    `<p>${APPROXIMATE_LABEL}.</p>`,
    `<p>${state}</p>`,
    model.notes ? `<p>${escapeHtml(model.notes)}</p>` : '',
    '<p>Sources:</p>',
    sourcesHtml(model.sources),
  ]
    .filter(Boolean)
    .join('\n')
  return `<dt>Numbers in Kruger</dt><dd class="population">${moreHtml(model.range ? escapeHtml(model.range) : 'No numeric estimate yet.', detail)}</dd>`
}

const sizeRowsHtml = (size) => {
  const rows = sizeFacts(size)
  const note = typeof size?.note === 'string' ? size.note.trim() : ''
  return rows
    .map(([label, text], index) => {
      const value =
        index === 0 && note
          ? moreHtml(escapeHtml(text), `<p>${escapeHtml(note)}</p>`)
          : escapeHtml(text)
      return `<dt>${label}</dt><dd>${value}</dd>`
    })
    .join('\n')
}

const factRow = (term, value) =>
  value ? `<dt>${term}</dt><dd>${escapeHtml(value)}</dd>` : ''

const factsHtml = (doc, details) => `<dl class="facts">
${[
  factRow('Status', statusLabel(details.status)),
  factRow('Months in Kruger', monthsLabel(details.monthsPresent)),
  factRow('Conservation', conservationLabel(details.conservationStatus)),
  sizeRowsHtml(details.size),
  factRow('Habitat', details.habitat),
  populationRowHtml(details.population),
  `<dt>Family</dt><dd><a href="/family/${escapeHtml(doc.familySlug)}">${escapeHtml(doc.familyEn || doc.family)}</a></dd>`,
  doc.order ? `<dt>Order</dt><dd>${orderLink(doc)}</dd>` : '',
]
  .filter(Boolean)
  .join('\n')}
</dl>`

const publishedSpeciesHtml = (doc, details) => {
  const images = listed(details.images)
  const predators = animalsHtml('Predators', listed(details.predators))
  const prey = animalsHtml('Prey', listed(details.prey))
  const gaps = listed(details.gaps)
  return `<div class="species-lead">
${images.length > 0 ? plateHtml(doc, images[0], true) : '<p>No photograph is stored for this species yet.</p>'}
<div class="species-lead-text">
${paragraphs(details.summary)}
${factsHtml(doc, details)}
</div>
</div>
${section('Description', details.description)}
${viewNotesHtml(listed(details.viewNotes))}
${similarHtml(listed(details.similar))}
${section('Habits', details.habits)}
${section('Diet', details.diet?.summary)}
${section('Young', details.young)}
${predators || prey ? `<h2>Predators and prey</h2>\n${predators}\n${prey}` : ''}
${callsHtml(listed(details.calls))}
${
  images.length > 1
    ? `<h2>More photographs</h2>
<div class="gallery">
${images
  .slice(1)
  .map((image) => plateHtml(doc, image))
  .join('\n')}
</div>`
    : ''
}
${
  gaps.length > 0
    ? `<details class="more"><summary>Not yet recorded</summary>
<ul>
${gaps.map((gap) => `<li>${escapeHtml(gap)}</li>`).join('\n')}
</ul>
</details>`
    : ''
}
<h2>Sources</h2>
${sourcesHtml(details.sources)}`
}

const evidenceHtml = (doc) => {
  const evidence = doc.inclusionEvidence || {}
  const facts = [
    [
      'Family',
      `<a href="/family/${escapeHtml(doc.familySlug)}">${escapeHtml(doc.familyEn || doc.family)}</a>`,
    ],
    ['Order', doc.order ? orderLink(doc) : ''],
    [
      'SANParks 2011 checklist',
      evidence.sanparks2011 === true
        ? 'Listed'
        : evidence.sanparks2011 === false
          ? 'Not listed'
          : '',
    ],
    [
      'iNaturalist research-grade records in the park',
      Number.isInteger(evidence.inatResearchGrade)
        ? String(evidence.inatResearchGrade)
        : '',
    ],
  ].filter(([, value]) => value)
  const notes = listed(doc.notes)
  return `<dl class="facts">
${facts.map(([term, value]) => `<dt>${term}</dt><dd>${value}</dd>`).join('\n')}
</dl>
${
  notes.length > 0
    ? `<h2>Research notes</h2>
<ul>
${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('\n')}
</ul>`
    : ''
}`
}

export const speciesHtml = (doc, { origin }) => {
  const details = doc.details
  const status = details?.status
    ? ` · ${escapeHtml(statusLabel(details.status))}`
    : ''
  const main = `
<div class="species-id">
<p class="kicker"><a href="/family/${escapeHtml(doc.familySlug)}">${escapeHtml(doc.familyEn || doc.family)}</a>${status}</p>
<h1>${escapeHtml(doc.en)}</h1>
<p class="latin">${escapeHtml(doc.latin)}</p>
${doc.af ? `<p class="afrikaans">${escapeHtml(doc.af)}</p>` : ''}
</div>
${details ? publishedSpeciesHtml(doc, details) : `<p>${UNPUBLISHED_SPECIES}</p>\n${evidenceHtml(doc)}`}`
  return layout({
    title: `${doc.en} (${doc.latin}) · ${SHORT_NAME}`,
    description: inlineText(details?.summary || doc.en),
    origin,
    path: `/species/${doc.slug}`,
    nav: 'species',
    crumbs: crumbs([
      { href: '/species', label: 'Species' },
      { label: doc.en, current: true },
    ]),
    main,
  })
}

export const askAiHtml = ({ origin }) => {
  const main = `
<h1>${escapeHtml(ASK_AI_TITLE)}</h1>
<p>${escapeHtml(ASK_AI_INTRO)}</p>
<div class="ask-ai" data-copy>
<h2 id="ask-ai-prompt">The prompt</h2>
<pre class="ask-ai-prompt" tabindex="0" aria-labelledby="ask-ai-prompt" data-copy-text>${escapeHtml(aiPrompt(origin))}</pre>
<p class="ask-ai-actions"><button class="copy-button" type="button" data-copy-button hidden>Copy prompt</button> <span class="copy-status" role="status" data-copy-status></span></p>
<p class="ask-ai-manual" data-copy-manual>Select all of the text in the box and copy it.</p>
</div>
<h2>Then ask it anything</h2>
<p>Every question is taken to be about Kruger, so you need not say so. For example:</p>
<ul>
${ASK_AI_EXAMPLES.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')}
</ul>
<h2>What to expect</h2>
<ul>
${ASK_AI_EXPECT.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')}
</ul>`
  return layout({
    title: `${ASK_AI_TITLE} · ${SHORT_NAME}`,
    description:
      'A prompt to paste into Claude, ChatGPT, Grok or Gemini so it can answer questions about the mammals of Kruger National Park from this guide.',
    origin,
    path: ASK_AI_PATH,
    nav: 'ask-ai',
    crumbs: crumbs([
      { href: ASK_AI_PATH, label: 'Ask your AI', current: true },
    ]),
    main,
  })
}

export const notFoundHtml = ({ origin, path }) =>
  layout({
    title: `Not found · ${SHORT_NAME}`,
    description: 'That page is not published.',
    origin,
    path,
    nav: '',
    crumbs: '',
    main: `
<h1>Not found</h1>
<p>No page is published at <code>${escapeHtml(path)}</code>.</p>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/orders">Orders</a></li>
<li><a href="/families">Families</a></li>
<li><a href="/species">Species</a></li>
</ul>`,
  })
