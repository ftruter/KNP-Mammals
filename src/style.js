/**
 * All UI CSS. The palette and fonts are those of KNP-birds `src/style.js`.
 * Gold is header text and decoration, never body text on the cream page.
 * Green is body headings in light mode.
 */
export const palette = {
  light: {
    bg: '#FDF6E3',
    text: '#1F2A1F',
    heading: '#28602a',
    accent: '#7A5A00',
    headerBg: '#28602a',
    headerFg: '#F6C64D',
  },
  dark: {
    bg: '#12301A',
    text: '#F3EFE0',
    heading: '#F6C64D',
    accent: '#8FD18F',
    headerBg: '#28602a',
    headerFg: '#F6C64D',
  },
}

const light = palette.light
const dark = palette.dark

export const css = `:root {
  color-scheme: light;
  --bg: ${light.bg};
  --text: ${light.text};
  --heading: ${light.heading};
  --link: ${light.heading};
  --accent: ${light.accent};
  --header-bg: ${light.headerBg};
  --header-fg: ${light.headerFg};
  --muted: #5C4E38;
  --surface: #FFFBF4;
  --footer-bg: #F3EAD6;
  --line: #E0D2AE;
  --zebra: #F6EED9;
  --row-hover: #EFE3C4;
  --thead: #E4EED9;
  --nav-pill: #143318;
  --focus: ${light.text};
  --radius: 0.9rem;
  --serif: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, "Times New Roman", serif;
  --sans: "Segoe UI", system-ui, -apple-system, "Helvetica Neue", sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --bg: ${dark.bg};
    --text: ${dark.text};
    --heading: ${dark.heading};
    --link: ${dark.heading};
    --accent: ${dark.accent};
    --header-bg: ${dark.headerBg};
    --header-fg: ${dark.headerFg};
    --muted: #D2C7B0;
    --surface: #1A3F27;
    --footer-bg: #0E2816;
    --line: #2F5A3C;
    --zebra: #163622;
    --row-hover: #234A30;
    --thead: #1E4A2C;
    --focus: ${dark.text};
  }
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--serif);
  font-size: 1.0625rem;
  line-height: 1.55;
}
a { color: var(--link); text-underline-offset: 0.15em; }
a:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.wrap { max-width: 70rem; margin: 0 auto; padding: 0 1rem; }

.site-header {
  background: var(--header-bg);
  color: var(--header-fg);
  border-bottom: 3px solid var(--header-fg);
}
.site-header .wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  padding-block: 0.75rem;
}
.site-title {
  color: var(--header-fg);
  font-size: 1.35rem;
  font-weight: 700;
  text-decoration: none;
}
.site-nav { display: flex; gap: 0.5rem; font-family: var(--sans); font-size: 0.95rem; }
.site-nav a {
  color: var(--header-fg);
  background: var(--nav-pill);
  border-radius: 999px;
  padding: 0.25rem 0.8rem;
  text-decoration: none;
}
.site-nav a[aria-current="page"] { outline: 1px solid var(--header-fg); }

main { padding-block: 1.5rem 3rem; }
h1, h2 { color: var(--heading); line-height: 1.2; }
h1 { font-size: 2rem; margin: 0 0 0.25rem; }
h2 { font-family: var(--sans); font-size: 1.2rem; margin: 2rem 0 0.5rem; }
.latin { font-style: italic; }
.lede, .muted { color: var(--muted); }
.lede { margin: 0 0 1rem; }
.note {
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
}
.note p { margin: 0; }

.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: var(--surface); }
th, td { padding: 0.45rem 0.75rem; text-align: left; vertical-align: top; }
thead th { background: var(--thead); font-family: var(--sans); font-size: 0.9rem; }
tbody tr:nth-child(even) { background: var(--zebra); }
tbody tr:hover { background: var(--row-hover); }
td.count, th.count { text-align: right; font-variant-numeric: tabular-nums; }

dl.facts { display: grid; grid-template-columns: max-content 1fr; gap: 0.3rem 1.25rem; margin: 1rem 0; }
dl.facts dt { font-family: var(--sans); font-size: 0.9rem; color: var(--muted); }
dl.facts dd { margin: 0; }

.site-footer {
  background: var(--footer-bg);
  border-top: 3px solid var(--header-fg);
  font-family: var(--sans);
  font-size: 0.9rem;
  color: var(--muted);
}
.site-footer .wrap { padding-block: 1rem; }
.site-footer p { margin: 0.25rem 0; }
`
