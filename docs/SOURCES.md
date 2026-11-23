# KNP-Mammals sources (Phase 1)

Researched 12 November 2026, Africa/Johannesburg. Phase 1 only: family list and source ranking. Facts below were checked in this session; nothing here is assumed from memory.

Candidate sources were verified for access and licence, not assumed. URL patterns that worked from this environment are marked. Live SANParks pages and several other sites returned HTTP 403 or were otherwise blocked, matching the KNP-birds lesson that SANParks HTML/PDF often 403 from the research environment.

## Ranked sources

### 1. SANParks Kruger mammal checklist (official inclusion list)

- **URLs**
  - Live HTML (current site, states “148 mammals” in search-engine snippets): <https://www.sanparks.org/parks/kruger/explore/fauna-flora/mammals/checklist>
  - Related park page: <https://www.sanparks.org/parks/kruger/explore/fauna-flora/mammals>
  - Historic PDF cited by the iNaturalist KNP checklist: `http://www.sanparks.org/parks/kruger/conservation/scientific/ff/mammal_checklist.pdf`
  - **Working copy used in this session:** Wayback Machine, 2 January 2011: <https://web.archive.org/web/20110102164614/http://www.sanparks.org/parks/kruger/conservation/scientific/ff/mammal_checklist.pdf>
- **Access:** Live SANParks HTML and the live PDF URL returned **HTTP 403** (the `http://` PDF URL returned 500). The 2011 Wayback PDF was HTTP 200 (`application/pdf`, 24 277 bytes) and is the official list used for Phase 1 inclusion. Search snippets of the live checklist were visible but truncated, so they were not used as the family list.
- **Licence / terms:** No licence statement was found on the PDF itself. Treat as SANParks all-rights-reserved. **Cite and link; do not host or copy the PDF into the repo.**
- **Good for:** Official KNP family and species inclusion; English and Afrikaans *species* names; asterisk flags for introduced house mouse and house/black rat. Family headings are Latin (sometimes with an order). It does not give Afrikaans *family* names. References printed on the PDF include Pienaar et al. 1987 (*Field guide to the mammals of the Kruger National Park*), Skinner & Smithers 1990, and the 2004 Red Data Book.
- **Caveats:** The Wayback copy is dated 2011 and may lag the live “148 mammals” list. Taxonomy is of that era (e.g. galagos under Lorisidae; nesomyid rodents and *Miniopterus* under Muridae and Vespertilionidae). The current live list could not be fetched to compare.
- **Rank:** 1 for inclusion.

### 2. iNaturalist (Kruger National Park, place_id 69020) — API

- **URLs that worked**
  - Place autocomplete: `https://api.inaturalist.org/v1/places/autocomplete?q=Kruger%20National%20Park` → place **69020** (“Kruger National Park, ZA”)
  - Taxonomy tree: `https://api.inaturalist.org/v1/observations/taxonomy?place_id=69020&iconic_taxa=Mammalia`
  - Research-grade species counts: `https://api.inaturalist.org/v1/observations/species_counts?place_id=69020&iconic_taxa=Mammalia&per_page=200&quality_grade=research` (94 species in this pull)
  - Taxon records (English family names): `https://api.inaturalist.org/v1/taxa?id={ids}`
- **URLs that failed**
  - HTML checklist “Checklist of the Mammals of the KNP” (list 8810): <https://www.inaturalist.org/check_lists/8810-Checklist-of-the-Mammals-of-the-KNP> — **HTTP 403**
  - `https://www.inaturalist.org/lists/8810.json` and `.../check_lists/8810.json` — **HTTP 401**
  - `https://www.inaturalist.org/lists/8810.csv` — **HTTP 401**
- **Access:** API v1 was HTTP 200 with a normal User-Agent. The HTML/JSON checklist derived from the SANParks PDF (and updated by Jakob Fahr, mostly bats, also *Chlorocebus*, *Genetta*, *Herpestes*, *Phacochoerus*) could not be downloaded here. Search-engine snippets of that checklist exist but were not treated as a complete list.
- **Licence / terms:** iNaturalist API/data use is subject to iNaturalist terms. Observation photos carry per-file licences (CC BY, CC BY-NC, CC0, CC BY-SA, CC BY-NC-SA and others appeared in records). Same media rule as KNP-birds: display only CC0 / CC BY / CC BY-SA / CC BY-NC and SA variants; never ND or all-rights-reserved.
- **Good for:** Modern family and order taxonomy; independent occurrence evidence; later-phase photographs (prefer Kruger, then South Africa). Not a substitute for the official checklist: many listed small mammals and bats have few or no research-grade observations, and the place also contains records that are not on the official list (see gaps).
- **Rank:** 2 for taxonomy, occurrence corroboration, and later photos.

### 3. Waterberg Bioquest — Soogdiere

- **URL:** <https://waterberg-bioquest.co.za/soogdiere.html> — HTTP 200
- **Licence / terms:** No licence or copyright statement was visible on the fetched page. Cite it; do not scrape images until a licence is confirmed. The page credits Clive Walker, *The Soul of the Waterberg* (2005), the Welgevonden mammal list, and the EWT Red List.
- **Good for:** English family headings in a southern African field-guide style (this is what was used for many `en` values when the heading maps to one family). Afrikaans names on this page are *species* names, not family headings (the family headings are English + Latin).
- **Not good for:** KNP inclusion (it is a Waterberg list). Do not add a Waterberg-only species or family to the KNP list.
- **Rank:** 3 for English family names. Same site family was used for Afrikaans *bird* family headings in KNP-birds; it does not play that role for mammal *families*.

### 4. Afrikaans Wikipedia — *Suider-Afrikaanse soogdiere en hul ordes*

- **URL:** <https://af.wikipedia.org/wiki/Suider-Afrikaanse_soogdiere_en_hul_ordes> — HTTP 200 (`action=raw` via `https://af.wikipedia.org/w/index.php?title=Suider-Afrikaanse_soogdiere_en_hul_ordes&action=raw`)
- **Related:** <https://af.wikipedia.org/wiki/Lys_van_Suider-Afrikaanse_soogdiere> (species list, not family vernaculars)
- **Licence:** CC BY-SA 4.0 (MediaWiki site licence). The page cites *Smither's Mammals of Southern Africa. A field guide*, Peter Apps (ed.), 3rd edition, 2000.
- **Good for:** The only cited source found in this session that gives Afrikaans *family* vernaculars (e.g. skeerbekmuise, gouemolle, perdeskoenvlermuise, bladneusvlermuise, aandvlermuise, klaasneuse). Not KNP-specific. Taxonomy is dated in places (galagos still under Lorisidae; mongooses still under Viverridae; aardwolf as Protelidae).
- **Rank:** 4 for Afrikaans family names only. If a family vernacular is not clearly stated, `af` is null.

### 5. 2016 SANBI / EWT *Red List of Mammals of South Africa, Swaziland and Lesotho*

- **URLs**
  - Landing page: <https://ewt.org/resources/mammal-red-list/> — HTTP 200
  - Introduction and methodology PDF: <https://ewt.org/wp-content/uploads/2022/10/2016-Mammal-Red-List_Introduction-and-Methodology.pdf> — HTTP 200 (59 pages)
  - Individual assessments, pattern: `https://ewt.org/wp-content/uploads/2022/11/{n}.-{Name}-{Species}_{status}.pdf` (several assessments fetched as 200 in search results, e.g. lion, kudu, elephant, wild dog, spiny mouse). Citation form on those PDFs: Child MF, Roxburgh L, Do Linh San E, Raimondo D, Davies-Mostert HT (eds). 2016.
  - SANBI species-status portal: <https://speciesstatus.sanbi.org/> — **HTTP 403**
- **Access:** EWT site and PDFs were reachable. The SANBI portal was not.
- **Licence / terms:** No Creative Commons or other reuse licence was found in a text extract of the 59-page introduction (only photo credit © lines). The EWT site footer links to “Terms of use”. Treat the text as all-rights-reserved unless a later session finds a licence. Freely downloadable for reading and citation. Do not host the PDFs in the repo.
- **Good for:** Later-phase conservation status, population figures, and KNP mentions inside species assessments. It is a national red list, not a KNP checklist, so it was not used as the family inclusion list.
- **Rank:** 5 for later population and status work.

### 6. Wikimedia Commons

- **URL checked:** <https://commons.wikimedia.org/wiki/Category:Mammals_of_Kruger_National_Park> — HTTP 200
- **Licence:** Per-file (CC0, CC BY, CC BY-SA and others). Same display rule as KNP-birds: no ND, no all-rights-reserved for displayed files. Record author, licence and source URL for every item.
- **Good for:** Later-phase photographs, second after iNaturalist Kruger photos.
- **Rank:** 6 for photos.

### 7. Wikipedia (fallback)

- **German list of KNP vertebrates:** <https://de.wikipedia.org/wiki/Liste_der_Wirbeltierarten_des_Kruger-Nationalparks> — HTTP 200. Wikitext via `https://de.wikipedia.org/w/index.php?title=Liste_der_Wirbeltierarten_des_Kruger-Nationalparks&action=raw`. The mammal section is explicitly a list of the *most conspicuous* species, referenced to the SANParks checklist PDF. It is **not complete** for bats, rodents or other small mammals, so it was not used as the family list. Licence: CC BY-SA 4.0.
- **English park page:** <https://en.wikipedia.org/wiki/Kruger_National_Park> — HTTP 200. Has a short mammal section and some historic count tables; not a family list.
- **Good for:** Fallback English text later; not for inclusion.
- **Rank:** 7 (fallback only).

### 8. Skinner & Chimimba, *The Mammals of the Southern African Subregion*

- **URL checked:** Cambridge Core, <https://www.cambridge.org/core/books/mammals-of-the-southern-african-subregion/5C2E1D1A9BD464C8A0F3D5A550595AFA> — HTTP 200, paywalled. Digital list price on the page: £274.00. ISBN 9780521844185 / 9781107340992. DOI <https://doi.org/10.1017/CBO9781107340992>. Publisher: Cambridge University Press (page dated 2005 / 2013 reprint).
- **Access:** Login / institutional access or purchase required. Not read in this session.
- **Licence:** Commercial CUP publication; rights and permissions via Cambridge. All-rights-reserved. Do not scrape or quote at length. Ask the owner before any purchase.
- **Good for:** Later authoritative text, if a legal copy is available. The 1990 Skinner & Smithers edition is already cited on the SANParks checklist.
- **Rank:** 8 (important, but unpaid and unaccessed here).

### 9. Stuart’s field guide to the mammals of southern Africa

- **Status this session:** Identified as a commercial Struik / Penguin Random House field guide (search results only). No free legal full text was fetched. Licence not read from a publisher page in this session; expect all-rights-reserved.
- **Good for:** Later field-guide text and possibly Afrikaans names, if the owner has a copy or approves a purchase. Not used for Phase 1 names.
- **Rank:** 9 (unaccessed).
- **Gap:** Access, licence and Afrikaans family coverage still to be confirmed.

### 10. xeno-canto (mammal sounds)

- **URLs**
  - Homepage: <https://xeno-canto.org/> — HTTP 200, but short HTML
  - Explore and terms pages returned HTTP 200 with an **Anubis** “Verifying visitor request...” challenge (~7 KB HTML), so search and terms were not actually readable
  - API v2 sample: `https://xeno-canto.org/api/2/recordings?query=cnt:south%20africa` — HTTP 404 JSON: “Xeno-canto API v2 is no longer available. Visit https://xeno-canto.org/explore/api for API v3 documentation.”
- **Access:** Effectively blocked for browse; API v2 retired. KNP-birds already found that API v3 needs `XENO_CANTO_API_KEY`. Mammal coverage for Kruger was **not verified** with a successful data response in this session.
- **Licence:** Not confirmed from a fetched terms page (challenge wall). KNP-birds recorded typical xeno-canto CC licences for *birds* (CC0, CC BY, BY-SA, BY-NC, and ND variants that may be linked only). Re-confirm for mammals when API v3 is available.
- **Rank:** 10 as a later sound candidate, access unresolved.

### 11. Macaulay Library (mammal sounds)

- **URL checked:** <https://www.macaulaylibrary.org/> — HTTP 200
- **Licence URL tried:** <https://www.macaulaylibrary.org/media-asset-licensing/> — **HTTP 404**. FAQ URL also 404.
- **Access:** Homepage reachable. Reuse terms were **not confirmed** from a fetched page. Do not assume recordings are reusable in the field guide.
- **Rank:** 11 as a later sound candidate, terms unresolved.

### 12. MammalMAP / ADU Virtual Museum

- **URLs tried**
  - <https://vmus.adu.org.za/vm_projects.php> — TLS certificate **expired** (`curl` error 60). With certificate verification disabled: **HTTP 404**
  - <https://mammalmap.adu.org.za/> — TLS certificate **expired**. With verification disabled: HTTP 200, redirected to <https://api.birdmap.africa/>
- **Access:** Not usable in this session.
- **Licence:** Not confirmed (SANBI metadata record exists at <https://metadata.sanbi.org/srv/api/records/c15072d2-88a0-48a6-8e6c-c8a1878e8488>; not relied on for names).
- **Rank:** 12 until a working endpoint is found. Still a candidate for later distribution records if access is repaired.

## URL patterns that worked

| Source | Pattern | Notes |
| --- | --- | --- |
| SANParks checklist PDF | `https://web.archive.org/web/20110102164614/http://www.sanparks.org/parks/kruger/conservation/scientific/ff/mammal_checklist.pdf` | Live sanparks.org equivalents 403 |
| iNaturalist place | `https://api.inaturalist.org/v1/places/autocomplete?q=Kruger%20National%20Park` | id `69020` |
| iNaturalist taxonomy | `https://api.inaturalist.org/v1/observations/taxonomy?place_id=69020&iconic_taxa=Mammalia` | Families, orders, counts |
| iNaturalist species counts | `https://api.inaturalist.org/v1/observations/species_counts?place_id=69020&iconic_taxa=Mammalia&per_page=200&quality_grade=research` | 94 species this pull |
| iNaturalist taxa | `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}` | English family names |
| Waterberg Bioquest | `https://waterberg-bioquest.co.za/soogdiere.html` | English family headings |
| Afrikaans Wikipedia raw | `https://af.wikipedia.org/w/index.php?title=Suider-Afrikaanse_soogdiere_en_hul_ordes&action=raw` | Afrikaans family names |
| German Wikipedia raw | `https://de.wikipedia.org/w/index.php?title=Liste_der_Wirbeltierarten_des_Kruger-Nationalparks&action=raw` | Incomplete conspicuous-species list |
| EWT Red List intro | `https://ewt.org/wp-content/uploads/2022/10/2016-Mammal-Red-List_Introduction-and-Methodology.pdf` | 200, 59 pp. |
| EWT species assessments | `https://ewt.org/wp-content/uploads/2022/11/…pdf` | 200 in samples |
| Wikimedia Commons | `https://commons.wikimedia.org/wiki/Category:Mammals_of_Kruger_National_Park` | 200 |

`https://de.wikipedia.org/w/api.php?action=raw&title=…` does **not** work (API error: unrecognized `action=raw`). Use `index.php?action=raw`.

## How the family list was built

1. Start from every family heading on the 2011 Wayback SANParks checklist (37 printed Latin family names, including bats, rodents, shrews, golden moles and other small mammals).
2. Record three modern taxonomic remaps, citing iNaturalist, rather than inventing them:
   - SANParks **Lorisidae** (only *Galago moholi* and *Otolemur crassicaudatus*) → **Galagidae**. True lorises are not listed; Lorisidae is not kept as a KNP family.
   - Part of SANParks **Muridae** (*Cricetomys*, *Saccostomus*, *Dendromus*, *Steatomys*) → **Nesomyidae**.
   - SANParks **Vespertilionidae** (*Miniopterus schreibersii*) → **Miniopteridae**.
3. English names: Waterberg Bioquest family heading when it maps to one family; otherwise the iNaturalist `preferred_common_name`.
4. Afrikaans names: only a clearly stated family (or, for Procaviidae and Pteropodidae, a clearly stated order/suborder vernacular that the same source applies to that single family). Otherwise `af` is null.
5. Orders are modern names from iNaturalist taxonomy (and, where it agrees, af.wikipedia). SANParks used Insectivora for shrews, hedgehogs and (by placement) golden moles.

Domestic or introduced species were included only where the official list already has them (house mouse and house/black rat, marked * under Muridae). They did not add extra families.

## Gaps log

### Access and licence

- Live SANParks checklist HTML and PDF: **HTTP 403**. Family inclusion is from the 2011 Wayback PDF, not the current live page (search snippets say 148 species; the English Wikipedia park page and German list say 147). A later session should compare if the 403 is ever lifted or if another official copy appears.
- iNaturalist KNP mammal checklist 8810: **HTTP 403 / 401**. This list is described as derived from the SANParks PDF and updated by Jakob Fahr. It may contain taxonomic updates the 2011 PDF lacks. Unfinished: fetch or export that checklist when access allows.
- SANBI species-status portal: **HTTP 403**.
- MammalMAP / ADU: expired TLS certificate; vmus 404 even insecure; mammalmap host redirected to `api.birdmap.africa`. Unfinished.
- xeno-canto: Anubis bot wall on browse; API v2 retired; API v3 not tested (needs a key). Mammal sound coverage for Kruger unfinished.
- Macaulay Library reuse terms: licensing page **HTTP 404**; terms unfinished.
- Waterberg Bioquest and EWT Red List text: no reusable licence found on the fetched pages/PDFs.
- Skinner (paywalled, £274) and Stuart (commercial, unaccessed) were not read. Unfinished: Afrikaans family names and later species text from those books, only if a legal copy is available. Ask before spending money.

### Inclusion not accepted without a stronger source

- **Rhinonycteridae** (trident bats): one research-grade iNaturalist observation of *Cloeotis percivali* in place 69020. The species is **not** on the 2011 SANParks checklist. The family was **not** added. Revisit if the live SANParks list or the Fahr-updated iNat checklist 8810 confirms it.
- **Hominidae**: iNaturalist taxonomy shows 7 observations in the place; almost certainly people. Not a wild KNP family in the official list. Excluded.
- **Lemuridae**: one observation in the place taxonomy tree. Lemurs are not on the official list and are not native. Treated as a misidentification or non-wild record. Excluded.
- Domestic dog (`Canis familiaris`) and domestic cat (`Felis catus`): research-grade iNaturalist records in the place, not on the official checklist. Flagged under Canidae and Felidae; not used as inclusion evidence.
- Waterberg-only species (e.g. spotted-necked otter, Cape fox, ground squirrel) were not added.

### Names

- **`af` is null for 22 of 39 families.** The only cited family-vernacular source found was af.wikipedia (plus two cautious order/suborder cases: dassies, vrugtevlermuise). Waterberg headings are English. Paid field guides that may have Afrikaans family names were not accessed.
- Several English iNaturalist names are awkward for a Kruger field guide (e.g. “Nesomyids”, “Equines”, “Suids”, “Bovids”). Where Waterberg had a one-family heading it was preferred; Nesomyidae still has only the iNat name.
- af.wikipedia gives Molossidae as singular **losstertvlermuis**; stored as written.
- Latin spelling variant: **Thryonomyidae** (SANParks, iNaturalist) vs **Thryonomidae** (af.wikipedia, some other lists).

### Counts and later work

- This session did not publish a reliable species total from the PDF (wrapped lines made a naive count unsafe). Use the live official figure (147 or 148) only after that page can be read, or recount the PDF carefully in Phase 3.
- Research-grade iNaturalist coverage is thin for bats, shrews, golden moles, hedgehog, many rodents, and some antelope on the official list (e.g. oribi, suni, grey rhebok, red duiker). Absence of an iNat record was not treated as absence from KNP.
- Population estimates, photos, sounds and per-species text are out of scope for Phase 1. Sound sources in particular remain unverified.

## Phase 1 outputs

- `families.json` — 39 families in 14 orders, with English, Afrikaans (or null), Latin, order, inclusion evidence, sources and gaps.
- This file.

No GitHub repo was touched and no pull request was opened.

## Phase 2 hints (Bovidae worked example, 13 November 2026, Africa/Johannesburg)

Researched in a fresh session for the Bovidae worked example. The 2011 Wayback PDF was fetched to a temporary path, converted with `pdftotext -layout`, and deleted. **Do not host or copy that PDF into the repo.**

### What worked

- Same official list as Phase 1: <https://web.archive.org/web/20110102164614/http://www.sanparks.org/parks/kruger/conservation/scientific/ff/mammal_checklist.pdf> (HTTP 200, 24 277 bytes). `pdftotext -layout` gave one Bovidae species per line (22 species); scientific names in this family were not wrapped. English and Afrikaans names sit after the scientific name, separated by ` / `.
- iNaturalist family taxon: `https://api.inaturalist.org/v1/taxa?q=Bovidae&rank=family` → taxon id **42241**.
- Family-scoped research-grade counts: `https://api.inaturalist.org/v1/observations/species_counts?place_id=69020&taxon_id=42241&quality_grade=research&per_page=200` — 18 species in this pull. Cleaner than filtering the all-mammal species-counts endpoint.
- All-grade taxonomy tree: `https://api.inaturalist.org/v1/observations/taxonomy?place_id=69020&taxon_id=42241` — caught official species that have few or no research-grade records (oribi, grey rhebok, red duiker) and iNat-only bovids that species_counts omitted because they had 0 research-grade records. Suni was absent from this tree entirely.
- Totals for a single taxon, including subspecies: `https://api.inaturalist.org/v1/observations?place_id=69020&taxon_id={id}&quality_grade=research&per_page=1` and read `total_results`. This was required for *Alcelaphus buselaphus lichtensteinii* (16) versus *A. b. caama* (3); the species-level *A. buselaphus* count (19) mixes both.
- Synonym and remap checks: `https://api.inaturalist.org/v1/taxa?q={2011+scientific+name}&all_names=true`. Use `matched_term` plus scientific names with `locale=sci` and `is_valid=false`. Batch current taxa with `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}&all_names=true`.
- Every official bovid on the 2011 PDF has a printed Afrikaans name, so `af` was filled for all 22 included species from that source alone.

### What failed or was not used

- Live SANParks checklist HTML and PDF were not fetched again; Phase 1 already recorded HTTP 403. Inclusion remains the 2011 Wayback copy and has not been compared with the live 147–148 figure.
- iNaturalist HTML/JSON checklist 8810 was not used (Phase 1: HTTP 403/401).
- Parsing `taxa?q=` JSON with an inline `python3 -c` script failed when the script itself contained escaped quotes. Save the JSON to a file and parse it in a heredoc instead.
- Skinner & Chimimba and Stuart’s guide were not available. No rare / reintroduced / introduced flags were added for official Bovidae species: the 2011 PDF does not mark any of them with an asterisk (asterisks on that list are only for house mouse and house/black rat under Muridae). Do not add such flags from memory.

### Remap and inclusion patterns to reuse on later families

- Keep official-list species even when the research-grade iNaturalist count is 0 (here: red duiker, oribi, grey rhebok, suni). Record the count as `0`, not `null`, when the endpoint was actually queried. Put iNat-only taxa in `candidates`, not `species`.
- If the 2011 name is still an active iNaturalist species of a different sense (a split), do not treat it as a synonym. Bushbuck is the worked example: *Tragelaphus scriptus* remains Northern Bushbuck (taxon 42341); Kruger research-grade records are *Tragelaphus sylvaticus* (Southern Bushbuck, taxon 1431867), and *T. scriptus sylvaticus* is listed as an invalid synonym of *T. sylvaticus*.
- If the 2011 name is lumped into a broader species, store the subspecies that still carries the 2011 English name, and check sister subspecies as candidates. Lichtenstein's hartebeest is the worked example: a search for *Sigmoceros lichtensteinii* matches *Alcelaphus buselaphus*, and the Kruger taxon was stored as *A. b. lichtensteinii*; *A. b. caama* (Red Hartebeest) went to candidates.
- Store official English and Afrikaans names from the 2011 PDF in `en` and `af`. When iNaturalist’s `preferred_common_name` differs by more than capitalisation, record that as an `en` remap and leave the stored `en` as the checklist name.
- Other scientific remaps confirmed from iNaturalist name lists in this session: *Taurotragus oryx* → *Tragelaphus oryx*; *Cephalophus natalensis* → *Cephalophorus natalensis*; *Neotragus moschatus* → *Nesotragus moschatus*.


## Phase 2 hints (batch 1: Giraffidae, Hippopotamidae, Suidae, Equidae, Rhinocerotidae, 13 November 2026, Africa/Johannesburg)

Researched in a fresh session for the first five-family batch after the Bovidae worked example. The 2011 Wayback PDF was again fetched to a temporary path, converted with `pdftotext -layout`, and deleted. **Do not host or copy that PDF into the repo.**

### What worked

- Same official-list URL as Phase 1 and the Bovidae example (HTTP 200, 24 277 bytes). These five families are short and unwrapped: Giraffidae (1 species), Hippopotamidae (1), Suidae (2), Equidae (1), Rhinocerotidae (2). English and Afrikaans names sit after the scientific name, separated by ` / `. None of these official species is marked with an asterisk. Every official species has a printed Afrikaans name.
- iNaturalist family taxon ids from `https://api.inaturalist.org/v1/taxa?q={Family}&rank=family`: Giraffidae **42153**, Hippopotamidae **42146**, Suidae **42118**, Equidae **43328**, Rhinocerotidae **43341**.
- Family-scoped research-grade counts and all-grade taxonomy trees used the same place_id **69020** patterns as Bovidae.
- Subspecies and infrahybrid totals again needed `https://api.inaturalist.org/v1/observations?place_id=69020&taxon_id={id}&quality_grade=research&per_page=1` and `total_results`. `per_page=1` still returns a full observation record (large JSON); only `total_results` is required. Save to a file and read that field; do not parse the observation body unless needed.
- Batch current taxa with `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}&all_names=true`.

### Remap and inclusion patterns from this batch

- The bushbuck split pattern recurred. *Giraffa camelopardalis* remains Northern Giraffe (taxon 42157); Kruger research-grade records are *Giraffa giraffa* (Southern Giraffe, taxon 1510571, 3245). *Giraffa camelopardalis giraffa* is listed as an invalid scientific name of *G. g. giraffa*. *Phacochoerus aethiopicus* remains Desert Warthog (taxon 42123); Kruger records are *Phacochoerus africanus* (Common Warthog, taxon 42122, 1556), and *P. aethiopicus africanus* is an invalid synonym of *P. africanus*.
- A split may lack an iNaturalist synonym link. *Potamochoerus porcus* remains Red River Hog (taxon 42139) and does not appear in the place tree; Kruger bushpig records are *Potamochoerus larvatus* (taxon 42138, 3 research-grade). iNaturalist lists no invalid scientific names on *P. larvatus*, and `taxa?q=Potamochoerus%20porcus%20larvatus` returned 0 results. The Kruger taxon was still stored as *P. larvatus* because that is the iNaturalist species whose preferred common name is Bushpig and which has the Kruger records. Log the missing synonym list as a gap; do not invent a synonym.
- The Lichtenstein's hartebeest lump pattern was applied to *Equus burchelli*. A search for that 2011 name matches species *Equus quagga* (taxon 43335), which lists *Equus burchelli* as an invalid scientific name. The stored taxon is subspecies *Equus quagga burchellii* (taxon 447362), whose preferred common name is Burchell's Zebra. Sister subspecies *E. q. chapmani* (taxon 418151, 1802 research-grade) went to candidates. The subspecies count for *E. q. burchellii* is only 1; the species-level total is 2430. Record both, and do not move the included taxon up to the species without the owner's yes.
- When the 2011 list is already a subspecies, keep that subspecies and check sisters as candidates. Black rhinoceros is listed as *Diceros bicornis minor* (taxon 147643, 20 research-grade); *D. b. bicornis* (taxon 147644, 3 research-grade) is a candidate. White rhinoceros stays at the 2011 species name *Ceratotherium simum* (877 research-grade); *C. s. simum* identifications in the tree were not treated as a separate candidate.
- Infrahybrids under an included species can be candidates. Giraffidae has *Giraffa giraffa angolensis × giraffa giraffa* (taxon 1511527, 4 research-grade).
- *Hippopotamus amphibius* is unchanged (2350 research-grade). The only remap is English: checklist Hippopotamus vs iNaturalist Common Hippopotamus.
- *species_counts* remains species-rank only. Always use observation `total_results` for subspecies, hybrids, and sister-subspecies checks.

### What failed or was not used

- Live SANParks checklist HTML and PDF were not fetched again; Phase 1 already recorded HTTP 403.
- iNaturalist HTML/JSON checklist 8810 was not used (Phase 1: HTTP 403/401).
- Skinner & Chimimba and Stuart’s guide were not available. No rare / reintroduced / introduced flags were added: the 2011 PDF does not mark any species in these five families with an asterisk.


## Batch 15 hints (vesper bats part 1, 15 November 2026, Africa/Johannesburg)

### Banana bat (Afronycteris nanus), 16 calls
- `site:ewt.org Afronycteris nanus` found https://ewt.org/project/banana-bat/ first try (2016 PDF uses Neoromicia nana). Only Kruger record is a 1977 thatched-roof colony that may be A. cf. helios, so status was omitted.
- Wikipedia: use `Afronycteris_nana`, `Neoromicia_nana` or `Pipistrellus_nanus` (redirect to Banana serotine); the "Banana bat" article is a Mexican species. ADW `Afronycteris_nanus` missing; `Neoromicia_nanus` is a stub.
- iNat 1431034: Kruger record at Letaba camp (-23.855, 31.576) dropped; kept 2 KZN banana/Strelitzia leaf roosts (CC BY-NC). Sound cuts sat on Satara and Lower Sabie camp coordinates.

### Long-tailed serotine bat (Cnephaeus hottentotus), 17 calls
- `site:ewt.org` with current plus old (Eptesicus) names found https://ewt.org/project/long-tailed-serotine-bat/ first; definite Kruger record, movement unknown, so resident. EWT Afrikaans is "Langstert-dakvlermuis" (hyphen; list form kept).
- Wikipedia redirects to a stub ("Long-tailed house bat", still Eptesicus): IUCN and habitat only. ADW current genus missing; old genus is classification only, so skip ADW for small vespers.
- iNat 1596136: Kruger photos and sounds all at Lower Sabie or Crocodile Bridge (-25.358, 31.894) camps; 6986 records were mist-net, in-hand or spectrogram .png files.

### Butterfly bat (Glauconycteris variegata), 17 calls
- `site:ewt.org` plus the Chiroptera tag page gave https://ewt.org/project/butterfly-bat/; definite Kruger record (Pafuri capture, Hassanin et al. park specimens), movement unknown, so resident. EWT HTML clipped the male total length.
- Wikipedia latin-name parse worked first time (Variegated butterfly bat; Rambaldini 2010 appearance). Older names: Chalinolobus variegatus.
- iNat: Kruger 69020 empty; 6986 had one natural foliage group at St Lucia (2 CC BY-NC photos kept).

### Damara woolly bat (Kerivoula argentata), 13 calls
- Exact EWT URLs: curl https://ewt.org/project_tag/chiroptera/ and read the hrefs (WebFetch drops links). 2025 page is the right species: NT, definite Kruger record from riverine forest at Pafuri (Monadjem et al. 2020), migration unlikely, so resident.
- Wikipedia latin parse works; mass figures conflict with EWT (kept in the size note). iNat taxon 40456: 0 licensed photos (69020, 6986), 0 sounds.

### Lesser woolly bat (Kerivoula lanosa), 10 calls
- https://ewt.org/project/lesser-woolly-bat/ is this species; definite Kruger record, movement unknown, so resident. Gives only mean forearm and total length: quote in the note, no invented ranges.
- Wikipedia latin parse is short but has pelage. iNat taxon 40468: 69020 empty; the one licensed 6986 record (Gert Sibande) is in-hand, dropped.

### Botswana long-eared bat (Laephotis angolensis), 16 calls
- EWT 2025 page is https://ewt.org/project/botswana-long-eared-bat/ titled L. cf. botswanae: L. botswanae s.s. is a synonym of savanna L. angolensis, and South African animals (including Kruger) are a distinct unnamed clade. Status omitted; `needsReview` set for the owner.
- Wikipedia "Laephotis angolensis" (Angolan long-eared bat) gives pelage and IUCN DD 2019, but its range is Angola/DRC. No Afrikaans on the EWT page. iNat taxon 40531: 0 licensed photos or sounds in 69020 and 6986.

### Cape serotine bat (Laephotis capensis), 14 calls
- EWT slug is https://ewt.org/project/cape-roof-bat/ (not cape-serotine); no Kruger mention and movement not specified, so status omitted.
- Wikipedia `Laephotis capensis` redirects to "Cape serotine" with Stuart 2007 size and appearance. iNat taxon 1431030: 0 licensed Kruger photos; the only Kruger sound was at Berg-en-Dal camp (about -25.425, 31.450). 6986 photos are mostly houses, in-hand, dead or laid-out bats.

### Rufous hairy bat (Myotis bocagii), 10 calls
- Exact slug from https://ewt.org/project_tag/chiroptera/ (page 1 lists most bats; check page 2 if needed). EWT names Great Limpopo Transfrontier Park but never Kruger, so status omitted; GLTP alone is not enough.
- Wikipedia is a stub; no appearance anywhere. iNat taxon 74698: 0 licensed photos (69020, 6986), 0 Kruger sounds.

### Temminck's hairy bat (Myotis tricolor), 15 calls
- https://ewt.org/project/temmincks-hairy-bat/: movement Migratory (summer maternity caves, winter hibernacula) and only Great Limpopo Transfrontier Park named, so status omitted. Wikipedia title is "Cape hairy bat" (appearance and contrast with M. bocagii).
- Photos: 2 southern African (Vhembe foliage; Langeberg cave). Photo-level licences can be stricter than the observation licence; drop all-rights-reserved photos. Drop harp-trap and board/table shots too.

## Phase 2 hints (batch 3: Cercopithecidae, Galagidae, Elephantidae, Manidae, Orycteropodidae, Procaviidae, Leporidae, 13 November 2026, Africa/Johannesburg)

Researched in a fresh session for seven small families. The 2011 Wayback PDF was again fetched to a temporary path, converted with `pdftotext -layout`, and deleted. **Do not host or copy that PDF into the repo.** Galagidae is printed as **Lorisidae** on that PDF; inclusion used that heading, and the family name stored is the Phase 1 remap in `families.json`.

### What worked

- Same official-list URL as earlier Phase 2 sessions (HTTP 200, 24 277 bytes). These seven families are short and unwrapped: Cercopithecidae (2 species and 1 subspecies), Lorisidae/Galagidae (2 species), Elephantidae (1), Manidae (1), Orycteropodidae (1), Procaviidae (2), Leporidae (3). English and Afrikaans names sit after the scientific name, separated by ` / `. None of these official taxa is marked with an asterisk. Every official species has a printed Afrikaans name.
- iNaturalist family taxon ids from `https://api.inaturalist.org/v1/taxa?q={Family}&rank=family`: Cercopithecidae **43443**, Galagidae **71390**, Elephantidae **43692**, Manidae **43358**, Orycteropodidae **47060**, Procaviidae **43084**, Leporidae **43095**.
- Family-scoped research-grade counts and all-grade taxonomy trees used the same place_id **69020** patterns as Bovidae. Querying Cercopithecidae by taxon id correctly excluded Hominidae.
- Subspecies and official taxa missing from `species_counts` again needed `https://api.inaturalist.org/v1/observations?place_id=69020&taxon_id={id}&quality_grade=research&per_page=1` and `total_results`. Used for *Cercopithecus mitis erythrarchus*, *C. m. albogularis*, *C. mitis*, *Chlorocebus aethiops*, and *Pronolagus crassicaudatus*.
- Batch current taxa with `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}&all_names=true`.

### Remap and inclusion patterns from this batch

- The bushpig-style split (no iNaturalist synonym link) recurred. *Chlorocebus aethiops* remains Grivet Monkey (taxon 43523) and does not appear in the place tree (0 research-grade); Kruger research-grade records are *Chlorocebus pygerythrus* (Vervet Monkey, taxon 68137, 1360). Searches for *Chlorocebus aethiops pygerythrus* and *Cercopithecus aethiops pygerythrus* returned 0 results, and the *C. pygerythrus* name list has only *Cercopithecus pygerythrus* as an invalid scientific name. The 2011 printed synonym `(=Cercopithecus aethiops)` is an invalid scientific name of the grivet, not of the vervet. The Kruger taxon was still stored as *C. pygerythrus* because that is the iNaturalist species whose preferred common name is Vervet Monkey and which has the Kruger records. Log the missing synonym list as a gap; do not invent a synonym.
- A genus transfer is not a split. A search for *Manis temminckii* matches *Smutsia temminckii* (taxon 75083, 15 research-grade), which lists *Manis temminckii* as an invalid scientific name. *Manis temminckii* is not kept as a different active species.
- When the 2011 list is already a subspecies, keep that subspecies and check sisters that appear in the place as candidates. Samango monkey is listed as *Cercopithecus mitis erythrarchus* (taxon 147602). Observation `total_results` is 0, and the subspecies is absent from the place tree. Sister *C. m. albogularis* (taxon 147597, preferred_common_name Sykes' Monkey) is in the tree (1 observation of any grade, 0 research-grade) and went to candidates. The parent species *C. mitis* also has 0 research-grade (2 of any grade). Flag an owner question when the stored official subspecies is absent and a sister is the only subspecies present, even if the sister does not dominate numerically in the *E. q. chapmani* sense.
- *Pronolagus crassicaudatus* (Natal red rock rabbit) stays on the official list with research-grade count **0**, not null: it is absent from both `species_counts` and the place taxonomy tree, and observation `total_results` is 0.
- *Lepus microtis* (African Savanna Hare, taxon 1558607, 9 research-grade) is an iNaturalist-only candidate. It is a separate active species (invalid names *Lepus victoriae* and *Lepus crawshayi*), not a synonym or recorded split of *Lepus capensis* or *Lepus saxatilis*. Do not remap the official hares from it.
- English remaps were recorded where the iNaturalist `preferred_common_name` differs by more than capitalisation (e.g. Thick-tailed bushbaby → Brown Greater Galago; Elephant → African Savanna Elephant; Pangolin → Temminck's Ground Pangolin; Rock dassie → Rock Hyrax; Yellow-spotted rock dassie → Bush Hyrax; Natal red rock rabbit → Natal Red Rockhare). Capitalisation-only differences were not stored as remaps (Vervet monkey, Cape hare, Scrub hare, and the matching name Chacma Baboon).
- The PDF sometimes inserts a typographic space in a hyphenated English name (`Yellow -spotted rock dassie`). Store the intended hyphenated form and note the spacing in the species record.
- *Papio ursinus* (1557), *Otolemur crassicaudatus* (139), *Galago moholi* (47), *Loxodonta africana* (4894), *Orycteropus afer* (7), *Procavia capensis* (42), *Heterohyrax brucei* (29) and *Lepus saxatilis* (118) are unchanged in Latin. *Lepus capensis* is unchanged in Latin and has only 1 research-grade observation (3 of any grade).
- Subspecies identifications under an included species-rank taxon (e.g. *Papio ursinus griseipes*, *Chlorocebus pygerythrus pygerythrus*, *Procavia capensis capensis*) were not treated as separate candidates, following the white rhinoceros pattern.

### What failed or was not used

- Live SANParks checklist HTML and PDF were not fetched again; Phase 1 already recorded HTTP 403.
- iNaturalist HTML/JSON checklist 8810 was not used (Phase 1: HTTP 403/401).
- Skinner & Chimimba and Stuart’s guide were not available. No rare / reintroduced / introduced flags were added: the 2011 PDF does not mark any species in these seven families with an asterisk.


## Batch 16 hints (vesper bats part 2, 15 November 2026, Africa/Johannesburg)

### Welwitsch's hairy bat (Myotis welwitschii), 12 calls
- https://ewt.org/project/welwitschs-hairy-bat/ is correct; names only Great Limpopo Transfrontier Park, movement unknown, so status omitted. Forearm figures can sit under the wrong heading; quote only what is shown.
- Wikipedia latin parse (Welwitsch's bat) gives the colour account EWT lacks. iNat taxon 40336: only Kruger record is a dead bat in a ground hornbill's bill; other licensed sets handled.

### Anchieta's bat (Neoromicia anchieta), 20 calls
- No 2025 page: the red-list table links only the 2016 PDF, filed as Hypsugo anchietae; it names Kruger with no migrant pattern, so resident. `needsReview` for genus and spelling.
- The tag page's page 2 has no project cards in static HTML (loaded by script); if a species is missing from page 1, go to the site: search or the red-list table instead of paging.
- Wikipedia latin parse redirects to Anchieta's serotine. iNat taxon 1431023 has zero observations.

### Somali serotine bat (Neoromicia zuluensis), 9 calls
- https://ewt.org/project/zulu-pipistrelle-bat/ is N. zuluensis (not N. somalica); names Kruger and cites a Kruger diet study, movement unknown, so resident. List English "Somali serotine bat" differs from EWT "Zulu pipistrelle" and Wikipedia "Zulu serotine"; `needsReview`.
- iNat taxon 765532: 0 licensed photos (69020, 6986), 0 sounds.

### Schlieffen's bat (Nycticeinops schlieffenii), 17 calls
- https://ewt.org/project/schlieffens-bat/ is this species; names only Great Limpopo Transfrontier Park, so status omitted (an "Unknown" movement entry alone does not block resident when Kruger is named).
- Wikipedia: the current latin name is missing; `Nycticeius schlieffeni` redirects to "Schlieffen's serotine". iNat taxon 57550: 0 Kruger photos or sounds; the one SA licensed record was indoors in hand.

### African pipistrellus (Pipistrellus hesperidus), 17 calls
- 2025 page is https://ewt.org/project/dusky-pipistrelle/ (body is P. hesperidus). It names GLTP, Soutpansberg and "Pafuri regions" but not Kruger, so status omitted; owner may judge Pafuri enough. EWT also gives Afrikaans "Kuhlvlermuis".
- Wikipedia latin parse redirects to a Madagascar-focused "Dusky pipistrelle" stub. Licensed SA photos were street, captured, drowned or rescued bats.

### Rusty bat (Pipistrellus rusticus), 11 calls
- EWT https://ewt.org/project/rusty-bat/ matched the species; names GLTP only, movement Unknown, so status omitted.
- Wikipedia parse API (redirects=1) gives the short "Rusty pipistrelle" stub: IUCN and a 3.5 g average mass only. Skip ADW.
- iNat taxon 40361; licensed photo and sound queries for places 69020 and 6986 both empty.
- Keep the list's English name over "Rusty pipistrelle".

### Lesser yellow house bat (Scotophilus borbonicus), 12 calls
- EWT /project/lesser-yellow-house-bat/ is an assessment of S. viridis (synonym S. borbonicus viridis); it names Kruger for S. viridis. Don't copy its ecology into borbonicus.
- Wikipedia Scotophilus_borbonicus redirects to a Madagascar/Réunion stub (IUCN DD). Status omitted for doubtful identity; needsReview.
- iNat taxon 40441 empty in 69020 and 6986.
- Tag page also has yellow-house-bat, giant-yellow-house-bat, thomas-house-bat, white-bellied-house-bat.

### Yellow house bat (Scotophilus dinganii), 16 calls
- EWT /project/yellow-house-bat/ is S. dinganii; names Kruger, movement Unknown, so resident.
- Wikipedia Scotophilus dinganii redirects to "African yellow bat". Litter size: EWT usually one, Wikipedia twins; both recorded.
- iNat taxon 40436: four Kruger RG records, all camps, building roosts or handled; 6986 also unusable. Empty images expected for house bats.
- Extra camps to drop: Orpen (~-24.475, 31.391), Pretoriuskop (~-25.17, 31.27).

### Rüppell's bat (Vansonia rueppellii), 14 calls
- EWT /project/ruppels-pipistrelle/ (header Vansonia rueppellii); names northern Kruger and a Kruger diet study, movement Unknown, so resident. 2025 regional NT D2.
- Wikipedia Vansonia rueppellii redirects to "Rüppell's bat"; skip ADW.
- iNat taxon 1431041: 0 photos/sounds in 69020 and 6986.

## Phase 2 hints (batch 2: Canidae, Felidae, Herpestidae, Hyaenidae, Mustelidae, Viverridae, 13 November 2026, Africa/Johannesburg)

Researched in a fresh session for the second Phase 2 batch, the six Carnivora families. The 2011 Wayback PDF was again fetched to a temporary path, converted with `pdftotext -layout`, and deleted. **Do not host or copy that PDF into the repo.**

### What worked

- Same official-list URL as Phase 1 and earlier Phase 2 batches (HTTP 200, 24 277 bytes). These six families are unwrapped: Canidae (4 species), Felidae (6), Herpestidae (8), Hyaenidae (3), Mustelidae (3), Viverridae (3). English and Afrikaans names sit after the scientific name, separated by ` / `. None of these official species is marked with an asterisk. Every official species has a printed Afrikaans name. Felidae also prints synonym lines (`=Felis caracal`, `=F. lybica`, `=Felis serval`). Hyaenidae already lists aardwolf as the subspecies *Proteles cristatus cristatus*.
- iNaturalist family taxon ids from `https://api.inaturalist.org/v1/taxa?q={Family}&rank=family`: Canidae **42043**, Felidae **41944**, Herpestidae **41893**, Hyaenidae **41884**, Mustelidae **41770**, Viverridae **41574**.
- Family-scoped research-grade counts and all-grade taxonomy trees used the same place_id **69020** patterns as earlier batches.
- Observation totals for taxa missing from `species_counts`, and for subspecies checks, used `https://api.inaturalist.org/v1/observations?place_id=69020&taxon_id={id}&quality_grade=research&per_page=0` and `total_results`. `per_page=0` returns the count without observation bodies, which is smaller than the `per_page=1` pattern used in batch 1.
- Batch current taxa with `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}&all_names=true`.

### Remap and inclusion patterns from this batch

- Two jackals are simple scientific remaps, not splits: *Canis adustus* → *Lupulella adusta* (taxon 1210965, 57 research-grade); *Canis mesomelas* → *Lupulella mesomelas* (taxon 1210966, 513). *Lycaon pictus* is unchanged (879); the English remap is Wild dog → African Wild Dog. *Otocyon megalotis* is unchanged and has 0 research-grade observations; it is also absent from the place Canidae taxonomy tree.
- The bushbuck split pattern recurred for the African wild cat and the small-spotted genet. *Felis silvestris* remains European Wildcat (taxon 922459); Kruger research-grade records are *Felis lybica* (African Wildcat, taxon 371414, 123). The 2011 list already prints `(=F. lybica)`. The *F. lybica* species record does not list *Felis silvestris* or *Felis silvestris lybica* as a scientific name; the only synonym link found is at subspecies rank (*Felis silvestris cafra* as an invalid name of *F. l. cafra*). Log that missing species-level link. *Genetta genetta* remains Northern Small-spotted Genet (taxon 925661); Kruger research-grade records are *Genetta felina* (Southern Small-spotted Genet, taxon 925659, 41), and *Genetta genetta felina* is an invalid scientific name of *G. felina*. Residual place observations identified as *G. genetta* (0 research-grade, 1 of any grade) were left in candidates.
- The bushpig split pattern (no iNaturalist synonym link) recurred for the large-spotted genet. *Genetta tigrina* remains Cape Genet (taxon 41595) and does not resolve to *Genetta fieldiana*. Kruger research-grade records are *G. fieldiana* (Rusty-spotted Genet, taxon 1643992, 188), which lists Large-spotted Genet as an English name and *Genetta maculata* as an invalid scientific name. iNaturalist lists no *Genetta tigrina* scientific names on *G. fieldiana*. Store *G. fieldiana*, log the missing synonym list, and leave residual *G. tigrina* observations (0 research-grade, 1 of any grade) in candidates.
- When a 2011 subspecies has been elevated to species, store the species that now carries that trinomial as an invalid name, not the defunct subspecies. Aardwolf is the worked example: a search for *Proteles cristatus cristatus* matches species *Proteles cristatus* (taxon 1306005, Southern Aardwolf), which lists the 2011 trinomial as an invalid scientific name. The former sister subspecies is now *Proteles septentrionalis* (Eastern Aardwolf). That sister was queried in the place (0 research-grade) and is absent from the taxonomy tree, so it was not added as a candidate. *P. cristatus* itself also has 0 research-grade observations and is absent from the tree.
- Other scientific remaps confirmed from iNaturalist name lists in this session: *Galerella sanguinea* → *Herpestes sanguineus*; *Hyaena brunnea* → *Parahyaena brunnea*; *Aonyx capensis* → *Lutra capensis*.
- If the 2011 list is already at species rank, stay at species even when the official English name is the preferred name of a subspecies. *Aonyx capensis* maps to species *Lutra capensis* (26 research-grade); Cape clawless otter is the preferred name of subspecies *L. c. capensis* (18 research-grade), not a listed English name of the species. This is not the Burchell's zebra lump, because the 2011 binomial is an invalid name of the species, not of a newly lumped broader species whose English identity sits only at subspecies rank.
- Official species with 0 research-grade counts were kept, with the count stored as `0` after an observation-totals query: bat-eared fox, Selous' mongoose, large grey mongoose, Meller's mongoose, aardwolf, brown hyaena, and striped polecat. Brown hyaena has 1 observation of any grade identified only to the genus *Hyaena*; that was not counted as the species.
- Domestic dog (*Canis familiaris*, 2 research-grade) and domestic cat (*Felis catus*, 3) are candidates only, with `flags: ["domestic"]`. They are not on the 2011 PDF.
- *species_counts* remains species-rank only. Use observation `total_results` for official species missing from that pull, and for subspecies checks. `per_page=0` is enough when only the count is needed.

### What failed or was not used

- Live SANParks checklist HTML and PDF were not fetched again; Phase 1 already recorded HTTP 403.
- iNaturalist HTML/JSON checklist 8810 was not used (Phase 1: HTTP 403/401).
- Skinner & Chimimba and Stuart’s guide were not available. No rare / reintroduced / introduced flags were added: the 2011 PDF does not mark any species in these six families with an asterisk.

## Batch 14 hints (horseshoe bats, 15 November 2026, Africa/Johannesburg)

### Peak-saddle horseshoe bat (Rhinolophus blasii), 12 calls
- No 2025 EWT page; 2016 PDF …/40.-Peak-saddle-Horsehoe-Bat-…_NT.pdf ("Horsehoe" typo is real). Pafuri record; partial migration suggested, so status omitted. ewt.org/project/peters-horseshoe-bat/ is R. lobatus, not this.
- Wikipedia short; ADW full account. iNat 40673: zero in 69020 and 6986.

### Geoffroy's horseshoe bat (Rhinolophus clivosus), 13 calls
- No 2025 EWT page; 2016 PDF …/42.-Geoffroys-Horseshoe-Bat-Rhinolophus-clivosus_LC.pdf lists Kruger among protected areas. Moves up to 10 km between caves (not migrant).
- Wikipedia short but useful; ADW stub. iNat 320633: 69020 zero; 6986 Oudtshoorn cave roost obs 334336064 kept.
- Stoffberg et al. clades flagged, not remapped.

### Darling's horseshoe bat (Rhinolophus darlingi), 17 calls
- 2025 EWT https://ewt.org/project/darlings-horseshoe-bat/: Kruger in Conservation, SA resident, no migration. Body correct (stray "shrew" alt text only).
- Wikipedia gives pelage and measurements (EWT clips them); ADW stub.
- iNat 338548: only obs 354001 at Olifants Rest Camp; zero photos.

### Rüppell's horseshoe bat (Rhinolophus fumigatus), 17 calls
- `site:ewt.org Rhinolophus fumigatus` returns the 2016 PDF first; the Chiroptera tag page gives the 2025 URL https://ewt.org/project/ruppells-horseshoe-bat/ (two l's; not the `ruppels-pipistrelle` slug). The 2025 body is this species; Kruger appears in Population Information and Conservation (northern Kruger subpopulations). No "migrat"; countries-table seasonality is blank.
- Wikipedia parse (redirects=1) is short but has the Kingdon et al. 2013 pelage and nose-leaf description; no forearm or mass. ADW is a classification stub only.
- iNat 69020 and 6986 licensed photos: both 0. No 69020 sounds.

### Hildebrandt's horseshoe bat (Rhinolophus hildebrandtii), 13 calls
- No EWT page under this name: after Taylor et al. 2012 the regional lists carry R. cohenae and R. smithersi instead. Check the https://ewt.org/red-list/ Chiroptera table and the 2025 summary Excel (https://ewt.org/wp-content/uploads/2026/01/2025-Regional-Mammal-Red-List-summary-listings.xlsx, linked from /resources/mammal-red-list/); no row means stop. Cite split taxa for taxonomy only.
- Wikipedia parse is a stub (habitats and IUCN only); ADW classification only.
- iNat taxon 183175 lumps the split names; 69020 had 0 licensed photos; 6986 had 2, both dropped (farmhouse; handled).

### Lander's horseshoe bat (Rhinolophus landeri), 14 calls
- No 2025 landeri page; the red-list Chiroptera row links only the 2016 PDF (no "Kruger" or "migrat"; only Great Limpopo Transfrontier Park). The southern African animals are now R. lobatus: https://ewt.org/project/peters-horseshoe-bat/ gives the split, pre-2000 records, and Brinkley et al. (2021) not finding it in northern Kruger. Use it for taxonomy and region facts only; keep list names.
- Afrikaans: list has "Lander se…", 2016 EWT has "Landers se…"; logged as a gap.
- Wikipedia parse is thin (size, etymology); ADW stub. iNat taxon 40680: 0 licensed photos (69020, 6986), 0 sounds.

### Bushveld horseshoe bat (Rhinolophus simulator), 13 calls
- No 2025 page; `site:ewt.org Rhinolophus simulator` returns the 2016 PDF (…/49.-Bushveld-Horseshoe-Bat-Rhinolophus-simulator_LC.pdf), which the red-list row also links. Two-column PDF: Kruger is in the Conservation list of protected areas; "migrat" only describes females' spring move to maternity roosts, not a species-level migrant pattern.
- Wikipedia parse is a stub (range, habitat, IUCN 2017 LC); ADW classification only. iNat taxon 40693: 0 licensed photos (69020, 6986), 0 sounds.

### Swinny's horseshoe bat (Rhinolophus swinnyi), 13 calls
- `site:ewt.org Rhinolophus swinnyi` returns the 2016 PDF and the R. rhodesiae page; the Chiroptera tag page from the same search gives https://ewt.org/project/swinnys-horseshoe-bat/ (body is this species). No "Kruger" and no "migrat": after the split R. swinnyi is KZN and Eastern Cape only, and northeastern animals are R. rhodesiae. Regional VU C2a(i), declining.
- Wikipedia (Skinner & Chimimba 2005) gives appearance and size; ADW stub. iNat taxon 40670: 0 licensed photos (69020, 6986), 0 sounds.

## Phase 2 hints (batch 4: Emballonuridae, Hipposideridae, Miniopteridae, Molossidae, Nycteridae, Pteropodidae, Rhinolophidae, Vespertilionidae, 13 November 2026, Africa/Johannesburg)

Researched in a fresh session for the eight Chiroptera families. The 2011 Wayback PDF was again fetched to a temporary path, converted with `pdftotext -layout`, and deleted. **Do not host or copy that PDF into the repo.** Miniopteridae is printed under **Vespertilionidae** on that PDF; inclusion used that heading, and the family name stored is the Phase 1 remap in `families.json`.

### What worked

- Same official-list URL as earlier Phase 2 sessions (HTTP 200, 24 277 bytes). Printed counts: Pteropodidae (3 species), Emballonuridae (1), Nycteridae (2), Rhinolophidae (8), Hipposideridae (2), Vespertilionidae (20 taxa, including *Miniopterus schreibersii*), Molossidae (6). English and Afrikaans names sit after the scientific name, separated by ` / `. Several synonym and Afrikaans lines wrap; *Tadarida fulminans* wraps the Afrikaans name as `Madagaskarse` / `grootlosstersvlermuis`. None of these official taxa is marked with an asterisk. Every official species has a printed Afrikaans name.
- iNaturalist family taxon ids from `https://api.inaturalist.org/v1/taxa?q={Family}&rank=family`: Emballonuridae **41334**, Hipposideridae **71378**, Miniopteridae **155314**, Molossidae **41226**, Nycteridae **41183**, Pteropodidae **40782**, Rhinolophidae **40641**, Vespertilionidae **40269**.
- Family-scoped research-grade counts and all-grade taxonomy trees used the same place_id **69020** patterns as earlier batches. Expect many official bats to be absent from `species_counts`; query observation `total_results` and store `0`, not `null`, when the endpoint was queried.
- Batch current taxa with `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}&all_names=true`. Name searches used `taxa?q={2011-scientific-name}&all_names=true`, including printed synonyms.
- Observation totals in this session used `per_page=1` (batch 2 noted that `per_page=0` is enough when only the count is needed).

### Remap and inclusion patterns from this batch

- The bat-specific split rule was needed twice. If it is unclear which split product occurs in Kruger and there are no Kruger records to decide it, keep the 2011 name and flag an owner question rather than guess. *Hipposideros commersoni* is listed by iNaturalist as an invalid scientific name of *Macronycteris commersonii* (taxon 851027), while *Macronycteris vittata* (taxon 851017) is a separate active species whose name list does not include the 2011 combination; neither has Kruger records. *Scotophilus borbonicus* remains an active species (taxon 40441); *S. viridis* (taxon 40433) is a separate active species with no synonym link; neither has species-rank Kruger records (many place observations are identified only to genus *Scotophilus*).
- When Kruger records do decide a split, store the current Kruger taxon and record the split, even if the 2011 binomial is missing from the current taxon's synonym list (log that missing link). *Epomophorus gambianus* remains Gambian Epauletted Fruit Bat (taxon 40812); Kruger has 1 observation of any grade of *Epomophorus crypturus* (taxon 64485, Peters's Epauletted Fruit Bat), and the 2011 list already prints `(=E. crypturus crypturus)` and the English name Peters' epauletted fruit bat. *Miniopterus schreibersii* remains Schreibers' Long-fingered Bat (taxon 57534); Kruger records in this family are *Miniopterus natalensis* (taxon 57530, 2 of any grade, 0 research-grade), which lists *Miniopterus schreibersii natalensis* as an invalid scientific name.
- A genus transfer is not a split. Examples: *Chaerephon ansorgei* → *Mops ansorgei*; *Neoromicia nanus* → *Afronycteris nanus*; *Pipistrellus rueppellii* → *Vansonia rueppellii*; *Eptesicus hottentotus* → *Cnephaeus hottentotus*; *Neoromicia capensis* → *Laephotis capensis*; *Pipistrellus anchietai* → *Neoromicia anchieta*.
- Exact 2011 spellings may return 0 results even when a printed synonym or close spelling matches the current taxon. Log the missing exact-spelling link and remap from the synonym that iNaturalist does list: *Mops condylus* (0 results) → *Mops condylurus* via *Tadarida condylura*; *Chaerephon pumila* (0 results) → *Mops pumilus* via *Tadarida pumila*; *Glauconycteris variegatus* (0 results) → *Glauconycteris variegata* via *Chalinolobus variegatus*; *Nyctinomus mastersoni* (0 results) while *Tadarida mastersoni* is an invalid name of *Tadarida fulminans*.
- Two official printed species may lump into one current taxon. *Eptesicus melckorum* is listed by iNaturalist as an invalid scientific name of the already-included *Laephotis capensis*. Record it as a remap of that included species; do not give it a second species row. Vespertilionidae therefore has 18 stored species from 19 official printed taxa after *Miniopterus* is moved out.
- When a 2011 subspecies has been elevated to species, store the species that now carries the printed synonym, even if a search for the trinomial itself returns 0 results. *Eptesicus somalicus zuluensis* (0 results) is stored as *Neoromicia zuluensis* (taxon 765532) via `(=Eptesicus zuluensis)`. *Eptesicus somalicus* is an invalid name of a different species, *Neoromicia somalica*; that parent was queried (0 research-grade, absent from the tree) and was not added as a candidate. Log the missing trinomial link.
- When the 2011 list is already a subspecies but iNaturalist has no subspecies taxon, store the species and say so. A search for *Tadarida aegyptiaca aegyptiaca* returns only species *Tadarida aegyptiaca* (taxon 41300, 0 research-grade, 11 of any grade at species rank).
- *species_counts* can return a genus-rank row. Pteropodidae returned *Epomophorus* with 70 research-grade observations; the place tree has 494 of any grade at genus rank. Do not treat that as a species identification of either official *Epomophorus*.
- Keep official species with research-grade count 0, including many bats. *Nycteris woodi*, *Rousettus aegyptiacus*, six of eight *Rhinolophus*, *Tadarida fulminans*, and most official vespertilionids are absent from both `species_counts` and the place taxonomy tree, with observation `total_results` 0.
- English remaps were recorded where the iNaturalist `preferred_common_name` differs by more than capitalisation (e.g. Tomb bat → Mauritian Tomb Bat; Common slit-faced bat → Egyptian Slit-faced Bat; Peak-saddle horseshoe bat → Blasius's horseshoe bat; Egyptian fruit bat → Egyptian Rousette; Angola free-tailed bat → Angolan Free-tailed Bat). Capitalisation-only differences were not stored as remaps (Wahlberg's epauletted fruit bat, Wood's slit-faced bat, and the matching horseshoe-bat and free-tailed-bat names).
- The typographic-space pattern from batch 3 recurred: `Sundevall's leaf -nosed bat`, `Midas free -tailed bat`, and Afrikaans `Peters se witkol- vrugtevlermuis`. Store the intended hyphenated form and note the printed spacing. The Afrikaans capital in `Sundevall se Bladneusvlermuis` was stored as printed.
- *Rhinolophus hildebrandtii* remains an active iNaturalist species (1 observation of any grade, 0 research-grade). iNaturalist lists *R. cohenae*, *R. mabuensis*, and *R. smithersi* as invalid scientific names of that taxon; they were not treated as separate Kruger taxa.
- *Laephotis botswanae* is an invalid scientific name of *Laephotis angolensis* (a lump, not a split). *Myotis bocagei* → *Myotis bocagii* and *Nycticeinops schlieffeni* → *Nycticeinops schlieffenii* are spelling corrections.
- *Pipistrellus hesperidus* is already the 2011 name, with `(=Pipistrellus kuhlii)`. *P. kuhlii* remains a separate active species on iNaturalist, has 0 Kruger records, and was not added as a candidate. The PDF line `African pipistrellus/ Kuhl se vlermuis` has no space before the slash; store official `en` as African pipistrellus and `af` as Kuhl se vlermuis.
- iNaturalist-only candidates in this batch: *Eidolon helvum* (1 research-grade) under Pteropodidae, and *Pseudoromicia rendalli* (1) under Vespertilionidae. *Cloeotis percivali* (taxon 40777) still has 1 research-grade observation in place 69020, in Rhinonycteridae (taxon 446817), not in these eight families. It remains a family-level candidate and was not added to these files.

### What failed or was not used

- Live SANParks checklist HTML and PDF were not fetched again; Phase 1 already recorded HTTP 403.
- iNaturalist HTML/JSON checklist 8810 was not used (Phase 1: HTTP 403/401). Jakob Fahr's bat updates on that checklist remain unchecked.
- Skinner & Chimimba and Stuart’s guide were not available. No rare / reintroduced / introduced flags were added: the 2011 PDF does not mark any species in these eight families with an asterisk.

## Batch 13 hints (long-fingered and free-tailed bats, 15 November 2026, Africa/Johannesburg)

### Schreibers' long-fingered bat (Miniopterus natalensis), 14 calls
- No 2025 EWT page (ignore the M. fraterculus page); 2016 PDF …/21.-Natal-Long-fingered-Bat-Miniopterus-natalensis_LC.pdf: no Kruger mention, migratory (up to 260 km). Status omitted.
- Wikipedia and ADW stubs; skip Wikipedia's fish-catching claim.
- 69020 photos are rest-camp roosts; 6986 cave records (Hangklip, Boomslang) usable.

### Ansorge's free-tailed bat (Mops ansorgei), 13 calls
- 2025 EWT https://ewt.org/project/ansorges-free-tailed-bat/ (Mops ansorgei; 2016 used Chaerephon ansorgei): Kruger definite, no migration.
- Wikipedia useful (pelage, 16 g, tail, echolocation). ADW has no account under either name; skip.
- iNat 1430965: only two licensed obs (dead at Letaba camp; Pretoriuskop camp). Zero photos.

### Angola free-tailed bat (Mops condylurus), 17 calls
- No 2025 EWT page; 2016 PDF has a definite Kruger record ("migrat" only refers to insects at turbines).
- Wikipedia short (Smith 1833 appearance, IUCN 2017); ADW no account.
- iNat 765544, 69020: 12 licensed photos, all camp/picnic/roof/handled (Letaba, Satara, Pretoriuskop, Lower Sabie, Mopani, Mlondozi, Nwanetsi). Zero photos.

### Midas free-tailed bat (Mops midas), 16 calls
- 2025 EWT https://ewt.org/project/midas-free-tailed-bat/ (body correct; Afrikaans matches list). Kruger definite, movement not specified.
- Wikipedia useful; ADW classification only.
- iNat 765553: 69020 one Pretoriuskop camp obs; 6986 gloved Musina bat and Pafuri River Camp shot. Zero photos.

### Little free-tailed bat (Mops pumilus), 16 calls
- 2025 EWT https://ewt.org/project/little-free-tailed-bat/ (2016 PDF under Chaerephon pumilus). Kruger record plus van der Merwe et al. 1986 Kruger parturition peaks.
- ADW: try old genus (Chaerephon_pumilus). Wikipedia redirect works.
- iNat 1370990: 69020 9 licensed photos and 4 sounds, all camp/roof/grounded; 6986 thumbs all handled or indoor. Zero photos.

### Egyptian free-tailed bat (Tadarida aegyptiaca), 17 calls
- 2025 EWT https://ewt.org/project/egyptian-free-tailed-bat/: Kruger named, South Africa Resident, movement not specified.
- Wikipedia and ADW (Eiting 2006) both full.
- iNat 41300: 69020 9 photos and 5 sounds, all rest camps; 6986 thumbs handled or on buildings. Zero photos.

### Madagascar large free-tailed bat (Tadarida fulminans), 8 calls
- 2025 EWT https://ewt.org/project/malagasy-free-tailed-bat/: Data Deficient (was LC 2016). Pafuri record but not recorded recently; status omitted.
- Wikipedia and ADW stubs. iNat 41296: zero in 69020 and 6986.

## Phase 2 hints (batch 5: Bathyergidae, Gliridae, Hystricidae, Muridae, Nesomyidae, Pedetidae, Sciuridae, Thryonomyidae, Erinaceidae, Soricidae, Chrysochloridae, Macroscelididae, 13 November 2026, Africa/Johannesburg)

Researched in a fresh session for the last Phase 2 batch, the eight Rodentia families plus Erinaceidae, Soricidae, Chrysochloridae and Macroscelididae. The 2011 Wayback PDF was again fetched to a temporary path, converted with `pdftotext -layout`, and deleted. **Do not host or copy that PDF into the repo.** Nesomyidae is printed under **Muridae** on that PDF; inclusion used that heading for the four remapped genera, and the family name stored is the Phase 1 remap in `families.json`.

### What worked

- Same official-list URL as earlier Phase 2 sessions (HTTP 200, 24 277 bytes). These twelve families unwrap as: Bathyergidae (1 species), Gliridae (1), Hystricidae (1), Muridae (19 printed species, of which 5 belong in Nesomyidae, leaving 14), Nesomyidae (those 5), Pedetidae (1), Sciuridae (1), Thryonomyidae (1), Erinaceidae (1), Soricidae (6), Chrysochloridae (2), Macroscelididae (3). English and Afrikaans names sit after the scientific name, separated by ` / `. Every official species has a printed Afrikaans name. Two official murids are marked with an asterisk: house mouse (*Mus musculus*) and house/black rat (*Rattus rattus*). Those are the only asterisks on the 2011 list and were stored as `flags: ["introduced"]`.
- Several printed spellings needed a note, not a silent correction: `Pedetes capensi s` (space in *capensis*); `Hystris africaeaustralis` (a search for that spelling returned 0 results; the current taxon is *Hystrix africaeaustralis*); `Calcochloris obtrusirostris` (a search for that spelling returned 0 results; the current taxon is *Calcochloris obtusirostris*); and English `Short-shouted elephant-shrew` (stored as printed; iNaturalist uses Short-snouted). Official English *Springhaas* and *Greater canerat* were also stored as printed.
- iNaturalist family taxon ids from `https://api.inaturalist.org/v1/taxa?q={Family}&rank=family`: Bathyergidae **43744**, Gliridae **71385**, Hystricidae **44167**, Muridae **44185**, Nesomyidae **71382**, Pedetidae **45927**, Sciuridae **45933**, Thryonomyidae **46276**, Erinaceidae **43011**, Soricidae **46341**, Chrysochloridae **42478**, Macroscelididae **43209**.
- Family-scoped research-grade counts and all-grade taxonomy trees used the same place_id **69020** patterns as earlier batches. Erinaceidae, Soricidae and Chrysochloridae had 0 species in `species_counts`. Muridae had 11, Nesomyidae 2, Macroscelididae 3, and the remaining seven families 1 each.
- Observation totals for official species missing from `species_counts`, and for candidates with 0 research-grade records, used `https://api.inaturalist.org/v1/observations?place_id=69020&taxon_id={id}&quality_grade=research&per_page=0` and `total_results`. Many official small mammals have count **0**, stored as `0` not null.
- Batch current taxa with `https://api.inaturalist.org/v1/taxa?id={comma-separated-ids}&all_names=true`. For typographic spellings that return 0, also search the corrected spelling and record the miss.

### Remap and inclusion patterns from this batch

- A typographic letter typo is not a split. Searches for *Hystris africaeaustralis* and *Calcochloris obtrusirostris* returned 0 results. Store *Hystrix africaeaustralis* and *Calcochloris obtusirostris*, and record a latin remap from the printed typo. *Pedetes capensi s* is the same name with a typographic space: store *Pedetes capensis* and note the spacing, as with `Yellow -spotted rock dassie`.
- If the official English name contains an apparent typo (*Short-shouted elephant-shrew*), store the printed form and record the iNaturalist preferred name as an `en` remap. Do not silently correct the official `en`.
- The bushbuck split pattern recurred for the giant rat. *Cricetomys gambianus* remains Northern Giant Pouched Rat (taxon 44512, 0 observations of any grade in the place); Kruger research-grade records are *Cricetomys ansorgei* (Southern Giant Pouched Rat, taxon 1453959, 6), and *Cricetomys gambianus ansorgei* is an invalid scientific name of *C. ansorgei*. The *C. gambianus* name list also includes *Cricetomys ansorgei* as an invalid scientific name; that conflicting synonym was logged and was not treated as making the two active taxa the same. Residual *C. gambianus* observations were not added as a candidate (0 of any grade). One observation identified only to genus *Cricetomys* was not assigned to either species.
- A genus transfer is not a split: *Tatera leucogaster* → *Gerbilliscus leucogaster* (taxon 74367, 3 research-grade); *Aethomys namaquensis* → *Micaelamys namaquensis* (taxon 851046, 1). *Suncus lixus* → *Suncus lixa* (taxon 1370725, 0 research-grade, 1 of any grade) is a spelling remap of the epithet; *Suncus lixus* is not kept as a different active species.
- When an official 2011 species is still an active iNaturalist species, and a similar iNat-only species is present with no synonym or trinomial link, keep the official name and put the other in candidates. Do not guess a split. *Cryptomys hottentotus* (Common Molerat, 0 research-grade, 2 of any grade) stays official; *Cryptomys natalensis* (Natal Mole-rat, 2 research-grade) is a candidate (a search for *Cryptomys hottentotus natalensis* returned 0 results). *Aethomys chrysophilus* (1 research-grade) stays official; *Aethomys ineptus* (1 research-grade) is a candidate (a search for *Aethomys chrysophilus ineptus* returned 0 results).
- Flag an owner question when the official species is absent from the place and a similar species is the only one present, but there is no synonym or trinomial link. *Acomys spinosissimus* (Spiny mouse, taxon 901997, 0 of any grade) stays official; *Acomys selousi* (Selous' Spiny Mouse, taxon 901998, 3 research-grade) is a candidate (a search for *Acomys spinosissimus selousi* returned 0 results). *A. spinosissimus* still lists Spiny Mouse as an English name; *A. selousi* does not.
- Other iNaturalist-only candidates: *Paraxerus palliatus* (0 research-grade, 3 of any grade), *Suncus varilla* (0 research-grade, 1 of any grade), *Rhabdomys chakae* (1 research-grade), and *Mus neavei* (0 research-grade, 1 of any grade). None is a synonym of an official species.
- Genus-rank identifications are not candidates and are not assigned to official species. *Dendromus* has 1 observation of any grade at genus rank, while both official *Dendromus* species have 0. *Crocidura* has 2 at genus rank; all five official *Crocidura* species have 0 and are absent from the tree.
- If the 2011 list is already at species rank, stay at species. Subspecies identifications under an included species (*Hystrix africaeaustralis africaeaustralis* and *zuluensis*, *Paraxerus cepapi cepapi* and *carpi*, *Petrodromus tetradactylus schwanni*, *Grammomys dolichurus dolichurus*, *Mus minutoides marica*) were not treated as separate candidates. *Atelerix frontalis* stays at species rank even though Southern Hedgehog is the preferred name of *A. f. frontalis*.
- Official species with 0 research-grade counts were kept, with the count stored as `0` after an observation-totals query. That includes all six official soricids, both official golden moles, the hedgehog, *Cryptomys hottentotus*, *Otomys angoniensis*, *Acomys spinosissimus*, *Dasymys incomtus*, *Mus musculus*, both official *Mastomys*, and both official *Dendromus* plus *Steatomys pratensis*. Erinaceidae has an empty place taxonomy tree.
- English remaps were recorded where the iNaturalist `preferred_common_name` differs by more than capitalisation (e.g. Tree squirrel → Smith's Bush Squirrel; Springhaas → Southern Springhare; Greater canerat → Greater Cane Rat; Giant rat → Southern Giant Pouched Rat; House rat → Black Rat; Four-toed elephant-shrew → Four-toed Sengi; Short-shouted elephant-shrew → Short-snouted Sengi; Reddish-grey musk shrew → Reddish-gray Musk Shrew). A British/American spelling difference such as grey/gray is a remap, not capitalisation-only. Capitalisation-only differences were not stored as remaps (Woodland dormouse, Cape porcupine, Common molerat, Bushveld gerbil, Grey climbing mouse, Chestnut climbing mouse, Natal multimammate mouse, Red veld rat, House mouse, Swamp musk shrew, Greater dwarf shrew, Yellow golden mole, Juliana's golden mole, and the matching Angoni vlei rat).
- *Paraxerus cepapi* (1008), *Hystrix africaeaustralis* (61), *Pedetes capensis* (54), *Thryonomys swinderianus* (14), *Lemniscomys rosalia* (10), *Thallomys paedulcus* (9), *Cricetomys ansorgei* (6), *Mus minutoides* (6), *Grammomys dolichurus* (6), *Graphiurus murinus* (4) and *Saccostomus campestris* (4) are unchanged in Latin, or are unchanged once a typographic typo is closed up, aside from the English remaps above. *Petrodromus tetradactylus* (15), *Elephantulus myurus* (15) and *Elephantulus brachyrhynchus* (2) are unchanged in Latin.

### What failed or was not used

- Live SANParks checklist HTML and PDF were not fetched again; Phase 1 already recorded HTTP 403.
- iNaturalist HTML/JSON checklist 8810 was not used (Phase 1: HTTP 403/401).
- Skinner & Chimimba and Stuart’s guide were not available. No rare or reintroduced flags were added. The only introduced flags in this batch are the two 2011 asterisks under Muridae.


## Batch 11 hints (Nesomyidae and shrews, 15 November 2026, Africa/Johannesburg)

### Grey climbing mouse (Dendromus melanotis), 18 calls
- One EWT search finds the 2025 page https://ewt.org/project/grey-climbing-mouse/ (titled Poemys melanotis) and the 2016 PDF …/2022/11/10.-Grey-Climbing-Mouse-Dendromus-melanotis_LC.pdf. Both list Kruger. Flag Poemys / species complex; don't remap.
- ADW /accounts/Dendromus_melanotis/ is a real short account. Wikipedia is a stub.
- iNat 44971: 0 at place 69020. Place 6986: uMkhanyakude wild shots worked; drop tub or cloth shots.

### Chestnut climbing mouse (Dendromus mystacalis), 15 calls
- EWT 2025 page https://ewt.org/project/chestnut-climbing-mouse/ (still Dendromus, lists Kruger) and 2016 PDF …/2022/11/12.-Chestnut-Climbing-Mouse-Dendromus-mystacalis_LC.pdf.
- ADW /accounts/Dendromus_mystacalis/ is a real account with sizes. Wikipedia is a stub.
- iNat 44976: 0 at place 69020; place 6986 had only one record (in a tub). Zero photos.

### Fat mouse (Steatomys pratensis), 15 calls
- EWT 2025 page https://ewt.org/project/fat-mouse/ is worth reading in full (Kruger diet and burrow citations); 2016 PDF …/2022/11/59.-Fat-Mouse-Steatomys-pratensis_LC.pdf. Not /project/krebs-fat-mouse/.
- ADW is a stub; Wikipedia is a stub.
- iNat 44923: 0 at place 69020; place 6986 had one held animal. Zero photos.

### Reddish-grey musk shrew (Crocidura cyanea), 18 calls
- EWT 2025 https://ewt.org/project/reddish-grey-musk-shrew/ is the main text source; it doesn't mention Kruger, so status was omitted. 2016 PDF …/2022/11/2.-Reddish-grey-Musk-Shrew-Crocidura-cyanea_LC.pdf.
- Wikipedia (American "gray") and ADW are stubs.
- iNat 46777: 0 at place 69020. Place 6986: many dead, cat-killed, boxed or trapped shrews, so thumbnails are needed. Kept one ZF Mgcawu shot.

### Tiny musk shrew (Crocidura fuscomurina), 13 calls
- EWT 2025 https://ewt.org/project/tiny-musk-shrew/ mentions Kruger; 2016 PDF …/2022/11/4.-Tiny-Musk-Shrew-Crocidura-fuscomurina_LC.pdf.
- Wikipedia ("Bicolored musk shrew") and ADW are stubs.
- iNat 46592: 0 at place 69020; the 3 records at place 6986 were all unusable. Zero photos.

### Lesser red musk shrew (Crocidura hirta), 14 calls
- EWT 2025 https://ewt.org/project/lesser-red-musk-shrew/ mentions Kruger and cites Kern 1981 (a Kruger fire study); 2016 PDF …/2022/11/5.-Lesser-Red-Musk-Shrew-Crocidura-hirta_LC.pdf.
- Wikipedia and ADW are stubs.
- iNat 46621: 0 at place 69020; place 6986 had one handheld record. Zero photos.

### Swamp musk shrew (Crocidura mariquensis), 12 calls
- EWT 2025 /project/swamp-musk-shrew/ says there are no Kruger data and it only presumably occurs, so status was omitted. Near Threatened. 2016 PDF …/2022/11/7.-Swamp-Musk-Shrew-Crocidura-mariquensis_NT.pdf.
- Wikipedia is a full Kingdon-based account (size, pelage, litter). ADW is a stub.
- iNat 46612: 0 at place 69020; place 6986 had one dead record. Zero photos.

### Peters' musk shrew (Crocidura silacea), 15 calls
- EWT 2025 https://ewt.org/project/lesser-grey-brown-musk-shrew/ names Kruger; 2016 PDF …/2022/11/8.-Lesser-Grey-brown-Musk-Shrew-Crocidura-silacea_LC.pdf. EWT says it's almost indistinguishable from C. cyanea.
- Wikipedia and ADW are stubs.
- iNat 46772: 0 at place 69020 and 0 licensed at place 6986.

### Greater dwarf shrew (Suncus lixa), 11 calls
- EWT 2025 /project/greater-dwarf-shrew/ (as Suncus lixus) lists Kruger; 2016 PDF …/2022/11/15.-Greater-Dwarf-Shrew-Suncus-lixus_LC.pdf.
- Wikipedia is a stub; ADW returns not-found.
- iNat 1370725: 0 at place 69020; place 6986 had one wild Vhembe set (CC BY), and both photos were kept.

## Owner decisions (13 Nov 2026)

- Burchell's zebra is stored at species level as *Equus quagga*, and its subspecies are ignored. The species has 2,431 research-grade records in place 69020.
- The Samango monkey (*Cercopithecus mitis erythrarchus*) is left out because it has 0 Kruger records. It moves to `excluded`.
- Bat names keep the 2011 nomenclature, including *Hipposideros commersoni* and *Scotophilus borbonicus*.
- *Acomys spinosissimus* is left out because it has no Kruger records. *A. selousi* stays a candidate.
- Vagrant and commensal rule: leave out any species that only lives in or around rest camps because it arrived with people, and wouldn't persist without them. *Mus musculus* and *Rattus rattus* move to `excluded`, and domestic dog and cat stay out.
- Left-out rows are kept in each family file's `excluded` array with an `excludedReason`, not deleted.


## Batch 12 hints (golden moles and first bats, 15 November 2026, Africa/Johannesburg)

### Yellow golden mole (Calcochloris obtusirostris), 13 calls
- EWT 2025 https://ewt.org/project/yellow-golden-mole/ records it from the Nyadu Sandveld in Kruger. Near Threatened. 2016 PDF …/2022/11/6.-Yellow-Golden-Mole-Calcochloris-obtusirostris-Near-Threatened.pdf has the underfur mark.
- Wikipedia and ADW are stubs.
- iNat 42519: 0 at place 69020; the one licensed record at place 6986 showed only runs in sand. Golden-mole records are often tracks, dead or handled animals.

### Juliana's golden mole (Neamblysomus julianae), 17 calls
- EWT 2025 https://ewt.org/project/julianas-golden-mole/ (Endangered); 2016 PDF …/2022/11/17.-Julianas-Golden-Mole-Neamblysomus-julianae-Endangered.pdf.
- Wikipedia is fuller, and ADW has a real account.
- iNat 42531: 0 at place 69020. Place 6986 has 35 records, mostly Tshwane gardens showing tunnels or handled animals. Zero photos.

### Wahlberg's epauletted fruit bat (Epomophorus wahlbergi), 20 calls
- EWT Chiroptera tag page lists every bat /project/ link; 2025 page https://ewt.org/project/wahlbergs-epauletted-fruit-bat/ (do not guess slugs).
- 2025 page has definite Kruger record plus diet/telemetry (Fenton 1985; Bonaccorso 2014; Adams and Snode 2015).
- Wikipedia full account; ADW /accounts/Epomophorus_wahlbergi/ is a real account (useful for fruit bats).
- iNat 69020: 0 licensed photos, 0 sounds. Place 6986 per_page 30: drop estates, zoo, handled, dead, thatch; foliage roosts from uMkhanyakude usable.
- EWT Afrikaans "Wahlberg se Vrugtevlermuis" differs from 2011 list name; kept list name, flagged.

### Peters's epauletted fruit bat (Epomophorus crypturus), 12 calls
- 2025 EWT slug /project/peters-epauletted-fruit-bat/; 2016 PDF titled Gambian Epauletted Fruit Bat. Kruger record with Bonaccorso et al. 2014 telemetry, Ficus sycomorus diet, Adams and Snode 2015 male calls.
- Wikipedia short (mass, forearm, young); ADW classification stub only.
- iNat 64485: 69020 empty; 6986 only a mist-net capture. Zero photos.

### Egyptian fruit bat (Rousettus aegyptiacus), 16 calls
- 2025 EWT slug /project/egyptian-fruit-bat/ (not the Egyptian free-tailed bat). Kruger named; "present, at least at times of the year". No Afrikaans on the page.
- Wikipedia full article; ADW /accounts/Rousettus_aegyptiacus/ (Cohen 2011) full account.
- iNat 75042: 69020 empty. 6986 has wild cave roosts (Mission Rocks, Wynberg, Groot Winterhoek); drop Helderberg handled, Musina mist-net, Nthakeni camp.

### Tomb bat (Taphozous mauritianus), 17 calls
- 2025 EWT https://ewt.org/project/mauritian-tomb-bat/: header usable, but the ecology/habitat/threats body is a pasted shrew account (mentions Crocidura silacea); not used. 2016 PDF is reliable (Schoeman 2006 diet; Fenton and Griffin 1997 foraging; definite Kruger record).
- Wikipedia and ADW both full accounts.
- iNat 69020 has many licensed photos, mostly camp thatch/eaves (Afsaal, Skukuza, picnic sites); one natural tree-trunk roost kept.

### Sundevall's leaf-nosed bat (Hipposideros caffer), 19 calls
- No 2025 EWT /project/ page; 2016 PDF https://ewt.org/wp-content/uploads/2022/11/11.-Sundevalls-Leaf-nosed-Bat-Hipposideros-caffer_LC.pdf has no Kruger mention.
- Wikipedia (redirects to Sundevall's roundleaf bat; Wright 2009) is the main measurements source; ADW stub.
- iNat 40761: 69020 has 12 licensed photos, all Lower Sabie camp, a picnic site or a rest-area bathroom; drop by coordinates. 6986 thumbs mostly buildings. Zero photos.

### Commerson's leaf-nosed bat (Hipposideros commersoni), 17 calls
- EWT 2025 /project/striped-leaf-nosed-bat/ (Macronycteris vittata); 2016 PDF as Hipposideros vittatus. Pafuri record (Rautenbach et al. 1984) and Thornybush. Near Threatened D2 (2025). Movement pattern Full Migrant, so status omitted (schema: resident means all year).
- Wikipedia H. commersoni is the Madagascar endemic; use Striped leaf-nosed bat page. ADW is a pre-split account; don't copy its figures.
- iNat 851017 (M. vittata): 69020 empty; 6986 Thornybush foliage roost obs 152915814 kept.

### Common slit-faced bat (Nycteris thebaica), 14 calls
- No 2025 EWT page; 2016 PDF …/33.-Egyptian-Slit-faced-Bat-Nycteris-thebaica_LC.pdf names Kruger in the Conservation section.
- Wikipedia (Egyptian slit-faced bat) and ADW both full accounts; ADW's "migratory" line is weak, don't let it override EWT.
- iNat 41192, 69020: 11 licensed photos; drop Lower Sabie, Malelane Satellite Camp, Bateleur Bushveld Camp, Timbavati Picnic Site (obs 1443084). Kept obs 151079 tree roost.

### Wood's slit-faced bat (Nycteris woodi), 16 calls
- 2025 EWT https://ewt.org/project/woods-slit-faced-bat/ (body correct): Pafuri record July 2006, population called resident. Near Threatened.
- Wikipedia and ADW stubs. iNat 41190 has only two observations worldwide (Zimbabwe); zero photos expected.

## Phase 4 hints (pro forma, Blue wildebeest, 13 Nov 2026)

Worked example: `data/species/details/connochaetes-taurinus.json`, schema in `docs/schema.md`. Later batches should reuse these patterns. Budget about 25 tool calls per species; this pro forma used about 25 research lookups (iNaturalist APIs, Wikimedia Commons API, xeno-canto pages, Wikipedia, Animal Diversity Web, the EWT species page, SANParks pages, and web searches). The official SANParks census PDF and the Macaulay Library search were attempted and failed, and are counted in that total.

### What worked

- **Kruger photographs, two sources.** Wikimedia Commons `generator=search` for `Connochaetes taurinus Kruger` in namespace 6, with `prop=imageinfo` and `iiprop=url|extmetadata|size`, returned many CC BY / CC BY-SA photographs taken in the park (Bernard DUPONT, CC BY-SA 2.0, was the richest Kruger set). iNaturalist research-grade photographs in place 69020, filtered with `photo_license=cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa`, are plentiful (1,260 of this species). Prefer `photo_license=cc0,cc-by,cc-by-sa` first; a CC BY nursing-calf photograph (Wynand Uys, observation 68397106) filled a view the Commons set already had at herd scale but not as a close suckling shot. Use the observation URL as `source`, the open-data `large` URL as `fileUrl`, and the iNaturalist `license_code` mapped to a named Creative Commons licence (`cc-by` → CC BY 4.0). Look at each thumb before tagging `view`, `age` and `sex`. Commons thumbnails 403 without a browser-like User-Agent; `curl -A Mozilla/5.0 …` worked.
- **Do not use East African white-bearded photographs as the main adult portrait** for this species in Kruger. Kruger holds the southern form, *C. t. taurinus*, which has a black beard. Many Commons results for the species are *C. t. mearnsi* at the Mara crossing.
- **Sounds.** xeno-canto API v3 needs a key and returned HTTP 401 without one. The HTML search `https://xeno-canto.org/explore?query=Connochaetes%20taurinus` worked from this environment and found three recordings, all CC BY-NC-SA 4.0. One is an adult male call from Kruger itself (XC1148048, grade A, African Bioacoustics Community / A. Karamitsos). Use the recording page for the licence, recordist, grade (the selected `rating-<id>-1` is A) and the mp3 `fileUrl`. iNaturalist had 0 sounds for this species in place 69020.
- **Population.** Prefer a SANParks census figure for Kruger, then the 2016 SANBI/EWT assessment. The March 2025 census sheet is `https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf`. It returned HTTP 403 (Cloudflare) from this environment; do not store the PDF. The SANParks Part 2 blog (HTML) fetched cleanly and confirms that wildebeest increased in the 2023 survey, but does not print the numeric range. The EWT HTML page `https://ewt.org/project/blue-wildebeest/` fetched cleanly and gives earlier Kruger figures (9,342–17,936 animals, or 12,555 mature individuals, in 2017) plus Least Concern and an increasing trend. The 2016 assessment URL pattern still holds: `https://ewt.org/wp-content/uploads/2022/11/6.-Blue-Wildebeest-Connochaetes-taurinus_LC.pdf`. Cite it; do not host it. **Wording rule (owner, 13 Nov 2026):** never put access glitches (HTTP codes, Cloudflare, "secondary reading", read dates) into species data. When a figure is not from the official source, write "One source claims…" or "Some sources claim…", set confidence to medium or low, and add "A more accurate figure may be available at this URL: <URL>" pointing to the official source.
- **Field text.** Wikipedia (`https://en.wikipedia.org/wiki/Blue_wildebeest`) and Animal Diversity Web (`https://animaldiversity.org/accounts/Connochaetes_taurinus/`) both fetched as HTML and were enough for size, diet, habits, young and predators when Skinner & Chimimba and Stuart were not available. Write the prose in your own words. Where the two sources disagree (for example mass 165–290 / 140–260 kg versus an unsexed 118–270 kg), put both in the `size.note` and do not pick a silent compromise. Cite Kruger-specific movement from the EWT page; do not describe the Serengeti migration as if it happened in Kruger.
- **Similar species.** Only use slugs that exist in `data/species-list.json`. Contrast the other species with sourced marks of the subject (black beard, brindle stripes, cow-like horns) rather than inventing the other species' colours from memory.

### What failed or was thin

- SANParks census PDF and, as before, live SANParks HTML: HTTP 403 (Cloudflare challenge).
- Macaulay Library catalog search: bot-check page, no usable result. Log it as a gap if it happens again.
- iNaturalist text search `q=calf` in place 69020 returned 0, even though calf photographs exist. Use Commons titles such as "females and youngs", or iNaturalist annotations (`term` for sex / life stage) and a look at the thumbs, not only a text query.
- xeno-canto API v3 is unusable without a key; use the HTML search in the meantime.
- Skinner & Chimimba and Stuart's guide remain unavailable. No iris colour, no sexed shoulder height, and no Kruger calving-month range were found. Leave those null.
- Genus- or family-level guesses, and East African migratory narrative, are not Kruger facts.

### Per-species call count (this example)

About 25 research lookups for *Connochaetes taurinus*, including the failed census-PDF and Macaulay attempts. Later species in a batch should aim at the same budget: a few iNaturalist calls, one Commons search, one xeno-canto HTML search, one Macaulay attempt, one census or Red List lookup, and two field-text sources, then stop and record gaps.

## Batch 1 hints (8 Bovidae: Impala, Tsessebe, Waterbuck, Buffalo, Kudu, Nyala, Sable, Eland, 13 Nov 2026, Africa/Johannesburg)

Details files: `data/species/details/<slug>.json` for `aepyceros-melampus`, `damaliscus-lunatus`, `kobus-ellipsiprymnus`, `syncerus-caffer`, `tragelaphus-strepsiceros`, `tragelaphus-angasii`, `hippotragus-niger`, `tragelaphus-oryx`. Branched from `data/phase4-proforma-wildebeest` because PR #6 was not yet on `main`.

### What worked

- **Population, same two secondary sources as the wildebeest pro forma.** `https://visitthekrugerpark.com/wildlife/` fetched as HTML 200 and quotes 2023 (buffalo: 2024) SANParks ranges and trend words for all of these species except nyala, which has habitat text but no count. Use "One source claims…", confidence medium, and "A more accurate figure may be available at this URL: https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf". EWT 2025 HTML assessments often give an earlier Kruger figure (useful as `previousEstimates`) and the regional status and national trend. Impala is the exception: the EWT Impala page already cites the same 2023 range of 123,998–168,451, but the two sources disagree on the Kruger trend (stable vs increasing); record both.
- **EWT project slugs are not always the checklist English name.** These fetched as 200: `/project/impala/`, `/project/tsessebe/`, `/project/greater-kudu/`, `/project/nyala/`, `/project/sable-antelope/` (also `/project/sable/`), `/project/eland/`, `/project/common-waterbuck/`, `/project/southern-savannah-buffalo/`. These 404'd: `/project/waterbuck/`, `/project/buffalo/`, `/project/african-buffalo/`, `/project/cape-buffalo/`, `/project/kudu/`, `/project/common-eland/`. A web search for `site:ewt.org` plus the scientific name found the two odd slugs. 2016 PDF URLs still work where tried (`14.-Common-Waterbuck-Kobus-ellipsiprymnus_LC.pdf`, `29.-Southern-Savannah-Buffalo-Syncerus-caffer_LC.pdf`); cite, do not host. The 2025 pages do not always link a new PDF.
- **Commons search `"{scientific name} Kruger"` in namespace 6 remains the richest Kruger set**, again largely Bernard DUPONT, CC BY-SA 2.0. For eland, search `Tragelaphus oryx Kruger` is almost useless (one hit, a book PDF). Search `Taurotragus oryx` or `Common Eland Kruger` instead; even then, DUPONT's eland set is from Mokala, Ithala, Camdeboo, Karoo and Mountain Zebra, not Kruger. For Kruger eland, use iNaturalist place 69020 (only 9 research-grade observations with a reusable licence in this pull). Check the Commons description for the place before writing a Kruger caption.
- **Title words such as "male", "female", "young", "calf", "lamb" and "nursery"** on Commons are a better calf-and-sex filter than iNaturalist `q=calf`. Still look at every thumb before tagging. A file titled "young male" may show no horns; do not tag sex from the title alone.
- **Field text.** Wikipedia extracts must be fetched one title at a time (`exintro` unset). A multi-title extracts query truncates badly (sable and kudu shrank to a few hundred characters). Animal Diversity Web accounts exist for all eight; eland is under `Taurotragus_oryx` (the `Tragelaphus_oryx` URL is a short stub). Wikipedia's common tsessebe page (`Common_tsessebe`) is the right field-text source for Kruger; do not use East African topi migration or Serengeti feeding hours as Kruger habits. *Damaliscus lunatus* on the official list is stored at species rank.
- **English names** stay as in `data/species-list.json` (the 2011 checklist): Impala, Tsessebe, Waterbuck, Buffalo, Kudu, Nyala, Sable, Eland — not "African buffalo", "Greater kudu", "Sable antelope" or "Common eland", though those may appear in remaps and in image alt text.

### What failed or was thin

- SANParks census PDF and the SANParks Part 2 blog both returned HTTP 403 (Cloudflare challenge) in this session. Do not mention that in the data files.
- **xeno-canto HTML search is now behind an Anubis proof-of-work wall** (`Verifying visitor request…`) and returned no recording pages from this environment, including via WebFetch. API v3 still needs a key. Do not mention the wall in the data; log "No licensable sound recording was included from xeno-canto or iNaturalist." iNaturalist sounds in place 69020 were 0 for seven species; buffalo had one observation, all-rights-reserved, so it was not used.
- Macaulay Library was not retried for this batch (the pro forma already found a bot-check page).
- Nyala has no recent Kruger count on the visitkruger sheet or the EWT page (only "greater Kruger … 3,000" from Anderson 2013). Leave `estimate` bounds null.
- Tsessebe and sable masses were published only as averages or typical values, not ranges; omit `massKg` rather than inventing min/max.
- Skinner & Chimimba and Stuart remain unavailable.

### EWT 2025 regional status from this batch

Least Concern: Impala, Waterbuck, Buffalo, Kudu, Nyala, Eland. Vulnerable: Tsessebe (regional trend declining), Sable (regional trend stable; Kruger subpopulation increasing).

## Batch 10 hints (small rodents, 15 November 2026, Africa/Johannesburg)
- Water rat (16 calls): EWT 2016 PDF 9.-African-Marsh-Rat-Dasymys-spp_VU.pdf records D. robertsii (not incomtus) in Kruger, so status omitted; 2025 Mammal Red List fact sheet ewt.org/wp-content/uploads/2026/02/Fact-Sheet_Mammal-Red-List_2.pdf lists updated statuses (useful for other species too). Wikipedia "African marsh rat" stub. ADW full 2020 account, Africa-wide. iNat 69020 and 6986: 0 licensed RG; zero photos.
- Bushveld gerbil (24 calls): EWT /project/bushveld-gerbil/ + 2016 PDF; Afrikaans Bosveldse nagmuis. No measurements anywhere (EWT, Wikipedia, ADW stub; /accounts/Tatera_leucogaster/ 404). iNat 69020 none usable; 6986 keepers Medike (CC BY) and Waterberg (CC BY-NC).
- Woodland mouse (20 calls): EWT 2016 PDF 23.-Woodland-Mouse-Grammomys-dolichurus_LC.pdf; no 2025 page. 2025 fact sheet lists only status CHANGES (absent = unchanged); pdftotext splits names across columns, search full text. Wikipedia "Woodland thicket rat" stub. ADW stub. iNat 69020 keeper obs 146695259 (Dupont, CC BY, near Letaba).
- Single-striped mouse (18 calls): EWT /project/single-striped-grass-mouse/ (Watson 1987 Kruger diet) + 2016 PDF. Wikipedia "Single-striped grass mouse" stub (Stuart 2007 sizes). ADW stub. iNat 69020: 7 licensed, none usable; 6986 keepers iMfolozi (CC BY-SA) and Zululand (CC BY-NC); drop watermarked Pilanesberg shots.
- Multimammate mouse M. coucha (16 calls): EWT combined 2016 PDF 32.-Multimammate-Mouse-Mastomys-spp_LC.pdf (Kneidinger et al. 2014: both species at Roan Camp, Kruger). M. natalensis has /project/natal-multimammate-mouse/. Wikipedia "Southern multimammate mouse". ADW stub. iNat 69020: 0; 6986: 3 licensed, all handled/building; zero photos.
- Natal multimammate mouse (18 calls): EWT /project/natal-multimammate-mouse/ is a full assessment, Afrikaans Natalse Vaalveldmuis. Wikipedia thin. ADW stub. No measurements anywhere. iNat 69020: 0 licensed; 6986 keeper obs 363660764 Waterberg (CC BY-NC).

### Namaqua rock mouse (Micaelamys namaquensis), 21 calls
- EWT search finds the 2016 PDF at once: https://ewt.org/wp-content/uploads/2022/11/34.-Namaqua-Rock-Mouse-Micaelamys-namaquensis_LC.pdf. No 2025 page. It does not mention Kruger, so status was omitted.
- Wikipedia (redirects to "Namaqua rock rat") and ADW are stubs; don't retry ADW under Aethomys.
- iNat taxon 851046. Place 69020 has one licensed record, in a tank (unusable). Place 6986: a Mapungubwe photo worked; drop live-traps, plastic sheets and the watermarked Vhembe photo. large.jpg is enough.

### Pygmy mouse (Mus minutoides), 15 calls
- EWT 2016 PDF: https://ewt.org/wp-content/uploads/2022/11/36.-Pygmy-Mouse-Mus-minutoides_LC.pdf (Afrikaans Dwergmuis, size, Kruger listed). /project/thomass-pygmy-mouse/ is Mus neavei; don't use it.
- Wikipedia "African pygmy mouse" is thin, with zoo-cited sizes; prefer EWT. ADW is a stub.
- iNat 69020 shots were near camps or handled. Place 6986: Thabazimbi 604820821 and Modimolle 588057749 kept. Some photos use large.jpeg, not .jpg.

### Angoni vlei rat (Otomys angoniensis), 17 calls
- EWT 2025 page: https://ewt.org/project/angoni-vlei-rat/ and 2016 PDF …/2022/11/40.-Angoni-Vlei-Rat-Otomys-angoniensis_LC.pdf. Both mention Kruger.
- ADW /accounts/Otomys_angoniensis/ is a short real account (mass, diet, habits; no lengths). Wikipedia is a stub.
- iNat 45439: 0 at place 69020. Place 6986: 5 licensed, 3 dead. Golden Gate and Buffelskloof (.jpeg) kept.

## Batch 2 hints (8 species: Giraffe, Hippopotamus, Warthog, Bushpig, Bushbuck, Reedbuck, Common duiker, Steenbok, 13 Nov 2026, Africa/Johannesburg)

Details files: `data/species/details/<slug>.json` for `giraffa-giraffa`, `hippopotamus-amphibius`, `phacochoerus-africanus`, `potamochoerus-larvatus`, `tragelaphus-sylvaticus`, `redunca-arundinum`, `sylvicapra-grimmia`, `raphicerus-campestris`. Branched from a fresh `origin/main` after PRs #6 and #7 were merged.

### What worked

- **Population.** `https://visitthekrugerpark.com/wildlife/` again fetched as HTML 200 and quotes 2023 SANParks figures for giraffe (10,345–14,554, increasing), hippo (5,889, a point count, up significantly since the late 1990s with a dip in the 2015/16 drought) and warthog (2,285–4,166, trend not stated). It has no figures for bushpig, bushbuck, reedbuck, common duiker or steenbok. The EWT 2025 pages for giraffe and hippo cite Greaver et al. 2024 for the same Kruger figures (giraffe also as a point estimate of 12,412 inside that range; hippo 5,889 at the end of 2023), so "Some sources claim…" is appropriate when both agree. For warthog, only the visitkruger page has the 2023 range; EWT gives an earlier Kruger estimate of 2,000–5,000 in 2012 (Ferreira et al. 2013), useful as `previousEstimates`, and leaves the 2023 trend unknown. Use "One source claims…" or "Some sources claim…", confidence medium or low, and "A more accurate figure may be available at this URL: https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf".
- **EWT 2025 HTML slugs from `site:ewt.org` plus the scientific name.** These fetched as 200: `/project/giraffe/`, `/project/hippopotamus/`, `/project/common-warthog/`, `/project/bushpig/`, `/project/southern-bushbuck/`, `/project/southern-reedbuck/`, `/project/common-duiker/`, `/project/steenbok/`. 2016 PDF URLs still work where listed (`10.-South-African-Giraffe-Giraffa-camelopardalis-giraffa_LC.pdf`, `11.-Hippopotamus-Hippopotamus-amphibius_LC.pdf`, `20.-Common-Warthog-Phacochoerus-africanus_LC.pdf`, `22.-Bushpig-Potamochoerus-larvatus_LC.pdf`, `33.-Southern-Bushbuck-Tragelaphus-sylvaticus_LC.pdf`, `26.-Southern-Reedbuck-Redunca-arundinum_LC.pdf`, `28.-Common-Duiker-Sylvicapra-grimmia_LC.pdf`, `25.-Steenbok-Raphicerus_campestris_LC.pdf` — note the underscore in `Raphicerus_campestris`). Cite, do not host.
- **No current Kruger count.** Bushbuck: EWT cites c. 500 in Kruger in 2009 (Ferreira et al. 2013); keep as `previousEstimates`, leave current `estimate` null. Reedbuck: EWT says Ferreira et al. (2013) suspected 300 in Kruger in 2009, but that recent counts recorded none. Research-grade iNaturalist observations show the species is still present; do not invent a current figure. Bushpig, common duiker and steenbok have no Kruger counts on either page.
- **Wikipedia and ADW names.** Fetch Wikipedia extracts one title at a time. Use `Southern_giraffe` for coat and range of *Giraffa giraffa*, but it is thin on measurements — the general `Giraffe` article is needed for size, with a note that those figures are for giraffes generally. Use `Cape_bushbuck` for *Tragelaphus sylvaticus*, not the lumped "Bushbuck" article. ADW has no account at `Giraffa_giraffa` or `Tragelaphus_sylvaticus` (soft 404). Use `Giraffa_camelopardalis` and `Tragelaphus_scriptus` and record that caveat. `Phacochoerus_africanus` and `Potamochoerus_larvatus` exist; do not use the desert warthog or red-river-hog accounts.
- **Commons search `"{scientific name} Kruger"` in namespace 6** remains the richest Kruger set for giraffe (also search `Giraffa camelopardalis Kruger`), hippo, warthog, bushbuck (also `Tragelaphus scriptus Kruger`), reedbuck, common duiker and steenbok, again largely Bernard DUPONT, CC BY-SA 2.0, with useful Charles J. Sharp and Derek Keats images. **Bushpig is the exception:** `Potamochoerus larvatus Kruger` and `Bushpig Kruger` returned no files. The only research-grade Kruger iNaturalist observations with a reusable licence are skulls (Makuleke, Ryan van Huyssteen, CC BY). Use live photographs from elsewhere (DUPONT at Mpila Camp, iMfolozi / Hluhluwe-iMfolozi Park; Derek Keats at Mapungubwe National Park) and put the actual place in the caption.
- **Sounds.** Follow the batch brief: check the iNaturalist place 69020 sounds API once per species and do not spend calls on xeno-canto HTML. Only hippo had recordings (two, both CC BY-NC, including one from Lake Panic). For the others, log "No reusable Kruger recording found."
- **English names** stay as in `data/species-list.json` (the 2011 checklist): Giraffe, Hippopotamus, Warthog, Bushpig, Bushbuck, Reedbuck, Common duiker, Steenbok — not "Southern giraffe", "Common hippopotamus", "Common warthog", "Southern bushbuck" or "Southern reedbuck", though those may appear in remaps, EWT titles and image alt text.

### What failed or was thin

- The official SANParks census PDF remains inaccessible from this environment. Keep that note here, not in the data files.
- xeno-canto HTML was not retried (batch 1 already found an Anubis wall). Macaulay Library was not retried.
- Reedbuck and common-duiker masses, and giraffe mass, were published only as averages, typical values, or "up to" bounds; omit `massKg` rather than inventing min/max. Common-duiker shoulder height and head-and-body length were only typical or average values, so those range fields are omitted. Hippo 5,889 is a point count, entered as low=high=5889.
- Skinner & Chimimba and Stuart remain unavailable.
- A `rg` scan for `403` will also match Wikimedia/Flickr file IDs that happen to contain those digits (for example a bushpig file numbered 31484039654). Prefer another file so the data-directory scan stays clean.

### EWT 2025 regional status from this batch

Least Concern, regional trend increasing: Giraffe, Warthog, Reedbuck. Least Concern, regional trend stable: Hippopotamus, Bushpig, Bushbuck, Common duiker, Steenbok. IUCN global status is Vulnerable for hippo (2017). A species-level IUCN global assessment for *Giraffa giraffa* was not found (IUCN accepted four giraffe species in 2025; older assessments treated giraffes as one species, Vulnerable).

## Batch 9 hints (rodents, 15 November 2026, Africa/Johannesburg)
- **Cape porcupine:** no EWT 2025 project page; 2016 PDF `/wp-content/uploads/2022/11/29.-Cape-Porcupine-Hystrix-africaeaustralis_LC.pdf`. Wikipedia `Cape_porcupine`; ADW full. iNat 44173; many Kruger records show quills, dung, camps or kills, so drop "quill" descriptions. The 2016 density figure is from a Northern Cape farm, not a park count. 28 calls.
- **Springhare:** EWT `/project/springhare/`, 2016 PDF `/wp-content/uploads/2022/11/51.-Springhare-Pedetes-capensis_LC.pdf`. Wikipedia `South_African_springhare`. ADW lumps P. surdaster and has an outdated VU line, so ignore both. iNat 45929; 54 RG records in 69020 (sandy north); many are at camp coordinates, including Shimuwini. 20 calls.
- **Tree squirrel:** EWT `/project/tree-squirrel/`, 2016 PDF `/wp-content/uploads/2022/11/48.-Tree-Squirrel-Paraxerus-cepapi_LC.pdf`. Wikipedia `Smith's_bush_squirrel`; ADW full (call types). iNat 46110; hundreds of photos in 69020, but many from camps or roads. In iNat place text, 'Mopani' can mean the district. One CC BY Kruger sound (obs 135954701). 20 calls.
- Greater cane rat (23 calls): EWT has only the 2016 PDF (ewt.org/wp-content/uploads/2022/11/63.-Greater-Cane-Rat-Thryonomys-swinderianus_LC.pdf), no 2025 /project/ page. Wikipedia Greater_cane_rat gives southern African sizes; ADW sizes are Africa-wide, note but don't average. iNat Kruger records are mostly rest-camp shots; also drop Berg-en-Dal, Pafuri picnic, Orpen. Skip SA fallback photos with camera-trap overlays or watermarks. No Kruger sounds.
- Giant rat (22 calls): has a 2025 EWT page (ewt.org/project/giant-rat/) plus 2016 PDF; one site:ewt.org search finds both. Wikipedia title Southern giant pouched rat (parse API). ADW only has C. gambianus account (Africa-wide); note, don't average. iNat 69020: 4 of 5 at Punda Maria camp (drop); obs 257698041 Pafuri area is ~2.4 km from picnic site, OK. Fill from 6986 (Lajuma, Louis Trichardt); drop trail-cam, roadkill, wall/bin shots.
- Woodland dormouse (37 calls, over limit): EWT /project/woodland-dormouse/ + 2016 PDF via one search. Wikipedia parse + ADW fine (ADW sizes lumped). Commons Kruger 0. iNat 69020 only 3 licensed RG, all thatch/handled/building. Photo hunt in 6986 ate the budget; keepers Bochum and Makhado, Limpopo.
- Common mole-rat (17 calls, hard 22 budget worked): EWT only the lumped 2016 PDF (8.-Common-Mole-rats-Cryptomys-spp_LC.pdf); Kruger animals are C. natalensis / possibly nimrodi per EWT 2016, flagged, not remapped. Wikipedia sizes cite ADW (not independent). 69020 licensed photos 0; 6986 mostly mounds; zero photos accepted. Afrikaans Vaalmol/Grysmol on the PDF.
- Tree rat (20 calls): EWT /project/tree-rat/ + 2016 PDF (61.-Tree-Rat-Thallomys-paedulcus_LC.pdf), Afrikaans Boomrot. Wikipedia "Acacia rat" stub is unreliable on synonyms. ADW partly lumped with T. nigricauda. iNat 69020: 8 licensed RG, all camps/thatch. 6986 keeper: obs 172666915 Hoedspruit.
- Red veld rat (16 calls): EWT /project/red-veld-rat/ (Kruger north of Olifants; A. ineptus now synonym), no measurements. Wikipedia title "Red rock rat". ADW is a classification stub, skip. iNat 69020: 0 licensed; 6986 only bagged/trapped/indoor shots; zero photos.
- Pouched mouse (18 calls): EWT only 2016 PDF (57.-Pouched-Mouse-Saccostomus-campestris_LC.pdf). Wikipedia redirects to "South African pouched mouse" (stub). ADW is a full 2004 account (Africa-wide). iNat 69020 none usable; 6986 keeper obs 11017591 Medike (CC BY).

## Batch 3 hints (9 carnivores: Lion, Leopard, Cheetah, Caracal, Serval, African wild cat, Spotted hyaena, Brown hyaena, Aardwolf, 14 November 2026, Africa/Johannesburg)

Details files: `data/species/details/<slug>.json` for `panthera-leo`, `panthera-pardus`, `acinonyx-jubatus`, `caracal-caracal`, `leptailurus-serval`, `felis-lybica`, `crocuta-crocuta`, `parahyaena-brunnea`, `proteles-cristatus`. Branched from a fresh `origin/main` after PRs #6, #7 and #8 were merged.

### What worked

- **Carnivore figures come from special surveys, not the official aerial herbivore sheet.** Cite the survey (call-up, visitor-photograph census, ranger estimate) and the year. Store a point count as `low=high` with a note. Leave `estimate` null, with confidence low, when no Kruger figure exists. Do not write as if the March 2025 wildlife-trends PDF were the source of a lion, leopard, cheetah or hyaena count; in the sheet source note, say that the official aerial sheet covers large herbivores. The wording rule still applies when a figure is only a secondary reading: "Some sources claim…" or "One source claims…", confidence medium or low.
- **EWT 2025 HTML slugs from `site:ewt.org` plus the scientific name.** These fetched as 200: `/project/lion/`, `/project/leopard/`, `/project/cheetah/`, `/project/caracal/`, `/project/serval/`, `/project/southern-african-wildcat/`, `/project/spotted-hyaena/`, `/project/brown-hyaena/`, `/project/aardwolf/`. The 2025 pages did not always link a 2016 PDF; cite a 2016 PDF only when its URL is already known, and do not host it. English names stay as in `data/species-list.json` (Lion, Leopard, Cheetah, Caracal, Serval, African wild cat, Spotted hyaena, Brown hyaena, Aardwolf), not "Southern African Wildcat" or "Laughing Hyaena". The 2011 Afrikaans names are also kept (including Strandjut and Aardwolf; EWT also lists Bruinhiëna / Strandwolf and Maanhaarjakkals).
- **Survey figures used in this batch.** Lion: 2015 call-up 1,715–1,891 (Ferreira and Funston 2020, cited on the EWT 2025 page); visitkruger still quotes the older 2005/06 figure of about 1,500–1,700 or 1,600 ±225 — record both. Leopard: no park-wide census; about 1,000 is a 2009 ranger estimate (confidence low). Cheetah: 2021/22 visitor-photograph census about 116 (point count); previous 2008/09 estimate 329–495. Caracal, serval, African wild cat, brown hyaena and aardwolf: no Kruger count found. Spotted hyaena: 2015 call-up 6,998–7,680 (S. Ferreira unpublished data, cited on the EWT page). That page also states a 55% mature subset of 3,849–4,224, in one place labelled as adults and subadults; use 6,998–7,680 as the 2015 count of individuals and record the subset in the notes rather than silently dropping it.
- **Brown hyaena in Kruger.** The EWT 2025 page says management has favoured spotted hyaena in Kruger, leading to brown hyaena being excluded as a breeding species (Mills 1990; Skinner and Chimimba 2005), which points to local extinction or uncertain presence at best. Keep the species (it is on the 2011 checklist). Leave the estimate null. Do not state extinction as a fact. There were no iNaturalist records of any grade in place 69020. Use photographs from elsewhere (Kgalagadi, Madikwe) and name the real place in the caption.
- **Aardwolf photographs.** Also 0 iNaturalist records in Kruger. Use southern African photographs (Mountain Zebra National Park, Lion and Rhino Reserve, Gauteng) and name the place. Do not use Kenya / Buffalo Springs photographs: that population is now often treated as *Proteles septentrionalis* (Eastern Aardwolf). The iNaturalist taxon for this file is 1306005 (Southern Aardwolf).
- **African wild cat.** The EWT 2025 page is titled Southern African Wildcat (*Felis lybica cafra*). Keep the checklist English name. Hybridisation with domestic cats is higher in Kruger than in the Kgalagadi (Le Roux et al. 2015, cited on the EWT page). Skip photographs that look domestic or were taken on pavement or through a camp fence.
- **Wikipedia and ADW.** Fetch Wikipedia extracts one title at a time. Size tables may sit in wikitext or an infobox and be missing from the extract (lion size was only in the wikitext table, citing West and Packer 2013 and Smuts et al. 1980). Animal Diversity Web 404s at `Felis_lybica`, `Parahyaena_brunnea` and `Proteles_cristatus`; use `Felis_silvestris`, `Hyaena_brunnea` and `Proteles_cristata` and record that caveat. Record disagreements (caracal and serval length and mass; spotted hyaena shoulder, body and mass ranges; brown hyaena average masses versus an ADW range) in `size.note` rather than averaging them. If mass is published only as an average, omit `massKg`.
- **Sounds.** Check the iNaturalist place 69020 sounds API once per species and do not spend calls on xeno-canto HTML. Lion had two Kruger sounds, of which one was reusable (CC BY-NC, Sable Hide, Mopani). Spotted hyaena had 14 Kruger sounds, several CC BY-NC; three were included. The other seven species had none reusable. An extra Commons `filetype:audio` search is worthwhile for lion roars and hyaena whoops, but the Commons lion hits were mostly pronunciations, and the published spotted-hyaena giggle files were scientific recordings, not Kruger field recordings — prefer a Kruger iNaturalist recording when one exists. If nothing reusable turns up, log "No reusable Kruger recording found."
- **Photographs.** Commons `"{scientific name} Kruger"` remains the richest Kruger set for lion, leopard, cheetah, serval and spotted hyaena, again largely Bernard DUPONT, CC BY-SA 2.0, plus Charles J. Sharp and Diego Delso. For caracal, African wild cat, brown hyaena and aardwolf the Kruger Commons search is thin or empty; add iNaturalist place 69020 (prefer CC, then CC+NC) and, where Kruger cannot fill a view, a clearly captioned photograph from elsewhere. Look at every thumbnail: a file titled as a Transvaal lion male was two lionesses grooming; caracal observation 240769734 is a camp-shop photograph. Jackal slugs in this repo are `lupulella-adusta` and `lupulella-mesomelas`, not `canis-*`.
- **Schema vocabulary.** Image `age` is `calf`, `juvenile`, `subadult`, `adult` or `mixed`, not `cub`. `view` is `standing-front`, `standing-side`, `standing-back`, `running` or `herd` (plus the bird flight/perched values if they genuinely fit, for example a leopard in a tree as `perched-side`). There is no `other` or `lying` view; a lying animal uses the closest standing view, and a female with cubs may use `herd` with `age`/`sex` `mixed`.

### What failed or was thin

- The official SANParks census PDF remains inaccessible from this environment. Keep that note here, not in the data files.
- xeno-canto HTML was not retried (batch 1 already found an Anubis wall). Macaulay Library was not retried.
- No current Kruger counts were found for caracal, serval, African wild cat, brown hyaena or aardwolf. Leopard has only a 2009 estimate. Lion and spotted hyaena have no park-wide figure later than 2015. Cheetah has a 2021/22 photograph-census point count; a new census runs from 1 September 2026 to 31 August 2027, with no results yet.
- Lion shoulder height was published only as ADW averages, so that range field was omitted. Serval tail length was only a typical value of around 30 cm. African wild cat head-and-body and tail lengths on Wikipedia were from North African and Yemeni skins, not southern Africa, and were omitted. Wikipedia gave no spotted-hyaena tail range; the 30–36 cm range is from ADW only.
- Skinner & Chimimba and Stuart remain unavailable. Iris colour, and Kruger-specific birth-month ranges, were generally not found (aardwolf has a South African rainy-season account, October–December, which is not Kruger-specific).
- iNaturalist thumbnail URLs may be `medium.jpg` or `medium.jpeg`; a 298-byte error body means try the other extension.

### EWT 2025 regional status from this batch

Least Concern, regional trend stable: Lion (IUCN global Vulnerable), Caracal, African wild cat. Least Concern, regional trend unknown: Aardwolf. Near Threatened: Serval (A2c + C2a(i)), Spotted hyaena (C2a(ii), regional trend stable), Brown hyaena (C2a(i) + D1, regional trend stable). Vulnerable, regional trend declining: Leopard. Vulnerable, conservation-dependent: Cheetah (Kruger count down sharply from 2014, but the method and COVID-era submissions may explain part of the drop).

## Batch 8 hints (9 species: South African hedgehog, two dassies, Cape and scrub hares, Natal red rock rabbit, three elephant-shrews; 15 November 2026, Africa/Johannesburg)
- **Hedgehog:** EWT `/project/southern-african-hedgehog/`, 2016 PDF `/wp-content/uploads/2022/11/1.-South-African-Hedgehog-Atelerix-frontalis_NT.pdf`; EWT doesn't mention Kruger (range is western Limpopo/Mpumalanga); iNat 69020 has 0 records of any grade, so `status` omitted; flag in PR. Wikipedia `Southern_African_hedgehog`; ADW full and fastest. iNat 43056; 83 RG licensed obs in 6986 (drop gardens, roads, watermarks). A bounding box on 6986 falsely flags Phalaborwa and Komatipoort; use place 69020. The session used 24 calls.
- **Yellow-spotted rock dassie:** EWT `/project/yellow-spotted-rock-hyrax/`, 2016 PDF `/wp-content/uploads/2022/11/2.-Yellow-spotted-Rock-Hyrax-Heterohyrax-brucei_LC.pdf`. Wikipedia `Yellow-spotted_rock_hyrax`, ADW full. Commons Kruger search 0; iNat 69020 records cluster in far-northern Kruger (Pafuri–Punda); drop Punda Maria camp, Pafuri picnic and Dead-annotated records. iNat 43088, 0 sounds. The session used 23 calls.
- **Rock dassie:** EWT slug `/project/rock-dassie/` (not rock-hyrax); 2016 PDF `/wp-content/uploads/2022/11/3.-Rock-Hyrax-Procavia-capensis_LC.pdf`. 2025 page silent on Kruger, but SANParks 2011 checklist + iNat RG records confirm presence. Wikipedia `Rock_hyrax` + ADW full; note size/gestation disagreements. Commons Kruger: skip. iNat 69020: 38 RG photo records, 0 sounds; wild cluster at Masorini (-23.92, 31.26); drop Letaba, Olifants, Punda Maria camps and accuracy >1 km. CC0 user with no display name: credit login. 19 calls.
- **Cape hare:** EWT `/project/cape-hare/`; 2016 combined PDF `/wp-content/uploads/2022/11/2.-Hares-Lepus-spp_LC.pdf`. Wikipedia `Cape_hare`; ADW mixes in European hare traits (diurnal, 4–5 kg), so treat with caution. iNat 69020: 0 licensed RG photos (only RG obs 264080608 at Skukuza, unlicensed), so use place 6986. Kruger presence uncertain (2011 checklist yes, EWT 2025 range omits Lowveld), so status was omitted. Don't invent coat contrasts vs scrub hare. 33 calls.
- **Process lesson (01:20):** /tmp was wiped by a box restart. Keep the repo in /workspace/knpm and commit + push after every species.
- Hedgehog redo: Wikipedia lead wrongly lists Tanzania; ignore. Skip obs 138702992 (garden), 150035250 (watermark), 225977488 (track). 23 calls.
- Yellow-spotted dassie redo: the 2016 EWT PDF has the Skinner & Chimimba face-mark contrast vs rock dassie. iNat filter without_term_value_id=19 drops Dead records. 21 calls.
- **Scrub hare:** EWT slug `/project/cape-scrub-hare/`; Wikipedia `Scrub_hare` redirects to `Cape_scrub_hare`; ADW range mixes other African hares, so use it with care. iNat 43125; place 69020 has many licensed RG photos. Olifants camp is an unmarked cluster near -24.05, 31.73, so skip it. Taxonomy flag: EWT 2025 restricts L. saxatilis s.s. to the W/N Cape, and iNat 69020 has L. microtis records. 23 calls.
- **Natal red rock rabbit:** EWT `/project/natal-red-rock-hare/` + `/project/jamesons-red-rock-hare/` (range split); 2016 PDF `/wp-content/uploads/2022/11/3.-Red-Rock-Hares-Pronolagus-spp_LC.pdf`. Wikipedia `Natal_red_rock_hare`. ADW stub, skip. iNat 43158; place 69020 has 0 for all Pronolagus, so use 6986. Taxonomy/presence flagged; status omitted. 24 calls.
- **Short-snouted sengi:** EWT `/project/short-snouted-sengi/`, 2016 PDF `/wp-content/uploads/2022/11/1.-Short-snouted-Sengi-Elephantulus-brachyrhynchus_LC.pdf`. Wikipedia `Short-snouted_sengi`; ADW full. iNat 43211; 69020 has 2 RG records, both coarse (5–14 km), so go to 6986. Drop trap/bag, fence and museum shots. English name kept as printed in 2011 ("Short-shouted"), so flag it as a likely typo. 26 calls.
- **Rock elephant-shrew:** EWT `/project/eastern-rock-sengi/` (names Kruger), 2016 PDF `/wp-content/uploads/2022/11/4.-Eastern-Rock-Sengi-Elephantulus-myurus_LC.pdf`. Wikipedia `Eastern_rock_sengi` stub; ADW full (Jones). iNat 43213; 69020 has precise far-northern photos. 22 calls.
- **Four-toed elephant-shrew:** EWT `/project/four-toed-sengi/` (confirmed in northern Kruger; NT), 2016 PDF `/wp-content/uploads/2022/11/8.-Four-toed-Sengi-Petrodromus-tetradactylus_NT.pdf`. Wikipedia `Four-toed_sengi`; ADW full (Smith 2002). iNat 43226; 69020 has 15 RG records with tight far-north photos. 21 calls.

## Batch 4 hints (7 carnivores: Wild dog, Black-backed jackal, Side-striped jackal, Bat-eared fox, African civet, Small-spotted genet, Large-spotted genet, 14 November 2026, Africa/Johannesburg)

Details files: `data/species/details/<slug>.json` for `lycaon-pictus`, `lupulella-mesomelas`, `lupulella-adusta`, `otocyon-megalotis`, `civettictis-civetta`, `genetta-felina`, `genetta-fieldiana`. Branched from a fresh `origin/main` after PRs #6–#9 were merged.

### What worked

- **Carnivore figures come from special surveys, not the official aerial herbivore sheet.** Cite the survey and the year. Store a point count as `low=high` with a note. Leave `estimate` null, with confidence low, when no Kruger figure exists. Do not write as if the March 2025 wildlife-trends PDF were the source of these counts; in the sheet source note, say that the official aerial sheet covers large herbivores. The wording rule still applies: "Some sources claim…" or "One source claims…", confidence medium or low.
- **Wild dog census.** The EWT 2025 African Wild Dog page cites Contemplate Wild unpublished data for a February 2024 estimate of 399 adults and yearlings in 54 breeding packs in "Kruger" as defined on that page (Greater Kruger: Kruger National Park plus the adjoining private nature reserves). It also gives a calculated mature subset of about 90 (Woodroffe and Sillero-Zubiri method), a 2009 photographic census of 132 mature individuals, and Maddock and Mills (1994) for 357 identified in 1989. visitthekrugerpark.com quotes about 250 in 2022, 151 in about 20 packs in 2008/09, and 357 in 26 packs in 1994/95. Record the disagreement; do not average. Enter 399 as a 2024 Greater Kruger adults-and-yearlings point count, and put the mature subset and the 2022 figure in the notes or as `previousEstimates`.
- **No Kruger count found** for black-backed jackal, side-striped jackal, bat-eared fox, African civet, small-spotted genet or large-spotted genet. EWT regional figures (for example more than 10,000 black-backed jackals in the assessment region, or 1,627–9,382 mature side-striped jackals, with the majority said to be in Kruger) are not Kruger censuses and should not be entered as park estimates. The civet page says Kruger holds the largest protected subpopulation, but gives no count.
- **EWT 2025 HTML slugs from `site:ewt.org` plus the scientific name.** These fetched as 200: `/project/african-wild-dog/`, `/project/black-backed-jackal/`, `/project/side-striped-jackal/`, `/project/bat-eared-fox/`, `/project/african-civet/`, `/project/small-spotted-genet/`, `/project/rusty-spotted-genet/` (the same page as `/project/large-spotted-genet/`). Cite a 2016 PDF only when its URL is already known, and do not host it. English names stay as in `data/species-list.json` (Wild dog, Black-backed jackal, Side-striped jackal, Bat-eared fox, African civet, Small-spotted genet, Large-spotted genet), not "African Wild Dog", "Rusty-spotted Genet" or similar, though those may appear in remaps, EWT titles and image alt text. The 2011 Afrikaans names are also kept (including Witkwasjakkals and Rooikolmuskejaatkat).
- **Genet taxonomy.** Kruger research-grade small-spotted records are *Genetta felina* (iNaturalist taxon 925659); large-spotted records are *Genetta fieldiana* (taxon 1643992). This is a split, not a simple synonym. Do not use *Genetta genetta* or *G. tigrina* photographs for *G. felina*. Do not use *G. maculata* photographs from elsewhere for *G. fieldiana* unless the taxon match is explicit; a Kruger animal labelled *G. maculata* on Commons (for example DUPONT at Tamboti) may be used if the caption names Kruger and the marks (dark tail tip, rusty blotches) fit. The Wikipedia title `Large-spotted_genet` redirects to the Cape genet (*G. tigrina*) — do not use that article for Kruger *G. fieldiana*; use `Rusty-spotted_genet` instead. `South_African_small-spotted_genet` is thin (white tail tip, dark feet, dark chin); size and general habits for *G. felina* had to come from `Common_genet`, with a caveat that those figures are for *G. genetta* broadly.
- **Bat-eared fox.** There were 0 iNaturalist observations of any grade in place 69020, and no Kruger photographs or recordings were found. Keep the species (it is on the 2011 checklist; the owner rule is to keep species with 0 research-grade records if they have official inclusion). Use southern African photographs of *O. m. megalotis* (Kgalagadi Transfrontier Park worked well) and name the real place in the caption. Do not use East African *O. m. virgatus* photographs.
- **Nocturnal photographs.** iNaturalist place 69020, including CC-BY-NC, is often better than Commons for civet, genets and side-striped jackal. Look at every thumbnail: skip roadkill, tracks, camera-trap overlay text, watermarks, very dark unusable night frames, and tight camp-fence shots. Commons titles such as "regurgitating meat to feed pup" or "alpha male & pups" are unreliable; tag age only from the image. iNaturalist thumbnail URLs may be `medium.jpg` or `medium.jpeg`.
- **Wikipedia and ADW.** Fetch Wikipedia extracts one title at a time, and fetch wikitext if the size table is missing. Animal Diversity Web 404s at `Lupulella_mesomelas`, `Lupulella_adusta`, `Genetta_felina` and `Genetta_fieldiana` (soft 404 pages). Use `Canis_mesomelas`, `Canis_adustus`, `Genetta_genetta` and the short `Genetta_maculata` stub, and record that caveat. Record disagreements (black-backed jackal mass 6–13 kg versus 5–10 kg; side-striped jackal mass; civet length and mass; wild dog head-and-body and tail ranges) in `size.note` rather than averaging them. If mass or shoulder height is published only as an average, omit that range field (civet shoulder height of 40 cm was omitted). No published tail-length range was found for the black-backed jackal.
- **Sounds.** Check the iNaturalist place 69020 sounds API once per species and do not spend calls on xeno-canto HTML. Only the black-backed jackal had a reusable Kruger recording (CC BY-NC, Satara Camp Road, 16 September 2026). The other six species had none. If nothing reusable turns up, log "No reusable Kruger recording found."
- **Photographs.** Commons `"{scientific name} Kruger"` remains useful for wild dog, both jackals and the Tamboti large-spotted genet, again largely Bernard DUPONT, CC BY-SA 2.0. Clean the author to "Bernard DUPONT" (not "from FRANCE") and "Derek Keats" (not a longer Flickr byline). For *G. felina*, Kruger is thin after skipping roadkill and poor frames; add clearly captioned southern African *G. felina* Commons files (the scientific name is in the filename). A Bushbuckridge, Mpumalanga, locality west of the Kruger fence should not be captioned as Kruger National Park.

### What failed or was thin

- The official SANParks census PDF remains inaccessible from this environment. Keep that note here, not in the data files.
- xeno-canto HTML was not retried (batch 1 already found an Anubis wall). Macaulay Library was not retried.
- No current Kruger counts were found except the wild dog special-survey figure, which is Greater Kruger adults and yearlings rather than a park-only mature count.
- Size figures specifically for *Genetta felina* and under the name *Genetta fieldiana* were not found; entered ranges follow *G. genetta* and rusty-spotted genet accounts, with a caveat.
- Skinner & Chimimba and Stuart remain unavailable. Iris colour, and Kruger-specific birth-month ranges, were generally not found (southern African seasons are noted where sourced).

### EWT 2025 regional status from this batch

Endangered, regional trend stable: Wild dog (IUCN global Endangered; the Kruger / Greater Kruger subpopulation is described as having increased recently, with natural fluctuations). Least Concern, regional trend stable: Black-backed jackal, Side-striped jackal (expanding westwards; increasing or at minimum stable), Bat-eared fox, Small-spotted genet (assessed as *Genetta genetta*). Least Concern, regional trend unknown: African civet, Rusty-spotted / large-spotted genet (assessed as *Genetta maculata*).

## Batch 7 hints (one session per species: big species and primates, 15 November 2026, Africa/Johannesburg)
- **Elephant:** EWT `/project/african-savanna-elephant/`, 2016 PDF `/wp-content/uploads/2022/11/African-Elephant-Loxodonta-africana_LC.pdf`; page has Kruger 31,324 (Ferreira et al. 2024), 13,382 mature, 2020–2024 CI 26,401–33,198, AfESG 2016 17,086. Wikipedia `African_bush_elephant` (speciesbox). ADW full account, but its "range length" 2.2–4 m is shoulder height. Commons Kruger search rich (Charles J. Sharp, Diego Delso sets enough). iNat 43694; the one 69020 sound is all-rights-reserved. The session used 21 calls.
- **Burchell's zebra:** no EWT `/project/` page (two searches); 2016 PDF `/wp-content/uploads/2022/11/3.-Plains-Zebra-Equus-quagga_LC.pdf` has Kruger 29,161–43,450 (2012 distance sampling, Ferreira et al. 2013), 17,497–30,415 mature. Afrikaans Bontsebra from that PDF. ADW under `Equus_burchellii`. Wikipedia `Plains_zebra`. Commons Kruger search rich (Delso, Dupont). iNat 43335, 0 sounds. The session used 22 calls.
- **White rhino:** no EWT 2025 `/project/` page found (three searches); 2016 PDF `/wp-content/uploads/2022/11/1.-Southern-White-Rhinoceros-Ceratotherium-simum-simum_NT.pdf` confirms Witrenoster, NT, no Kruger total. Kruger 3,529 (2021) only via Wikipedia, so low confidence. ADW shoulder max 285 cm is an outlier; use Wikipedia. Commons Kruger search rich (DUPONT titles name roads and gates; caption only "Kruger National Park"); Sharp 26 Apr 2024 set usable. iNat 43348, 0 sounds. Black rhino EWT page exists: `/project/black-rhinoceros/`. The session used 29 calls.
- **Black rhino:** EWT `/project/black-rhinoceros/` is rich (Swartrenoster, regional EN, Kruger 627 in 2008 to 205 by end-2022, citing Ferreira et al. 2024c); 2016 PDF `/wp-content/uploads/2022/11/2.-Black-Rhinoceros-Diceros-bicornis_EN.pdf`. Wikipedia has no Kruger figures. Commons Kruger search: only one true black-rhino file (DUPONT; others were white rhinos), then iNat 69020. 800px `upload.wikimedia.org` thumbs failed; 1280px with Chrome UA and Referer worked. iNat 43350, 0 sounds. The session used 23 calls.
- **Pangolin:** EWT `/project/pangolin/`, 2016 PDF `/wp-content/uploads/2022/11/Temmincks-Ground-Pangolin-Smutsia-temminckii_VU.pdf`. Afrikaans Ietermagog (also Ystermagog). Wikipedia `Ground_pangolin`. ADW `Smutsia_temminckii` is a soft 404; `Manis_temminckii` works. Commons Kruger search empty; iNat 69020 has 9 licensed research-grade observations (obscured). Use the photo licence, not the observation licence. Greater-Kruger density 24/100 km² is not a park total. iNat 75083, 0 sounds. The session used 26 calls.
- **Aardvark:** no EWT `/project/` page; 2016 PDF `/wp-content/uploads/2022/11/Aardvark-Orycteropus-afer_LC.pdf`; 2025 uplisting LC to NT from the fact sheet `/wp-content/uploads/2026/02/Fact-Sheet_Mammal-Red-List_2.pdf` (useful for other 2025 status changes). Afrikaans Erdvark. Wikipedia and ADW worked first time. Commons Kruger search: PDFs only; iNat 69020 has 3 open research-grade observations (two night shots are the same scene), Kelly Abram CC0 Limpopo daylight fill. iNat 47062, 0 sounds. The session used 28 calls.
- **Vervet:** EWT `/project/vervet-monkey-chlorocebus-pygerythrus/` (Blouaap, no Kruger total); 2016 PDF not found. Wikipedia `Vervet_monkey` is fastest (size, diet, young, alarm calls). ADW: `Chlorocebus_pygerythrus` is classification only; `Chlorocebus_aethiops` is a 1999 lumped account (use with caveat). Commons Kruger search rich (Sharp, Delso, DUPONT); drop picnic-site and camp shots. iNat 68137; one CC BY-NC Skukuza sound (obs 125798020). Predator list includes East African alarm-study species (caveated in notes); flag in PR. The session used 25 calls.
- **Chacma baboon:** EWT `/project/chacma-baboon/`, 2016 PDF `/wp-content/uploads/2022/11/7.-Chacma-Baboon-Papio-ursinus_LC.pdf` (no census). Wikipedia `Chacma_baboon` and ADW `Papio_ursinus` both full; ADW gave call types and natal pelage. Commons Kruger search rich (DUPONT). If `thumb.wikimedia.org` returns 400, `Special:FilePath/<file>?width=640` works. iNat 57556; one research-grade CC BY-NC Kruger sound (406360551). The session used 27 calls.
- **Lesser bushbaby:** EWT `/project/southern-lesser-galago-galago-moholi/` (slug carries the latin; Nagapie; Kruger presence). Wikipedia `Mohol_bushbaby`. ADW `Galago_moholi` is a full account. Commons Kruger search: mostly Lower Sabie campsite (drop). iNat 69020: 44 licensed RG photos but many are rest-camp clusters; filter by coordinates (Crocodile Bridge ≈ -25.358, 31.894; Malelane satellite ≈ -25.476, 31.511; Skukuza), not place text; one "Crocodile River Rd" record was Marloth Park. Good wild obs: 86267008, 135167447, 103747188, 123812972. iNat 43561, 0 sounds. The session used 23 calls.
- **Thick-tailed bushbaby:** EWT `/project/thick-tailed-bushbaby-otolemur-crassicaudatus/` (Bosnagaap; 2025 uplisted to NT). Wikipedia `Brown_greater_galago` contradicts EWT on range; prefer EWT. ADW full account. Commons Kruger: camp shots only. iNat 69020 rich but camp-clustered (Punda Maria -22.693, 31.018; Letaba -23.855, 31.576; Satara -24.393, 31.778; Skukuza -24.995, 31.593; Pafuri picnic -22.421, 31.231). One CC BY-NC Skukuza sound (125809630). The session used 22 calls.

## Batch 5 hints (one session per species, 14 November 2026, Africa/Johannesburg)
- **Fast path that works for most species:** first `site:ewt.org <scientific name>` (status, regional numbers, 2016 PDF link); then the Wikipedia article plus Animal Diversity Web `<Genus>_<species>` for size, diet, young and calls; then Commons `"<scientific name> Kruger"` (namespace 6) and iNaturalist `taxon_id=<id>&place_id=69020&photo_license=cc0,cc-by,cc-by-sa`.
- **Thumbnail cost cap:** shortlist only 6–8 candidates from the metadata (place line, licence, title) before looking at any; view at most 6 thumbnails per species, aiming for one wild side view, one front view and one close coat shot. Skip camp, bin, indoor, watermarked and track shots without opening them. Skip iNaturalist observations with positional accuracy above about 1 km.
- **Honey badger:** EWT slug `/project/honey-badger/` (`/project/ratel/` 404s). There's no Kruger density or count anywhere checked; EWT's 741–13,200 mature figure is regional, so don't enter it as a park count. iNaturalist place 69020 has 0 sounds. Commons has a rich Bernard DUPONT Kruger set, plus a CC0 Andrew Deacon iNaturalist photo near Satara. The session used 41 calls, mostly thumbnails.
- **Cape clawless otter:** EWT and most sources use *Aonyx capensis*; keep the stored 2011 name *Lutra capensis*. EWT slug `/project/african-clawless-otter/`, Wikipedia `African_clawless_otter`, ADW `Aonyx_capensis`. Commons Kruger searches return only PDFs, so go straight to iNaturalist place 69020. The spotted-necked otter isn't recorded in Kruger, so don't add it as a similar species. EWT regional numbers are not a park census. The session used 26 calls.
- **General:** skip visitthekrugerpark.com for small carnivores; it only lists counts for large mammals. For Commons, if the first Kruger search returns only PDFs or nothing, don't retry variants; use iNaturalist.
- **Striped polecat:** EWT slug `/project/zorilla/`; Wikipedia `Striped_polecat`; ADW `Ictonyx_striatus`. iNaturalist place 69020 had no usable photos (one CC BY-NC-ND observation). Live CC BY photos from Addo and from Tutume, Botswana were used. The session used 22 calls.
- **Roadkill filter:** many South African iNaturalist CC records are carcasses. Drop any whose description mentions roadkill and prefer Commons files whose description already says a live animal at a named place. For images, fetch the original `upload.wikimedia.org/wikipedia/commons/...` file with a Chrome User-Agent if `/thumb/` URLs fail.
- **Banded mongoose:** EWT slug `/project/banded-mongoose/` (no 2016 PDF link on the 2025 page, so don't invent one); Wikipedia `Banded_mongoose`; ADW `Mungos_mungo`. Commons `"Mungos mungo Kruger"` has a rich DUPONT Kruger set (Letaba, Lower Sabie, Nkuhlu, Crocodile Bridge) that was enough without iNaturalist. Regional densities elsewhere are not Kruger counts. The session used 18 calls.
- **Mongoose tip:** if Commons gives 5 good Kruger photos, skip the iNaturalist photo query; still do the one iNaturalist sounds check.
- **Dwarf mongoose:** EWT `/project/dwarf-mongoose/` and 2016 PDF `18.-Dwarf-Mongoose-Helogale-parvula_LC.pdf` both worked first time. Wikipedia redirects to `Common_dwarf_mongoose`, but keep the 2011 English name "Dwarf mongoose". ADW is thin on calls. Commons `"Helogale parvula Kruger"` has a rich DUPONT Kruger set; skip camp or bungalow shots based on metadata. Call types needed one paper search (doi 10.1093/beheco/arx091). The session used 21 calls.
- **General:** for call types, one targeted paper search beats ADW; Wikipedia redirect titles are fine to follow, but the species list keeps the names.
- **Slender mongoose:** EWT `/project/slender-mongoose/` works; `/project/common-slender-mongoose/` returns 404, and there is no 2016 PDF link. Wikipedia redirects to `Common_slender_mongoose`; keep the 2011 name. Use ADW `Galerella_sanguinea`: `Herpestes_sanguineus` is a soft 404 (status 200 but a "Page not found" body). ADW had the call types (Baker 1982). Commons `"Herpestes sanguineus Kruger"` has a rich DUPONT set. iNaturalist taxon 74414. The session used 21 calls.
- **Image fetch:** if Commons `320px` thumbs or `thumb.wikimedia.org` return 400, use `upload.wikimedia.org/.../1280px-...` with a Chrome user agent and a commons.wikimedia.org Referer.
- **ADW tip:** for mongooses, ADW may use older genus names (Galerella, etc.). Check the page body, not just the status.
- **White-tailed mongoose:** EWT `/project/white-tailed-mongoose/` and 2016 PDF `23.-White-tailed-Mongoose-Ichneumia-albicauda_LC.pdf` worked first time. Wikipedia `White-tailed_mongoose`, ADW `Ichneumia_albicauda` (ADW had the call types). Commons `"Ichneumia albicauda Kruger"` gave 0 hits, so go straight to iNaturalist place 69020 (taxon 41939: 16 research-grade photos on allowed licences, 0 sounds). The regional trend is Unknown. The session used 18 calls.
- **Nocturnal species tip:** expect few Commons Kruger hits; try one Commons query, then iNaturalist. Filter out records with positional accuracy above about 1 km and camp or parking-lot records from metadata. Night spotlight shots are fine; drop near-invisible or blurry rear views.
- **Water mongoose:** EWT `/project/water-mongoose/` works; `/project/marsh-mongoose/` returns 404, and there is no 2016 PDF link (don't try guessed numbered paths: they 404 and waste calls). Wikipedia `Marsh_mongoose`; keep the 2011 name. ADW `Atilax_paludinosus` has the call types. iNaturalist taxon 41919. Commons Kruger search: 0 hits; Kruger iNaturalist records on allowed licences were only footprints or watermarked shots. Fallback photos: Derek Keats CC BY 2.0 Rietvlei NR (Gauteng) set on Commons. The session used 23 calls.
- **Photo filter:** drop spoor/track and watermarked observations from metadata before opening any thumbnail.
- **Large grey mongoose:** use the 2016 EWT PDF `https://ewt.org/wp-content/uploads/2024/10/19.-Large-Grey-Mongoose-Herpestes-ichneumon_LC.pdf` (it also has the call types, Palomares 1991); there is no 2025 project page, so don't guess slugs. Wikipedia `Egyptian_mongoose`; keep the 2011 name. ADW `Herpestes_ichneumon`. iNaturalist taxon 41900 (place 69020: 0 research-grade, 0 sounds). Commons Kruger search: 0 hits; general Commons results are mostly Israel or captive animals. Southern African iNaturalist records are often carcasses. The session used 29 calls.
- **Rare-species tip:** when the Kruger Commons search gives 0 hits, run one iNaturalist country-level (South Africa) research-grade photo query on allowed licences and treat road-named localities as possible roadkill. Don't run broad OR'd Commons queries.
- **Selous' mongoose:** the 2016 EWT PDF is under a 2022/11 path: `https://ewt.org/wp-content/uploads/2022/11/33.-Selous-Mongoose-Paracynictis-selousi-_LC.pdf` (found with one `site:ewt.org <latin>` search). EWT PDF paths vary by year folder, so always search; never guess. Wikipedia `Selous's_mongoose`; use `action=parse&prop=wikitext` (extracts return only the lead). The ADW page is a stub; skip it. iNaturalist taxon 41937; place 69020 had 0 observations. The South African (place_id 6986) research-grade query gave one usable live photo (Medike); the rest were roadkill. The Wikipedia page's Commons file `Paracynictis_selousi_11781660.jpg` (Zambia, CC BY 4.0) is usable. The session used 26 calls.
- **Meller's mongoose:** EWT `/project/mellers-mongoose/` and 2016 PDF `https://ewt.org/wp-content/uploads/2022/11/37.-Mellers-Mongoose-Rhynchogale-melleri-_LC.pdf` both came from one `site:ewt.org <latin>` search. Wikipedia `Meller's_mongoose`; the ADW page is a stub, skip it. Commons has no live photos (maps, a skull, an old plate, a mis-tagged dwarf mongoose). iNaturalist taxon 41941; place 69020 had 0 observations. On South Africa (place_id 6986), observation 130006834 is a clean live photo but lies west of the Kruger fence (caption it Limpopo, not Kruger); 130519512 has an accuracy of 355 km, skip it. The session used 21 calls.
- **Location tip:** check coordinates against the park boundary; iNaturalist place_guess "Kruger Park" is not proof. Skip camera-trap frames with overlay text.

## Batch 6 hints (remaining antelope; one session per species)
- Antelope fast path: reuse the batch 1–2 hints (EWT search, Wikipedia, ADW, Commons `"<latin> Kruger"`). Always find EWT pages or PDFs with one `site:ewt.org <latin>` search; PDF year folders vary, never guess paths.
- Several of these are rare or relocated in Kruger (roan, Lichtenstein's hartebeest, suni, oribi, grey rhebok, red duiker). Status and population may come from SANParks reintroduction notes; keep the wording rules.
- Check iNaturalist coordinates against the park boundary; drop records with accuracy above about 1 km, roadkill, captive, watermarked or camera-trap overlay shots based on metadata.
- **Lichtenstein's hartebeest:** EWT covers it on `/project/red-hartebeest/`; the 2016 PDF is `https://ewt.org/wp-content/uploads/2022/11/2.-Red-Hartebeest-Alcelaphus-buselaphus-caama_LC.pdf`. Regional status: Not Applicable (2025). Wikipedia `Lichtenstein's_hartebeest` (short; use the full wikitext, and the general `Hartebeest` article for species-level facts). ADW `Alcelaphus_buselaphus` works; `Alcelaphus_lichtensteinii` is empty and `Sigmoceros_lichtensteinii` returns a 404 body. Commons Kruger search: 0 hits. iNaturalist taxon 132659 at place 69020: 16 research-grade, 10 allowed-licence photos, 0 sounds. For photos on both Commons and iNaturalist, cite the iNaturalist observation for the locality. visitthekrugerpark has no figure. The session used 25 calls.
- **Red duiker:** EWT `/project/natal-red-duiker/` (not `/project/red-duiker/`), 2016 PDF `/wp-content/uploads/2022/11/4.-Natal-Red-Duiker-Cephalophus-natalensis_NT.pdf`; EWT uses *Cephalophus*. Wikipedia `Red_forest_duiker`. ADW is a stub. Commons `"Cephalophus natalensis"` (old genus) found a rich KZN DUPONT set; the Kruger search gave only PDFs. iNaturalist taxon 1431002: 0 Kruger research-grade photos or sounds. The session used 24 calls (the first on FASTPATH).
- **Roan:** EWT `/project/roan-antelope/` 2025 page has the Kruger total (58; 35–41 mature; 50 in 2012). The 2016 PDF is `/wp-content/uploads/2022/11/12.-Roan-Antelope-Hippotragus-equinus_EN.pdf`. Wikipedia `Roan_antelope`. ADW is a full account but has no vocal types. Commons Kruger search: 1 photo (DENCINAR1996). iNaturalist place 69020: 32 licensed research-grade photos. The SANParks trends PDF to cite as the official source: `https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf`. The session used 25 calls.
- **Suni:** EWT `/project/suni/`, 2016 PDF `https://ewt.org/wp-content/uploads/2024/10/15.-Suni-Nesotragus-moschatus_EN.pdf`. Wikipedia `Suni`. ADW is under `Neotragus_moschatus`. Commons Kruger searches gave only a PDF. iNaturalist taxon 74770: 0 Kruger records; 41 South African research-grade licensed photos, all in northern KZN. EWT says Kruger reports are unconfirmed and the 1995 release failed, so `status` was omitted (flag this in the PR for the owner). The session used 21 calls.
- **Klipspringer:** EWT `/project/klipspringer/`, 2016 PDF `/wp-content/uploads/2022/11/16.-Klipspringer-Oreotragus-oreotragus_LC.pdf`, no Kruger total. Wikipedia `Klipspringer`. ADW is a full account. Commons Kruger search is rich (DUPONT sets at Skukuza, Nkumbe, Biyamiti, Stevenson-Hamilton Rock). iNaturalist taxon 42384, 0 sounds. The session used 25 calls.
- **Oribi:** EWT `/project/oribi/`, 2016 PDF `/wp-content/uploads/2022/11/18.-Oribi-Ourebia-ourebi_EN.pdf`. Wikipedia `Oribi`. ADW is a real account. Commons Kruger search: 0. iNaturalist taxon 42380: 0 Kruger photos; use place 6986. Kruger presence is unclear (EWT doesn't mention Kruger; one tourism page claims a translocation), so `status` was omitted; flag it in the PR. The session used 29 calls.
- **Grey rhebok:** EWT `/project/grey-rhebok/`, 2016 PDF (found by search) `/wp-content/uploads/2022/11/19.-Grey-Rhebok_Pelea-capreolus_NT.pdf`; EWT 2025 doesn't mention Kruger (a bibliography line "excluding the Kruger National Park" is not a park record). Wikipedia `Grey_rhebok`. ADW `Pelea_capreolus` is a full account ("common rhebok"). Commons Kruger search: 0. iNaturalist taxon 42336: one casual 2016 Kruger record, no photo, 0 research grade; use place 6986 (Western Cape sites shortlisted well; drop accuracy >1 km, road-named localities, distant grassland dots). iNat `large` URLs can be `.jpeg`; HEAD both. Afrikaans: keep checklist Vaalribbok (EWT writes "Vaal Ribbok"). `status` omitted; flag in PR. The session used 28 calls.
- **Sharpe's grysbok:** EWT `/project/sharpes-grysbok/`, 2016 PDF `/wp-content/uploads/2022/11/24.-Sharpes-Grysbok-Raphicerus-sharpei_LC.pdf`; strong Kruger habitat text; regional total only (5,814–13,565 mature), Kruger trend only, so park estimate null. Afrikaans also Tropiese Grysbok; kept 2011 Sharpe se grysbok. Wikipedia `Sharpe's_grysbok`. ADW `Raphicerus_sharpei` is a full account. Commons `"Raphicerus sharpei Kruger"` is enough (DUPONT sets; skip same-minute pairs and crops); no iNat photo pass needed. iNat taxon 42374, 0 sounds. 320px Commons thumbs can return an error page; use 1280px with a Chrome UA and Commons Referer. Resident. The session used 28 calls.
- **Mountain reedbuck:** EWT `/project/mountain-reedbuck/`, 2016 PDF (found by search) `/wp-content/uploads/2022/11/27.-Mountain-Reedbuck-Redunca-fulvorufula_EN.pdf`; EWT mentions Kruger (suspected 150 in 2009, citing Ferreira et al. 2013, no trend), used as a previous estimate. Afrikaans Rooiribbok (EWT, matches the 2011 list). Wikipedia is short; ADW `Redunca_fulvorufula` gave the whistle, gestation and predators (averages only, stale IUCN). Commons Kruger search: 0. iNat taxon 42306: 1 research-grade Kruger photo (Pretoriuskop, obs 253342211), 0 sounds; then place 6986. Only one Kruger record, so `status` omitted; flag in PR. The session used 20 calls.

## Issue 45 — Afrikaans family names

The 17 Afrikaans family names already in `data/families.json` were left as stored. Species Afrikaans names were not copied onto a family. This pass covered only the 22 families that were still `af: null`. Six now have a cited name. Sixteen stay null. Books (Skinner & Chimimba, Stuart, Apps / Smithers, Pienaar et al. 1987) and EWT or SANBI species assessments were not opened.

### Rank

1. **Afrikaans Wikipedia family article** (CC BY-SA 4.0). One Wikidata query supplied the Afrikaans label and the af.wikipedia sitelink for all 22 names. Where a sitelink exists, only the intro was read. The article title is stored when the lead applies that word to the Latin family. The article URL is the citation. A Wikidata label that differs from the title is not stored.
2. **iNaturalist** `locale=af`, only when there is no Wikipedia family article, and only when Catalogue of Life gives the same single string. Cite the taxon URL.
3. **GBIF vernacular names** attributed to Catalogue of Life, in that same pass. When Catalogue of Life lists two Afrikaans names, store neither.
4. **Wikidata Afrikaans label.** Used to find the sitelink. Not stored when it differs from the Wikipedia title. A label with no sitelink and no second source stays unused.

The 2011 SANParks checklist (Latin family headings) and Waterberg Soogdiere (English family headings) were not searched again.

### Bovidae, the worked rule

The orders overview describes Bovidae as wildsbok species plus buffalo. That phrase is not a family vernacular, and it was not stored. The family article [Horingdraers](https://af.wikipedia.org/wiki/Horingdraers) says the Horingdraers (Bovidae) are the family, so the stored name is **Horingdraers**, with the capital letter of the article title. The Wikidata Afrikaans label on [Q25497](https://www.wikidata.org/wiki/Q25497) is **Holhoringes**. That label differs from the title and was not stored. The article heading and the database label are not interchangeable. No further vernacular list was opened after the article heading was accepted.

### Filled

| Family | Stored name | Citation |
| --- | --- | --- |
| Canidae | Hondagtiges | <https://af.wikipedia.org/wiki/Hondagtiges> — lead: Hondagtiges (Canidae) is a family |
| Bovidae | Horingdraers | <https://af.wikipedia.org/wiki/Horingdraers> — lead applies Horingdraers to Bovidae. Holhoringes was not stored |
| Equidae | Perdagtiges | <https://af.wikipedia.org/wiki/Perdagtiges> — lead: Perdagtiges (Equidae) is a family. The Wikidata label is the Latin name Equidae and was not stored |
| Hippopotamidae | Seekoeie | <https://af.wikipedia.org/wiki/Seekoeie> — title Seekoeie. The lead calls Hippopotamidae the seekoeifamilie and names the species seekoei separately. The same string is the Wikidata label, the iNaturalist `locale=af` preferred name, and the only Catalogue of Life Afrikaans vernacular |
| Emballonuridae | Skedestertvlermuise | No af.wikipedia family article. iNaturalist taxon 41334 `locale=af` and the only Catalogue of Life Afrikaans vernacular on GBIF usage key 9615. Not the species name witlyfvlermuis |
| Hystricidae | Ystervarke | No af.wikipedia family article. iNaturalist taxon 44167 `locale=af` and the only Catalogue of Life Afrikaans vernacular on GBIF usage key 9705. The species name ystervark was not stored |

### Left null

| Family | Why `af` stays null | Strings not stored |
| --- | --- | --- |
| Orycteropodidae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | erdvark (species name) |
| Elephantidae | Catalogue of Life lists two Afrikaans vernaculars | Olifant, Olifante (iNaturalist: Olifante). olifant not copied from the species |
| Erinaceidae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | krimpvarkie (species name) |
| Miniopteridae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | aandvlermuise not copied from Vespertilionidae |
| Cercopithecidae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | — |
| Herpestidae | [Muishond](https://af.wikipedia.org/wiki/Muishond) applies Muishonde to Herpestidae, then places Herpestes and Helogale in Viverridae and also uses muishond for Mustelidae | Muishond (title and Wikidata label), Muishonde (lead, iNaturalist, Catalogue of Life) |
| Hyaenidae | [Hiëna](https://af.wikipedia.org/wiki/Hiëna) calls hiëna a family and does not name Hyaenidae. The other two sources use a different string | Hiëna (title and Wikidata label), Hiënas (iNaturalist and Catalogue of Life) |
| Viverridae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name. The orders overview still lumps mongooses into this family | — |
| Manidae | [Skubdier](https://af.wikipedia.org/wiki/Skubdier) applies Skubdiere and ietermagoë to the order Pholidota, not to Manidae | Skubdier, Skubdiere, ietermagoë. ietermagô not copied from the species |
| Rhinocerotidae | [Renoster](https://af.wikipedia.org/wiki/Renoster) does not name Rhinocerotidae. Catalogue of Life lists two Afrikaans vernaculars | Renoster (title, Wikidata label, and one Catalogue of Life name), Renosters (iNaturalist and the other Catalogue of Life name) |
| Giraffidae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | kameelperd (species name) |
| Bathyergidae | [Duinmol](https://af.wikipedia.org/wiki/Duinmol) does not name Bathyergidae, and the databases use a different word | Duinmol (title and Wikidata label), Blesmolle (iNaturalist and Catalogue of Life) |
| Muridae | [Muridae](https://af.wikipedia.org/wiki/Muridae) is titled with the Latin name and gives no Afrikaans family vernacular | Muise (iNaturalist and Catalogue of Life). Not copied onto Nesomyidae |
| Nesomyidae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | Muridae names not copied onto this split |
| Pedetidae | No label, no sitelink, no iNaturalist name, no Catalogue of Life name | springhaas (species name) |
| Leporidae | [Leporidae](https://af.wikipedia.org/wiki/Leporidae) is titled with the Latin name. The Wikidata label differs from that title | hase en konyne (lead phrase and Wikidata label). Not shortened into a group name |

URLs opened for the nulls are on each family in `data/families.json`. Inclusion gaps were left in place.

## Status pass (issue #43, 22 November 2026, Africa/Johannesburg)

One pass over the 21 species that still had no `status`. The 2011 SANParks checklist was not used on its own. *Dasymys incomtus* was not remapped to *D. robertsii*, and *Cryptomys hottentotus* was not remapped to *C. natalensis*. No SANParks or EWT PDF was added to the repo. Species JSON does not record access failures.

Filled (rule (c)):

- Cape hare, *Lepus capensis*. `GET https://api.inaturalist.org/v1/observations?place_id=69020&taxon_id=57560&quality_grade=research&captive=false&d1=2000-01-01&per_page=1&order=desc&order_by=observed_on` returned one row: observation 264080608, observed 4 March 2025 at Skukuza, not captive, research grade, community taxon *Lepus capensis*. An earlier *Lepus saxatilis* identification on that observation is not current. https://www.inaturalist.org/observations/264080608

Left empty. The stop for each species is the first decisive result, within three lookups.

- Cape serotine bat. The same iNaturalist query for taxon 1431030 returned 0. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/27.-Cape-Serotine-Bat-Neoromicia-capensis_LC.pdf says all provinces, not Kruger and not the Lowveld. Checklist only. Stop.
- Rusty bat. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/39.-Rusty-Bat-Pipistrellus-rusticus_LC.pdf names Limpopo, Mpumalanga, Gauteng, the North West, and the Great Limpopo Transfrontier Park. No Kruger and no Lowveld. The cited iNaturalist search was not repeated. Checklist only. Stop.
- Reddish-grey musk shrew. The one new source, https://speciesstatus.sanbi.org/assessment/last-assessment/2266/, returned HTTP 403. The 2016 and 2025 EWT pages were not fetched again. Checklist only. Stop.
- Swamp musk shrew. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/7.-Swamp-Musk-Shrew-Crocidura-mariquensis_NT.pdf still says no Kruger data are available and that the species presumably occurs there. Stop.
- Oribi. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/18.-Oribi-Ourebia-ourebi_EN.pdf does not mention Kruger. Checklist only. Stop.
- Suni. No later statement that the species persists in Kruger. The cited assessment still treats northeastern Kruger reports as anecdotal and records that the 1995 release was not found by 1998. Stop.
- Grey rhebok. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/19.-Grey-Rhebok_Pelea-capreolus_NT.pdf mentions Kruger only in Kettlitz (1962), a Transvaal paper that excludes the park. Checklist only. Stop.
- Botswana long-eared bat. https://ewt.org/project/botswana-long-eared-bat/ is *Laephotis* cf. *botswanae*, and the Kruger record on that page is of that clade. Stop.
- Common molerat. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/8.-Common-Mole-rats-Cryptomys-spp_LC.pdf still assigns Kruger to *C. natalensis*. Not remapped. Stop.
- Water rat. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/9.-African-Marsh-Rat-Dasymys-spp_VU.pdf still records *D. robertsii* in Kruger. Not remapped. Stop.
- Lesser yellow house bat. https://ewt.org/project/lesser-yellow-house-bat/ is an assessment of *Scotophilus viridis*. Stop.
- Hildebrandt's horseshoe bat. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/43.-Cohens-Horseshoe-Bat-Rhinolophus-cohenae_VU.pdf still says *R. cohenae* was included within *R. hildebrandtii*. Stop.
- Lander's horseshoe bat. https://ewt.org/project/peters-horseshoe-bat/ is *R. lobatus*, with pre-2000 records and no northern Kruger record in Brinkley et al. (2021). Not copied onto the 2011 name. Stop.
- Swinny's horseshoe bat. https://ewt.org/project/swinnys-horseshoe-bat/ still limits *R. swinnyi* in the assessment region to KwaZulu-Natal and the Eastern Cape. Stop.
- Schreibers' long-fingered bat. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/21.-Natal-Long-fingered-Bat-Miniopterus-natalensis_LC.pdf does not name Kruger and describes seasonal migration of up to 260 km. Stop.
- Temminck's hairy bat. https://ewt.org/project/temmincks-hairy-bat/ lists movement as Migratory and names the Great Limpopo Transfrontier Park, not Kruger. Stop.
- Peak-saddle horseshoe bat. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/40.-Peak-saddle-Horsehoe-Bat-Rhinolophus-blasii_NT.pdf still gives Pafuri and a partial-migration suggestion. Stop.
- Commerson's leaf-nosed bat. https://ewt.org/project/striped-leaf-nosed-bat/ still lists movement as Full Migrant. Queried neither taxon. Stop.
- Madagascar large free-tailed bat. https://ewt.org/project/malagasy-free-tailed-bat/ still says the species has not been recorded in recent times and does not give a year for the Pafuri record. Stop.
- South African hedgehog. The 2016 PDF https://ewt.org/wp-content/uploads/2022/11/1.-South-African-Hedgehog-Atelerix-frontalis_NT.pdf still says they are not present in Kruger National Park. Stop.
