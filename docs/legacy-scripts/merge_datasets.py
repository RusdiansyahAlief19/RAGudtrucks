import json
import os

file_main = 'astra_ud_trucks_rag_dataset.json'
file_ext = 'astra_ud_trucks_dataset_extension_v3_1.json'

# Load the datasets
with open(file_main, 'r', encoding='utf-8') as f:
    data_main = json.load(f)

with open(file_ext, 'r', encoding='utf-8') as f:
    data_ext = json.load(f)

# Extract chunks from extension
chunks_ext = data_ext.get('chunks', [])

# Append chunks to main dataset
data_main['chunks'].extend(chunks_ext)

# Update metadata
data_main['dataset_meta']['version'] = '3.1.0'
data_main['dataset_meta']['total_chunks'] = len(data_main['chunks'])
if 'sources' in data_main['dataset_meta'] and 'source' in data_ext['dataset_meta']:
    # Avoid duplicate source strings if possible, or simply append
    if data_ext['dataset_meta']['source'] not in data_main['dataset_meta']['sources']:
        data_main['dataset_meta']['sources'].append(data_ext['dataset_meta']['source'])

# Combine categories list if needed
if 'new_categories_added' in data_ext.get('dataset_meta', {}):
    for cat in data_ext['dataset_meta']['new_categories_added']:
        if cat not in data_main['dataset_meta'].get('categories', []):
            data_main['dataset_meta']['categories'].append(cat)

# Save the updated main dataset
with open(file_main, 'w', encoding='utf-8') as f:
    json.dump(data_main, f, indent=2, ensure_ascii=False)

print(f"Successfully merged! Total chunks now: {len(data_main['chunks'])}")
