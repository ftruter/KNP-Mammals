/**
 * The agent guide. It is not the home page, and it does not bake in counts:
 * those live on /.json. It names only routes this Worker serves.
 */
export const llmsTxt = (
  origin,
) => `# Agent guide: mammals of Kruger National Park

This file is the agent guide for ${origin}. It is not the home page. The home page in Markdown is ${origin}/.md.

> An open field guide to the mammals of Kruger National Park, South Africa. Written for people and for AI agents. Every page is server-rendered. JavaScript is optional: the pages, sort links, and photographs work with it off.

The list follows the 2011 SANParks checklist for the park. Species with no Kruger records, and animals that live only around rest camps because they arrived with people, are left out.

## Rules

- A missing fact stays null. Do not infer a number, a month, a measurement, or a place.
- Afrikaans names are only those already stored from a cited source (the 2011 checklist for species). If af is null, do not invent one.
- Population figures are given only when estimate.low and estimate.high are stored, as a range with the year and the citation. Both null means no figure.
- Do not copy or host SANParks or EWT PDFs. A citation may name the title and the URL.
- Displayed media may be CC0, CC BY, CC BY-SA, CC BY-NC, or CC BY-NC-SA only. ND and all-rights-reserved files are not shown.
- A Kruger caption does not name a camp, a road, or a waterhole. Black rhino, white rhino, and Temminck's pangolin captions name the place only as "Kruger National Park". Juliana's golden mole is placed only as "southwestern Kruger National Park".
- Species documents nest the researched account under details. Empty details means the account is not published. gaps is the list of what was not found.

## URL scheme

The file extension selects the format.

- No extension: HTML (text/html)
- .md: Markdown (text/markdown; charset=utf-8)
- .json: the stored KV document (application/json). It is not a rewritten summary.

| Page | What it is |
| --- | --- |
| ${origin}/ | Home. HTML. The Markdown home is ${origin}/.md and the stored JSON is ${origin}/.json |
| ${origin}/orders | Orders, from the stored index |
| ${origin}/order/<slug> | One order. The slug is the Latin name in lower case |
| ${origin}/families | Families |
| ${origin}/family/<slug> | One family |
| ${origin}/species | Every species |
| ${origin}/species/<slug> | One species. The slug is the scientific name in lower case, with hyphens |
| ${origin}/ask-ai | A prompt a person pastes into their own chat AI. Also ${origin}/ask-ai.md and ${origin}/ask-ai.json, whose prompt field is the text. The page does not call a model |
| ${origin}/llms.txt | This file |
| ${origin}/.well-known/ard.json | Agentic Resource Discovery manifest, [ARD v0.91](https://github.com/ards-project/ard-spec/blob/main/spec/ard.md) |
| ${origin}/.well-known/ai-catalog.json | Predecessor catalog. Same entries as the manifest |

HTML pages link their Markdown and JSON alternates with link rel="alternate" and in the footer. Responses other than icons, CSS, JavaScript, and image or audio bytes also send an HTTP Link header. It points at ${origin}/.well-known/ard.json (rel="ard") and this file (rel="describedby"). Page responses add rel="canonical" and the Markdown and JSON alternates to the same header. There is no rel="ai-catalog" link. A missing page returns 404.

## Counts

Do not read a species, family or order total out of this file. Open ${origin}/.json. That stored document has counts.species, counts.families, counts.orders and counts.researched. researched is how many species have a published account.

## Species documents

A species page is one stored document. Names, family and order are on the document. The researched account, when it exists, is nested under details. If details is absent, the account is not published: the page says so, and gaps on a published account lists what was not found. Do not fill either gap from memory.

details may include summary, description, habitat, habits, diet, young, status, monthsPresent, size, conservationStatus, population, similar, predators, prey, calls, images, sources and gaps. A field that is missing or null was not recorded. monthsPresent, when stored, uses integers 1 to 12. size may hold shoulderHeightCm, headBodyLengthCm, tailCm and massKg, each with min and max, and massKg may split male and female. Omit a bound that is not stored. Do not convert a missing measurement into zero.

Give a population figure only when details.population.estimate.low and details.population.estimate.high are numbers. Give the range, the year in asOf, and the sources. Both bounds null means no figure. The species index copies that range onto the list row only when the stored unit is individuals. A null population on the list row is not a zero. Read the species document before treating it as "no estimate".

af is the stored Afrikaans name, or null. Do not invent one. For a species, a stored Afrikaans name comes from the 2011 checklist.

images and calls carry author, license and source. Show a file only when its licence is one of the licences in the rules above. A caption on a Kruger photograph does not add a camp, a road or a waterhole, including for the four species named in the rules.

## Indexes

index/families, served at ${origin}/.json, ${origin}/families.json and ${origin}/orders.json, is one stored object. It has counts, an orders array and a families array. It does not list individual species. Each order has slug, latin, familyCount and speciesCount. Each family has slug, latin, en, af (or null), order, orderSlug and speciesCount.

index/species, served at ${origin}/species.json, is a species array. Each row has slug, latin, en, af (or null), family, familyEn, familySlug, order, orderSlug, population (a low and high range, or null) and researched (true when a details account is published). The rows are an array, not a map keyed by scientific name.

## Start here

- [Home, Markdown](${origin}/.md)
- [Orders, Markdown](${origin}/orders.md)
- [Families, Markdown](${origin}/families.md)
- [Species, Markdown](${origin}/species.md)
- [Prompt for a reader's own chat AI, Markdown](${origin}/ask-ai.md)
`
