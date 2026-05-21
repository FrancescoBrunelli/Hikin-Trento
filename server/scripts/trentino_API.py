import json
import requests
import os
import time
import sys

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)




# ── OpenDataHub API config ────────────────────────────────────────────
BASE_URL = "https://rifugi.cai.it/api/v1/shelters"
PAGE_SIZE = 20  # max items per request

def fetch_page(page_number):
    """
    Fetches a single page of accommodations from OpenDataHub.

    @param page_number: the page number to fetch (starts at 1)
    @returns: the JSON response from the API or None if the request fails
    """
    params = {
        "page":   page_number,
        "per_page":     PAGE_SIZE
    }
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page {page_number}: {e}")
        return None

def seed():
    """
    Main seed function. Fetches all accommodations from OpenDataHub
    and inserts them into MongoDB Atlas, skipping duplicates.
    """
    eprint("Starting seed from OpenDataHub...")
    all_raw = []  # ← add this at the top of the function
    # fetch first page to get total count
    first_page = fetch_page(1)
    if not first_page:
        eprint("Failed to fetch first page. Aborting.")
        return

    total_items = first_page.get("total", 0)
    total_pages = int(total_items / PAGE_SIZE) + 1
    eprint(f"Found {total_items} accommodations across {total_pages} pages")

    inserted = 0
    skipped  = 0

    # process all pages
    for page in range(1, total_pages + 1):
        eprint(f"Processing page {page}/{total_pages}...")

        data = fetch_page(page) if page > 1 else first_page
        if not data:
            continue

        items = data.get("data", [])
        all_raw.extend(items)  # ← collect raw items
        for item in items:
            #mapped = map_accommodation(item)
#
            ## skip if coordinates are missing
            #if not mapped["coordinates"]:
            #    skipped += 1
            #    continue

            # skip if already in DB (uses odh_id to detect duplicates)
            #existing = collection.find_one({"odh_id": mapped["odh_id"]})
            #if existing:
            #    skipped += 1
            #    continue

            #collection.insert_one(mapped)
            inserted += 1

        # be polite to the API — wait between pages
        time.sleep(0.5)
    with open("accommodations_raw_cai.json", "w", encoding="utf-8") as f:
        json.dump(all_raw, f, ensure_ascii=False, indent=2)
    eprint(f"\nDone! Inserted: {inserted} | Skipped: {skipped}")

if __name__ == "__main__":
    seed()



