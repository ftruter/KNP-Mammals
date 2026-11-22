# Kruger population estimates

**Deliverable:** `population` on each species document. Family totals and index midpoints are derived by `scripts/seed.mjs` and are not edited by hand.

This site cites numeric facts. It does not host the SANParks March 2025 census PDF, and it does not host EWT PDFs.

## Citation

SANParks Scientific Services. Most recent counts of Kruger's wildlife and trends over time. March 2025.

- Official sheet: https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf

The sheet is cited from species pages. It is not copied into this repo. A figure that does not come from that sheet is written as “One source claims…” or “Some sources claim…”, with `confidence` of `medium` or `low`, and the note “A more accurate figure may be available at this URL: https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf”.

The working substitute for the sheet, for the species that page names, is https://visitthekrugerpark.com/wildlife/. It is a reading of the sheet. It is not the official figure.

## Method and units

Prefer, in this order: the official sheet; a 2025 EWT assessment, or the 2016 SANBI/EWT PDF, when it prints a Kruger count or range; then one paper that assessment cites, when that paper itself prints a Kruger count.

Units stay as published (`individuals` or `matureIndividuals`). A mature-individual range is not converted into a count of all individuals, and the reverse is not done. A single published number is stored as `low` = `high`. Two disagreeing sources are both kept in the note. They are not averaged. A later cited park figure becomes `estimate`. The older cited figure moves to `previousEstimates`. `previousEstimates` do not replace `estimate`.

`confidence` stays `medium` for a figure taken from the visit page until the official sheet is read. This pass did not read the sheet, so no census row was raised to `high`.

Greater Kruger (the park plus adjoining reserves) is a different area from Kruger National Park. A figure for that wider area has to say so, as the wild dog figure already does. A regional total for South Africa, Eswatini and Lesotho is not a park figure.

## What was copied

The visit page was re-read against the census species already stored. Two estimates changed. One older range was added beside an estimate that stayed.

| Species | Unit | Estimate | As of | What changed |
| --- | --- | --- | --- | --- |
| Burchell's zebra, `equus-quagga` | `individuals` | 45,918–57,276 | 2023 | Replaced 29,161–43,450 (2012). The 2012 range is now `previousEstimates`. Trend increasing. |
| Elephant, `loxodonta-africana` | `individuals` | 27,260–33,198 | 2024 | Replaced 26,401–33,198, the interval the EWT page gives for surveys from 2020 to 2024. That interval is now `previousEstimates`. The two ranges were not averaged. Trend increasing. |
| Roan, `hippotragus-equinus` | `individuals` | 58–58 | 2024 | Kept. The visit page names 40–75 for 2023, which is earlier, so that range was added to `previousEstimates`. The two figures were not averaged. |

These stored ranges already matched the visit page, so the files were not edited:

| Species | Estimate | As of | Trend stored |
| --- | --- | --- | --- |
| Impala, `aepyceros-melampus` | 123,998–168,451 | 2023 | stable |
| Blue wildebeest, `connochaetes-taurinus` | 16,700–21,948 | 2023 | increasing |
| Kudu, `tragelaphus-strepsiceros` | 6,561–10,020 | 2023 | stable |
| Waterbuck, `kobus-ellipsiprymnus` | 3,291–7,150 | 2023 | stable |
| Warthog, `phacochoerus-africanus` | 2,285–4,166 | 2023 | unknown (the page does not state a trend) |
| Giraffe, `giraffa-giraffa` | 10,345–14,554 | 2023 | increasing |
| Hippopotamus, `hippopotamus-amphibius` | 5,889–5,889 | 2023 | increasing |
| Buffalo, `syncerus-caffer` | 50,741–61,754 | 2024 | unknown |
| Eland, `tragelaphus-oryx` | 226–294 | 2023 | increasing |
| Tsessebe, `damaliscus-lunatus` | 208–287 | 2023 | increasing |
| Sable, `hippotragus-niger` | 384–470 | 2023 | increasing |

The visit page describes the 2024 buffalo trend as increasing. The buffalo file was left unchanged because the numeric range already matched. Its trend is still `unknown`.

White rhinoceros and black rhinoceros are not in that table. Their stored figures were left until the official sheet, or a named paper, is read. No location more specific than Kruger National Park was added for rhino or pangolin.

## What was refused

- A regional total, including “probably fewer than 50” Lichtenstein’s hartebeest in the assessment region.
- A translocation or release total (Lichtenstein’s hartebeest: 18 moved in 1985, 91 released in northern Kruger in 1990–1994, 31 released in the south in 1994).
- A suspected figure used as the current estimate. Common reedbuck (suspected 300 in 2009), mountain reedbuck (suspected 150 in 2009), nyala (about 3,000 in the greater Kruger in 2013) and bushbuck (about 500 in 2009) stay in `previousEstimates`. They were not promoted to `estimate`.
- A zero inferred from “recent counts recorded none” or “no southern reedbuck recorded”. No source printed 0 for common reedbuck or mountain reedbuck, so the estimate stays null.
- Lichtenstein’s hartebeest in the 2016 PDF: “suspected to be around 50” in Kruger in 2009, and a personal communication that perhaps one remained in 2014. The 2025 EWT page does not print a current Kruger census. Neither figure was stored. Ferreira et al. 2013, *Animal abundances in Parks 2012/2013* (Scientific Services, SANParks, Skukuza), is the report those suspected counts cite. No free copy was found. The estimate stays null.
- An unpublished elephant figure of around 39,000. The visit page says SANParks has not published it.
- A density, including the pangolin’s 24 individuals / 100 km² in the greater Kruger. It was not multiplied by a park area. That file was not reopened.
- An unlabelled range. The official sheet was not read, so none was assigned.
- The *Dasymys robertsii* and *Cryptomys natalensis* remap. Left for the owner.

## What stays null

143 species files. 21 have a numeric `estimate`. 122 have both bounds null. This pass filled none of the null files.

The other null files already say that no Kruger census was found. They were not walked again. Bats, rodents, shrews, mongooses and the other small mammals stay as they are.
