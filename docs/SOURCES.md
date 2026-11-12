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
