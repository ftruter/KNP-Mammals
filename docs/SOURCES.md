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

