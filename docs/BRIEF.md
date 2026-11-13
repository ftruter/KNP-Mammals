# Mammalian brief: KNP-Mammals research

Owner: ftruter ("Chief"). Repo: https://github.com/ftruter/KNP-Mammals. Public domain for the eventual Cloudflare Worker: `mammals.truter.world`. Sister project: https://github.com/ftruter/KNP-birds (live at https://birds.truter.world). Read `/workspace/knp-mammals/BIRDS_LESSONS.md` before starting; it holds the architecture, data model, design system and source lessons to reuse.

## Status
Phase 1 is done (PR #1). Phase 2 is done (PRs #3 and #4: 39 family files). Phase 3 is the combined `data/species-list.json` (PR #5). Phase 4 waits for the owner's go.

## Your job
Research the mammals of Kruger National Park (KNP) for an open field guide in the same style as the birds site. You research and write files. You do not build the site or train models until the owner says go.

## Hard rules
- Do the work yourself. Never launch Cursor cloud agents and never pick a heavier model without the owner's explicit yes. Use fresh, short-lived executor sessions (low effort first) for each batch. Never keep one long-running session going.
- No unattended loops or routines, and never run overnight. Stop at every gate below and wait for the owner's yes.
- Never fabricate. If a fact isn't in a source, leave it null and log the gap. Afrikaans names come from a cited source only; leave `af` null rather than invent one.
- Per item, make at most 3 lookups per fact, then record the gap and move on.
- Write results to files under `/workspace/knp-mammals/` (later the repo). Don't carry transcripts between sessions; give each new session the brief, the pro-forma sample and the current `SOURCES.md` hints.
- Never merge PRs; only @ftruter merges. One PR per batch, branched from latest `main`, never stacked. Ask before anything that costs money.
- Do not close an identify or Live issue from the implementing PR while its "Done when" still needs real-device or tester checks; leave it open and list what testers must try. Pause rather than iterate on untested phone behaviour.
- CI uses stand-ins and skips real-model tests when `.tflite` files are absent. Live camera or microphone modes need a recorded video or audio fixture; log it as a gap if there is none.
- Media licences: CC0, CC BY, CC BY-SA, CC BY-NC (and their SA variants) only. Never ND or all-rights-reserved for displayed files. Record the author, licence and source URL for every item.
- Keep replies to the owner short: what was done, what was found, the gaps, and the next proposed step.

## Phases (stop after each one for the owner's yes)
1. **Families (pro forma).** In one session, list every mammal family in KNP with English, Afrikaans and Latin names, plus the sources used. Identify and rank the candidate sources for later phases in `SOURCES.md`: confirm access and licence for each, and note which return HTTP 403. Candidates to verify, not assumed: the SANParks KNP species lists, the 2016 SANBI/EWT Red List of Mammals of South Africa, Skinner & Chimimba, Stuart's field guide, MammalMAP (ADU), iNaturalist Kruger observations, Wikimedia Commons, Wikipedia (fallback), and xeno-canto / Macaulay Library for sounds. Output: `families.json`, `SOURCES.md`. Budget: about 40 tool calls.
2. **Species per family.** Run one fresh session per family, or a small batch of tiny families together, and list its KNP species (English, Afrikaans, Latin, and the inclusion evidence). Do the first family as the worked example, show it to the owner, then do the rest in batches of about 5 families, refining `SOURCES.md` after each batch. Budget: about 15 tool calls per family. Output: `species/<family-slug>.json`.
3. **Combined list.** In one session, merge all the species into `species-list.json`, dedupe, reconcile taxonomy (record remaps rather than inventing them), and flag vagrants and introduced species. Show the counts to the owner.
4. **Per-species research.** Do one species first as the pro forma, using the birds schema in `docs/schema.md` and adapting fields for mammals: photos (with credits), sounds (where any exist), description, habits, diet, young vs adult, predators, prey, population estimate with citation, size and mass, habitat, similar species, and sources. Then run fresh sessions in batches of about 5 to 10 species, with a budget of about 25 tool calls per species. Output: `data/species/<slug>.json`.
5. **Recognizers (spike first, no build).** Report what exists for image and sound recognition of KNP mammals, along with coverage, licences and size, and propose a plan. The birds approach was an on-device MobileNetV4 trained on iNaturalist photos for images, and BirdNET for sound. After PRs #186 and #187 the spike should also: (a) try a general Apache-2.0 COCO detector for finding the animal and check whether LiteRT.js can run the stock file or needs the same strip as `strip-detector.py`; (b) measure crop margins against a recogniser trained on full photos, rather than assuming a tight box; (c) treat the detector as an optional upgrade, not a forced download; (d) plan Live camera mode only after timing exists on real phones (issue 178 was the dependency named in issue 181); (e) credit a third-party detector on `/credits` and keep it off Hugging Face unless there is a reason to publish it; (f) write "Not measured" into the spike report instead of implying desktop numbers will carry over. Expect sound coverage for mammals to be thin. Train nothing until the owner approves.
6. **Site (later, on the owner's go).** Use the same Cloudflare Worker pattern as the birds site: KV plus R2, HTML/.md/.json views, and the palette and fonts from KNP-birds `src/style.js`. Bind it to `mammals.truter.world`.

## KNP-birds baseline
The birds lessons were taken from KNP-birds `main` at commit `a650569d` (12 Nov 2026, after PR #187). When the owner asks what changed in KNP-birds, compare from this commit: https://github.com/ftruter/KNP-birds/compare/a650569d...main. Then propose similar changes for KNP-Mammals, and wait for the owner's yes before making any. After adopting changes, update this baseline to the new commit.


## Inclusion rules from owner decisions (13 Nov 2026)
- List species, not subspecies (for example, *Equus quagga*).
- Leave out official species that have no Kruger records.
- Bats keep the 2011 nomenclature.
- Leave out vagrant or commensal species that live only around rest camps because they arrived with people; that includes introduced rodents, dogs and cats.
- Keep left-out rows in `excluded`, each with a reason.
