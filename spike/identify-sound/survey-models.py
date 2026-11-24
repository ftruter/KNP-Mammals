"""Match model label files to the 143 scientific names.

A label counts only when the whole scientific name is equal, or it is an
iNaturalist accepted name recorded for that species. Codes, common names and
near spellings do not count. If the label file cannot be fetched or contains
no scientific names, the overlap is null.
"""
import csv
import hashlib
import io
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
from species import load_species  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTO = os.path.join(HERE, "..", "identify-photo")
CACHE = os.path.join(HERE, "cache", "labels")
UA = "knp-mammals-spike/0.1 (identify-counts; label lists only)"
BINOMIAL = re.compile(r"^[A-Z][a-z]+ [a-z]+(?: [a-z]+)?$")

BATTY = "https://huggingface.co/tphakala/BattyBirdNET-onnx/resolve/main/labels/{name}_Labels.txt"
BATTY_REGIONS = [
    "BattyBirdNET-Bavaria-256kHz",
    "BattyBirdNET-Bavaria-256kHz-high",
    "BattyBirdNET-EU-256kHz",
    "BattyBirdNET-Scotland-256kHz",
    "BattyBirdNET-SouthWales-256kHz",
    "BattyBirdNET-Sweden-256kHz",
    "BattyBirdNET-UK-256kHz",
    "BattyBirdNET-USA-256kHz",
    "BattyBirdNET-USA-EAST-256kHz",
    "BattyBirdNET-USA-EAST-256kHz-high",
    "BattyBirdNET-USA-WEST-256kHz",
]


def source(model_id, title, claim_url, label_url, licence_url, label_format):
    return {
        "id": model_id,
        "title": title,
        "claimUrl": claim_url,
        "labelUrl": label_url,
        "licenceUrl": licence_url,
        "labelFormat": label_format,
    }


def catalog():
    rows = [
        source(
            "birdnet-plus-v3-global-12k",
            "BirdNET+ V3.0 Global 12K",
            "https://zenodo.org/records/24362980",
            "https://zenodo.org/api/records/24362980/files/BirdNET+_V3.0_Global_12K_Labels.csv/content",
            "https://zenodo.org/api/records/24362980/files/MODEL_LICENSE.txt/content",
            "csv",
        ),
        source(
            "birdnet-v2.4",
            "BirdNET V2.4 global 6K",
            "https://raw.githubusercontent.com/birdnet-team/BirdNET-Analyzer/v2.4.0/README.md",
            "https://raw.githubusercontent.com/birdnet-team/BirdNET-Analyzer/v2.4.0/birdnet_analyzer/labels/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels_en_uk.txt",
            "https://raw.githubusercontent.com/birdnet-team/BirdNET-Analyzer/v2.4.0/README.md",
            "underscore",
        ),
        source(
            "bsg-bat-v0.21",
            "BSG-BAT v0.21",
            "https://huggingface.co/tphakala/BSG-BAT/raw/main/README.md",
            "https://huggingface.co/tphakala/BSG-BAT/raw/main/bsgbat_labels.txt",
            "https://huggingface.co/tphakala/BSG-BAT/raw/main/README.md",
            "lines",
        ),
        source(
            "batdetect2-uk-same-onnx",
            "BatDetect2 UK same, ONNX conversion",
            "https://huggingface.co/legojoey17/batdetect2-uk-same-onnx/raw/main/README.md",
            "https://huggingface.co/legojoey17/batdetect2-uk-same-onnx/raw/main/labels.json",
            "https://huggingface.co/legojoey17/batdetect2-uk-same-onnx/raw/main/README.md",
            "json",
        ),
    ]
    for region in BATTY_REGIONS:
        rows.append(source(
            region.lower(),
            region,
            "https://huggingface.co/tphakala/BattyBirdNET-onnx/raw/main/README.md",
            BATTY.format(name=region),
            "https://huggingface.co/tphakala/BattyBirdNET-onnx/raw/main/README.md",
            "underscore",
        ))
    for model_id, title, readme in (
        ("echo-edge-bat-classifier-331", "Echo-Edge-Bat-Classifier-331", "https://huggingface.co/SOTAagi2030/Echo-Edge-Bat-Classifier-331/raw/main/README.md"),
        ("beats-bean-bats", "BEATs BEAN bats", "https://huggingface.co/espnet/BEATs-BEAN.Bats/raw/main/README.md"),
        ("openbeats-large-i3-bats", "OpenBEATS Large i3 bats", "https://huggingface.co/espnet/OpenBEATS-Large-i3-bats/raw/main/README.md"),
        ("batai-mobilenet-onnx", "BatAI MobileNet ONNX", "https://huggingface.co/legojoey17/batai-mobilenet-onnx/raw/main/README.md"),
    ):
        rows.append(source(model_id, title, readme, None, readme, None))
    rows.append(source(
        "naturelm-audio",
        "NatureLM-audio",
        "https://projects.earthspecies.org/naturelm-audio/1.0/datasets.html",
        None,
        "https://projects.earthspecies.org/naturelm-audio/1.0/datasets.html",
        None,
    ))
    rows[0]["acceptableUseUrl"] = "https://zenodo.org/api/records/24362980/files/ACCEPTABLE_USE.txt/content"
    return rows


def download(url):
    if not url:
        return None
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest())
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as response:
        raw = response.read()
    text = raw.decode("utf-8", "replace")
    open(path, "w", encoding="utf-8").write(text)
    return text


def names_from_text(text):
    found = []
    for line in text.splitlines():
        head = line.strip()
        if not head or head.startswith("#"):
            continue
        head = re.sub(r"^\d+\s+", "", head)
        head = head.split("_", 1)[0].strip()
        head = head.split(" - ", 1)[0].strip()
        if BINOMIAL.match(head):
            found.append(head)
    return found


def names_from_csv(text):
    reader = csv.DictReader(io.StringIO(text))
    fields = {(name or "").strip().lower(): name for name in (reader.fieldnames or [])}
    column = None
    for candidate in ("scientific_name", "sci_name", "scientific name"):
        if candidate in fields:
            column = fields[candidate]
            break
    if column is None:
        return None, None
    names, groups = [], {}
    group_column = fields.get("taxon_group")
    for row in reader:
        value = (row.get(column) or "").strip()
        if BINOMIAL.match(value):
            names.append(value)
        if group_column:
            group = row.get(group_column) or ""
            groups[group] = groups.get(group, 0) + 1
    return names, groups or None


def names_from_json(text):
    data = json.loads(text)
    values = data.get("labels") if isinstance(data, dict) else data
    if not isinstance(values, list):
        return None
    return [item for item in values if isinstance(item, str) and BINOMIAL.match(item.strip())]


def load_names(text, label_format):
    if text is None:
        return None, None
    if label_format == "csv":
        return names_from_csv(text)
    if label_format == "json":
        return names_from_json(text), None
    return names_from_text(text), None


def name_index(species, taxa):
    index = {}
    def add(name, slug, how):
        if not name:
            return
        index.setdefault(name.lower(), []).append({"slug": slug, "how": how})
    for sp in species:
        add(sp["scientificName"], sp["slug"], "scientific name")
    synonyms = []
    if taxa:
        for row in taxa.get("species") or []:
            if row.get("match") == "iNaturalist synonym" and row.get("inatName") and row["inatName"].lower() != row["scientificName"].lower():
                add(row["inatName"], row["slug"], "iNaturalist accepted name")
                synonyms.append({
                    "slug": row["slug"],
                    "scientificName": row["scientificName"],
                    "inatName": row["inatName"],
                    "source": "iNaturalist taxa search matched_term",
                    "usedForMatching": True,
                })
    remaps = []
    for sp in species:
        for item in sp["latinRemaps"]:
            remaps.append({"slug": sp["slug"], **item, "usedForMatching": False,
                           "reason": "Checklist remap. Not applied, because it was not re-checked against each model's taxonomy."})
    return index, {"inatSynonyms": synonyms, "checklistRemapsNotUsed": remaps}


def match(names, index):
    if names is None:
        return None
    hits, ambiguous = [], []
    seen = set()
    for name in names:
        rows = index.get(name.lower()) or []
        slugs = {row["slug"] for row in rows}
        if len(slugs) > 1:
            ambiguous.append(name)
            continue
        if len(slugs) == 1:
            slug = next(iter(slugs))
            if slug not in seen:
                seen.add(slug)
                hits.append({"slug": slug, "label": name, "how": rows[0]["how"]})
    return hits, ambiguous


def sample_rate_note(text):
    if not text:
        return None
    flat = re.sub(r"\s+", " ", text)
    match = re.search(r".{0,80}\d+\s*kHz.{0,80}", flat, re.I)
    if not match:
        return None
    return match.group(0).strip()


def licence_note(text):
    if not text:
        return None
    flat = re.sub(r"\s+", " ", text)
    match = re.search(
        r".{0,100}(CC BY-NC-SA 4\.0|CC BY 4\.0|CC BY-NC 4\.0|Apache License(?:, Version 2\.0)?|cc-by-nc-sa-4\.0|cc-by-4\.0|cc-by-nc-4\.0).{0,100}",
        flat,
        re.I,
    )
    if not match:
        return None
    return match.group(0).strip()


def main():
    species = load_species()
    taxa_path = os.path.join(PHOTO, "taxa.json")
    taxa = json.load(open(taxa_path, encoding="utf-8")) if os.path.exists(taxa_path) else None
    index, synonyms = name_index(species, taxa)
    json.dump(synonyms, open(os.path.join(HERE, "synonyms.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(os.path.join(HERE, "synonyms.json"), "a", encoding="utf-8").write("\n")
    models, gaps = [], []
    for item in catalog():
        row = dict(item)
        row["of"] = len(species)
        try:
            label_text = download(item["labelUrl"]) if item["labelUrl"] else None
            licence_text = download(item["licenceUrl"]) if item["licenceUrl"] else None
            claim_text = download(item["claimUrl"]) if item["claimUrl"] and item["claimUrl"] != item["licenceUrl"] else licence_text
            if item.get("acceptableUseUrl"):
                row["acceptableUse"] = download(item["acceptableUseUrl"])
        except Exception as exc:
            row.update(matched=None, labelCount=None, error=str(exc))
            gaps.append({"id": item["id"], "reason": "label list or licence page was not fetched", "error": str(exc)})
            models.append(row)
            print(item["id"], "FAILED", file=sys.stderr)
            continue
        row["sampleRateNote"] = sample_rate_note(claim_text) or sample_rate_note(licence_text)
        if item["labelUrl"] is None:
            row.update(matched=None, labelCount=None, licenceLine=licence_note(licence_text))
            gaps.append({"id": item["id"], "reason": "no label file URL. Overlap is null."})
            models.append(row)
            print(item["id"], "no label file", file=sys.stderr)
            continue
        names, groups = load_names(label_text, item["labelFormat"])
        if not names:
            row.update(matched=None, labelCount=0 if names == [] else None, taxonGroups=groups, licenceLine=licence_note(licence_text))
            gaps.append({"id": item["id"], "reason": "label file has no scientific names, so the overlap is null"})
            models.append(row)
            print(item["id"], "no scientific names", file=sys.stderr)
            continue
        hits, ambiguous = match(names, index)
        row.update(
            matched=len(hits),
            labelCount=len(names),
            taxonGroups=groups,
            species=hits,
            ambiguousLabels=ambiguous,
            licenceLine=licence_note(licence_text),
            claimFetched=bool(claim_text),
        )
        models.append(row)
        print(item["id"], len(hits), "of", len(names), file=sys.stderr)
    if taxa is None:
        gaps.append({"id": "synonyms", "reason": "taxa.json was absent, so only exact scientific names were matched"})
    payload = {
        "method": "Exact scientific name, then an iNaturalist accepted name from taxa.json. Checklist remaps in synonyms.json were not applied. No model weights were downloaded.",
        "species": len(species),
        "models": models,
        "gaps": gaps,
    }
    path = os.path.join(HERE, "models.json")
    json.dump(payload, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(path, "a", encoding="utf-8").write("\n")


if __name__ == "__main__":
    main()
