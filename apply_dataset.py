import json
import os

f1 = 'files (1)/quester.json'
f2 = 'files (1)/general.json'
out = 'astra_ud_trucks_rag_dataset.json'

with open(f1, 'r', encoding='utf-8') as f:
    d1 = json.load(f)

with open(f2, 'r', encoding='utf-8') as f:
    d2 = json.load(f)

merged = {
    "dataset_meta": {
        "name": "UD Trucks RAG KB — Full Merged Dataset",
        "series": "all",
        "source_type": "mixed",
        "source_doc": "ManualsLib / astraudtrucks.co.id",
        "source_ref": "Multiple Sources",
        "version": "1.0.0",
        "processed_date": "2026-06-13",
        "language": "id",
        "total_chunks": len(d1['chunks']) + len(d2['chunks']),
        "schema_version": "1.0"
    },
    "chunks": d1['chunks'] + d2['chunks']
}

with open(out, 'w', encoding='utf-8') as f:
    json.dump(merged, f, indent=2, ensure_ascii=False)

print(f"Successfully created {out} with {len(merged['chunks'])} chunks following the new schema.")
