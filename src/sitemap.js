import { escapeXml } from './escape.js'

/**
 * Top-level HTML pages, in sitemap order. `group` inserts the taxon
 * pages built from the indexes. A later page is one new line.
 * /search stays off this list: a query URL is not a page to crawl.
 */
export const SITEMAP_ROUTES = [
  { name: 'Home', href: '/' },
  { name: 'Sitemap', href: '/sitemap' },
  { name: 'Orders', href: '/orders', group: 'orders' },
  { name: 'Families', href: '/families', group: 'families' },
  { name: 'Species', href: '/species', group: 'species' },
]

export const SITEMAP_INTRO =
  'Every page in the guide. Orders are listed by their Latin name. Families are listed by English name, with the species of that family underneath. The species list is every mammal once, by English name.'

const stored = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

const isDocument = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const byName = (a, b) =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) ||
  a.latin.localeCompare(b.latin, 'en', { sensitivity: 'base' })

/** Same keys as the request log in src/worker.js. */
const gap = (path, error) => {
  console.error(JSON.stringify({ message: 'sitemap gap', path, error }))
}

const list = (doc, key) => (Array.isArray(doc?.[key]) ? doc[key] : [])

const taxon = (row, section, hrefFor, seen) => {
  const slug = stored(row?.slug)
  const latin = stored(row?.latin)
  const en = stored(row?.en)
  if (!slug && !latin && !en) {
    gap(section, 'slug, Latin, and English are missing')
    return null
  }
  const name = en || latin
  if (!slug || !name) {
    gap(
      slug || section,
      !slug ? 'slug is missing' : 'English and Latin are missing',
    )
    return null
  }
  const href = hrefFor(slug)
  if (seen.has(href)) {
    gap(href, 'repeated slug')
    return null
  }
  seen.add(href)
  return { name, latin, href, slug }
}

const entry = (name, href, { latin = '', children } = {}) => {
  const node = { name, href }
  if (latin) node.latin = latin
  if (children?.length) node.children = children
  return node
}

/**
 * Orders, families, and species from the two indexes.
 * A missing index is logged and contributes no taxa.
 */
export const buildSitemap = (familiesIndex, speciesIndex) => {
  if (!isDocument(familiesIndex)) gap('index/families', 'missing')
  if (!isDocument(speciesIndex)) gap('index/species', 'missing')
  const familiesDoc = isDocument(familiesIndex) ? familiesIndex : null
  const speciesDoc = isDocument(speciesIndex) ? speciesIndex : null

  const seenSpecies = new Set()
  const species = []
  const speciesByFamily = new Map()
  for (const row of list(speciesDoc, 'species')) {
    const node = taxon(
      row,
      'species',
      (slug) => `/species/${slug}`,
      seenSpecies,
    )
    if (!node) continue
    species.push(node)
    const familySlug = stored(row?.familySlug)
    const bucket = speciesByFamily.get(familySlug)
    if (bucket) bucket.push(node)
    else speciesByFamily.set(familySlug, [node])
  }

  const seenFamilies = new Set()
  const families = []
  for (const row of list(familiesDoc, 'families')) {
    const node = taxon(row, 'family', (slug) => `/family/${slug}`, seenFamilies)
    if (!node) continue
    families.push({
      ...node,
      orderSlug: stored(row?.orderSlug),
      species: (speciesByFamily.get(node.slug) ?? []).slice().sort(byName),
    })
  }
  families.sort(byName)

  const seenOrders = new Set()
  const orders = []
  for (const row of list(familiesDoc, 'orders')) {
    const node = taxon(
      { slug: row?.slug, latin: row?.latin },
      'order',
      (slug) => `/order/${slug}`,
      seenOrders,
    )
    if (!node) continue
    orders.push({
      ...node,
      families: families
        .filter((family) => family.orderSlug === node.slug)
        .map(({ name, latin, href }) => ({ name, latin, href }))
        .sort(byName),
    })
  }
  orders.sort(byName)
  species.sort(byName)
  return { orders, families, species }
}

const groupChildren = (route, tree) => {
  if (route.group === 'orders')
    return tree.orders.map((order) =>
      entry(order.name, order.href, {
        children: order.families.map((family) =>
          entry(family.name, family.href, { latin: family.latin }),
        ),
      }),
    )
  if (route.group === 'families')
    return tree.families.map((family) =>
      entry(family.name, family.href, {
        latin: family.latin,
        children: family.species.map((species) =>
          entry(species.name, species.href, { latin: species.latin }),
        ),
      }),
    )
  if (route.group === 'species')
    return tree.species.map((species) =>
      entry(species.name, species.href, { latin: species.latin }),
    )
  return undefined
}

export const sitemapEntries = (tree) =>
  SITEMAP_ROUTES.map((route) =>
    entry(route.name, route.href, { children: groupChildren(route, tree) }),
  )

const pushPath = (paths, seen, href) => {
  if (!href || seen.has(href)) return
  seen.add(href)
  paths.push(href)
}

/** HTML paths, one each, in sitemap order. */
export const sitemapPaths = (tree) => {
  const paths = []
  const seen = new Set()
  for (const route of SITEMAP_ROUTES) {
    pushPath(paths, seen, route.href)
    if (route.group === 'orders') {
      for (const order of tree.orders) pushPath(paths, seen, order.href)
    } else if (route.group === 'families') {
      for (const family of tree.families) {
        pushPath(paths, seen, family.href)
        for (const species of family.species)
          pushPath(paths, seen, species.href)
      }
    } else if (route.group === 'species') {
      for (const species of tree.species) pushPath(paths, seen, species.href)
    }
  }
  return paths
}

/**
 * Records have no updated timestamp. Deploys set DATA_PUBLISHED_AT
 * (milliseconds since epoch) when KV is published, and that UTC date is
 * lastmod for every URL. When the binding is missing, as in local tests,
 * use the UTC date of main at c11cb8cbd786.
 */
export const SITEMAP_LASTMOD_FALLBACK = '2026-11-22'

/** A W3C date (YYYY-MM-DD) from a publish timestamp, or the fallback. */
export const sitemapLastmod = (publishedAt) => {
  const ms = Number(publishedAt)
  if (Number.isFinite(ms) && ms > 0)
    return new Date(ms).toISOString().slice(0, 10)
  return SITEMAP_LASTMOD_FALLBACK
}

const w3cDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : sitemapLastmod(value)

export const sitemapXml = (origin, tree, lastmod = sitemapLastmod()) => {
  const day = w3cDate(lastmod)
  const body = sitemapPaths(tree)
    .map(
      (path) =>
        `  <url>\n    <loc>${escapeXml(origin + path)}</loc>\n    <lastmod>${escapeXml(day)}</lastmod>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

export const robotsTxt = (origin) =>
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
