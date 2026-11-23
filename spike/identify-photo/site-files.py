"""Count photographs and recordings already stored on the species. Reads only."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
from species import REPO  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))


def bucket(text):
    if not isinstance(text, str) or not text.strip():
        return None
    lowered = text.lower()
    if "all rights reserved" in lowered or "all-rights-reserved" in lowered:
        return "reserved"
    tokens = set(re.sub(r"[^a-z0-9]+", " ", lowered.replace("_", " ")).split())
    if "nd" in tokens:
        return "nd"
    if "cc0" in lowered.replace(" ", "") or "public domain" in lowered:
        return "open"
    if "by" not in tokens:
        return None
    if "nc" in tokens:
        return "nc"
    return "open"


def files_of(details):
    images = details.get("images") or []
    recordings = []
    for call in details.get("calls") or []:
        recordings.extend(call.get("recordings") or [])
    return images, recordings


def main():
    folder = os.path.join(REPO, "data", "species", "details")
    species = []
    for name in sorted(os.listdir(folder)):
        if not name.endswith(".json"):
            continue
        details = json.load(open(os.path.join(folder, name), encoding="utf-8"))
        images, recordings = files_of(details)
        photo = {"open": 0, "nc": 0, "nd": 0, "reserved": 0, "unknown": 0, "illustration": 0}
        sound = {"open": 0, "nc": 0, "nd": 0, "reserved": 0, "unknown": 0}
        for image in images:
            if image.get("aiGenerated") is True:
                photo["illustration"] += 1
                continue
            kind = bucket(image.get("license"))
            photo[kind or "unknown"] += 1
        for recording in recordings:
            kind = bucket(recording.get("license"))
            sound[kind or "unknown"] += 1
        species.append({
            "slug": details.get("slug"),
            "scientificName": details.get("scientificName"),
            "photographs": photo,
            "recordings": sound,
            "displayablePhotograph": photo["open"] + photo["nc"] > 0,
            "playableRecording": sound["open"] + sound["nc"] > 0,
        })
    def tally(key, field):
        return {
            "species": sum(1 for sp in species if sp[key]),
            "files": sum(sp[field]["open"] + sp[field]["nc"] for sp in species),
            "openFiles": sum(sp[field]["open"] for sp in species),
            "ncFiles": sum(sp[field]["nc"] for sp in species),
            "ndFiles": sum(sp[field]["nd"] for sp in species),
            "unknownFiles": sum(sp[field]["unknown"] for sp in species),
        }
    payload = {
        "method": "Counts files already in data/species/details. AI-generated images are illustrations, not photographs. ND and all-rights-reserved are not displayable or playable.",
        "species": len(species),
        "photographs": tally("displayablePhotograph", "photographs"),
        "illustrations": sum(sp["photographs"]["illustration"] for sp in species),
        "recordings": tally("playableRecording", "recordings"),
        "withoutPhotograph": [sp["slug"] for sp in species if not sp["displayablePhotograph"]],
        "withPlayableRecording": [sp["slug"] for sp in species if sp["playableRecording"]],
        "rows": [{k: sp[k] for k in ("slug", "scientificName", "photographs", "recordings", "displayablePhotograph", "playableRecording")} for sp in species],
    }
    path = os.path.join(HERE, "site-files.json")
    json.dump(payload, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(path, "a", encoding="utf-8").write("\n")
    print(json.dumps({k: payload[k] for k in ("species", "photographs", "illustrations", "recordings")}, indent=2))


if __name__ == "__main__":
    main()
