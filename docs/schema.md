# Content schema (mammals)

This is the Phase 4 schema for KNP-Mammals species documents. It is adapted from the KNP-birds schema at [`docs/schema.md`](https://github.com/ftruter/KNP-birds/blob/main/docs/schema.md) on `main`, using [`data/species/coracias-caudatus.json`](https://github.com/ftruter/KNP-birds/blob/main/data/species/coracias-caudatus.json) as the worked example. Field names from the birds schema are kept where they still fit. Mammal-only fields are listed under "Added for mammals". Family pages, indexes, credits and identify documents are not specified here yet; they can follow the birds pattern when the site is built.

The first filled document is [`data/species/details/connochaetes-taurinus.json`](../data/species/details/connochaetes-taurinus.json). Phase 2 family files under `data/species/<family-slug>.json` and the combined `data/species-list.json` are unchanged in shape; details files do not replace them.

`null` on a mark or a numeric bound means the value was not found in a source. It does not mean the part is uncoloured or absent. Never invent a figure. Record the gap in `gaps` and, if useful, in `research.note`.

## Keys and slugs

A species details file lives at `data/species/details/<slug>.json`. The slug is the scientific name in lowercase, with spaces turned into hyphens (`Connochaetes taurinus` → `connochaetes-taurinus`). That is the same rule as KNP-birds, and the same slug as the Phase 2 row. When a taxon is stored at subspecies rank, the slug includes the third epithet (`alcelaphus-buselaphus-lichtensteinii`).

## Species

`kind` is `"species"`.

### Fields kept from birds

| Field | Meaning |
| --- | --- |
| `slug`, `scientificName` | Identity. The slug matches the filename. |
| `commonNames.en` | English name. `commonNames.af` is the official Afrikaans name from the 2011 checklist when one exists, otherwise omitted or null. Do not invent Afrikaans text beyond that name. |
| `family` | Family slug (`bovidae`). |
| `status` | For mammals, `resident` when the species is present all year in Kruger. Other values can be added later if a sourced seasonal status appears. Omit the field rather than guess. Vagrants and camp-only commensals are not in the list. |
| `monthsPresent` | Optional. Months the species is present in Kruger, as integers `1`–`12`. All twelve means all year. |
| `size` | See below. Omitted when no published measurement has been found. |
| `summary` | A short plain-language description, in field-guide style and in the author's own words. |
| `sampleData` | `true` while the text is still a sample. `false` once the species text is sourced. |
| `habitat` | Optional. One or two plain sentences on habitat in Kruger, or on the habitat of the species if a Kruger-specific sentence cannot be sourced. |
| `similar` | Optional. Other species in this guide and how to tell them apart. Each item is `{ slug, note }`. Do not invent marks for the other species; contrast them with sourced marks of the subject, or leave the entry out. |
| `sources` | Bibliography for the species text. Same shape as a population citation: `title`, `url`, `publisher`, `year`, optional `note`. `url`, `publisher` and `year` may be null. Population sources stay on `population.sources`. |
| `variants` | Structured appearance by age and sex. An empty array means the marks have not been published. See below. |
| `viewNotes` | Optional notes for particular views. Not variants. |
| `calls` | Vocalisations, with optional recordings. |
| `images` | Photographs. May be empty. A file can later live in an R2 bucket or, until an upload exists, only as metadata plus `fileUrl`. |
| `population` | An approximate Kruger population estimate. See below. |
| `research` | Optional: `confidence` (`low`, `medium`, or `high`), `needsReview`, `note`, and optional `researched` (date and zone). It records uneven confidence. It is not a claim that every sentence has the same authority. |

`lengthCm` from the birds `size` object is not the usual mammal measurement. It may still be used if a source gives only a single length and does not distinguish shoulder height from head-and-body length. Prefer the mammal size fields below.

### Added for mammals

| Field | Meaning |
| --- | --- |
| `inatTaxonId` | Optional. The iNaturalist taxon id used for counts and photographs. |
| `conservationStatus` | Optional. `status` (for example `Least Concern`), `scope`, `asOf`, and `sources`. Cite the 2016 SANBI/EWT Red List and/or the IUCN assessment. Do not host those PDFs. |
| `description` | A slightly longer appearance account than `summary`, still concise and in the author's own words. |
| `habits` | Optional. Daily activity, social behaviour, movement in Kruger. Do not describe the Serengeti migration as if it happened in Kruger unless a source says the Kruger animals migrate that way. |
| `diet` | Optional. `{ summary, items, guild }`. `guild` is `herbivore`, `carnivore`, `omnivore`, `insectivore`, or another short sourced term. `items` is a list of foods. `prey` is the structured list of animal prey, and is empty for a grazer. |
| `young` | Optional. Prose on birth, calf or pup appearance, and care. Use `variants` with `age: "calf"` (or `juvenile`, `pup`) for structured marks, and photographs for the comparison. |
| `predators` | Optional. Each item is `{ slug, en }` for a species in this guide, or `{ slug: null, en, note }` for a non-mammal predator such as a crocodile. |
| `prey` | Optional. Same shape as `predators`. An empty array means the species is not a predator, not that the diet is unknown. |
| `gaps` | Array of short strings for facts that could not be sourced in this session. Required on a Phase 4 document. Leave the related field null rather than fill it from memory. |

### Size

| Field | Meaning |
| --- | --- |
| `shoulderHeightCm` | `{ min, max }` in centimetres. |
| `headBodyLengthCm` | `{ min, max }` in centimetres, excluding the tail. |
| `tailCm` | `{ min, max }`. |
| `massKg` | Either `{ min, max }` or, when a source splits the sexes, `{ male: { min, max }, female: { min, max } }`. |
| `lengthCm` | Optional birds-style `{ min, max }`, only when that is all a source gives. |
| `note` | Source of the figures, and any disagreement between sources. |

Omit any bound that was not published. Do not convert units by guesswork beyond a quoted figure.

### Variants and marks

Each variant is one combination of:

- `age`: `calf`, `juvenile`, `subadult`, `adult`, or `mixed` (an image or note that shows more than one age together; `mixed` is for images and view notes, not usually for a marks block)
- `sex`: `male`, `female`, or `any` (the marks apply to both sexes). A photograph of a female and a calf, or of a male and a female together, may use `mixed` on the image only.
- `season`: `wet`, `dry`, or `any`. (Birds used `breeding` / `non-breeding`. Those values remain acceptable if a mammal source is framed that way.)

`marks` names body parts. Unknown fields are `null`. Every part listed below should be present on a variant, with `null` where the source is silent.

| Part | Fields |
| --- | --- |
| `horns` | `colour`, `shape` (or `null` on a hornless calf or a hornless species) |
| `ears` | `colour`, `shape` |
| `eye` | `iris`, `ring` |
| `head` | `face`, `muzzle`, `beard` (beard may be `null`) |
| `mane` | `colour`, `shape` |
| `upperparts` | `colour`, `pattern` |
| `underparts` | `colour`, `pattern` |
| `legs` | `colour` |
| `tail` | `colour`, `shape` |

Colour fields take a short lowercase English name, or an array of names when the part varies. There is not yet a mammal colour vocabulary; do not invent a swatch. `shape` and `pattern` are short plain phrases or `null`.

A more specific variant overrides `any` only where it sets a non-null mark. Null does not erase a known value.

Species without a useful coat or horn difference between the sexes still get one `sex: "any"` adult variant, rather than two guessed ones.

### View notes and images

```json
{ "view": "standing-side", "age": "adult", "sex": "any", "season": "any", "note": "High shoulders, a stiff black mane, and a long black tail." }
```

`view` is `standing-front`, `standing-side`, `standing-back`, `running`, or `herd`. The birds values `flight-above`, `flight-below`, `flight-side`, `perched-front`, `perched-back`, `perched-side`, `display-front`, and `display-back` may still be used if they genuinely fit (for example a bat in flight). `age`, `sex`, and `season` are optional and default to `any`.

An image may set `caption`. The page can show it with the view label. `sex: "mixed"` or `age: "mixed"` is labelled in the caption, not guessed as one sex or age.

Each image:

| Field | Meaning |
| --- | --- |
| `key` | Object key. When the file is later in an R2 bucket it can be served at `/images/<key>`. |
| `view`, `age`, `sex`, `season` | Same vocabularies as variants and view notes. |
| `source` | Source page URL (Commons file page, or iNaturalist observation). |
| `fileUrl` | Optional file URL used for display when the photograph is not in the bucket. A Wikimedia 1280-pixel thumbnail, or an iNaturalist `large` open-data URL, is fine. ND items are not displayed this way. |
| `hosted` | `false` means the file is not in the bucket. The page then shows `fileUrl` when the licence allows display. |
| `author` | Who made the photograph. |
| `license` | Licence name, for example `CC BY-SA 2.0`. The field name stays `license`. |
| `licenceUrl` | A link to the licence terms, or `null`. |
| `aiGenerated` | `true` is labelled as AI-generated. `false` is a photograph. |
| `alt` | Optional alt text. |
| `caption` | Optional. Place, date, or what the picture shows. |

Prefer research-grade iNaturalist photographs from Kruger (`place_id` 69020) and Wikimedia Commons photographs taken in Kruger. A photograph from elsewhere may be used for a view that cannot be filled from Kruger, and the caption must say where it was taken. Allowed licences: CC0, CC BY, CC BY-SA, CC BY-NC, and their SA variants. Never ND or all-rights-reserved for a displayed file.

### Calls

```json
{
  "sex": "male",
  "type": "call",
  "description": "A loud nasal grunt or bellow.",
  "recordings": []
}
```

`type` is `call`, `alarm`, `contact`, `other`, or a short sourced term (`song` remains valid if a source uses it). `description` is one short sentence or two. A recording has a `key`, plus the same attribution as an image: `source`, `author`, `license`, optional `licenceUrl`, optional `fileUrl`, and `hosted: false` until the file is in the bucket. `quality` is the xeno-canto grade (`A` best, then `B`, `C`, `D`, `E`) when the recording is from xeno-canto. `aiGenerated` is optional. Credit is collected from each recording, not from the call object.

Try xeno-canto and the Macaulay Library. If no licensable recording is found, leave `recordings` empty and record the gap. iNaturalist sounds may be used when the licence allows. ND recordings are linked, not played.

### Population

`population` is an approximate Kruger estimate. Prefer a SANParks census or the 2016 SANBI/EWT Red List assessment. Cite those PDFs; do not host or copy them into the repo.

| Field | Meaning |
| --- | --- |
| `estimate.low`, `estimate.high` | Integers, or `null`. Both null means no sourced figure has been entered. |
| `unit` | `individuals`, `matureIndividuals`, or `null` when there is no estimate. Other birds units (`groups`, `breedingPairs`, `territories`, `pairs`) remain valid if a source uses them. |
| `trend` | `increasing`, `stable`, `decreasing`, or `unknown`. |
| `confidence` | `low`, `medium`, `high`, or `null`. Use `medium` or `low` when the figure is not from the official source. |
| `asOf` | Year of the estimate, or `null`. |
| `notes` | Plain text. Say when a PDF could not be fetched, and keep older figures in the note or in `previousEstimates`. |
| `sources` | Citations: `title`, `url`, `publisher`, `year`, optional `note`. |
| `previousEstimates` | Optional. Earlier cited ranges, each with `estimate`, `unit`, `asOf`, and `notes`. They do not replace `estimate`. |

The page should render a range (`low–high`) with a readable unit, the trend, the note, and the sources. A species with no sourced figure keeps both bounds null. It does not invent a count.

## Media licences

Media licences are separate from the licence of the code. CC0, CC BY, CC BY-SA, CC BY-NC, and their SA variants may be shown. ND and all-rights-reserved items are not displayed or hosted. Record the author, licence, licence URL and source URL for every item.

## Unpublished species

A stub has the scientific name, English and Afrikaans names, the family slug, `sampleData: true`, empty `variants`, `viewNotes`, `calls` and `images`, and a `gaps` note that the details have not been published. `status` and `size` are omitted rather than invented. `population` may still carry a cited estimate.
