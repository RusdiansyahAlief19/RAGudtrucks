"""
migrate_dataset.py
Migrasi astra_ud_trucks_rag_dataset.json (128 chunk, skema lama)
ke 2 file sesuai Skema Standar Dataset RAG UD FleetSight:
  - quester.json  (chunk dari ManualsLib Quester manual / error code list)
  - general.json  (chunk dari astraudtrucks.co.id, applies_to: all)

Jalankan:
    python3 migrate_dataset.py
Output ditulis ke folder ./output/
"""

import json
import re
import os
from chapter_map import page_to_chapter, SOURCE_DOC_QUESTER

INPUT_FILE = "astra_ud_trucks_rag_dataset.json"
OUTPUT_DIR = "output"
PROCESSED_DATE = "2026-06-13"

# ---------------------------------------------------------------------------
# 1. Mapping kategori lama -> kategori induk baru (sesuai §4 skema standar)
# ---------------------------------------------------------------------------
CATEGORY_MAP = {
    "company_profile": "company",
    "news_and_updates": "company",

    "product_specs": "product",
    "vehicle_identification": "product",
    "truck_knowledge": "product",

    "service_24h": "service",
    "service_agreement": "service",
    "service_driver_training": "service",
    "service_genuine": "service",
    "service_mobile_workshop": "service",
    "service_telematics": "service",
    "service_warranty": "service",

    "cab_operation": "operation",
    "cruise_control": "operation",
    "differential_lock": "operation",
    "pto_operation": "operation",
    "fifth_wheel": "operation",
    "operational_knowledge": "operation",
    "instrument_cluster": "operation",
    "electrical_system": "operation",

    "tyre_maintenance": "maintenance",
    "battery_maintenance": "maintenance",
    "vehicle_storage": "maintenance",
    "maintenance_schedule": "maintenance",
    "daily_inspection": "maintenance",

    "emergency_procedures": "emergency",
    "towing_procedure": "emergency",

    "fault_codes": "diagnostics",

    "driving_operation": "driving",
    "driving_special_conditions": "driving",
    "loading_operation": "driving",

    "service_data": "service_data",
}

# ---------------------------------------------------------------------------
# 2. Helper: tentukan series, source_type, source_doc, page, chapter
# ---------------------------------------------------------------------------

FAULT_CODE_RE = re.compile(r"\b([PU][0-9A-F]{4})\b")


def derive_fields(chunk):
    url = chunk.get("source_url", "") or ""
    text = chunk.get("text", "") or ""
    old_category = chunk["category"]

    series = "general"
    applies_to = "all"
    source_type = "website"
    source_doc = None
    chapter = None
    page = None
    fault_code = None

    if url.startswith("https://www.manualslib.com/manual/1525764"):
        # Quester manual page-linked chunk
        series = "quester"
        applies_to = "quester_series"
        source_type = "owner_manual"
        source_doc = SOURCE_DOC_QUESTER
        m = re.search(r"[?&]page=(\d+)", url)
        if m:
            page = int(m.group(1))
            chapter = page_to_chapter(page)

    elif url == "ManualsLib - Quester Series":
        # Quester-related, but no specific page in source_url -> not a
        # direct page citation. Mark as synthesized per §8 (honesty note).
        series = "quester"
        applies_to = "quester_series"
        source_type = "synthesized"
        source_doc = SOURCE_DOC_QUESTER
        page = None
        chapter = None

    elif url == "UD-HDE Quester Error Code List":
        series = "quester"
        applies_to = "quester_series"
        source_type = "error_code_list"
        source_doc = "UD-HDE Quester Error Code List"
        page = None
        chapter = None

    elif url.startswith("https://astraudtrucks.co.id"):
        series = "general"
        applies_to = "all"
        source_type = "website"
        source_doc = "astraudtrucks.co.id"
        page = None
        chapter = None

    else:
        # Fallback: unknown source pattern
        series = "general"
        applies_to = "all"
        source_type = "website"
        source_doc = chunk.get("source_doc") or url or None

    # fault_code: only relevant for diagnostics-category chunks
    new_category = CATEGORY_MAP.get(old_category, None)
    if new_category == "diagnostics":
        m = FAULT_CODE_RE.search(text)
        if m:
            fault_code = m.group(1)

    return {
        "series": series,
        "applies_to": applies_to,
        "category": new_category,
        "source_type": source_type,
        "source_doc": source_doc,
        "chapter": chapter,
        "page": page,
        "fault_code": fault_code,
    }


# ---------------------------------------------------------------------------
# 3. chunk_id regeneration
# ---------------------------------------------------------------------------

CATEGORY_TO_TAG = {
    "company": "COMPANY",
    "product": "PRODUCT",
    "service": "SERVICE",
    "operation": "OPERATION",
    "maintenance": "MAINTENANCE",
    "emergency": "EMERGENCY",
    "diagnostics": "DIAGNOSTICS",
    "driving": "DRIVING",
    "service_data": "SERVICE_DATA",
}

SERIES_PREFIX = {
    "quester": "QST",
    "kuzer": "KZR",
    "croner": "CRN",
    "general": "GEN",
}


def build_chunk_id(series, source_type, category, counters):
    if source_type == "error_code_list":
        prefix = "ERR"
    else:
        prefix = SERIES_PREFIX.get(series, "GEN")

    tag = CATEGORY_TO_TAG.get(category, category.upper())
    key = (prefix, tag)
    counters[key] = counters.get(key, 0) + 1
    num = counters[key]
    return f"{prefix}_{tag}_{num:03d}"


# ---------------------------------------------------------------------------
# 4. Main migration
# ---------------------------------------------------------------------------

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        old_data = json.load(f)

    old_chunks = old_data["chunks"]

    quester_chunks = []
    general_chunks = []

    id_counters = {}
    unmapped_categories = set()

    for old in old_chunks:
        derived = derive_fields(old)

        if derived["category"] is None:
            unmapped_categories.add(old["category"])
            continue

        new_chunk_id = build_chunk_id(
            derived["series"], derived["source_type"], derived["category"], id_counters
        )

        new_chunk = {
            "chunk_id": new_chunk_id,
            "series": derived["series"],
            "applies_to": derived["applies_to"],
            "category": derived["category"],
            "sub_category": old["sub_category"],
            "source_type": derived["source_type"],
            "source_doc": derived["source_doc"],
            "chapter": derived["chapter"],
            "page": derived["page"],
            "fault_code": derived["fault_code"],
            "user_role": old["user_role"],
            "language": old.get("language", "id"),
            "keywords": old.get("keywords", []),
            "text": old["text"],
        }

        if derived["series"] == "quester":
            quester_chunks.append(new_chunk)
        else:
            general_chunks.append(new_chunk)

    if unmapped_categories:
        print("WARNING - kategori lama tanpa mapping (chunk dilewati):", unmapped_categories)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    quester_out = {
        "dataset_meta": {
            "name": "UD Trucks RAG KB — Quester Series",
            "series": "quester",
            "source_type": "owner_manual",
            "source_doc": SOURCE_DOC_QUESTER,
            "source_ref": "ManualsLib (manual 1525764) / astraudtrucks.co.id",
            "version": "1.0.0",
            "processed_date": PROCESSED_DATE,
            "language": "id",
            "total_chunks": len(quester_chunks),
            "schema_version": "1.0",
        },
        "chunks": quester_chunks,
    }

    general_out = {
        "dataset_meta": {
            "name": "UD Trucks RAG KB — General / Website",
            "series": "general",
            "source_type": "website",
            "source_doc": "astraudtrucks.co.id",
            "source_ref": "astraudtrucks.co.id",
            "version": "1.0.0",
            "processed_date": PROCESSED_DATE,
            "language": "id",
            "total_chunks": len(general_chunks),
            "schema_version": "1.0",
        },
        "chunks": general_chunks,
    }

    with open(os.path.join(OUTPUT_DIR, "quester.json"), "w", encoding="utf-8") as f:
        json.dump(quester_out, f, ensure_ascii=False, indent=2)

    with open(os.path.join(OUTPUT_DIR, "general.json"), "w", encoding="utf-8") as f:
        json.dump(general_out, f, ensure_ascii=False, indent=2)

    print(f"quester.json -> {len(quester_chunks)} chunks")
    print(f"general.json -> {len(general_chunks)} chunks")
    print(f"total -> {len(quester_chunks) + len(general_chunks)} (input: {len(old_chunks)})")


if __name__ == "__main__":
    main()
