"""Count iNaturalist research-grade, non-captive observations with an allowed sound licence.

Clip totals count sound files on those observations when every page comes back and
every file has a licence code. Otherwise the clip total is null. No audio is saved.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
from inat import KRUGER, SOUTH_AFRICA, WITH_NC, WITHOUT_NC, get, place  # noqa: E402
from summary import rest_of_south_africa, summarise  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTO = os.path.join(HERE, "..", "identify-photo")
CACHE = os.path.join(HERE, "cache", "api")
LICENCES = (("withNc", WITH_NC), ("withoutNc", WITHOUT_NC))
ALLOWED = {
    "withNc": {"cc0", "cc-by", "cc-by-sa", "cc-by-nc", "cc-by-nc-sa"},
    "withoutNc": {"cc0", "cc-by", "cc-by-sa"},
}
ND = "cc-by-nd,cc-by-nc-nd"
PAGE = 200
MAX_PAGES = 15


def observation_page(taxon_id, licence, place_id, page, per_page):
    params = {
        "taxon_id": taxon_id,
        "quality_grade": "research",
        "captive": "false",
        "sounds": "true",
        "sound_license": licence,
        "per_page": per_page,
        "page": page,
    }
    if place_id:
        params["place_id"] = place_id
    return get("observations", params, CACHE)


def observation_total(taxon_id, licence, place_id):
    data = observation_page(taxon_id, licence, place_id, 1, 1)
    value = data.get("total_results")
    return value if isinstance(value, int) else None


def clip_count(taxon_id, licence_name, licence, place_id):
    """Return (clips or null, observation total or null, complete)."""
    first = observation_page(taxon_id, licence, place_id, 1, PAGE)
    total = first.get("total_results")
    if not isinstance(total, int):
        return None, None, False
    if total == 0:
        return 0, 0, True
    pages = (total + PAGE - 1) // PAGE
    if pages > MAX_PAGES:
        return None, total, False
    observations = list(first.get("results") or [])
    for page in range(2, pages + 1):
        more = observation_page(taxon_id, licence, place_id, page, PAGE)
        observations.extend(more.get("results") or [])
    if len(observations) < total:
        return None, total, False
    clips, unknown = 0, 0
    for obs in observations[:total]:
        for sound in obs.get("sounds") or []:
            code = (sound.get("license_code") or "").lower()
            if code in ALLOWED[licence_name]:
                clips += 1
            elif not code:
                unknown += 1
    if unknown:
        return None, total, False
    return clips, total, True


def main():
    taxa = json.load(open(os.path.join(PHOTO, "taxa.json"), encoding="utf-8"))
    kruger = place(KRUGER, CACHE)
    south_africa = place(SOUTH_AFRICA, CACHE)
    if not kruger or "Kruger" not in (kruger.get("name") or ""):
        raise SystemExit(f"place {KRUGER} is not Kruger: {kruger}")
    if not south_africa or south_africa.get("name") != "South Africa":
        raise SystemExit(f"place {SOUTH_AFRICA} is not South Africa: {south_africa}")
    rows, gaps = [], []
    for taxon in taxa["species"]:
        observations = {name: {"kruger": None, "southAfrica": None, "restOfSouthAfrica": None, "anywhere": None} for name, _ in LICENCES}
        clips = {name: {"kruger": None, "southAfrica": None, "anywhere": None} for name, _ in LICENCES}
        nd_anywhere = None
        slug = taxon["slug"]
        if taxon.get("taxonId") is None:
            gaps.append({"slug": slug, "reason": "taxon id is null, so sound counts are null"})
        else:
            try:
                for licence_name, licence in LICENCES:
                    raw = {
                        "southAfrica": observation_total(taxon["taxonId"], licence, SOUTH_AFRICA),
                    }
                    for place_name, place_id in (("kruger", KRUGER), ("anywhere", None)):
                        counted, total, complete = clip_count(taxon["taxonId"], licence_name, licence, place_id)
                        raw[place_name] = total
                        clips[licence_name][place_name] = counted if complete else None
                        if not complete:
                            gaps.append({
                                "slug": slug,
                                "licence": licence_name,
                                "place": place_name,
                                "reason": "clip count is null because the sound files were not fully read",
                                "observations": total,
                            })
                    rest = rest_of_south_africa(raw["southAfrica"], raw["kruger"])
                    if rest is None and isinstance(raw["southAfrica"], int) and isinstance(raw["kruger"], int):
                        gaps.append({
                            "slug": slug,
                            "licence": licence_name,
                            "reason": "South Africa total is smaller than the Kruger total, so the rest is null",
                            "southAfrica": raw["southAfrica"],
                            "kruger": raw["kruger"],
                        })
                    observations[licence_name] = {
                        "kruger": raw["kruger"],
                        "southAfrica": raw["southAfrica"],
                        "restOfSouthAfrica": rest,
                        "anywhere": raw["anywhere"],
                    }
                    clips[licence_name]["southAfrica"] = None
                nd_anywhere = observation_total(taxon["taxonId"], ND, None)
            except Exception as exc:
                gaps.append({"slug": slug, "reason": "sound count request failed", "error": str(exc)})
                observations = {name: {"kruger": None, "southAfrica": None, "restOfSouthAfrica": None, "anywhere": None} for name, _ in LICENCES}
                clips = {name: {"kruger": None, "southAfrica": None, "anywhere": None} for name, _ in LICENCES}
                nd_anywhere = None
        rows.append({
            "slug": slug,
            "scientificName": taxon["scientificName"],
            "order": taxon.get("order"),
            "taxonId": taxon.get("taxonId"),
            "inatName": taxon.get("inatName"),
            "match": taxon.get("match"),
            "observations": observations,
            "clips": clips,
            "ndObservationsAnywhere": nd_anywhere,
        })
        print(slug, observations["withNc"]["anywhere"], clips["withNc"]["anywhere"], file=sys.stderr)
    flat = []
    for row in rows:
        flat.append({
            "slug": row["slug"],
            "order": row["order"],
            "withNc": row["observations"]["withNc"],
            "withoutNc": row["observations"]["withoutNc"],
        })
    payload = {
        "method": {
            "qualityGrade": "research",
            "captive": False,
            "sounds": True,
            "soundLicenseWithNc": WITH_NC.split(","),
            "soundLicenseWithoutNc": WITHOUT_NC.split(","),
            "ndLicense": ND.split(","),
            "ndMeaning": "link only, not playback and not training material",
            "places": {"kruger": kruger, "southAfrica": south_africa, "anywhere": None},
            "observations": "research-grade non-captive observations with at least one sound under the licence filter",
            "clips": "sound files with an allowed licence code on those observations, or null when a page or a licence code was missing. South Africa clips were not paged.",
            "clipPageCap": MAX_PAGES * PAGE,
        },
        "summary": summarise(flat, {
            "all": lambda _r: True,
            "bats": lambda r: r["order"] == "Chiroptera",
            "notBats": lambda r: r["order"] != "Chiroptera",
        }),
        "species": rows,
        "gaps": gaps,
        "xenoCanto": {
            "reusableClips": None,
            "reason": "Counted separately from the public explore pages. See xc.json. API v3 was not called.",
        },
        "macaulayLibrary": {
            "reusableClips": None,
            "reason": "Reuse terms were not readable. https://www.macaulaylibrary.org/media-asset-licensing/ returned 404. https://birds.cornell.edu/home/terms-of-use/ returned 403. The about page does not state a licence.",
        },
    }
    path = os.path.join(HERE, "counts.json")
    json.dump(payload, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(path, "a", encoding="utf-8").write("\n")
    print("anywhere with NC", json.dumps(payload["summary"]["all"]["withNc"]["anywhere"]))


if __name__ == "__main__":
    main()
