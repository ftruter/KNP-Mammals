# STATE

Handoff for the next session. Counts below were taken from `main` when this file was written. Re-count `data/species-list.json`, `data/species/details/` and `data/media/mirror.json` before treating a number as current. Do not copy population figures into this file.

## Project

Live field guide at <https://mammals.truter.world>. Sister project: [KNP-birds](https://github.com/ftruter/KNP-birds), live at <https://birds.truter.world>.

`data/species-list.json` records 14 orders, 39 families and 143 species. There are 143 details files, one per listed species, and each has `sampleData: false`. The list file also holds 20 candidates and 4 excluded rows. Seed does not publish `candidates` or `excluded`.

Scope is the owner decisions of 13 Nov 2026 in [`docs/BRIEF.md`](docs/BRIEF.md):

- List species, not subspecies. Lichtenstein's hartebeest is the stored exception: *Alcelaphus buselaphus lichtensteinii* (`alcelaphus-buselaphus-lichtensteinii`). The 2011 list printed *Sigmoceros lichtensteinii*. The species-list note stores the iNaturalist subspecies.
- Leave out official species with no Kruger records.
- Bats keep the 2011 names.
- Leave out vagrant or commensal species that live only around rest camps. Excluded rows stay in `excluded`, with a reason.

## Stack and deploy

The Worker is `src/worker.js`. `wrangler.toml` binds KV as `MAMMALS_KV` (namespace `knp-mammals`; the id is in that file) and R2 as `IMAGES` (bucket `knp-mammals-images`). Pull-request previews use the same KV namespace and the same bucket. The custom domain is `mammals.truter.world`. Workers Caching is on (`[cache]`). There is no second R2 binding.

`pnpm run deploy` uploads the KV payload, then deploys the Worker with `DATA_VERSION` (a SHA-256 of the payload) and `DATA_PUBLISHED_AT`. It does not publish media. For 70 seconds after `DATA_PUBLISHED_AT`, responses rendered from KV are `no-store` (`KV_CONSISTENCY_MS` in `src/cache.js`). Workers Builds on `main` should use deploy command `npm run deploy`. Locally, use `pnpm run deploy`. `pnpm-workspace.yaml` exists because pnpm 9 rejects a workspace file with no `packages` list.

`pnpm run media:publish` copies displayable photographs and recordings into the bucket and writes `data/media/mirror.json`. The script does not set `hosted` and does not edit species files. A remote run needs the owner's yes. `--dry-run` makes no remote call.

## Repo layout

- `data/families.json` — 39 families.
- `data/species/<family>.json` — one file per family.
- `data/species-list.json` — `species`, `candidates`, `excluded`.
- `data/species/details/<slug>.json` — the account. `scripts/seed.mjs` merges it onto `species/<slug>` as `details` when the file exists, and writes nothing back to `data/`.
- `data/media/mirror.json` — record of files copied into the bucket. Do not edit it by hand.
- `media/images/neamblysomus-julianae/imagined-by-grok.jpg` — the one illustration stored in the repo. It is also in the site bucket, and its details entry has `hosted: true`, so the page loads `/images/neamblysomus-julianae/imagined-by-grok.jpg`.
- `docs/schema.md`, `docs/SOURCES.md`, `docs/BRIEF.md`.

`researched` on a list row means a details file exists.

## What's done

Family list, combined species list, and a details file for every listed species. The Worker serves HTML, `.md` and `.json` for the home page, orders, families and species. Tables sort with `?sort=` and `dir=`. Photo zoom works from the button, including with scripts off. Orders are not in the header navigation. They are linked from the home page, the Order column, and family and species pages.

Site routes beyond the taxon pages are live: `/search` (matches names only, `noindex`; the HTML page shows a photograph and a play button for a species that has them), `/credits`, `/facts`, `/llms.txt`, `/.well-known/ard.json`, `/.well-known/ai-catalog.json`, `/ask-ai`, `/robots.txt`, `/sitemap` and `/sitemap.xml`, and the installable offline app (`/manifest.webmanifest`, `/sw.js`, `/offline.js`, `/offline.json`). The offline app always saves the HTML guide pages and their JSON documents; one measured lead photograph and clip per species from `data/media/mirror.json` are saved when those options are ticked.

A published species page shows a lead image, facts, description, what to look for, similar species, habits, diet, young, predators and prey, calls, further photographs, gaps and sources. `variants` are stored and are not rendered.

Hosted photographs and recordings load from `/images/<key>` and `/audio/<key>`. On this `main`: 382 photographs and 12 recordings have `hosted: true`, and `data/media/mirror.json` has the same two counts. `scripts/publish-media.mjs` plans the same 382 photographs and 12 recordings. Thirty-five details files have an empty `images` array. ND licences are not shown.

## What's left

Not on this `main`, and not described here as shipped:

- An MCP endpoint (#34 batch 2, needs a second yes) and identify (#40; batch 1 is counts only). `src/style.js` is a copy of the birds stylesheet and still contains identify rules that no route uses.
- A real-device install and offline check of the offline app (#38 stays open for it).
- Recognisers. [`docs/BRIEF.md`](docs/BRIEF.md) phase 5 has not started. This repo has no model files.
- Rendering `variants`.
- The home-page sentence. `progressSentence` in `src/html.js` still says that some species are listed by name only, even though every listed species has a details file. HTML and Markdown both use that function. Changing it is code, and the wording is an open decision below.
- A machine-readable content schema and an ajv check. Later, after data fills settle. Not this change.
- `LICENSE` and `.github/CODEOWNERS`. Not in the repo. See open decisions.

A listed species with no details file still gets the unpublished page ("The details for this species have not been published yet."). The live list has no such species. `test/site.test.js` covers that page with an in-memory KV document.

## Data conventions

Field meanings are in [`docs/schema.md`](docs/schema.md). `null` means the value was not found. Record the gap. Do not invent a fact, an Afrikaans name, a caption or a population figure.

- Afrikaans names come only from a cited source. Sixteen of 39 family `af` values are null.
- Displayed or hosted media may be CC0, CC BY, CC BY-SA, CC BY-NC or CC BY-NC-SA. No ND and no all-rights-reserved.
- Cite SANParks and EWT PDFs. Do not host or copy them.
- White rhinoceros, black rhinoceros and Temminck's ground pangolin captions include "Kruger National Park" and do not name a finer place. `test/media.test.js` checks those three files. The white-rhino note in [`docs/SOURCES.md`](docs/SOURCES.md) says the file titles name roads and gates, and the place in the caption is "Kruger National Park".
- The Juliana's golden mole text places that Kruger subpopulation in southwestern Kruger National Park. The illustration caption does not name a place. It reads: "Imagined by Grok. An illustration, not a photograph of a real animal." The page marks it as an AI-generated image. Author Grok, licence CC0 1.0.
- Other Kruger captions keep the place as recorded, camps, roads and waterholes included. Owner decision: keep as much place detail as possible and do not generalise to "Kruger National Park"; only the rhinos and the pangolin say "Kruger National Park", and Juliana's golden mole says "southwestern Kruger National Park".

## Checks

```sh
pnpm test
pnpm run lint
pnpm run kv:dry-run
pnpm run media:dry-run
pnpm run check
```

`pnpm run check` builds the Worker and does not deploy.

## Gotchas

- One pull request per batch, branched from the latest `main`. Do not stack branches. Only [@ftruter](https://github.com/ftruter) merges.
- Every PR links its issue (`Closes #N` when the issue is finished, `Part of #N` for a batch), the PR title matches the issue title (plus a suffix such as " (batch 1)" for a partial PR), and the issue gets a comment pointing to the PR.
- Do not close an issue from the implementing pull request while a real-device check is still open.
- `docs/BRIEF.md` still tells a research session not to build the site until the owner says go. The Status paragraph in that file is the current state. Phase 5 has not started. Do not train a model from that file's phase 5 notes.
- `docs/schema.md` still says family pages, indexes, credits and identify documents can follow the birds pattern when the site is built. The Worker is already live. This file does not rewrite `docs/schema.md`. Identify documents are still not specified there.
- `scripts/publish-media.mjs` leaves object keys under `models/` and `offline/` in place. Those bucket prefixes are not the installable offline app, and this repo has no model store.
- The birds README still has an "AI Models" section. Do not copy it. Those scripts are not in this `package.json`.

## Open decisions

Do not resolve these in a documentation or data edit unless the owner decides.

1. Code licence. There is no `LICENSE` file, and `package.json` has no `license` field. The README names no licence. [`docs/BRIEF.md`](docs/BRIEF.md) says "Public domain for the eventual Cloudflare Worker: `mammals.truter.world`". This handoff does not treat that line as a choice of licence. Apache-2.0 was asked and is not confirmed. Do not invent a copyright holder.
2. `.github/CODEOWNERS`. The issue asks for `* @ftruter`. This change does not add the file.
3. Home-page wording when every listed species has a details file. The proposal was: "Every listed species has a full account." Partial coverage would keep the current "so far / the rest are listed by name" sentence. Not applied. It is a change to `src/html.js`.
4. Decided: captions keep place detail (see Data conventions). Whether recording `place` strings follow the same rule is open (#58).
5. A JSON Schema and an ajv test over the data files. A later change, after data fills settle. Do not change a species fact to make a schema pass.
