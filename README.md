# Mammals of Kruger National Park

An open field guide to the mammals found in Kruger National Park. It is a sister project to [KNP-birds](https://github.com/ftruter/KNP-birds), which is live at <https://birds.truter.world>. The future site is <https://mammals.truter.world>.

Phase 1 records the family list and the ranked sources. Family records are in [`data/families.json`](data/families.json). Source notes are in [`docs/SOURCES.md`](docs/SOURCES.md).

## Status

Phase 1 (families and sources) is done. Phase 2 (species per family) is next, pending the owner's go.

## Families

[`data/families.json`](data/families.json) records 39 families in 14 orders. The table follows that file, grouped by order in the same sequence. English and Afrikaans names are copied as stored. A dash means `af` is null (22 of 39). Nulls are not filled in.

| Order | Latin | English | Afrikaans |
| --- | --- | --- | --- |
| Afrosoricida | Chrysochloridae | Golden moles | gouemolle |
| Macroscelidea | Macroscelididae | Elephant shrews | klaasneuse |
| Tubulidentata | Orycteropodidae | Aardvarks | - |
| Hyracoidea | Procaviidae | Dassies or hyraxes | dassies |
| Proboscidea | Elephantidae | Elephants | - |
| Eulipotyphla | Erinaceidae | Hedgehogs | - |
| Eulipotyphla | Soricidae | Shrews | skeerbekmuise |
| Chiroptera | Emballonuridae | Sheath-tailed bats | - |
| Chiroptera | Hipposideridae | Old World leaf-nosed bats | bladneusvlermuise |
| Chiroptera | Miniopteridae | Bent-winged bats | - |
| Chiroptera | Molossidae | Free-tailed bats | losstertvlermuis |
| Chiroptera | Nycteridae | Slit-faced bats | spleetgesigvlermuise |
| Chiroptera | Pteropodidae | Fruit bats | vrugtevlermuise |
| Chiroptera | Rhinolophidae | Horseshoe bats | perdeskoenvlermuise |
| Chiroptera | Vespertilionidae | Vesper bats | aandvlermuise |
| Primates | Cercopithecidae | Monkeys and baboons | - |
| Primates | Galagidae | Bushbabies | nagape |
| Carnivora | Canidae | Dogs | - |
| Carnivora | Felidae | Cats | katfamilie |
| Carnivora | Herpestidae | Mongooses | - |
| Carnivora | Hyaenidae | Hyaenas | - |
| Carnivora | Mustelidae | Badgers, otters and polecats | weselfamilie |
| Carnivora | Viverridae | Civets and genets | - |
| Pholidota | Manidae | Pangolins | - |
| Perissodactyla | Equidae | Zebras | - |
| Perissodactyla | Rhinocerotidae | Rhinoceroses | - |
| Artiodactyla | Bovidae | Antelopes and buffaloes | - |
| Artiodactyla | Giraffidae | Giraffes | - |
| Artiodactyla | Hippopotamidae | Hippopotamuses | - |
| Artiodactyla | Suidae | Pigs | varke |
| Rodentia | Bathyergidae | Mole-rats | - |
| Rodentia | Gliridae | Dormice | waaiermuise |
| Rodentia | Hystricidae | Porcupines | - |
| Rodentia | Muridae | Rats and mice | - |
| Rodentia | Nesomyidae | Nesomyids | - |
| Rodentia | Pedetidae | Springhares | - |
| Rodentia | Sciuridae | Squirrels | eekhorings |
| Rodentia | Thryonomyidae | Cane rats | rietrotte |
| Lagomorpha | Leporidae | Hares and rabbits | - |

## Sources

The ranked list, URLs, and the gaps log are in [`docs/SOURCES.md`](docs/SOURCES.md) (researched 12 November 2026). Short summary of access and licence notes from that file:

1. **SANParks 2011 Wayback checklist PDF** — rank 1 for inclusion. The working copy is the 2 January 2011 Wayback capture: <https://web.archive.org/web/20110102164614/http://www.sanparks.org/parks/kruger/conservation/scientific/ff/mammal_checklist.pdf>. Live SANParks HTML and the live PDF URL returned HTTP 403 (the `http://` PDF URL returned 500). The 2011 PDF was HTTP 200 and is the official list used for Phase 1 inclusion. No licence statement was found on the PDF. Treat as SANParks all-rights-reserved. Cite and link; do not host or copy the PDF. The copy is dated 2011 and may lag the live list. Search snippets of the live checklist say “148 mammals”; the English Wikipedia park page and the German list say 147. No species total was published from the PDF.
2. **iNaturalist API, place 69020** (“Kruger National Park, ZA”) — rank 2 for taxonomy, occurrence corroboration, and later photos. API v1 was HTTP 200. The HTML checklist (list 8810) returned HTTP 403. The list JSON and CSV URLs returned HTTP 401. Use is subject to iNaturalist terms. Observation photos carry per-file licences (CC BY, CC BY-NC, CC0, CC BY-SA, CC BY-NC-SA and others appeared in records). Display only CC0 / CC BY / CC BY-SA / CC BY-NC and SA variants; never ND or all-rights-reserved.
3. **Waterberg Bioquest** — <https://waterberg-bioquest.co.za/soogdiere.html> was HTTP 200. Rank 3 for English family names. No licence or copyright statement was visible on the fetched page. Cite it; do not scrape images until a licence is confirmed. It is a Waterberg list, not a KNP inclusion list. Afrikaans names on that page are species names; the family headings are English and Latin.
4. **Afrikaans Wikipedia** — *Suider-Afrikaanse soogdiere en hul ordes* was HTTP 200. Rank 4 for Afrikaans family names only. Licence: CC BY-SA 4.0. If a family vernacular is not clearly stated, `af` is null.
5. **2016 EWT/SANBI Red List** — *Red List of Mammals of South Africa, Swaziland and Lesotho*. Rank 5 for later population and status work, not for family inclusion. The EWT landing page and the introduction PDF were HTTP 200 (59 pages). The SANBI species-status portal returned HTTP 403. No Creative Commons or other reuse licence was found in a text extract of the introduction. Treat the text as all-rights-reserved unless a later session finds a licence. Freely downloadable for reading and citation. Do not host the PDFs.
6. **Wikimedia Commons** — category Mammals of Kruger National Park was HTTP 200. Rank 6 for later photographs. Licence is per file (CC0, CC BY, CC BY-SA and others). Same display rule as KNP-birds: no ND and no all-rights-reserved for displayed files.
7. **Wikipedia (fallback)** — rank 7, fallback only, not for inclusion. The German list of KNP vertebrates was HTTP 200. Its mammal section is the most conspicuous species and is not complete for bats, rodents, or other small mammals. Licence stated for that list: CC BY-SA 4.0. The English park page was HTTP 200 and has a short mammal section, not a family list.
8. **Skinner & Chimimba, *The Mammals of the Southern African Subregion*** — rank 8. The Cambridge Core page was HTTP 200 and paywalled (digital list price £274.00). Not read. Commercial Cambridge University Press publication; all-rights-reserved.
9. **Stuart’s field guide to the mammals of southern Africa** — rank 9, unaccessed. Identified from search results only. No free legal full text was fetched. Licence was not read from a publisher page; expect all-rights-reserved. Not used for Phase 1 names.
10. **xeno-canto, Macaulay Library, and MammalMAP** — ranks 10–12, unresolved. xeno-canto browse returned an Anubis challenge, API v2 is retired, and API v3 was not tested. Mammal coverage for Kruger was not verified, and the licence was not confirmed from a fetched terms page. The Macaulay Library homepage was HTTP 200, but the licensing page returned HTTP 404, so reuse terms were not confirmed. MammalMAP / ADU Virtual Museum was not usable in this research (expired TLS certificate); its licence was not confirmed.

## Taxonomic remaps

Three remaps are recorded, citing iNaturalist, instead of keeping the 2011 SANParks family headings:

1. **Lorisidae to Galagidae.** SANParks listed only *Galago moholi* and *Otolemur crassicaudatus* under Lorisidae. Those species are recorded as Galagidae. True lorises are not listed, and Lorisidae is not kept as a KNP family.
2. **Part of Muridae to Nesomyidae.** *Cricetomys*, *Saccostomus*, *Dendromus*, and *Steatomys*, printed under Muridae, are recorded as Nesomyidae.
3. ***Miniopterus* to Miniopteridae.** *Miniopterus schreibersii*, printed under Vespertilionidae, is recorded as Miniopteridae.

## Gaps

- **22 of 39 Afrikaans family names are null.** The only cited family-vernacular source in this research was Afrikaans Wikipedia, plus two order or suborder vernaculars stored for a single family in that source (dassies for Procaviidae, vrugtevlermuise for Pteropodidae). Where a family vernacular is not clearly stated, `af` stays null.
- **The live SANParks list returned HTTP 403**, so it could not be compared with the 2011 Wayback copy. Family inclusion is from that 2011 PDF.
- **Rhinonycteridae / *Cloeotis percivali* was not added.** One research-grade iNaturalist observation of *Cloeotis percivali* is in place 69020. The species is not on the 2011 SANParks checklist, so the family was not added.
- **Introduced house mouse and house/black rat are flagged.** The official list marks house mouse (*Mus musculus*) and house/black rat (*Rattus rattus*) with an asterisk under Muridae. They did not add extra families.
- **Sound sources are unverified.** xeno-canto access is unresolved, and Macaulay Library reuse terms were not confirmed. Population estimates, photos, sounds, and per-species text are out of scope for Phase 1.

## Site

A Cloudflare Worker (`src/worker.js`) reads JSON documents from Workers KV and renders each page as HTML, Markdown (`.md`) or the stored JSON (`.json`). The design is that of KNP-birds: `src/style.js`, `src/client/app.js`, `src/sort.js` and `src/credit.js` are copies of its files, and the page markup uses the same class names. When the birds design changes, copy those files again.

| Page | KV key | Built from |
| --- | --- | --- |
| `/` | `index/families` | Counts of species, families, orders and full accounts |
| `/orders` | `index/families` | The `order` of each family, with family and species counts |
| `/order/<slug>` | `order/<slug>` | The families and species of one order. The slug is the Latin name in lower case |
| `/families` | `index/families` | `data/families.json`, with species counts |
| `/species` | `index/species` | `species` in `data/species-list.json`, with the Kruger estimate where a details file records one |
| `/family/<slug>` | `family/<slug>` | `data/families.json` and its species |
| `/species/<slug>` | `species/<slug>` | The species-list row, plus `data/species/details/<slug>.json` as `details` when that file exists |

A species with a details file gets a full account: a lead photograph, facts, description, what to look for, similar species, habits, diet, young, predators and prey, calls with recordings, more photographs and sources. A species without one says its details have not been published. Photographs and recordings load from their sources (`fileUrl`) and each carries its credit and licence; nothing is copied to this site yet. The field marks in `variants` are not shown yet.

Orders are not in the site navigation. They are reached from the home page, from the Order column of the tables, and from family and species pages. They have Latin names only, because `data/families.json` records no English or Afrikaans name for an order.

The tables on `/orders`, `/order/<slug>`, `/families`, `/species` and `/family/<slug>` sort with `?sort=` and `dir=asc` or `dir=desc`. The server sorts, so the header links work with scripts off; `/app.js` sorts in place when scripts are on. The default is the first column, A to Z; an order page has two tables and both follow the same query. Latin breaks ties and empty values sort last.

There is no search, sitemap, credits page or MCP endpoint yet.

`candidates` and `excluded` are not published. `scripts/seed.mjs` derives the payload on every run and writes nothing back to `data/`. It adds names to the animals a details file points at (similar, predators, prey) and marks whether this guide lists them. It stops if a species names a family that is not in `data/families.json`, if a slug repeats, or if a details file has no listed species.

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
