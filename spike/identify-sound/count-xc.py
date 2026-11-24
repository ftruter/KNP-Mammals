"""Count xeno-canto recordings from the public explore pages.

API v3 needs a member key this project does not have, so it is not called.
No audio is downloaded. A row counts only when its scientific name is the
species, or a subspecies of a binomial on our list, and the page shows a
Creative Commons licence. Kruger is null: xeno-canto has no Kruger place.
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
from species import load_species  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache", "xc")
UA = "knp-mammals-spike/0.1 (identify-counts; no audio download)"
OPEN = {"by", "by-sa", "cc0", "zero", "publicdomain"}
NC = {"by-nc", "by-nc-sa"}
ND = {"by-nd", "by-nc-nd", "nd"}


def fetch(url):
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".html")
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as response:
        text = response.read().decode("utf-8", "replace")
    os.makedirs(CACHE, exist_ok=True)
    open(path, "w", encoding="utf-8").write(text)
    time.sleep(1.05)
    return text


def stated_results(html):
    if "No recordings found" in html:
        return 0
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    match = re.search(r"([\d,]+) results?\b", text)
    if not match:
        return None
    return int(match.group(1).replace(",", ""))


def parse_rows(html):
    rows = []
    for row in re.findall(r"<tr[\s\S]*?</tr>", html):
        licences = re.findall(r"creativecommons.org/licenses/([a-z0-9-]+)/", row)
        names = re.findall(r"class='sci-name'>([^<]+)", row)
        if not licences and not names:
            continue
        rows.append({"names": " ".join(names), "licence": licences[0] if len(licences) == 1 else None})
    return rows


def name_ok(cell, scientific):
    found = re.findall(r"[A-Z][a-z]+ [a-z]+(?: [a-z]+)?", cell or "")
    if not found:
        return False
    if len(scientific.split()) == 3:
        return all(item == scientific for item in found)
    return all(item == scientific or item.startswith(scientific + " ") for item in found)


def query_for(scientific):
    parts = scientific.split()
    if len(parts) == 2:
        return f'sp:"{scientific}"'
    if len(parts) == 3:
        return f'ssp:"{scientific}"'
    return None


def pages(query):
    html = fetch("https://xeno-canto.org/explore?query=" + urllib.parse.quote(query))
    stated = stated_results(html)
    parsed = parse_rows(html)
    page = 1
    while isinstance(stated, int) and stated > len(parsed) and page < 25:
        page += 1
        more = fetch("https://xeno-canto.org/explore?query=" + urllib.parse.quote(query) + f"&pg={page}")
        added = parse_rows(more)
        if not added:
            break
        parsed.extend(added)
    return stated, parsed


def tally(stated, parsed, scientific):
    if stated == 0:
        return {"statedResults": 0, "parsedRows": 0, "withNc": 0, "withoutNc": 0, "nd": 0, "complete": True}
    blank = {"statedResults": stated, "parsedRows": len(parsed), "withNc": None, "withoutNc": None, "nd": None, "complete": False}
    if stated is None or len(parsed) != stated:
        return blank
    open_n = nc_n = nd_n = 0
    for row in parsed:
        if not name_ok(row["names"], scientific) or row["licence"] is None:
            return blank
        code = row["licence"]
        if code in OPEN:
            open_n += 1
        elif code in NC:
            nc_n += 1
        elif code in ND:
            nd_n += 1
        else:
            return blank
    return {
        "statedResults": stated,
        "parsedRows": len(parsed),
        "withNc": open_n + nc_n,
        "withoutNc": open_n,
        "nd": nd_n,
        "complete": True,
    }


def one(scientific, extra):
    query = query_for(scientific)
    if query is None:
        return None, None
    if extra:
        query = query + " " + extra
    try:
        stated, parsed = pages(query)
    except Exception as exc:
        return {"statedResults": None, "parsedRows": None, "withNc": None, "withoutNc": None, "nd": None, "complete": False, "error": str(exc)}, query
    return tally(stated, parsed, scientific), query


def self_test():
    html = """
    <p>2 results from 1 species</p>
    <tr><span class='sci-name'>Panthera leo</span>
    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/"></a></tr>
    <tr><span class='sci-name'>Panthera leo melanochaita</span>
    <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/"></a></tr>
    """
    assert stated_results(html) == 2
    assert stated_results("<p>1 result from 1 species</p>") == 1
    rows = parse_rows(html)
    assert [row["licence"] for row in rows] == ["by-nc-sa", "by-nc-nd"]
    counted = tally(2, rows, "Panthera leo")
    assert counted["withNc"] == 1 and counted["withoutNc"] == 0 and counted["nd"] == 1
    assert tally(2, rows, "Panthera pardus")["complete"] is False
    assert "No recordings found" and stated_results("No recordings found") == 0
    print("xc parser ok")


def main():
    if "--self-test" in sys.argv:
        self_test()
        return
    species = load_species()
    rows, gaps = [], []
    for sp in species:
        anywhere, anywhere_query = one(sp["scientificName"], None)
        south_africa, sa_query = one(sp["scientificName"], 'cnt:"South Africa"')
        if not anywhere or not anywhere["complete"]:
            gaps.append({"slug": sp["slug"], "place": "anywhere", "reason": "xeno-canto reusable count is null"})
        if not south_africa or not south_africa["complete"]:
            gaps.append({"slug": sp["slug"], "place": "southAfrica", "reason": "xeno-canto reusable count is null"})
        rows.append({
            "slug": sp["slug"],
            "scientificName": sp["scientificName"],
            "order": sp["order"],
            "anywhere": anywhere,
            "southAfrica": south_africa,
            "kruger": None,
            "queries": {"anywhere": anywhere_query, "southAfrica": sa_query},
        })
        print(sp["slug"], None if not anywhere else anywhere.get("withNc"), file=sys.stderr)
    def column(place, field):
        numbers, nulls = [], 0
        for row in rows:
            value = None if row[place] is None else row[place].get(field)
            if isinstance(value, int):
                numbers.append(value)
            else:
                nulls += 1
        return {"speciesWithAny": sum(v > 0 for v in numbers), "recordings": sum(numbers), "counted": len(numbers), "nulls": nulls}
    payload = {
        "method": "Public explore HTML at xeno-canto.org/explore. API v3 was not called because it requires a member key and this project has none. No audio was downloaded. ND recordings are counted separately and are not reusable.",
        "terms": {
            "url": "https://xeno-canto.org/about/terms",
            "read": True,
            "note": "The terms page says each recordist chooses a Creative Commons licence. BY-NC-ND is named as the most restrictive of the licences they describe.",
        },
        "kruger": None,
        "krugerGap": "xeno-canto has no place for Kruger National Park (iNaturalist place 69020). A country filter is not that park, so the Kruger count is null.",
        "summary": {
            "anywhere": {"withNc": column("anywhere", "withNc"), "withoutNc": column("anywhere", "withoutNc"), "nd": column("anywhere", "nd")},
            "southAfrica": {"withNc": column("southAfrica", "withNc"), "withoutNc": column("southAfrica", "withoutNc"), "nd": column("southAfrica", "nd")},
        },
        "species": rows,
        "gaps": gaps,
    }
    path = os.path.join(HERE, "xc.json")
    json.dump(payload, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(path, "a", encoding="utf-8").write("\n")
    print(json.dumps(payload["summary"]))


if __name__ == "__main__":
    main()
