import { clientSrc, offlineSrc, styleSrc } from './client.js'
import { ARD_LINK } from './head.js'
import { ICON_LINKS } from './icon.js'
import { INSTALL_LINKS } from './offline-app.js'
import { OFFLINE_PATH } from './offline.js'
import { creditHtml, creditModel } from './credit.js'
import { escapeHtml, inlineText, safeHttpUrl } from './escape.js'
import { visibleText, visitorDetails } from './visible.js'
import {
  NO_OBSERVATION_REFS,
  isObservationRef,
  withoutObservationRefs,
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
  FACTS_COLUMNS,
  FACTS_INTRO,
  coverageSentence,
  factsTableRows,
} from './facts.js'
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
import { SEARCH_MAX, alternates, searchSuffix } from './route.js'
import { searchSample } from './search.js'
import { SITEMAP_INTRO } from './sitemap.js'

export const SITE_NAME = 'Mammals of Kruger National Park'
export const SHORT_NAME = 'KNP Mammals'
export const BIRDS_URL = 'https://birds.truter.world'
export const ABOUT =
  'The guide is written for people and for AI agents. Pages are rendered on the server. JavaScript is optional: sorting and photo zoom still work from the links and the page when it is off.'
export const UNPUBLISHED_SPECIES =
  'The details for this species have not been published yet.'
export const APPROXIMATE_LABEL = 'Approximate number in Kruger'

/**
 * The download panel. It stays hidden in a browser tab: the page script shows
 * it only when the site was opened from the home screen, and fills in the
 * options from /offline.json.
 */
const OFFLINE_PANEL = `<section id="offline-panel" class="offline-panel" aria-labelledby="offline-heading" data-manifest="${OFFLINE_PATH}.json" hidden>
<h2 id="offline-heading">Use without a signal</h2>
<p>Signal in much of the park is poor. Tick what to keep on this device. Untick it to remove it again.</p>
<ul id="offline-rows" class="offline-rows"></ul>
<p id="offline-pages" class="offline-note"></p>
<p id="offline-status" class="visually-hidden" role="status" aria-live="polite"></p>
</section>`

export const progressSentence = (counts) =>
  `The list has ${counts.species} species in ${counts.families} families and ${counts.orders} orders. ${counts.researched} of the species have a full account so far; the rest are listed by name.`

const NAV = [
  ['identify-photo', '/identify/photo', 'Identify by photo'],
  ['identify-sound', '/identify/sound', 'Identify by sound'],
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

const SEARCH_ICON =
  '<svg class="site-search-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M10.68 11.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/></svg>'

const searchFormHtml = (query) =>
  `<form class="site-search" role="search" method="get" action="/search">
<label class="visually-hidden" for="site-search-q">Search mammals by English, Afrikaans or Latin name</label>
${SEARCH_ICON}
<input id="site-search-q" type="search" name="q" value="${escapeHtml(query)}" placeholder="Search mammals" maxlength="${SEARCH_MAX}" autocomplete="off" spellcheck="false" enterkeyhint="search">
<span class="site-search-hint" aria-hidden="true">Type <kbd>/</kbd> to search</span>
<button class="site-search-submit" type="submit">Search</button>
</form>`

export const layout = ({
  title,
  description,
  origin,
  path,
  nav,
  crumbs: crumbHtml,
  main,
  searchQuery = '',
  noindex = false,
  scripts = [],
}) => {
  const alts = alternates(path, searchSuffix(searchQuery))
  const onSitemap = path === '/sitemap' ? ' aria-current="page"' : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${escapeHtml(origin + alts.html)}">
<link rel="alternate" type="text/markdown" href="${escapeHtml(alts.md)}" title="Markdown">
<link rel="alternate" type="application/json" href="${escapeHtml(alts.json)}" title="JSON">
${ARD_LINK}
${ICON_LINKS}
${INSTALL_LINKS}
<link rel="stylesheet" href="${styleSrc}">
<script type="module" defer src="${clientSrc}"></script>
<script type="module" defer src="${offlineSrc}"></script>
${scripts.map((src) => `<script type="module" defer src="${escapeHtml(src)}"></script>\n`).join('')}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap mast">
<div class="brand">
<p class="site-name"><a href="/">${SHORT_NAME}</a></p>
<p class="site-tag">Kruger National Park</p>
</div>
${searchFormHtml(searchQuery)}
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
<p><a href="/facts">Facts</a> · <a href="${BIRDS_URL}" title="Switch to our sister site">Birds</a> · <a href="/credits">Credits</a> · <a href="/llms.txt">llms.txt</a> · <a href="/sitemap"${onSitemap}>Sitemap</a> · <a href="${escapeHtml(alts.md)}">Markdown</a> · <a href="${escapeHtml(alts.json)}">JSON</a></p>
</div>
</div>
</footer>
</body>
</html>
`
}

const CAMERA_ICON =
  '<svg class="home-action-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="40" height="40"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3a1 1 0 0 0 .8-.4l1-1.4a1.5 1.5 0 0 1 1.2-.6h4.4a1.5 1.5 0 0 1 1.2.6l1 1.4a1 1 0 0 0 .8.4h2.3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5ZM15.75 12.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>'

const MICROPHONE_ICON =
  '<svg class="home-action-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="40" height="40"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3ZM5.75 11.25a6.25 6.25 0 0 0 12.5 0M12 17.5v3M8.75 20.5h6.5"/></svg>'

/** The two recognisers, first on the home page. */
export const HOME_IDENTIFY = [
  {
    href: '/identify/photo',
    name: 'Identify by photo',
    description:
      'Take or open a photo of a mammal and see the closest matches.',
    icon: CAMERA_ICON,
  },
  {
    href: '/identify/sound',
    name: 'Identify by sound',
    description: 'Record a call and hear which mammal it may be.',
    icon: MICROPHONE_ICON,
  },
]

const identifyActionHtml = (action) =>
  `<li><a class="home-action" href="${action.href}">${action.icon}<span class="home-action-copy"><span class="home-action-title">${escapeHtml(action.name)}</span><span class="home-action-text">${escapeHtml(action.description)}</span></span></a></li>`

export const homeHtml = (doc, { origin }) => {
  const { counts } = doc
  const main = `
<h1>${SITE_NAME}</h1>
<ul class="home-actions">
${HOME_IDENTIFY.map(identifyActionHtml).join('\n')}
</ul>
<nav aria-label="Browse the guide">
<ul class="browse-links">
<li><a href="/orders">Orders</a> <span>${counts.orders}</span></li>
<li><a href="/families">Families</a> <span>${counts.families}</span></li>
<li><a href="/species">Species</a> <span>${counts.species}</span></li>
<li><a href="/facts">Facts</a> <span>${counts.species}</span></li>
<li><a href="/credits">Credits</a></li>
<li><a href="/search">Search</a></li>
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
<p>${escapeHtml(ABOUT)}</p>
${OFFLINE_PANEL}`
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

export const factsPageHtml = (doc, { origin, url }) =>
  layout({
    title: `Facts · ${SHORT_NAME}`,
    description:
      'Size, mass, Kruger status and conservation status for each mammal in this guide.',
    origin,
    path: '/facts',
    nav: '',
    crumbs: crumbs([{ label: 'Facts', current: true }]),
    main: `
<h1>Facts</h1>
<p>${escapeHtml(FACTS_INTRO)}</p>
<p>${escapeHtml(coverageSentence(doc))}</p>
${tableHtml({
  caption: 'Facts',
  columns: FACTS_COLUMNS,
  rows: factsTableRows(doc),
  path: '/facts',
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
  const item = withoutObservationRefs(doc.slug, image)
  const shown = mediaSrc(item, 'images')
  const src = shown?.src || ''
  const detail = [viewLabel(item?.view), item?.caption]
    .filter(Boolean)
    .map((part) => escapeHtml(sentence(part)))
    .join(' ')
  const caption = [
    item?.aiGenerated ? '<span class="ai-label">AI-generated image</span>' : '',
    detail,
    creditHtml(creditModel(item, 'image', shown), src),
  ]
    .filter(Boolean)
    .join(' ')
  const alt = item?.alt || `${doc.en}: ${viewLabel(item?.view)}`
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

const PLAY_ICON =
  '<svg class="call-play-glyph call-play-glyph-play" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.2v13.6L19 12z"/></svg>'

const STOP_ICON =
  '<svg class="call-play-glyph call-play-glyph-stop" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false"><rect fill="currentColor" x="6" y="6" width="12" height="12" rx="1.5"/></svg>'

/** "Play call", "Play alarm", and "Play call 2 of 3" when a call has several clips. */
export const playLabel = (type, place = 0, of = 1) => {
  const known = callTypeLabel(type)
  const word = known === 'Other' ? 'call' : known.toLowerCase()
  return `Play ${word}${of > 1 ? ` ${place + 1} of ${of}` : ''}`
}

/**
 * One large play and stop control for a clip. The button stays hidden until
 * the page script connects it; with the script off, the browser's own audio
 * control is what a reader gets. preload="none" keeps the file from being
 * fetched until someone plays it.
 */
export const playerHtml = (src, label, name = '') => {
  const stop = label.replace(/^Play/, 'Stop')
  return `<div class="call-player">
<button type="button" class="call-play" hidden aria-pressed="false">
${PLAY_ICON}${STOP_ICON}<span class="call-play-label" data-play="${escapeHtml(label)}" data-stop="${escapeHtml(stop)}">${escapeHtml(label)}</span>${name ? `<span class="visually-hidden">, ${escapeHtml(name)}</span>` : ''}
<span class="call-play-meter" aria-hidden="true"><span class="call-play-meter-bar"></span></span>
</button>
<audio controls preload="none" src="${escapeHtml(src)}"></audio>
<p class="call-play-status" role="status"></p>
</div>`
}

const recordingHtml = (recording, { label, name, slug }) => {
  const item = withoutObservationRefs(slug, recording)
  const shown = mediaSrc(item, 'audio')
  const src = shown?.src || ''
  const model = creditModel(item, 'recording', shown, {
    catalogue: !NO_OBSERVATION_REFS.has(slug),
  })
  return `<div class="recording">${src ? playerHtml(src, label, name) : ''}${creditHtml(model, src)}</div>`
}

/** True when a call has text a reader should see, or a clip to play. */
const callShown = (call) =>
  readerCallText(call?.description) !== '' ||
  listed(call?.recordings).length > 0

const callsHtml = (calls, doc) => {
  const shown = calls.filter(callShown)
  return shown.length === 0
    ? ''
    : `<h2 id="calls">Calls</h2>
<ul class="call-list">
${shown
  .map((call) => {
    const text = readerCallText(call?.description)
    const clips = listed(call?.recordings)
    return `<li class="call-item"><p class="call-copy"><span class="call-type">${escapeHtml(callTypeLabel(call?.type))}</span>${text ? ` ${escapeHtml(text)}` : ''}</p>${clips
      .map((clip, place) =>
        recordingHtml(clip, {
          label: playLabel(call?.type, place, clips.length),
          name: doc.en,
          slug: doc.slug,
        }),
      )
      .join('')}</li>`
  })
  .join('\n')}
</ul>`
}

/** A way to the calls from the top of the page, when a clip can play. */
const hearCallHtml = (details) =>
  listed(details?.calls).some((call) =>
    listed(call?.recordings).some((clip) => mediaSrc(clip, 'audio')),
  )
    ? '<p class="hear-call"><a href="#calls">Hear its call</a></p>'
    : ''

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
  details = visitorDetails(details)
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
${callsHtml(listed(details.calls), doc)}
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
${hearCallHtml(details)}
</div>
${details ? publishedSpeciesHtml(doc, details) : `<p>${UNPUBLISHED_SPECIES}</p>\n${evidenceHtml(doc)}`}`
  return layout({
    title: `${doc.en} (${doc.latin}) · ${SHORT_NAME}`,
    description: inlineText(visibleText(details?.summary) || doc.en),
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

const CREDIT_CALL = {
  call: 'Call',
  alarm: 'Alarm',
  contact: 'Contact',
  other: 'Other',
}

const licencePhrase = (item, missing) => {
  const url = safeHttpUrl(item?.licenceUrl)
  const name = typeof item?.licence === 'string' ? item.licence.trim() : ''
  if (!name && !url) return missing
  const label = escapeHtml(name || 'Licence terms')
  const linked = url ? `<a href="${escapeHtml(url)}">${label}</a>` : label
  return `Licence: ${linked}.`
}

const sourcePhrase = (value) => {
  const text = typeof value === 'string' ? value.trim() : ''
  const href = safeHttpUrl(text)
  if (!text) return 'Source not recorded.'
  if (!href) return `Source: ${escapeHtml(text)}.`
  return `Source: <a href="${escapeHtml(href)}">${escapeHtml(href)}</a>.`
}

const creditLine = (item, kind, slug = '') => {
  const ai =
    item?.aiGenerated === true
      ? `<span class="ai-label">${kind === 'recording' ? 'AI-generated recording' : 'AI-generated image'}</span>. `
      : ''
  const author = item?.author
    ? `Author: ${escapeHtml(item.author)}. `
    : 'Author not recorded. '
  const callType =
    typeof item?.callType === 'string' && item.callType.trim()
      ? `${escapeHtml(CREDIT_CALL[item.callType.trim()] || item.callType.trim())}. `
      : ''
  const number =
    kind === 'recording' && !NO_OBSERVATION_REFS.has(slug)
      ? catalogueNumber(item?.key)
      : ''
  const catalogue = number
    ? ` xeno-canto catalogue number: ${escapeHtml(number)}.`
    : ''
  const sourceUrl =
    NO_OBSERVATION_REFS.has(slug) && isObservationRef(item?.sourceUrl)
      ? ''
      : item?.sourceUrl
  return `${callType}${ai}${author}${licencePhrase(item, 'Licence not recorded.')} ${sourcePhrase(sourceUrl)}${catalogue}`
}

const citationHtml = (source) => {
  const url = safeHttpUrl(source?.url)
  const title = escapeHtml(source?.title || 'Untitled source')
  const bits = [
    url ? `<a href="${escapeHtml(url)}">${title}</a>` : title,
    source?.publisher ? escapeHtml(source.publisher) : '',
    source?.year != null ? escapeHtml(String(source.year)) : '',
  ].filter(Boolean)
  return bits.join('. ')
}

const CREDIT_HEADING = {
  image: 'Photographs',
  recording: 'Recordings',
  source: 'Sources',
}

const creditList = (items, kind, slug = '') =>
  !items.length
    ? ''
    : `<h4>${CREDIT_HEADING[kind]}</h4>
<ul>
${items
  .map(
    (item) =>
      `<li>${kind === 'source' ? citationHtml(item) : creditLine(item, kind, slug)}</li>`,
  )
  .join('\n')}
</ul>`

const dataSourceHtml = (source) => {
  const url = safeHttpUrl(source?.url)
  const name = escapeHtml(source?.name || 'Untitled source')
  const title = url ? `<a href="${escapeHtml(url)}">${name}</a>` : name
  const links = listed(source?.links)
    .map((link) => {
      const href = safeHttpUrl(link?.url)
      return href
        ? `<a href="${escapeHtml(href)}">${escapeHtml(link.label || href)}</a>`
        : ''
    })
    .filter(Boolean)
  const also = links.length ? `<p>Also: ${links.join('. ')}.</p>` : ''
  return `<li>
<p>${title}</p>
<p>${escapeHtml(source?.usedFor || '')}</p>
${also}
<p>${licencePhrase(source, 'Licence not recorded.')}</p>
</li>`
}

const speciesCreditHtml = (group) => `<section>
<h3><a href="/species/${escapeHtml(group.slug)}">${escapeHtml(group.commonName || group.scientificName)}</a> <em>${escapeHtml(group.scientificName || '')}</em></h3>
${creditList(listed(group.images), 'image', group.slug)}
${creditList(listed(group.recordings), 'recording', group.slug)}
${creditList(listed(group.sources), 'source')}
</section>`

const siteHtml = (site) => {
  if (!site) return ''
  const repo = safeHttpUrl(site.repository)
  const repoLink = repo
    ? `<a href="${escapeHtml(repo)}">${escapeHtml(repo)}</a>`
    : escapeHtml(site.repository || '')
  const handle = typeof site.maintainer === 'string' ? site.maintainer : ''
  const maintainer = /^[A-Za-z0-9-]+$/.test(handle)
    ? `<a href="https://github.com/${escapeHtml(handle)}">${escapeHtml(handle)}</a>`
    : escapeHtml(handle)
  return `<h2>This site</h2>
<p>The code is at ${repoLink}. ${licencePhrase(site, 'Licence not recorded.')}</p>
<p>Built and maintained by ${maintainer}.</p>
${site.palette ? `<p>${escapeHtml(site.palette)}</p>` : ''}
${site.affiliation ? `<p>${escapeHtml(site.affiliation)}</p>` : ''}`
}

const licenceCounts = (licences) =>
  Object.entries(licences ?? {})
    .map(
      ([name, n]) =>
        `${n.toLocaleString('en-GB')} ${name.toUpperCase().replace(/^CC-/, 'CC ')}`,
    )
    .join(', ')

const linkTo = (url, label) => {
  const href = safeHttpUrl(url)
  return href
    ? `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
    : escapeHtml(label)
}

/** The recognisers: training data, noise, base models and licence. Left out when there are none. */
export const recognisersHtml = (rec) => {
  if (!rec) return ''
  const items = []
  if (rec.photos?.count)
    items.push(
      `<li>Photo recogniser: trained on ${rec.photos.count.toLocaleString('en-GB')} photos of ${rec.photos.species} species by ${rec.photos.photographers.toLocaleString('en-GB')} photographers on ${linkTo(rec.photos.sourceUrl, rec.photos.source || 'iNaturalist')} (${escapeHtml(licenceCounts(rec.photos.licences))}). ${rec.photos.list ? `${linkTo(rec.photos.list, 'Every photo, its photographer and its licence')}.` : ''}</li>`,
    )
  if (rec.sounds?.count)
    items.push(
      `<li>Sound recogniser: trained on ${rec.sounds.count.toLocaleString('en-GB')} recordings of ${rec.sounds.species} species by ${rec.sounds.recordists.toLocaleString('en-GB')} recordists on iNaturalist and xeno-canto (${escapeHtml(licenceCounts(rec.sounds.licences))}). ${rec.sounds.list ? `${linkTo(rec.sounds.list, 'Every recording, its recordist and its licence')}.` : ''}</li>`,
    )
  for (const item of listed(rec.noise))
    items.push(
      `<li>${linkTo(item.url, item.name)}, ${escapeHtml(item.authors)} (${escapeHtml(String(item.year))}). ${escapeHtml(item.licence)}. ${escapeHtml(item.usedFor)}.</li>`,
    )
  for (const model of listed(rec.models))
    if (model.base?.name)
      items.push(
        `<li><a href="${escapeHtml(model.page)}">${escapeHtml(model.name)}</a> built on ${linkTo(model.base.url, model.base.name)}${model.base.authors ? ` by ${escapeHtml(model.base.authors)}` : ''} (${escapeHtml(model.base.licence)}).</li>`,
      )
  if (rec.runtime?.name)
    items.push(
      `<li>Both run in the browser with ${linkTo(rec.runtime.url, `${rec.runtime.name} ${rec.runtime.version}`)} (${escapeHtml(rec.runtime.licence)}).</li>`,
    )
  const licence = rec.licence?.name
    ? `<p>The recognisers are released under ${linkTo(rec.licence.url, rec.licence.name)}. ${listed(
        rec.models,
      )
        .map(
          (model) =>
            `<a href="${escapeHtml(model.licenceFile)}">${escapeHtml(model.name)} licence</a>`,
        )
        .join(' · ')}</p>`
    : ''
  return `<h2 id="recognisers">Recognisers</h2>
<p>Thank you to every photographer and recordist whose work trained the photo and sound recognisers.</p>
<ul>
${items.join('\n')}
</ul>
${licence}
${rec.note ? `<p>${escapeHtml(rec.note)}</p>` : ''}
${rec.bats ? `<p>${escapeHtml(rec.bats)}</p>` : ''}`
}

export const creditsHtml = (doc, { origin }) => {
  const sources = listed(doc?.dataSources)
  const groups = listed(doc?.species)
  const images = groups.flatMap((group) => listed(group.images))
  const recordings = groups.flatMap((group) => listed(group.recordings))
  const note = doc?.mediaNote
    ? `<p>${escapeHtml(doc.mediaNote)}</p>`
    : groups.length
      ? ''
      : '<p>No photos or recordings have been added so far.</p>'
  const main = `
<h1>Credits</h1>
<p>Checklists and references used for the family and species lists, the taxonomy those names follow, and credit for every photograph, recording and cited source.</p>
<p>This page lists ${imageCountPhrase(images)}, ${countPhrase(recordings.length, 'recording', 'recordings')}, and ${countPhrase(groups.length, 'species section', 'species sections')}.</p>
<h2>Data sources</h2>
${sources.length ? `<ol>\n${sources.map(dataSourceHtml).join('\n')}\n</ol>` : '<p>No data sources are recorded.</p>'}
<h2>Taxonomy</h2>
<p><strong>${escapeHtml(doc?.taxonomy?.authority || '')}</strong>. ${escapeHtml(doc?.taxonomy?.summary || '')}</p>
<h2>Photographs and recordings and cited sources</h2>
${note}
${groups.map(speciesCreditHtml).join('\n')}
${recognisersHtml(doc?.recognisers)}
${siteHtml(doc?.site)}`
  return layout({
    title: `Credits · ${SHORT_NAME}`,
    description:
      'Sources, taxonomy, and credits for the mammals of Kruger National Park.',
    origin,
    path: '/credits',
    nav: '',
    crumbs: crumbs([{ label: 'Credits', current: true }]),
    main,
  })
}

/**
 * The sample photograph of a species result. With no file, or once a file
 * fails to load, a plain note holds the picture's place so the cards keep
 * one shape. The page script switches to the note when the image fails.
 */
const searchPhotoHtml = (image) => {
  const ai = image?.ai
    ? '<span class="ai-label">AI-generated image</span> '
    : ''
  const credit = image
    ? `<figcaption>${ai}${creditHtml(image.credit, image.src)}</figcaption>`
    : ''
  return `<figure class="search-photo${image ? '' : ' is-missing'}">
${image ? `<img draggable="false" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async">` : ''}
<p class="search-photo-missing">${image ? 'Photograph unavailable.' : 'No photograph yet.'}</p>
${credit}
</figure>`
}

/** The sample call: the same large play and stop control the species page uses. */
const searchCallHtml = (result, call) => {
  if (!call) return ''
  const name = result.englishName || result.scientificName
  const ai = call.ai
    ? '<span class="ai-label">AI-generated recording</span> '
    : ''
  return `<div class="search-call">${playerHtml(call.src, playLabel(call.type), name)}${ai}${creditHtml(call.credit, call.src)}</div>`
}

const resultHtml = (result) => {
  const path = new URL(result.pages.html).pathname
  const afrikaans = result.afrikaansName
    ? ` · <span class="afrikaans">${escapeHtml(result.afrikaansName)}</span>`
    : ''
  const sample = result.kind === 'species' ? searchSample(result) : null
  return `<li class="search-result">
${sample ? searchPhotoHtml(sample.image) : ''}<p class="kicker">${result.kind === 'family' ? 'Family' : 'Species'}</p>
<h3><a href="${escapeHtml(path)}">${escapeHtml(result.englishName || result.scientificName)}</a></h3>
<p class="search-names"><span class="latin">${escapeHtml(result.scientificName)}</span>${afrikaans}</p>
${sample ? searchCallHtml(result, sample.call) : ''}</li>`
}

export const renderSearchHtml = ({ origin, query, found }) => {
  const quoted = `“${query}”`
  const count = found
    ? `${found.total} ${found.total === 1 ? 'result' : 'results'} for ${quoted}`
    : ''
  const more =
    found && found.total > found.results.length
      ? `<p>Showing the first ${found.results.length}. Add another word to narrow the search.</p>`
      : ''
  const body = !query
    ? '<p>Type an English, Afrikaans or Latin name, or a family, into the search box.</p>'
    : found.total === 0
      ? `<h2 id="search-count">${escapeHtml(count)}</h2>
<p class="search-empty">No mammal matched ${escapeHtml(quoted)}. Check the spelling, try fewer words, or browse the <a href="/species">species</a> and <a href="/families">families</a>.</p>`
      : `<h2 id="search-count">${escapeHtml(count)}</h2>
${more}
<ol class="search-results" aria-labelledby="search-count">
${found.results.map(resultHtml).join('\n')}
</ol>`
  return layout({
    title: query
      ? `Search: ${query} · ${SHORT_NAME}`
      : `Search · ${SHORT_NAME}`,
    description: 'Search the mammals of Kruger National Park by name.',
    origin,
    path: '/search',
    nav: '',
    crumbs: crumbs([{ href: '/search', label: 'Search', current: true }]),
    main: `
<h1>Search</h1>
${body}`,
    searchQuery: query,
    noindex: true,
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
<li><a href="/sitemap">Sitemap</a></li>
</ul>`,
  })

const sitemapLatin = (latin) =>
  latin ? ` <span class="sitemap-latin">${escapeHtml(latin)}</span>` : ''

const sitemapLink = (item) =>
  `<a href="${escapeHtml(item.href)}"${item.href === '/sitemap' ? ' aria-current="page"' : ''}>${escapeHtml(item.name)}</a>${sitemapLatin(item.latin)}`

const sitemapNest = (items) =>
  items?.length
    ? `<ul class="sitemap-nest">\n${items
        .map(
          (item) =>
            `<li>${sitemapLink(item)}${sitemapNest(item.children)}</li>`,
        )
        .join('\n')}\n</ul>`
    : ''

export const renderSitemapHtml = (entries, { origin }) =>
  layout({
    title: `Sitemap · ${SHORT_NAME}`,
    description: SITEMAP_INTRO,
    origin,
    path: '/sitemap',
    nav: '',
    crumbs: crumbs([{ label: 'Sitemap', current: true }]),
    main: `
<h1>Sitemap</h1>
<p>${escapeHtml(SITEMAP_INTRO)} <a href="/sitemap.xml">Sitemap XML</a> lists each HTML page once.</p>
<nav aria-label="Sitemap">
<ol class="sitemap">
${entries.map((item) => `<li>${sitemapLink(item)}${sitemapNest(item.children)}</li>`).join('\n')}
</ol>
</nav>`,
  })
