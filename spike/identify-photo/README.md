# Identify by photo: counts only

This folder counts openly licensed iNaturalist photographs. It does not train a model,
download photographs, or change the site.

The report is `docs/identify-photo-spike.md`. API responses are cached under `cache/` and
are not committed.

Rerun, from the repository root. The scripts wait at least a second between iNaturalist
requests. Delete `spike/identify-photo/cache` first for a fresh pull.

```bash
python3 spike/identify-photo/map-taxa.py
python3 spike/identify-photo/count-photos.py
python3 spike/identify-photo/site-files.py
python3 spike/write-reports.py
```

`map-taxa.py` writes `taxa.json`. A species is mapped only when an active Mammalia taxon
has the same scientific name, or iNaturalist reports that name as the matched synonym of
exactly one taxon. A stored `inatTaxonId` is compared and never used as a fallback.

`count-photos.py` writes `counts.json`. For each mapped species it counts research-grade,
non-captive observations with at least one photo under CC0, CC BY, CC BY-SA, CC BY-NC, or
CC BY-NC-SA, and the same count without the NC licences. Places are Kruger (69020), South
Africa (6986), the rest of South Africa (the second total minus the first, or null if that
is negative), and anywhere.

`site-files.py` only reads the species files and writes `site-files.json`.
