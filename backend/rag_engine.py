import os
import pickle
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS

class RAGEngine:
    def __init__(self):
        print("Inisialisasi RAG Engine...")
        from langchain_community.embeddings import HuggingFaceEmbeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Load FAISS VectorStore
        # allow_dangerous_deserialization=True is required for loading local pickle files in newer langchain versions
        self.vectorstore = FAISS.load_local(
            "faiss_index", 
            self.embeddings, 
            allow_dangerous_deserialization=True
        )
        
        # Load BM25 Index
        with open("bm25_index.pkl", "rb") as f:
            data = pickle.load(f)
            self.bm25 = data["bm25"]
            self.documents = data["documents"]
            
        # Load LLM (Gemini)
        # Using a low temperature for more factual and less hallucinated responses
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, google_api_key=os.getenv("GEMINI_API_KEY"))
        print("RAG Engine siap!")

    def hybrid_search(self, query: str, top_k: int = 4):
        # 1. Vector Search
        vector_docs = self.vectorstore.similarity_search_with_score(query, k=top_k)
        
        # 2. BM25 Search
        tokenized_query = query.lower().split(" ")
        bm25_scores = self.bm25.get_scores(tokenized_query)
        top_n_indices = bm25_scores.argsort()[-top_k:][::-1]
        
        # 3. Combine with RRF (Reciprocal Rank Fusion)
        rrf_scores = {}
        
        # Rank Vector Docs
        # FAISS score is distance, so smaller is better (usually L2). It is already sorted by distance ascending.
        rank = 1
        for doc, score in vector_docs:
            doc_id = doc.metadata["chunk_id"]
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + (1 / (60 + rank))
            rank += 1
            
        # Rank BM25 Docs
        rank = 1
        for idx in top_n_indices:
            doc = self.documents[idx]
            doc_id = doc.metadata["chunk_id"]
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + (1 / (60 + rank))
            rank += 1
            
        # Sort Combined RRF Scores
        sorted_rrf = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        top_docs = []
        for doc_id, _ in sorted_rrf[:top_k]:
            # Find the actual document object
            doc = next((d for d in self.documents if d.metadata["chunk_id"] == doc_id), None)
            if doc:
                top_docs.append(doc)
                
        return top_docs

    def generate_answer(self, query: str) -> dict:
        # Retrieve relevant contexts using hybrid search
        top_docs = self.hybrid_search(query, top_k=4)
        context = "\n\n".join([f"Konteks {i+1}:\n{doc.page_content}" for i, doc in enumerate(top_docs)])
        
        # Build sources list
        sources = []
        for doc in top_docs:
            loc_str = doc.metadata.get("source_doc", "Internal Database")
            page = doc.metadata.get("page")
            if page:
                loc_str += f" (Hal. {page})"
            
            sources.append({
                "doc": doc.metadata.get("category", "UD Trucks Dataset"),
                "loc": loc_str
            })
        
        # Create prompt grounded in the retrieved contexts
        prompt = f"""Anda adalah AI Assistant Resmi Astra UD Trucks ('Fleet Intelligence Platform').
Anda harus menjawab pertanyaan pelanggan, fleet manager, atau pengemudi dengan bahasa Indonesia yang profesional, ramah, dan sangat akurat.

PERATURAN UTAMA:
1. Jawab HANYA berdasarkan informasi pada KONTEKS di bawah ini.
2. JIKA informasi tidak ada di KONTEKS, katakan "Maaf, informasi tersebut tidak tersedia dalam basis data resmi Astra UD Trucks kami." Jangan pernah mengarang jawaban atau berhalusinasi.
3. Berikan jawaban yang terstruktur, mudah dibaca (gunakan format list/bullet points jika perlu), dan langsung pada intinya.
4. Anda dapat menyesuaikan bahasa yang digunakan sesuai dengan persona yang bertanya (calon pembeli, fleet manager, mekanik, pengemudi), asalkan tetap sopan dan profesional.
5. JIKA pengguna bertanya tentang REKOMENDASI TRUK atau HARGA/BIAYA, Anda HARUS menyertakan estimasi kasar TCO (Total Cost of Ownership). Gunakan referensi harga berikut HANYA JIKA diminta: Quester Euro 5 (Harga unit mulai Rp 1,1 Miliar), Kuzer Euro 4 (Harga unit mulai Rp 600 Juta). Anda WAJIB mengakhiri rekomendasi tersebut dengan kalimat: *"Untuk perhitungan investasi yang lebih presisi, silakan gunakan fitur interaktif TCO Calculator yang tersedia di menu navigasi layar Anda."*
6. Saring dan terjemahkan teks teknis! JIKA di dalam KONTEKS terdapat parameter URL atau kode website (seperti `tab_type=Booking+Service`), JANGAN pernah menyalinnya mentah-mentah. Ubah menjadi bahasa natural seperti "melalui menu Booking Service di website kami".

KONTEKS REFERENSI:
{context}

PERTANYAAN PENGGUNA: {query}
JAWABAN AI:"""

        response = self.llm.invoke(prompt)
        return {
            "answer": response.content,
            "sources": sources
        }
