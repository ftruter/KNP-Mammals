# Agent discovery

The live site publishes [Agentic Resource Discovery (ARD) v0.91](https://github.com/ards-project/ard-spec/blob/main/spec/ard.md). The entry schema this Worker is checked against is [`test/fixtures/ard-entry.schema.json`](../test/fixtures/ard-entry.schema.json), the ARD v0.91 entry schema. This note records how this Worker applies that spec. The MCP server card is listed too (see below).

## Routes

| URL | What it is |
| --- | --- |
| `/llms.txt` | Agent guide, `text/plain; charset=utf-8`. It is not the home page. Counts stay on `/.json`. A case variant such as `/LLMS.TXT` redirects to `/llms.txt`. |
| `/.well-known/ard.json` | ARD manifest. `Content-Type` is `application/json; charset=utf-8`. The body is `{ "entries": [ ... ] }`. |
| `/.well-known/ai-catalog.json` | Predecessor catalog for clients that still fetch that path. `specVersion` is `"1.0"`. The `entries` array is the same array as the ARD manifest. `host.documentationUrl` points at `/llms.txt`. |
| `/ask-ai` | A prompt a person pastes into their own chat AI. Also `/ask-ai.md` and `/ask-ai.json`. The JSON `prompt` field is that same text. The page does not call a model. |
| HTML `<head>` | `<link rel="ard" type="application/json" href="/.well-known/ard.json">` on every page `layout` renders, including the HTML 404, and on the short 405 and 500 documents. |

There is no per-page `ard.json`. Birds does not publish one per species or family either. One manifest, the link tag, and the `Link` header are the discovery surface.

`/.json` stays the stored `index/families` document. ARD describes that document. It is not rewritten into a composed home object.

## HTTP Link header

HTML, Markdown, JSON, `llms.txt`, both well-known JSON files, redirects, and the 404, 405 and 500 responses send one RFC 8288 `Link` header. Page responses keep the canonical URL and the `.md` / `.json` alternates they already sent, then add the discovery relations. The well-known files and `llms.txt` do not gain alternate links for twins that do not exist.

Icons, CSS, JavaScript, and image and audio bytes do not send it. A missing image or recording, which answers as plain text, does not either.

The header always ends with:

```
</.well-known/ard.json>; rel="ard"; type="application/json", </llms.txt>; rel="describedby"; type="text/plain"
```

`rel="ard"` is the relation ARD v0.91 defines for the manifest. `rel="describedby"` is the registered relation (RFC 6892) for `llms.txt`. There is no `rel="ai-catalog"` link. There is no `Agentmap` line, and this site has no `robots.txt` to put one on. `robots.txt` is out of scope. The MCP server card has no registered relation, so the `Link` header names it with the extension URI `https://mammals.truter.world/rel/mcp-server-card` (RFC 8288). The site does not serve a document at that URI.

The targets are root-relative, so they follow the host that served the response. The header does not change `Cache-Control` or the content security policy.

## Entries

`src/ard.js` builds the entries once per request from `index/families` and `index/species`. Both manifests serialize that same array. Counts and any sample Afrikaans question are read from those indexes. The indexes are arrays (`{ families: [...] }`, `{ species: [...] }`), not a map keyed by scientific name. If an index is missing, every entry that needs it is omitted and the miss is logged. A count is never filled in by hand.

Identifiers are always `urn:air:mammals.truter.world:...`. `url` values use the origin of the request. An entry's `type` is the media type of the document at `url`.

The catalog has four entries, and only these:

| Entry | URL | Document |
| --- | --- | --- |
| Home | `/.json` | The stored `index/families` object: `counts`, `orders`, and `families`. The description names `/llms.txt`. It does not list individual species. |
| Families | `/families.json` | The same stored object. The description is about the `families` array. |
| Orders | `/orders.json` | The same stored object. The description is about the `orders` array. |
| Species | `/species.json` | The stored `index/species` object. |

`/.json`, `/families.json` and `/orders.json` are one KV document served at three URLs. The entries say so. They do not pretend each URL has its own shape.

`llms.txt` is not an entry. Its media type is `text/plain`, which the ARD v0.91 checks do not accept as an entry type. The home entry's description names the file, and the `Link` header points at it with `rel="describedby"`.

## Cache

`/llms.txt` and `/ask-ai` do not read KV. They use the asset cache. The two well-known JSON documents are rendered from KV, so they use `kvCache` and `PAGE_CACHE`, including `no-store` for 70 seconds after `DATA_PUBLISHED_AT`. They do not get `.md` or `.json` alternate links.

## Prompt

`/ask-ai` tells the reader's own chat AI to open the home page as Markdown and follow it, then to use `/species.md`, `/families.md` and `/orders.md`. Every URL in the prompt is absolute. The prompt repeats the guide's rules: a missing fact stays null, Afrikaans names are only those already stored, a population is a stored range with its year and citation, SANParks and EWT PDFs are cited and not copied, displayed media is CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA, and a caption keeps the place as stored, except that rhinos and the pangolin are placed only as Kruger National Park and Juliana's golden mole only as southwestern Kruger National Park.

The home Markdown has an "Answering questions from this guide" section with the same limits. Markdown bodies pass through `absoluteLinks`, so a root-relative link target is written out in full.

The Copy button is rendered `hidden`. `bindCopy` in `src/client/app.js` shows it only when the clipboard can be written. With JavaScript off, the page says to select the text.

The prompt points at `/search.md?q=` for finding an animal by name (#32). It also names `/mcp`, the public read-only MCP server (#34 batch 2), and says the pages work without it.

## Not built here

No identify flow. The MCP server (`POST /mcp`, one `search` tool) and its card (`GET /mcp/server-card`) are batch 2 of issue 34. The ARD entry for the card has `type: application/mcp-server-card+json` and its `url` is the card, not the transport.
