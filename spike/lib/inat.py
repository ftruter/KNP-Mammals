"""Polite iNaturalist reads. One request a second, cached on disk. No media is downloaded."""
import hashlib
import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.inaturalist.org/v1"
UA = "knp-mammals-spike/0.1 (identify-counts; no media download)"
KRUGER = 69020
SOUTH_AFRICA = 6986
WITH_NC = "cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa"
WITHOUT_NC = "cc0,cc-by,cc-by-sa"
_last = [0.0]
_lock = threading.Lock()


def get(path, params, cache_dir, api=API):
    url = f"{api}/{path}?{urllib.parse.urlencode(params, safe='(),:!')}"
    key = os.path.join(cache_dir, hashlib.sha1(url.encode()).hexdigest() + ".json")
    if os.path.exists(key):
        return json.load(open(key, encoding="utf-8"))
    data = None
    err = None
    for attempt in range(6):
        with _lock:
            wait = 1.05 - (time.time() - _last[0])
            if wait > 0:
                time.sleep(wait)
            _last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as response:
                data = json.load(response)
            err = None
            break
        except Exception as exc:  # 429 or a dropped connection
            err = exc
            if attempt == 5:
                break
            time.sleep(10 * (attempt + 1))
    if err is not None:
        detail = ""
        if isinstance(err, urllib.error.HTTPError):
            detail = err.read()[:300].decode("utf-8", "replace")
        raise RuntimeError(f"{url} failed: {err} {detail}") from err
    os.makedirs(cache_dir, exist_ok=True)
    json.dump(data, open(key, "w", encoding="utf-8"))
    return data


def place(place_id, cache_dir):
    data = get(f"places/{place_id}", {}, cache_dir)
    results = data.get("results") or []
    if not results:
        return None
    row = results[0]
    return {"id": row.get("id"), "name": row.get("name"), "displayName": row.get("display_name")}
