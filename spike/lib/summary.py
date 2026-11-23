"""Thresholds and the median. Unknowns stay out of the numeric buckets."""


def rest_of_south_africa(south_africa, kruger):
    """South Africa place total minus the Kruger place total.

    This is the rest of the country only when every Kruger observation is also
    inside the South Africa place. A smaller South Africa total makes that
    untrue, so the result is null."""
    if not isinstance(south_africa, int) or not isinstance(kruger, int):
        return None
    if south_africa < kruger:
        return None
    return south_africa - kruger


def median(values):
    xs = sorted(v for v in values if isinstance(v, (int, float)) and not isinstance(v, bool))
    n = len(xs)
    if n == 0:
        return None
    mid = n // 2
    if n % 2:
        return xs[mid]
    return (xs[mid - 1] + xs[mid]) / 2


def column(records, key_path):
    """key_path is ('withNc', 'anywhere') and the value may be null."""
    numbers, nulls = [], 0
    for record in records:
        value = record
        for key in key_path:
            value = None if value is None else value.get(key)
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            nulls += 1
        else:
            numbers.append(value)
    return {
        "median": median(numbers),
        "under20": sum(v < 20 for v in numbers),
        "under50": sum(v < 50 for v in numbers),
        "under150": sum(v < 150 for v in numbers),
        "atLeast50": sum(v >= 50 for v in numbers),
        "atLeast150": sum(v >= 150 for v in numbers),
        "zero": sum(v == 0 for v in numbers),
        "counted": len(numbers),
        "nulls": nulls,
    }


def summarise(records, groups):
    """groups is a dict of name -> predicate. 'all' should be included by the caller."""
    out = {}
    for name, pred in groups.items():
        chosen = [r for r in records if pred(r)]
        block = {"species": len(chosen)}
        for licence in ("withNc", "withoutNc"):
            block[licence] = {}
            for place in ("kruger", "southAfrica", "restOfSouthAfrica", "anywhere"):
                block[licence][place] = column(chosen, (licence, place))
        out[name] = block
    return out
