import json
import requests
import time

BASE_URL = "https://overpass.private.coffee/api/interpreter"
#BASE_URL = "https://overpass.openstreetmap.ru/api/interpreter"
#BASE_URL = "https://overpass-api.de/api/interpreter"

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
    out geom;
    """
    #out tags;
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

def fetchTrails():
    print("Fetching trails from OpenStreetMap...")
    all_trails = []
    seen_ids = set()

    for i, bbox in enumerate(BBOXES):
        print(f"Fetching chunk {i + 1}/{len(BBOXES)}...")
        elements = fetch_chunk_with_retry(bbox)

        for element in elements:
            if element["id"] not in seen_ids and "Società degli Alpinisti Tridentini" in element.get("tags", {}).get("operator", ""):
                seen_ids.add(element["id"])
                all_trails.append(element)

        print(f"  Got {len(elements)} trails, total unique: {len(all_trails)}")
        time.sleep(2)

    with open("trails.json", "w", encoding="utf-8") as f:
        json.dump(all_trails, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Fetched {len(all_trails)} unique trails")


def cleanTrailsData():
    data = []
    with open("trails.json", "r") as f:
        trails = json.load(f)

    for trail in trails:
        tags = trail.get("tags", {})

        from_place = tags.get("from")
        to_place = tags.get("to")
        name = tags.get("name") or (f"{from_place} → {to_place}" if from_place and to_place else None)

        tmp = {
            "osm_id": trail.get("id"),
            "name": name,
            "ref": tags.get("ref"),
            "reg_ref": tags.get("reg_ref"),
            "difficulty": tags.get("cai_scale"),
            "distance_km": float(tags["distance"]) if tags.get("distance") else None,
            "ascent_m": round(float(tags["ascent"])) if tags.get("ascent") else None,
            "descent_m": round(float(tags["descent"])) if tags.get("descent") else None,
            "duration_forward": tags.get("duration:forward"),
            "duration_backward": tags.get("duration:backward"),
            "from": from_place,
            "to": to_place,
            "roundtrip": tags.get("roundtrip") == "yes",
            "operator": tags.get("operator"),
            "website": tags.get("website"),
            "bounds": trail.get("bounds"),
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [point["lon"], point["lat"]]
                    for member in trail.get("members", [])
                    if member.get("type") == "way"
                    for point in member.get("geometry", [])
                ]
            }
        }

        data.append(tmp)

    with open("trails_mapped.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return data

def fetchPI():
    print("Fetching bivouacs from OpenStreetMap...")
    all_bivouacs = []
    seen_ids = set()

    for i, bbox in enumerate(BBOXES):
        print(f"Fetching chunk {i + 1}/{len(BBOXES)}...")
        elements = fetch_PI_chunk_with_retry(bbox)

        for element in elements:
            if element["id"] not in seen_ids:
                seen_ids.add(element["id"])
                all_bivouacs.append(element)

        print(f"  Got {len(elements)} bivouacs, total unique: {len(all_bivouacs)}")
        time.sleep(2)

    with open("PI.json", "w", encoding="utf-8") as f:
        json.dump(all_bivouacs, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Fetched {len(all_bivouacs)} unique bivouacs")

def fetch_PI_chunk(bbox):
    south, west, north, east = bbox
    query = f"""
    [out:json][timeout:90];
    (
        node["amenity"="shelter"]({south},{west},{north},{east});
    );
    out body;
    """

    '''
    query = f"""
    [out:json][timeout:90];
    (
        node["tourism"="alpine_hut"]({south},{west},{north},{east});
        node["tourism"="wilderness_hut"]({south},{west},{north},{east});
    );
    out body;
    """
    '''

    response = requests.get(
        BASE_URL,
        params={"data": query},
        headers={
            "Accept": "application/json",
            "User-Agent": "HikinTrento/1.0 (student project)"
        },
        timeout=120
    )
    if response.status_code == 200:
        return response.json().get("elements", [])
    else:
        print(f"  Error {response.status_code} for bbox {bbox}")
        return None

def fetch_PI_chunk_with_retry(bbox, retries=3):
    south, west, north, east = bbox
    for attempt in range(retries):
        result = fetch_PI_chunk(bbox)
        if result is not None:
            return result
        wait = 10 * (attempt + 1)
        print(f"  Retrying with smaller area... attempt {attempt + 2}/{retries}, waiting {wait}s...")
        time.sleep(wait)
        mid_lat = (south + north) / 2
        left = fetch_PI_chunk((south, west, mid_lat, east))
        right = fetch_PI_chunk((mid_lat, west, north, east))
        if left is not None and right is not None:
            return left + right
    print(f"  All retries failed for bbox {bbox}")
    return []

def cleanPIData():
    with open("PI.json", "r") as f:
        pois = json.load(f)

    data = []
    for p in pois:
        tags = p.get("tags", {})
        tmp = {
            "osm_id": p.get("id"),
            "name": tags.get("name"),
            "coordinates": {
                "latitude": p.get("lat"),
                "longitude": p.get("lon"),
            },
            "shelter_type": tags.get("shelter_type")
        }
        if tags.get("name"):
            data.append(tmp)

    with open("PI_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Cleaned {len(data)} POIs")
    return data

if __name__ == "__main__":
    #fetchTrails()
    #cleanTrailsData()
    #fetchPI()
    cleanPIData()
