"""Match each listed species to an iNaturalist taxon. Writes taxa.json.

A species is mapped only when an active Mammalia taxon has the same scientific
name, or iNaturalist reports our name as a matched synonym of exactly one taxon.
Nothing is matched on English names, stored ids, or by guessing.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
from inat import get  # noqa: E402
from species import REPO, load_species  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache", "api")
OUT = os.path.join(HERE, "taxa.json")


def search(name, active):
    found, total = [], None
    for page in (1, 2):
        data = get("taxa", {
            "q": name, "per_page": 20, "page": page, "is_active": "true" if active else "false",
            "all_names": "true",
        }, CACHE)
        found.extend(data.get("results") or [])
        total = data.get("total_results")
        if not isinstance(total, int) or page * 20 >= total:
            break
    return found, total


def pick(results, name):
    mammals = [t for t in results if t.get("iconic_taxon_name") == "Mammalia"]
    exact = [t for t in mammals if (t.get("name") or "").lower() == name.lower()]
    ids = {t.get("id"): t for t in exact}
    if len(ids) == 1:
        return next(iter(ids.values())), "same name"
    if len(ids) > 1:
        detail = "; ".join(f"{t.get('id')} {t.get('rank')} {t.get('name')}" for t in ids.values())
        return None, "ambiguous exact name: " + detail
    syn = [t for t in mammals if (t.get("matched_term") or "").lower() == name.lower()
           and (t.get("name") or "").lower() != name.lower()]
    ids = {t.get("id"): t for t in syn}
    if len(ids) == 1:
        return next(iter(ids.values())), "iNaturalist synonym"
    if len(ids) > 1:
        return None, "ambiguous synonym: " + ",".join(str(i) for i in ids)
    return None, None


def main():
    species = load_species()
    rows, gaps = [], []
    for sp in species:
        name = sp["scientificName"]
        results, total = search(name, True)
        taxon, how = pick(results, name)
        inactive_note = None
        if taxon is None and how is None:
            inactive, _ = search(name, False)
            inactive_taxon, inactive_how = pick(inactive, name)
            if inactive_taxon is not None:
                inactive_note = {
                    "slug": sp["slug"],
                    "scientificName": name,
                    "reason": "the only Mammalia match is inactive, so the taxon id is null",
                    "inactiveTaxonId": inactive_taxon.get("id"),
                    "inactiveName": inactive_taxon.get("name"),
                    "how": inactive_how,
                }
        row = {
            "slug": sp["slug"],
            "scientificName": name,
            "en": sp["en"],
            "af": sp["af"],
            "order": sp["order"],
            "family": sp["family"],
            "storedInatTaxonId": sp["storedInatTaxonId"],
            "taxonId": None,
            "inatName": None,
            "inatRank": None,
            "match": None,
            "storedIdAgrees": None,
            "searchResults": total,
        }
        if taxon is not None and how in ("same name", "iNaturalist synonym"):
            row.update(taxonId=taxon.get("id"), inatName=taxon.get("name"), inatRank=taxon.get("rank"), match=how)
            stored = sp["storedInatTaxonId"]
            if isinstance(stored, int) and isinstance(taxon.get("id"), int):
                row["storedIdAgrees"] = stored == taxon.get("id")
                if stored != taxon.get("id"):
                    gaps.append({
                        "slug": sp["slug"],
                        "reason": "stored inatTaxonId differs from the scientific-name match",
                        "storedInatTaxonId": stored,
                        "taxonId": taxon.get("id"),
                    })
        else:
            reason = how or "no active Mammalia taxon with this scientific name in the first two search pages"
            gaps.append({"slug": sp["slug"], "scientificName": name, "reason": reason, "searchResults": total})
            if inactive_note:
                gaps.append(inactive_note)
        rows.append(row)
        print(sp["slug"], "->", row["taxonId"], row["match"], file=sys.stderr)
    payload = {
        "source": "iNaturalist taxa search on the scientific name. Active Mammalia only.",
        "speciesList": os.path.relpath(os.path.join(REPO, "data", "species-list.json"), REPO),
        "species": rows,
        "gaps": gaps,
    }
    json.dump(payload, open(OUT, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(OUT, "a", encoding="utf-8").write("\n")
    mapped = sum(r["taxonId"] is not None for r in rows)
    print(f"{mapped} mapped; {len(rows) - mapped} missing")


if __name__ == "__main__":
    main()
