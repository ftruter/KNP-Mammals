"""Read the 143 listed species. Does not write species files."""
import json
import os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def load_species():
    listing = json.load(open(os.path.join(REPO, "data", "species-list.json"), encoding="utf-8"))
    rows = []
    for row in listing["species"]:
        path = os.path.join(REPO, "data", "species", "details", row["slug"] + ".json")
        details = json.load(open(path, encoding="utf-8"))
        if details.get("slug") != row["slug"] or details.get("scientificName") != row["latin"]:
            raise SystemExit("species-list and details disagree for " + row["slug"])
        names = details.get("commonNames") or {}
        rows.append({
            "slug": row["slug"],
            "scientificName": details["scientificName"],
            "en": names.get("en"),
            "af": names.get("af"),
            "order": row["order"],
            "family": details.get("family"),
            "storedInatTaxonId": details.get("inatTaxonId"),
            "latinRemaps": [
                {"from": item.get("from"), "to": item.get("to"), "source": item.get("source"), "note": item.get("note")}
                for item in (row.get("remaps") or [])
                if item.get("field") == "latin"
            ],
        })
    return rows
