"""Write the two spike reports from the count files. It does not invent a number."""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PHOTO = os.path.join(HERE, "identify-photo")
SOUND = os.path.join(HERE, "identify-sound")
DOCS = os.path.join(REPO, "docs")


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def clean_note(note):
    if not note:
        return None
    text = re.sub(r"<[^>]+>", " ", note)
    text = re.sub(r"\s+", " ", text).strip(" -|")
    if "<" in text or "fontawesome" in text.lower():
        return None
    return text or None


def clean_licence(model):
    line = model.get("licenceLine") or ""
    lowered = line.lower()
    if "fontawesome" in lowered:
        return "null"
    if "apache license" in lowered:
        return "Apache License 2.0"
    if "cc by-nc-sa 4.0" in lowered or "cc-by-nc-sa-4.0" in lowered:
        return "CC BY-NC-SA 4.0"
    if "cc-by-nc-4.0" in lowered or "cc by-nc 4.0" in lowered:
        return "CC BY-NC 4.0"
    if "cc-by-4.0" in lowered or "cc by 4.0" in lowered:
        return "CC BY 4.0"
    return "null"


def num(value):
    if value is None:
        return "null"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def cell(value):
    return num(value).replace("|", "/")


def bucket_line(title, block):
    return (
        f"{title}: median {num(block['median'])}, under 20: {block['under20']}, "
        f"under 50: {block['under50']}, under 150: {block['under150']}, "
        f"at least 50: {block['atLeast50']}, at least 150: {block['atLeast150']}, "
        f"zero: {block['zero']}, null: {block['nulls']}."
    )


def fence(marker, obj):
    return f"<!-- {marker} -->\n```json\n{json.dumps(obj, indent=2, ensure_ascii=False)}\n```\n"


def photo_table(species):
    lines = [
        "| Species | Taxon | Match | Kruger | Rest of South Africa | Anywhere | Kruger without NC | Rest without NC | Anywhere without NC |",
        "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for row in species:
        lines.append(
            "| {name} | {taxon} | {match} | {k} | {r} | {a} | {k2} | {r2} | {a2} |".format(
                name=row["scientificName"],
                taxon=cell(row.get("taxonId")),
                match=cell(row.get("match")),
                k=cell(row["withNc"]["kruger"]),
                r=cell(row["withNc"]["restOfSouthAfrica"]),
                a=cell(row["withNc"]["anywhere"]),
                k2=cell(row["withoutNc"]["kruger"]),
                r2=cell(row["withoutNc"]["restOfSouthAfrica"]),
                a2=cell(row["withoutNc"]["anywhere"]),
            )
        )
    return "\n".join(lines)


def zeros(species, licence, place):
    found = []
    for row in species:
        value = row[licence][place]
        if value == 0:
            found.append(row["scientificName"])
    return found


def grouped_gaps(gaps):
    if not gaps:
        return "None.\n"
    grouped = {}
    for gap in gaps:
        reason = gap.get("reason") or "unspecified"
        grouped.setdefault(reason, []).append(gap.get("slug") or gap.get("id") or "")
    lines = []
    for reason, slugs in grouped.items():
        names = ", ".join(slug for slug in slugs if slug)
        lines.append(f"- {reason}" + (f" ({len(slugs)}): {names}" if names else ""))
    return "\n".join(lines) + "\n"


def write_photo(counts, taxa, site):
    summary = counts["summary"]
    bats = summary["bats"]["species"]
    lines = [
        "# Identify by photo: counts",
        "",
        "Batch 1 of issue 40. This is a count, not a training run and not a page. No photograph was downloaded, and no route was added.",
        "",
        "## Recommendation",
        "",
        "Do not train, and do not add `/identify/photo`, until the owner accepts which of these species a model would leave uncovered. The tables below are that list. They do not decide whether the totals are enough, whether NC photographs may be used, or whose machine would run the training.",
        "",
        f"Of {summary['all']['species']} listed species, {summary['all']['withNc']['anywhere']['nulls']} "
        + ("has" if summary["all"]["withNc"]["anywhere"]["nulls"] == 1 else "have")
        + " a null anywhere total because the name did not resolve. Those nulls are not counted as zero.",
        "",
        "## How the count was made",
        "",
        "Each scientific name was searched on the iNaturalist taxa API. An active Mammalia taxon was kept only when its name was the same, or iNaturalist returned our name as the matched synonym of exactly one taxon. A stored `inatTaxonId` was compared and was not used when the search failed.",
        "",
        "The observation count is research-grade, non-captive, and has at least one photo under CC0, CC BY, CC BY-SA, CC BY-NC, or CC BY-NC-SA. The without-NC count drops the two NC licences. ND and all-rights-reserved are excluded. Kruger is iNaturalist place "
        f"{counts['method']['places']['kruger']['id']} ({counts['method']['places']['kruger']['displayName']}). South Africa is place "
        f"{counts['method']['places']['southAfrica']['id']} ({counts['method']['places']['southAfrica']['displayName']}). Anywhere has no place filter.",
        "",
        "Rest of South Africa is the South Africa total minus the Kruger total. That is the rest of the country only when every Kruger observation is also inside the South Africa place. This pass did not compare coordinates. When the South Africa total is smaller than the Kruger total, the rest is null.",
        "",
        "A median or an under-20, under-50, or under-150 count uses only species whose total is a number. `null` in the summary is the number of species left unknown.",
        "",
        "## Summary",
        "",
        bucket_line("Anywhere, with NC", summary["all"]["withNc"]["anywhere"]),
        "",
        bucket_line("Anywhere, without NC", summary["all"]["withoutNc"]["anywhere"]),
        "",
        bucket_line("Kruger, with NC", summary["all"]["withNc"]["kruger"]),
        "",
        bucket_line("Kruger, without NC", summary["all"]["withoutNc"]["kruger"]),
        "",
        bucket_line("Rest of South Africa, with NC", summary["all"]["withNc"]["restOfSouthAfrica"]),
        "",
        bucket_line("Rest of South Africa, without NC", summary["all"]["withoutNc"]["restOfSouthAfrica"]),
        "",
        f"Bats, order Chiroptera, are {bats} of {summary['all']['species']}.",
        "",
        bucket_line("Bats anywhere, with NC", summary["bats"]["withNc"]["anywhere"]),
        "",
        bucket_line("Other species anywhere, with NC", summary["notBats"]["withNc"]["anywhere"]),
        "",
        fence("photo-summary", summary),
        "",
        "## Species with no allowed photograph anywhere",
        "",
        "These resolved species have an anywhere total of zero with NC included. Unresolved names are in the gaps, not in this list.",
        "",
    ]
    none = zeros(counts["species"], "withNc", "anywhere")
    lines.append("None." if not none else ", ".join(none) + ".")
    lines += [
        "",
        "## Species already on the site",
        "",
        "This is a count of files already in `data/species/details`, not the iNaturalist pool. An AI-generated image is an illustration, not a photograph. ND and all-rights-reserved would not be counted as displayable; the file count of those is in `site-files.json`.",
        "",
        f"Displayable photographs: {site['photographs']['species']} species, {site['photographs']['files']} files ({site['photographs']['openFiles']} without NC, {site['photographs']['ncFiles']} NC).",
        "",
        f"Illustrations: {site['illustrations']}.",
        "",
        f"Species with no displayable photograph: {len(site['withoutPhotograph'])}.",
        "",
        "## All species",
        "",
        photo_table(counts["species"]),
        "",
        "## Gaps",
        "",
        grouped_gaps(list(taxa.get("gaps") or []) + list(counts.get("gaps") or [])),
        "",
        "## Not decided",
        "",
        "This batch does not answer these questions from the plan:",
        "",
        "1. What is close enough to train? The suggested bar was how many species have at least 50 allowed photographs anywhere, with and without NC. Bats can be left uncovered if the owner would rather the model cover animals a visitor can photograph.",
        "2. Train on CC BY-NC photographs, and license the weights CC BY-NC-SA 4.0?",
        "3. Is the one training run on the owner's machine?",
        "4. Should a later public training manifest omit observation ids for black rhino, white rhino, pangolin, and Juliana's golden mole?",
        "5. Add Playwright for browser tests, or keep a node:test stand-in?",
        "6. Is a short `/credits` page acceptable in a later photo-page pull request?",
        "",
        "No cloud GPU, hosted model, new bucket, or public model repository was created. The site already binds an R2 bucket for species media. This batch does not add a model file.",
        "",
    ]
    path = os.path.join(DOCS, "identify-photo-spike.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    print(path)


def clip_line(species):
    def total(place, licence):
        values = [row["clips"][licence][place] for row in species]
        numbers = [value for value in values if isinstance(value, int)]
        return sum(numbers), sum(value > 0 for value in numbers), sum(value is None for value in values)
    anywhere, anywhere_species, anywhere_null = total("anywhere", "withNc")
    kruger, kruger_species, _ = total("kruger", "withNc")
    open_anywhere, open_species, _ = total("anywhere", "withoutNc")
    return (
        f"Clips with NC: {anywhere} anywhere across {anywhere_species} species ({anywhere_null} null), "
        f"and {kruger} in Kruger across {kruger_species} species. "
        f"Clips without NC: {open_anywhere} anywhere across {open_species} species."
    )


def sound_table(species):
    lines = [
        "| Species | Kruger observations | Anywhere observations | Kruger clips | Anywhere clips | Anywhere without NC | ND observations anywhere |",
        "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for row in species:
        lines.append(
            "| {name} | {k} | {a} | {kc} | {ac} | {a2} | {nd} |".format(
                name=row["scientificName"],
                k=cell(row["observations"]["withNc"]["kruger"]),
                a=cell(row["observations"]["withNc"]["anywhere"]),
                kc=cell(row["clips"]["withNc"]["kruger"]),
                ac=cell(row["clips"]["withNc"]["anywhere"]),
                a2=cell(row["observations"]["withoutNc"]["anywhere"]),
                nd=cell(row.get("ndObservationsAnywhere")),
            )
        )
    return "\n".join(lines)


def xc_table(species):
    lines = [
        "| Species | Anywhere with NC | Anywhere without NC | Anywhere ND | South Africa with NC |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for row in species:
        anywhere = row.get("anywhere") or {}
        south = row.get("southAfrica") or {}
        lines.append(
            "| {name} | {a} | {b} | {n} | {s} |".format(
                name=row["scientificName"],
                a=cell(anywhere.get("withNc")),
                b=cell(anywhere.get("withoutNc")),
                n=cell(anywhere.get("nd")),
                s=cell(south.get("withNc")),
            )
        )
    return "\n".join(lines)


def write_sound(counts, models, xc, site, taxa):
    summary = counts["summary"]
    bats = summary["bats"]["species"]
    best = None
    for model in models["models"]:
        matched = model.get("matched")
        if isinstance(matched, int) and (best is None or matched > best.get("matched", -1)):
            best = model
    if best is None:
        best_line = "No fetched label list produced a numeric overlap. Where a list could not be fetched, or it contains no scientific names, the overlap is null."
    else:
        best_line = (
            f"The largest numeric overlap is {best['matched']} of {best['of']} in `{best['id']}` "
            f"({best['title']}). That is not a decision to use the model or to add `/identify/sound`."
        )
    fetched = " ".join(clean_note(model.get("sampleRateNote")) or "" for model in models["models"])
    rate_notes = []
    if "384 kHz" in fetched:
        rate_notes.append("- The fetched BSG-BAT card says the model takes 384 kHz ultrasonic audio.")
    if "256 kHz" in fetched:
        rate_notes.append("- The fetched BattyBirdNET card says bat recordings at 256 kHz are passed to BirdNET without resampling.")
    lines = [
        "# Identify by sound: counts",
        "",
        "Batch 1 of issue 40. This is a count and a label survey, not a training run and not a page. No audio was downloaded, and no route was added.",
        "",
        "## Recommendation",
        "",
        "Do not add `/identify/sound` until the owner accepts an existing model and the species it cannot name, including bats a phone microphone cannot hear. "
        f"The species files already hold {site['recordings']['files']} playable recordings across {site['recordings']['species']} species. A model trained on those recordings is not a plan.",
        "",
        best_line,
        "",
        "## Phone and bats",
        "",
        f"{bats} of {summary['all']['species']} listed species are bats (order Chiroptera). Most echolocation is above a phone microphone, so a phone page cannot name those calls. Bat-detector hardware is out of this issue.",
        "",
    ]
    if rate_notes:
        lines.append("Fetched pages that state a sample rate:")
        lines.append("")
        lines.extend(rate_notes)
        lines.append("")
    lines += [
        "## iNaturalist",
        "",
        "Observations are research-grade, non-captive, and have at least one sound under CC0, CC BY, CC BY-SA, CC BY-NC, or CC BY-NC-SA. The without-NC count drops the two NC licences. A clip is a sound file with one of those licence codes on the returned observations. South Africa clips were not paged, so those clip cells are null. ND observations are counted separately and are not reusable.",
        "",
        "Rest of South Africa is the South Africa observation total minus the Kruger total, with the same limit as the photo count: it is null when the South Africa total is smaller.",
        "",
        bucket_line("Anywhere observations, with NC", summary["all"]["withNc"]["anywhere"]),
        "",
        bucket_line("Anywhere observations, without NC", summary["all"]["withoutNc"]["anywhere"]),
        "",
        bucket_line("Kruger observations, with NC", summary["all"]["withNc"]["kruger"]),
        "",
        clip_line(counts["species"]),
        "",
        "iNaturalist and xeno-canto are separate counts. They were not deduplicated, and the totals are not added.",
        "",
        fence("sound-summary", summary),
        "",
        sound_table(counts["species"]),
        "",
        "## xeno-canto",
        "",
        xc["method"],
        "",
        xc["terms"]["note"] + f" Terms page: {xc['terms']['url']}.",
        "",
        xc["krugerGap"],
        "",
        f"Anywhere, reusable (with NC): {xc['summary']['anywhere']['withNc']['recordings']} recordings across {xc['summary']['anywhere']['withNc']['speciesWithAny']} species, with {xc['summary']['anywhere']['withNc']['nulls']} species null.",
        "",
        f"Anywhere, without NC: {xc['summary']['anywhere']['withoutNc']['recordings']} recordings, {xc['summary']['anywhere']['withoutNc']['nulls']} species null.",
        "",
        f"Anywhere, ND (link only): {xc['summary']['anywhere']['nd']['recordings']} recordings, {xc['summary']['anywhere']['nd']['nulls']} species null.",
        "",
        f"South Africa, reusable (with NC): {xc['summary']['southAfrica']['withNc']['recordings']} recordings across {xc['summary']['southAfrica']['withNc']['speciesWithAny']} species, with {xc['summary']['southAfrica']['withNc']['nulls']} species null.",
        "",
        fence("xc-summary", xc["summary"]),
        "",
        xc_table(xc["species"]),
        "",
        "## Macaulay Library",
        "",
        counts["macaulayLibrary"]["reason"] + " The reusable clip count is null.",
        "",
        "## Models",
        "",
        models["method"],
        "",
        "Checklist remaps from `data/species-list.json` are in `synonyms.json` with `usedForMatching` false. They were not applied.",
        "",
        "| Model | Scientific names parsed | Mammal labels in the file | Of these species | Licence read from the fetched page |",
        "| --- | ---: | ---: | ---: | --- |",
    ]
    for model in models["models"]:
        groups = model.get("taxonGroups") or {}
        lines.append(
            f"| `{model['id']}` | {cell(model.get('labelCount'))} | {cell(groups.get('Mammalia'))} | {cell(model.get('matched'))} | {clean_licence(model)} |"
        )
    lines += ["", "Matched names, where the overlap is a number:", ""]
    for model in models["models"]:
        if not isinstance(model.get("matched"), int):
            continue
        names = ", ".join(hit["label"] for hit in model.get("species") or []) or "none"
        lines.append(f"- `{model['id']}`: {names}")
    lines += ["", "## Gaps", "", grouped_gaps(list(models.get("gaps") or []) + list(counts.get("gaps") or []) + list(xc.get("gaps") or []))]
    unresolved = [row["scientificName"] for row in taxa.get("species") or [] if row.get("taxonId") is None]
    lines += [
        "",
        "Species whose iNaturalist taxon id is null, so the iNaturalist sound count is null: "
        + (", ".join(unresolved) if unresolved else "none")
        + ".",
        "",
        "## Not decided",
        "",
        "Using any model in the table, including one with a numeric overlap, is not decided. Neither is the choice to leave `/identify/sound` absent if no model is accepted. The photo-count report lists the other open questions from the plan. No model weights were downloaded and no hosted model was created.",
        "",
    ]
    use = next((model.get("acceptableUse") for model in models["models"] if model.get("acceptableUse")), None)
    if use:
        lines += [
            "## BirdNET+ acceptable-use file",
            "",
            "Fetched from the Zenodo record and copied here so the conditions are not paraphrased.",
            "",
            "```text",
            use.strip(),
            "```",
            "",
        ]
    path = os.path.join(DOCS, "identify-sound-spike.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    print(path)


def main():
    counts = load(os.path.join(PHOTO, "counts.json"))
    taxa = load(os.path.join(PHOTO, "taxa.json"))
    site = load(os.path.join(PHOTO, "site-files.json"))
    sound = load(os.path.join(SOUND, "counts.json"))
    models = load(os.path.join(SOUND, "models.json"))
    xc = load(os.path.join(SOUND, "xc.json"))
    write_photo(counts, taxa, site)
    write_sound(sound, models, xc, site, taxa)


if __name__ == "__main__":
    main()
