import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. Load Data
def load_data():
    with open('files (1)/quester.json', 'r', encoding='utf-8') as f:
        quester = json.load(f)
    with open('files (1)/general.json', 'r', encoding='utf-8') as f:
        general = json.load(f)
    return quester['chunks'] + general['chunks']

chunks = load_data()
print(f"Total chunks loaded: {len(chunks)}")

# 2. Extract texts and metadata
texts = [c['text'] for c in chunks]
metadata = []
for c in chunks:
    metadata.append({
        'chunk_id': c.get('chunk_id'),
        'category': c.get('category'),
        'source_doc': c.get('source_doc'),
        'chapter': c.get('chapter'),
        'page': c.get('page'),
        'fault_code': c.get('fault_code'),
        'applies_to': c.get('applies_to')
    })

# 3. Generate Embeddings using all-MiniLM-L6-v2
print("Loading model and generating embeddings...")
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(texts, show_progress_bar=True)

# 4. Normalize embeddings for Cosine Similarity (IndexFlatIP)
embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

# 5. Build FAISS Index
dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)
print(f"FAISS index built with {index.ntotal} vectors.")

# 6. Test with 3 Queries
test_queries = [
    "Bagaimana cara mengatasi engine overheat atau mesin kepanasan?",
    "Apa spesifikasi dari truk Quester GWE 410 ESCOT?",
    "Muncul kode error P20EE tenaga mesin dibatasi, apa solusinya?"
]

print("\n" + "="*50)
print("HASIL RETRIEVAL TEST")
print("="*50)

for i, query in enumerate(test_queries, 1):
    print(f"\n[QUERY {i}]: {query}")
    
    # Encode & normalize query
    q_emb = model.encode([query])
    q_emb = q_emb / np.linalg.norm(q_emb, axis=1, keepdims=True)
    
    # Search
    k = 3
    distances, indices = index.search(q_emb, k)
    
    for rank in range(k):
        idx = indices[0][rank]
        score = distances[0][rank]
        meta = metadata[idx]
        text_snippet = texts[idx][:150].replace('\n', ' ') + "..."
        
        # Format doc reference
        doc_ref = str(meta['source_doc'])
        if meta['chapter']:
            doc_ref += f", Chapter: {meta['chapter']}"
        if meta['page']:
            doc_ref += f", Page: {meta['page']}"
            
        print(f"  Rank {rank+1} (Score: {score:.4f}) | ID: {meta['chunk_id']} | Cat: {meta['category']}")
        print(f"  Source: {doc_ref}")
        print(f"  Snippet: {text_snippet}\n")
