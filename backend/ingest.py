import json
import os
import pickle
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from rank_bm25 import BM25Okapi

load_dotenv()

def ingest_data():
    dataset_path = "../astra_ud_trucks_rag_dataset.json"
    print(f"Membaca dataset dari {dataset_path}...")
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    documents = []
    
    print("Mempersiapkan data chunk...")
    for chunk in data["chunks"]:
        # Build text representation combining metadata and text
        text = f"[{chunk.get('category', '')} - {chunk.get('sub_category', '')}]\n{chunk.get('text', '')}\nKeywords: {', '.join(chunk.get('keywords', []))}"
        
        meta = {
            "chunk_id": chunk.get("chunk_id"),
            "category": chunk.get("category"),
            "series": chunk.get("series"),
            "applies_to": chunk.get("applies_to"),
            "source_type": chunk.get("source_type"),
            "source_doc": chunk.get("source_doc"),
            "chapter": chunk.get("chapter"),
            "page": chunk.get("page"),
            "fault_code": chunk.get("fault_code")
        }
        
        doc = Document(page_content=text, metadata=meta)
        documents.append(doc)
    
    # 1. FAISS Vector Database
    print("Membuat Vector Database dengan Gemini Embeddings...")
    from langchain_community.embeddings import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(documents, embeddings)
    vectorstore.save_local("faiss_index")
    print("Vector Database berhasil disimpan ke folder 'faiss_index'!")

    # 2. BM25 Index
    print("Membuat BM25 Index...")
    tokenized_corpus = [doc.page_content.lower().split(" ") for doc in documents]
    bm25 = BM25Okapi(tokenized_corpus)
    
    with open("bm25_index.pkl", "wb") as f:
        pickle.dump({"bm25": bm25, "documents": documents}, f)
    print("BM25 Index berhasil disimpan ke 'bm25_index.pkl'!")

if __name__ == "__main__":
    if not os.getenv("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY belum diset di sistem environment / .env")
        exit(1)
    ingest_data()
