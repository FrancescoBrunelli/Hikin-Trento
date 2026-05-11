import json
import requests
import time

BASE_URL = "https://overpass.private.coffee/api/interpreter"

BBOXES = [
    (45.67, 10.47, 46.0,  11.2),
    (45.67, 11.2,  46.0,  11.6),
    (45.67, 11.6,  46.0,  11.8),
    (45.67, 11.8,  45.85, 12.0),
    (45.85, 11.8,  46.0,  12.0),
    (45.67, 12.0,  46.0,  12.48),
    (46.0,  10.47, 46.3,  11.2),
    (46.0,  11.2,  46.15, 12.0),
    (46.15, 11.2,  46.3,  12.0),
    (46.0,  12.0,  46.3,  12.48),
    (46.3,  10.47, 46.53, 10.85),
    (46.3,  10.85, 46.53, 11.2),
    (46.3,  11.2,  46.53, 12.0),
    (46.3,  12.0,  46.53, 12.48),
]

def fetch_chunk(bbox):
    south, west, north, east = bbox
    query = f"""
    [out:json][timeout:90];
    relation["route"="hiking"]({south},{west},{north},{east});
    out tags;
    """
    response = requests.get(
        BASE_URL,
        params={"data": query},
        headers={
            "Accept": "application/json",
            "User-Agent": "HikinTrento/1.0 (student project)"
        }
    )
    if response.status_code == 200:
        return response.json().get("elements", [])
    else:
        print(f"Error {response.status_code} for bbox {bbox}")
        return None

def fetch_chunk_with_retry(bbox, retries=3):
    south, west, north, east = bbox
    for attempt in range(retries):
        result = fetch_chunk(bbox)
        if result is not None:
            return result
        print(f"  Retrying with smaller area... attempt {attempt + 2}/{retries}")
        time.sleep(5)
        mid_lat = (south + north) / 2
        left = fetch_chunk((south, west, mid_lat, east))
        right = fetch_chunk((mid_lat, west, north, east))
        if left is not None and right is not None:
            return left + right
    return []

def seed():
    print("Fetching trails from OpenStreetMap...")
    all_trails = []
    seen_ids = set()

    for i, bbox in enumerate(BBOXES):
        print(f"Fetching chunk {i + 1}/{len(BBOXES)}...")
        elements = fetch_chunk_with_retry(bbox)

        for element in elements:
            if element["id"] not in seen_ids:
                seen_ids.add(element["id"])
                all_trails.append(element)

        print(f"  Got {len(elements)} trails, total unique: {len(all_trails)}")
        time.sleep(2)

    with open("trails.json", "w", encoding="utf-8") as f:
        json.dump(all_trails, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Fetched {len(all_trails)} unique trails")

if __name__ == "__main__":
    #seed()

    with open("trails.json") as f:
        trails = json.load(f)

    sat_trails = [t for t in trails if "Società degli Alpinisti Tridentini" in t.get("tags", {}).get("operator", "")]

    has_name = sum(1 for t in sat_trails if "name" in t.get("tags", {}))
    has_cai = sum(1 for t in sat_trails if "cai_scale" in t.get("tags", {}))
    has_distance = sum(1 for t in sat_trails if "distance" in t.get("tags", {}))
    has_from_to = sum(1 for t in sat_trails if "from" in t.get("tags", {}) and "to" in t.get("tags", {}))

    print(f"SAT trails: {len(sat_trails)}")
    print(f"Has name: {has_name}/{len(sat_trails)}")
    print(f"Has cai_scale: {has_cai}/{len(sat_trails)}")
    print(f"Has distance: {has_distance}/{len(sat_trails)}")
    print(f"Has from/to: {has_from_to}/{len(sat_trails)}")