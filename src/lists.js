import { escapeHtml } from './escape.js'
import { formatRange } from './labels.js'
import { compareSortKeys } from './sort.js'

export const SORT_NOTE =
  'The HTML table sorts with ?sort= and dir=asc or dir=desc. The default is English, A to Z. Latin breaks ties. Empty values sort last.'

const textOf = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const midpoint = (range) => (range ? (range.low + range.high) / 2 : null)

const name = (kind) => ({
  id: 'en',
  label: 'English',
  value: (row) => textOf(row.en),
  html: (row) =>
    `<a href="/${kind}/${escapeHtml(row.slug)}">${escapeHtml(row.en)}</a>`,
  md: (row) => `[${row.en}](/${kind}/${row.slug}.md)`,
  rowHeader: true,
})

const AF = {
  id: 'af',
  label: 'Afrikaans',
  value: (row) => textOf(row.af),
  html: (row) => escapeHtml(row.af || '—'),
  md: (row) => row.af || '—',
}

const LATIN = {
  id: 'latin',
  label: 'Latin',
  value: (row) => textOf(row.latin),
  html: (row) => `<em>${escapeHtml(row.latin)}</em>`,
  md: (row) => `*${row.latin}*`,
}

const ORDER = {
  id: 'order',
  label: 'Order',
  value: (row) => textOf(row.order),
  html: (row) =>
    row.order && row.orderSlug
      ? `<a href="/order/${escapeHtml(row.orderSlug)}">${escapeHtml(row.order)}</a>`
      : escapeHtml(row.order || '—'),
  md: (row) =>
    row.order && row.orderSlug
      ? `[${row.order}](/order/${row.orderSlug}.md)`
      : row.order || '—',
}

const FAMILY = {
  id: 'family',
  label: 'Family',
  value: (row) => textOf(row.familyEn),
  html: (row) =>
    `<a href="/family/${escapeHtml(row.familySlug)}">${escapeHtml(row.familyEn)}</a>`,
  md: (row) => `[${row.familyEn}](/family/${row.familySlug}.md)`,
}

const POPULATION = {
  id: 'population',
  label: 'Kruger population',
  numeric: true,
  value: (row) => midpoint(row.population),
  html: (row) => escapeHtml(formatRange(row.population) || '—'),
  md: (row) => formatRange(row.population) || '—',
}

const SPECIES_COUNT = {
  id: 'species',
  label: 'Species',
  numeric: true,
  value: (row) => row.speciesCount,
  html: (row) => String(row.speciesCount),
  md: (row) => String(row.speciesCount),
}

const ORDER_NAME = {
  id: 'latin',
  label: 'Order',
  value: (row) => textOf(row.latin),
  html: (row) =>
    `<a href="/order/${escapeHtml(row.slug)}">${escapeHtml(row.latin)}</a>`,
  md: (row) => `[${row.latin}](/order/${row.slug}.md)`,
  rowHeader: true,
}

const FAMILY_COUNT = {
  id: 'families',
  label: 'Families',
  numeric: true,
  value: (row) => row.familyCount,
  html: (row) => String(row.familyCount),
  md: (row) => String(row.familyCount),
}

/** Orders have a Latin name only, so that is the name column. */
export const ORDER_COLUMNS = [ORDER_NAME, FAMILY_COUNT, SPECIES_COUNT]
/** The families and species of one order: the order is the page itself. */
export const ORDER_FAMILY_COLUMNS = [name('family'), AF, LATIN, SPECIES_COUNT]
export const ORDER_SPECIES_COLUMNS = [
  name('species'),
  AF,
  LATIN,
  FAMILY,
  POPULATION,
]
export const FAMILY_COLUMNS = [name('family'), AF, LATIN, ORDER, SPECIES_COUNT]
export const SPECIES_COLUMNS = [
  name('species'),
  AF,
  LATIN,
  FAMILY,
  ORDER,
  POPULATION,
]
/** The species of one family: the family and order are the page itself. */
export const FAMILY_SPECIES_COLUMNS = [name('species'), AF, LATIN, POPULATION]

/** Reads ?sort= and dir= from a URL. Anything else is the first column, A to Z. */
export const parseListQuery = (url, columns) => {
  const params = url instanceof URL ? url.searchParams : new URLSearchParams()
  const sort = params.get('sort')
  const dir = params.get('dir')
  if (!columns.some((column) => column.id === sort))
    return { sort: columns[0].id, dir: 'asc' }
  return { sort, dir: dir === 'desc' ? 'desc' : 'asc' }
}

export const sortRows = (rows, column, dir) =>
  rows
    .slice()
    .sort((a, b) =>
      compareSortKeys(
        { value: column.value(a), latin: a.latin },
        { value: column.value(b), latin: b.latin },
        dir,
      ),
    )

const sortAttr = (value) =>
  value == null || value === ''
    ? ''
    : typeof value === 'number'
      ? ` data-sort-value="${value}" data-sort-number`
      : ` data-sort-value="${escapeHtml(String(value))}"`

const headerHtml = (column, active, path) => {
  const current = active.sort === column.id
  const next = current && active.dir === 'asc' ? 'desc' : 'asc'
  const aria = current
    ? active.dir === 'desc'
      ? 'descending'
      : 'ascending'
    : 'none'
  const mark = current
    ? ` <span class="sort-mark" aria-hidden="true">${active.dir === 'desc' ? '▼' : '▲'}</span>`
    : ''
  return `<th scope="col"${column.numeric ? ' class="num"' : ''} aria-sort="${aria}"><a href="${escapeHtml(`${path}?sort=${column.id}&dir=${next}`)}">${escapeHtml(column.label)}${mark}</a></th>`
}

const cellHtml = (column, row) => {
  const attrs = `${column.numeric ? ' class="num"' : ''}${sortAttr(column.value(row))}`
  return column.rowHeader
    ? `<th scope="row"${attrs}>${column.html(row)}</th>`
    : `<td${attrs}>${column.html(row)}</td>`
}

/**
 * A sortable table. The server sorts by the query, so the links in the
 * header work with scripts off; src/client/app.js sorts in place when on.
 */
export const tableHtml = ({ caption, columns, rows, path, query, empty }) => {
  if (!rows.length) return `<p>${escapeHtml(empty)}</p>`
  const active = parseListQuery(query, columns)
  const column = columns.find((item) => item.id === active.sort)
  return `<div class="table-wrap">
<table class="species">
<caption>${escapeHtml(caption)}</caption>
<thead>
<tr>
${columns.map((item) => headerHtml(item, active, path)).join('\n')}
</tr>
</thead>
<tbody>
${sortRows(rows, column, active.dir)
  .map(
    (row) =>
      `<tr data-latin="${escapeHtml(row.latin)}">${columns.map((item) => cellHtml(item, row)).join('')}</tr>`,
  )
  .join('\n')}
</tbody>
</table>
</div>`
}

const mdCell = (value) =>
  String(value ?? '—')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')

/** The same table in Markdown, in the default order. */
export const tableMarkdown = ({ columns, rows, empty }) => {
  if (!rows.length) return empty
  return [
    `| ${columns.map((column) => column.label).join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...sortRows(rows, columns[0], 'asc').map(
      (row) =>
        `| ${columns.map((column) => mdCell(column.md(row))).join(' | ')} |`,
    ),
  ].join('\n')
}
