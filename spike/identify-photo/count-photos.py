"""Count research-grade, non-captive observations with an allowed photo licence.

Kruger is place 69020. South Africa is place 6986. The rest of South Africa is
the South Africa total minus the Kruger total, or null when that subtraction
would be negative. Anywhere has no place filter. No photograph is downloaded.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
from inat import KRUGER, SOUTH_AFRICA, WITH_NC, WITHOUT_NC, get, place  # noqa: E402
from species import load_species  # noqa: E402
from summary import rest_of_south_africa, summarise  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache", "api")
LICENCES = (("withNc", WITH_NC), ("withoutNc", WITHOUT_NC))
PLACES = (("kruger", KRUGER), ("southAfrica", SOUTH_AFRICA), ("anywhere", None))


def total(taxon_id, licence, place_id):
    params = {
        "taxon_id": taxon_id,
        "quality_grade": "research",
        "captive": "false",
        "photos": "true",
        "photo_license": licence,
        "per_page": 1,
    }
    if place_id:
        params["place_id"] = place_id
    data = get("observations", params, CACHE)
    value = data.get("total_results")
    if not isinstance(value, int):
        return None
    return value


def blank():
    return {name: {"kruger": None, "southAfrica": None, "restOfSouthAfrica": None, "anywhere": None} for name, _ in LICENCES}


def main():
    taxa = json.load(open(os.path.join(HERE, "taxa.json"), encoding="utf-8"))
    by_slug = {sp["slug"]: sp for sp in load_species()}
    kruger = place(KRUGER, CACHE)
    south_africa = place(SOUTH_AFRICA, CACHE)
    if not kruger or "Kruger" not in (kruger.get("name") or ""):
        raise SystemExit(f"place {KRUGER} is not Kruger: {kruger}")
    if not south_africa or south_africa.get("name") != "South Africa":
        raise SystemExit(f"place {SOUTH_AFRICA} is not South Africa: {south_africa}")
    rows, gaps = [], []
    for taxon in taxa["species"]:
        counts = blank()
        slug = taxon["slug"]
        if taxon.get("taxonId") is None:
            gaps.append({"slug": slug, "reason": "taxon id is null, so photo counts are null"})
        else:
            try:
                for licence_name, licence in LICENCES:
                    raw = {}
                    for place_name, place_id in PLACES:
                        raw[place_name] = total(taxon["taxonId"], licence, place_id)
                    rest = rest_of_south_africa(raw["southAfrica"], raw["kruger"])
                    if rest is None and isinstance(raw["southAfrica"], int) and isinstance(raw["kruger"], int):
                        gaps.append({
                            "slug": slug,
                            "licence": licence_name,
                            "reason": "South Africa total is smaller than the Kruger total, so the rest is null",
                            "southAfrica": raw["southAfrica"],
                            "kruger": raw["kruger"],
                        })
                    counts[licence_name] = {
                        "kruger": raw["kruger"],
                        "southAfrica": raw["southAfrica"],
                        "restOfSouthAfrica": rest,
                        "anywhere": raw["anywhere"],
                    }
            except Exception as exc:
                counts = blank()
                gaps.append({"slug": slug, "reason": "photo count request failed", "error": str(exc)})
        sp = by_slug[slug]
        rows.append({
            "slug": slug,
            "scientificName": taxon["scientificName"],
            "en": taxon.get("en"),
            "af": taxon.get("af"),
            "order": sp["order"],
            "family": sp["family"],
            "taxonId": taxon.get("taxonId"),
            "inatName": taxon.get("inatName"),
            "inatRank": taxon.get("inatRank"),
            "match": taxon.get("match"),
            "withNc": counts["withNc"],
            "withoutNc": counts["withoutNc"],
        })
        print(slug, counts["withNc"]["anywhere"], counts["withoutNc"]["anywhere"], file=sys.stderr)
    groups = {
        "all": lambda _r: True,
        "bats": lambda r: r["order"] == "Chiroptera",
        "notBats": lambda r: r["order"] != "Chiroptera",
    }
    payload = {
        "method": {
            "qualityGrade": "research",
            "captive": False,
            "photos": True,
            "photoLicenseWithNc": WITH_NC.split(","),
            "photoLicenseWithoutNc": WITHOUT_NC.split(","),
            "excluded": ["cc-by-nd", "cc-by-nc-nd", "all-rights-reserved"],
            "places": {"kruger": kruger, "southAfrica": south_africa, "anywhere": None},
            "restOfSouthAfrica": "southAfrica total minus kruger total, or null if that is negative",
            "unit": "observations with at least one photo under the licence filter",
        },
        "summary": summarise(rows, groups),
        "species": rows,
        "gaps": gaps + [{"slug": g["slug"], "reason": g["reason"]} for g in taxa.get("gaps", []) if g.get("reason")],
    }
    # Taxon gaps are already in taxa.json. Keep only count gaps here, plus a pointer.
    payload["gaps"] = gaps
    payload["taxonGapCount"] = len(taxa.get("gaps") or [])
    path = os.path.join(HERE, "counts.json")
    json.dump(payload, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(path, "a", encoding="utf-8").write("\n")
    anywhere = payload["summary"]["all"]["withNc"]["anywhere"]
    print("anywhere with NC", json.dumps(anywhere))


if __name__ == "__main__":
    main()
