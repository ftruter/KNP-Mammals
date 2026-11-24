# Identify by sound: counts only

This folder counts reusable sound clips and checks public model label lists. It does not
train a model, download audio, or change the site.

The report is `docs/identify-sound-spike.md`. Caches under `cache/` are not committed.

Rerun, from the repository root, after `spike/identify-photo/map-taxa.py`. iNaturalist and
xeno-canto requests are at least a second apart. Delete `spike/identify-sound/cache` for a
fresh pull.

```bash
python3 spike/identify-photo/map-taxa.py
python3 spike/identify-sound/count-sounds.py
python3 spike/identify-sound/count-xc.py
python3 spike/identify-sound/survey-models.py
python3 spike/write-reports.py
```

`count-sounds.py` writes `counts.json`: research-grade, non-captive iNaturalist observations
with a sound under the same licences as the photo count, plus a clip count when every sound
file on those observations was read. ND observations are a separate anywhere total and are
not reusable. The Macaulay Library count is null.

`count-xc.py` writes `xc.json` from the public explore pages. API v3 is not called. Kruger
is null. `python3 spike/identify-sound/count-xc.py --self-test` checks the page parser.

`survey-models.py` writes `models.json` and `synonyms.json`. A label matches a species only
on the full scientific name, or on an iNaturalist accepted name recorded in `taxa.json`.
Checklist remaps are listed and not applied. A missing or non-scientific label list leaves
the overlap null. Model weights are not downloaded.
