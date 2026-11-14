import { escapeHtml, safeHttpUrl } from './escape.js'
import { STYLE_PATH, alternates } from './route.js'

export const SITE_NAME = 'Mammals of Kruger National Park'
export const SHORT_NAME = 'Mammals of KNP'
export const STATUS_NOTE =
  'This guide is being researched. So far it lists the families and species of the park by name; species accounts will follow.'

const NAV = [
  { href: '/', label: 'Families' },
  { href: '/species', label: 'Species' },
]

const dash = (value) => (value ? escapeHtml(value) : '–')
const latin = (value) => `<span class="latin">${escapeHtml(value)}</span>`

const layout = ({ title, path, origin, main }) => {
  const alts = alternates(path)
  const nav = NAV.map(
    ({ href, label }) =>
      `<a href="${href}"${href === path ? ' aria-current="page"' : ''}>${label}</a>`,
  ).join('')
  const pageTitle =
    path === '/' ? SITE_NAME : `${escapeHtml(title)} · ${SHORT_NAME}`
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${pageTitle}</title>
<link rel="stylesheet" href="${STYLE_PATH}">
<link rel="canonical" href="${origin}${alts.html}">
<link rel="alternate" type="text/markdown" href="${alts.md}">
<link rel="alternate" type="application/json" href="${alts.json}">
</head>
<body>
<header class="site-header"><div class="wrap">
<a class="site-title" href="/">${SHORT_NAME}</a>
<nav class="site-nav" aria-label="Site">${nav}</nav>
</div></header>
<main class="wrap">
${main}
</main>
<footer class="site-footer"><div class="wrap">
<p>${SITE_NAME}. A sister guide to <a href="https://birds.truter.world">Birds of Kruger National Park</a>.</p>
<p>This page as <a href="${alts.md}">Markdown</a> or <a href="${alts.json}">JSON</a>.</p>
</div></footer>
</body>
</html>
`
}

const table = (head, rows) => `<div class="table-scroll"><table>
<thead><tr>${head.map((cell) => (cell.count ? `<th scope="col" class="count">${cell.label}</th>` : `<th scope="col">${cell}</th>`)).join('')}</tr></thead>
<tbody>
${rows.join('\n')}
</tbody>
</table></div>`

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`

const speciesRow = (species, withFamily) =>
  `<tr><td><a href="/species/${escapeHtml(species.slug)}">${escapeHtml(species.en)}</a></td><td>${dash(species.af)}</td><td>${latin(species.latin)}</td>${
    withFamily
      ? `<td><a href="/family/${escapeHtml(species.familySlug)}">${escapeHtml(species.family)}</a></td><td>${escapeHtml(species.order)}</td>`
      : ''
  }</tr>`

export const homeHtml = (doc, ctx) => {
  const { counts, orders } = doc
  const sections = orders.map(
    (order) => `<h2>${escapeHtml(order.order)}</h2>
${table(
  ['English', 'Afrikaans', 'Latin', { label: 'Species', count: true }],
  order.families.map(
    (family) =>
      `<tr><td><a href="/family/${escapeHtml(family.slug)}">${escapeHtml(family.en)}</a></td><td>${dash(family.af)}</td><td>${latin(family.latin)}</td><td class="count">${family.speciesCount}</td></tr>`,
  ),
)}`,
  )
  return layout({
    ...ctx,
    title: SITE_NAME,
    main: `<h1>${SITE_NAME}</h1>
<p class="lede">${plural(counts.species, 'species', 'species')} in ${plural(counts.families, 'family', 'families')} and ${plural(counts.orders, 'order', 'orders')}.</p>
<div class="note"><p>${STATUS_NOTE}</p></div>
${sections.join('\n')}`,
  })
}

export const speciesListHtml = (doc, ctx) =>
  layout({
    ...ctx,
    title: 'Species',
    main: `<h1>Species</h1>
<p class="lede">${plural(doc.species.length, 'species', 'species')}, in checklist order.</p>
${table(
  ['English', 'Afrikaans', 'Latin', 'Family', 'Order'],
  doc.species.map((species) => speciesRow(species, true)),
)}`,
  })

const sourceList = (sources) => {
  const links = (Array.isArray(sources) ? sources : [])
    .map(safeHttpUrl)
    .filter(Boolean)
  if (links.length === 0) return ''
  return `<h2>Sources</h2>
<ul>
${links.map((href) => `<li><a href="${escapeHtml(href)}">${escapeHtml(href)}</a></li>`).join('\n')}
</ul>`
}

export const familyHtml = (doc, ctx) =>
  layout({
    ...ctx,
    title: doc.en,
    main: `<h1>${escapeHtml(doc.en)}</h1>
<p class="lede">${latin(doc.latin)} · ${escapeHtml(doc.order)}${doc.af ? ` · ${escapeHtml(doc.af)}` : ''}</p>
<h2>${plural(doc.species.length, 'species', 'species')}</h2>
${table(
  ['English', 'Afrikaans', 'Latin'],
  doc.species.map((species) => speciesRow(species, false)),
)}
${sourceList(doc.sources)}`,
  })

export const speciesHtml = (doc, ctx) => {
  const evidence = doc.inclusionEvidence || {}
  const facts = [
    ['Afrikaans', dash(doc.af)],
    [
      'Family',
      `<a href="/family/${escapeHtml(doc.familySlug)}">${escapeHtml(doc.family)}</a>`,
    ],
    ['Order', escapeHtml(doc.order)],
    [
      'SANParks 2011 checklist',
      evidence.sanparks2011 === true
        ? 'Listed'
        : evidence.sanparks2011 === false
          ? 'Not listed'
          : 'Not recorded',
    ],
    [
      'iNaturalist research-grade records in the park',
      Number.isInteger(evidence.inatResearchGrade)
        ? String(evidence.inatResearchGrade)
        : 'Not recorded',
    ],
  ]
  const summary =
    typeof doc.details?.summary === 'string'
      ? `<p>${escapeHtml(doc.details.summary)}</p>`
      : `<div class="note"><p>${STATUS_NOTE}</p></div>`
  const notes = Array.isArray(doc.notes) ? doc.notes : []
  return layout({
    ...ctx,
    title: doc.en,
    main: `<h1>${escapeHtml(doc.en)}</h1>
<p class="lede">${latin(doc.latin)}</p>
${summary}
<dl class="facts">
${facts.map(([term, value]) => `<dt>${term}</dt><dd>${value}</dd>`).join('\n')}
</dl>
${
  notes.length > 0
    ? `<h2>Research notes</h2>
<ul>
${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('\n')}
</ul>`
    : ''
}`,
  })
}

export const notFoundHtml = (ctx) =>
  layout({
    ...ctx,
    title: 'Not found',
    main: `<h1>Not found</h1>
<p>There is no page at this address. Try the <a href="/">list of families</a> or the <a href="/species">list of species</a>.</p>`,
  })
