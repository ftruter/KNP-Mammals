# Mammals of Kruger National Park

An open field guide to the mammals found in Kruger National Park. It is a sister project to [KNP-birds](https://github.com/ftruter/KNP-birds), live at <https://birds.truter.world>. This guide is live at <https://mammals.truter.world>.

Family records are in [`data/families.json`](data/families.json). The species list is [`data/species-list.json`](data/species-list.json). Source notes are in [`docs/SOURCES.md`](docs/SOURCES.md). Field meanings are in [`docs/schema.md`](docs/schema.md). A handoff for the next session is [`STATE.md`](STATE.md).

## Status

`data/species-list.json` records 14 orders, 39 families and 143 species. Every listed species has a details file under `data/species/details/`, and each of those files has `sampleData: false`. The same list file holds 20 candidates and 4 excluded rows. Those rows are not published.

Every photograph stored on the details files (382) and all 12 recordings have `hosted: true`. `data/media/mirror.json` records those 382 images and 12 recordings, including the Juliana's golden mole illustration. `scripts/publish-media.mjs` plans the same 382 photographs and 12 recordings. Thirty-five listed species have an empty `images` array. A file without `hosted: true` loads from `fileUrl` when the licence allows it.

Search, credits, facts, the sitemap, `robots.txt`, the agent-discovery files and the installable offline app are served (see the route table below). A public read-only MCP endpoint (`/mcp`) is served. There is no identify tool. `variants` are stored and are not shown.

The home page still says that some species are listed by name only. That sentence is `progressSentence` in `src/html.js`. Every listed species already has a details file. This documentation does not change the sentence.

## Families

[`data/families.json`](data/families.json) records 39 families in 14 orders. The table follows that file, grouped by order in the same sequence. English and Afrikaans names are copied as stored. A dash means `af` is null (16 of 39). Nulls are not filled in.

| Order | Latin | English | Afrikaans |
| --- | --- | --- | --- |
| Afrosoricida | Chrysochloridae | Golden moles | gouemolle |
| Macroscelidea | Macroscelididae | Elephant shrews | klaasneuse |
| Tubulidentata | Orycteropodidae | Aardvarks | - |
| Hyracoidea | Procaviidae | Dassies or hyraxes | dassies |
| Proboscidea | Elephantidae | Elephants | - |
| Eulipotyphla | Erinaceidae | Hedgehogs | - |
| Eulipotyphla | Soricidae | Shrews | skeerbekmuise |
| Chiroptera | Emballonuridae | Sheath-tailed bats | Skedestertvlermuise |
| Chiroptera | Hipposideridae | Old World leaf-nosed bats | bladneusvlermuise |
| Chiroptera | Miniopteridae | Bent-winged bats | - |
| Chiroptera | Molossidae | Free-tailed bats | losstertvlermuis |
| Chiroptera | Nycteridae | Slit-faced bats | spleetgesigvlermuise |
| Chiroptera | Pteropodidae | Fruit bats | vrugtevlermuise |
| Chiroptera | Rhinolophidae | Horseshoe bats | perdeskoenvlermuise |
| Chiroptera | Vespertilionidae | Vesper bats | aandvlermuise |
| Primates | Cercopithecidae | Monkeys and baboons | - |
| Primates | Galagidae | Bushbabies | nagape |
| Carnivora | Canidae | Dogs | Hondagtiges |
| Carnivora | Felidae | Cats | katfamilie |
| Carnivora | Herpestidae | Mongooses | - |
| Carnivora | Hyaenidae | Hyaenas | - |
| Carnivora | Mustelidae | Badgers, otters and polecats | weselfamilie |
| Carnivora | Viverridae | Civets and genets | - |
| Pholidota | Manidae | Pangolins | - |
| Perissodactyla | Equidae | Zebras | Perdagtiges |
| Perissodactyla | Rhinocerotidae | Rhinoceroses | - |
| Artiodactyla | Bovidae | Antelopes and buffaloes | Horingdraers |
| Artiodactyla | Giraffidae | Giraffes | - |
| Artiodactyla | Hippopotamidae | Hippopotamuses | Seekoeie |
| Artiodactyla | Suidae | Pigs | varke |
| Rodentia | Bathyergidae | Mole-rats | - |
| Rodentia | Gliridae | Dormice | waaiermuise |
| Rodentia | Hystricidae | Porcupines | Ystervarke |
| Rodentia | Muridae | Rats and mice | - |
| Rodentia | Nesomyidae | Nesomyids | - |
| Rodentia | Pedetidae | Springhares | - |
| Rodentia | Sciuridae | Squirrels | eekhorings |
| Rodentia | Thryonomyidae | Cane rats | rietrotte |
| Lagomorpha | Leporidae | Hares and rabbits | - |

## Sources

The ranked list, the URLs and the gaps log are in [`docs/SOURCES.md`](docs/SOURCES.md). Species-document fields are in [`docs/schema.md`](docs/schema.md).

## Taxonomic remaps

Three remaps are recorded, citing iNaturalist, instead of keeping the 2011 SANParks family headings:

1. **Lorisidae to Galagidae.** SANParks listed only *Galago moholi* and *Otolemur crassicaudatus* under Lorisidae. Those species are recorded as Galagidae. True lorises are not listed, and Lorisidae is not kept as a KNP family.
2. **Part of Muridae to Nesomyidae.** *Cricetomys*, *Saccostomus*, *Dendromus*, and *Steatomys*, printed under Muridae, are recorded as Nesomyidae.
3. ***Miniopterus* to Miniopteridae.** *Miniopterus schreibersii*, printed under Vespertilionidae, is recorded as Miniopteridae.

## Rules

- Never invent a fact. Leave the field null and record the gap.
- Afrikaans names come only from a cited source. Sixteen of the 39 family `af` values are null. The table above shows those as a dash.
- Displayed or hosted media may be CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA. ND and all-rights-reserved files are not displayed or hosted.
- Cite SANParks and EWT PDFs. Do not host or copy them.
- White rhinoceros, black rhinoceros and Temminck's ground pangolin captions include "Kruger National Park" and do not name a finer place. `test/media.test.js` checks that. [`docs/SOURCES.md`](docs/SOURCES.md) records that the white-rhino file titles name roads and gates, and that the place in those captions is "Kruger National Park".
- The Juliana's golden mole account places that Kruger subpopulation in southwestern Kruger National Park. Its illustration caption is "Imagined by Grok. An illustration, not a photograph of a real animal." The caption does not name a place.
- Other Kruger captions keep the place as recorded, camps, roads and waterholes included (owner decision: keep as much place detail as possible; do not generalise to "Kruger National Park").

## Site

A Cloudflare Worker (`src/worker.js`) reads JSON documents from Workers KV and renders each page as HTML, Markdown (`.md`) or the stored JSON (`.json`). The design is that of KNP-birds: `src/style.js`, `src/client/app.js`, `src/sort.js` and `src/credit.js` are copies of its files, and the page markup uses the same class names. When the birds design changes, copy those files again.

| Page | KV key | Built from |
| --- | --- | --- |
| `/` | `index/families` | Counts of species, families, orders and full accounts |
| `/orders` | `index/families` | The `order` of each family, with family and species counts |
| `/order/<slug>` | `order/<slug>` | The families and species of one order. The slug is the Latin name in lower case |
| `/families` | `index/families` | `data/families.json`, with species counts |
| `/species` | `index/species` | `species` in `data/species-list.json`, with the Kruger estimate where a details file records one |
| `/facts` | `index/facts` | One row per listed species from the details files: size, mass, Kruger status, conservation status and the Kruger individuals range |
| `/family/<slug>` | `family/<slug>` | `data/families.json` and its species |
| `/species/<slug>` | `species/<slug>` | The species-list row, plus `data/species/details/<slug>.json` as `details` when that file exists |
| `/manifest.webmanifest`, `/sw.js`, `/offline.json` | `index/offline` for the JSON | The installable app: the manifest, the service worker, and the pages and media a saved copy can keep. `/offline` and `/offline.md` are not pages |
| `/sitemap` | `index/families`, `index/species` | Every published order, family, and species page, plus `/facts`, `/credits` and `/ask-ai`. `/search` is left out |
| `/sitemap.xml` | `index/families`, `index/species` | One URL for each HTML page, dated from `DATA_PUBLISHED_AT` |
| `/robots.txt` | (none) | An allow policy for crawlers, and the address of `/sitemap.xml` |
| `/llms.txt` | none | Agent guide. It points at `/.json` for counts and does not repeat them |
| `/.well-known/ard.json` | `index/families`, `index/species` | ARD manifest. A missing index is omitted |
| `/.well-known/ai-catalog.json` | the same indexes | Predecessor catalog. The same entries. `host.documentationUrl` is `/llms.txt` |
| `/ask-ai` | none | A prompt for a reader's own chat AI. Also `.md` and `.json`. The page does not call a model |
| `/credits` | `index/credits` | Derived by `scripts/seed.mjs`: checklist sources, taxonomy, and every photograph, recording and cited source |
| `/search` | `index/species` and `index/families` | English, Afrikaans and Latin names already on those indexes. The query is `?q=` |

A species with a details file gets a full account: a lead photograph, facts, description, what to look for, similar species, habits, diet, young, predators and prey, calls with recordings, more photographs and sources. A species without one says its details have not been published. Photographs and recordings that are saved on this site load from `/images/<key>` or `/audio/<key>`; otherwise they load from their sources (`fileUrl`). Each carries its credit and licence. CC BY-NC media is shown on a non-commercial site. The field marks in `variants` are not shown yet.

Orders are not in the site navigation. They are reached from the home page, from the Order column of the tables, and from family and species pages. They have Latin names only, because `data/families.json` records no English or Afrikaans name for an order.

The tables on `/orders`, `/order/<slug>`, `/families`, `/species`, `/facts` and `/family/<slug>` sort with `?sort=` and `dir=asc` or `dir=desc`. The server sorts, so the header links work with scripts off; `/app.js` sorts in place when scripts are on. The default is the first column, A to Z; an order page has two tables and both follow the same query. Latin breaks ties and empty values sort last.

`/credits` lists the checklist sources, the taxonomy, and the credit on every photograph and recording. Species pages still show that credit beside each file. The page links SANParks and EWT PDFs and does not host them.

`/robots.txt` and `/sitemap.xml` are not HTML pages, so they have no `.md` or `.json` view. `/sitemap` has the usual three formats.

`/llms.txt`, `/.well-known/ard.json`, `/.well-known/ai-catalog.json` and `/ask-ai` are served, and so are `POST /mcp` and `/mcp/server-card` (see below). There is no identify tool yet.

`/search` finds a species or a family by its stored English name, Afrikaans name or scientific name. The same page is `/search.md` and `/search.json`. A blank query explains what can be searched. The header search box is on every HTML page, and the form is a normal GET, so it works with scripts off. Orders are not searched.

`POST /mcp` is a public read-only MCP server (streamable HTTP, no sign-in). It has one tool, `search`, with the same ranking as `/search`: `query` (up to 200 characters) and `limit` (1 to 25, default 10). Results hold the kind, the three stored names and the page URLs, and nothing else, so no place, photograph, recording or observation reference leaves through it. `GET /mcp/server-card` is the server card (`application/mcp-server-card+json`), and the ARD manifest lists it. Only `mammals.truter.world`, `localhost`, `127.0.0.1` and `[::1]` are accepted as host or browser origin. It needs `compatibility_flags = ["nodejs_compat"]` and three npm packages (`agents`, `@modelcontextprotocol/server`, `zod`). It uses no Durable Object, OAuth, model service or extra binding.

`index/offline` is derived when the KV payload is built and is not written under `data/`. It lists the HTML pages above, one lead photograph and one clip per species when `data/media/mirror.json` has a measured size for that file, and `iconic` (empty until a family ranking is chosen, so the family rows stay unavailable). The pack addresses are `/images/<key>` and `/audio/<key>`. Add a path to `GUIDE_PAGES` in `src/offline.js` when another HTML page should be saved with the guide.

`candidates` and `excluded` are not published. `scripts/seed.mjs` derives the payload on every run and writes nothing back to `data/`. It adds names to the animals a details file points at (similar, predators, prey) and marks whether this guide lists them. It also builds `index/facts` from those details. It stops if a species names a family that is not in `data/families.json`, if a slug repeats, if a details file has no listed species, or if a photograph or recording has a licence outside CC0, CC BY, CC BY-SA, CC BY-NC and CC BY-NC-SA.

```sh
pnpm install
pnpm test
pnpm run lint
pnpm run kv:dry-run   # the keys and sizes, without a Cloudflare token
pnpm run check        # builds the Worker without deploying
```

To preview locally, load the payload into local KV and start the Worker:

```sh
node scripts/seed.mjs > /tmp/mammals-kv.json
pnpm exec wrangler kv bulk put /tmp/mammals-kv.json --local --binding MAMMALS_KV
pnpm run dev
```

## Site icon

The drawing is [`icons/icon.svg`](icons/icon.svg): a zebra standing on "KNP", in the header's green and gold. After changing it, run:

```sh
pnpm icons
```

This needs `rsvg-convert` (librsvg) and rewrites `src/icons.generated.js`, which holds every size the Worker serves: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` and the 192 and 512 px PNGs. Browser tabs get the zebra alone, because the lettering is unreadable at 16 px. Its stripes are few and wide so that they survive at that size.

## Deploy

The `MAMMALS_KV` binding is the `knp-mammals` KV namespace, whose id is in `wrangler.toml`.

Workers Builds on `main` should use:

- Build command: none. Workers Builds sees `pnpm-lock.yaml` and runs `pnpm install --frozen-lockfile` itself. `pnpm-workspace.yaml` lists the root as its one package because pnpm 9 rejects a workspace file without a `packages` list.
- Deploy command: `npm run deploy`, not the default `npx wrangler deploy`. Locally, run `pnpm run deploy`.

`pnpm run deploy` fails the build if either step fails:

1. Uploads the payload to the `MAMMALS_KV` namespace. Keys that are gone from `data/` are deleted only when they start with `species/`, `family/`, `order/` or `index/`.
2. Deploys the Worker with `DATA_VERSION` (a SHA-256 of the payload) and `DATA_PUBLISHED_AT` (the time the upload finished).

KV is written first so the new version renders the data it advertises. Workers Caching (`[cache]` in `wrangler.toml`) includes the Worker version in its key, and `DATA_VERSION` is a Worker var, so a data-only deploy starts with an empty cache. For 70 seconds after `DATA_PUBLISHED_AT`, responses are `no-store`, because a KV read can return the previous value for up to 60 seconds.

The Worker is bound to `mammals.truter.world` by the `[[routes]]` block in `wrangler.toml`.

## Contributing

Pull requests are welcome. Only [@ftruter](https://github.com/ftruter) approves and merges. Branch from the latest `main`. Do not stack pull requests. Every pull request links its issue (`Closes #N` when it finishes the issue, `Part of #N` for a batch), its title matches the issue title (with a suffix such as " (batch 1)" for a partial PR), and the issue gets a comment pointing to the pull request.
