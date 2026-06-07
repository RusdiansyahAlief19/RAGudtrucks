# Astra UD Trucks - Fleet Intelligence Platform

Fleet Intelligence Platform adalah asisten kecerdasan buatan (AI Assistant) tingkat *Enterprise* berbasis **Retrieval-Augmented Generation (RAG)** yang dikembangkan khusus untuk Astra UD Trucks. Sistem ini dirancang untuk memberikan informasi teknis, operasional, dan rekomendasi truk (seperti Quester dan Kuzer) kepada *fleet manager*, pengemudi, mekanik, maupun calon pembeli secara akurat, cepat, dan **bebas halusinasi**.

## 🌟 Fitur Utama

1. **Hybrid Search RAG Engine**: Menggunakan kombinasi **Vector Search (FAISS)** berbasis Semantic dan **Keyword Search (BM25)** yang digabungkan menggunakan *Reciprocal Rank Fusion* (RRF) untuk hasil pencarian dokumen internal Astra UD Trucks yang paling akurat.
2. **Anti-Halusinasi Terjamin**: Didukung oleh LLM canggih Google **Gemini 2.5 Flash**, AI dikunci (di-*grounding*) hanya untuk menjawab dari dataset yang disediakan.
3. **Conversational TCO**: Jika ditanya seputar "harga" atau "rekomendasi truk", AI secara otomatis menyertakan kisaran harga investasi dasar.
4. **Interactive TCO Calculator**: Dilengkapi antarmuka kalkulator interaktif visual untuk menghitung *Total Cost of Ownership* (Estimasi BBM, Servis & Ban per tahun) secara *real-time*.
5. **Premium UI/UX**: Tampilan *frontend* berbasis *Vanilla Web* dengan estetika mewah (*Dark Mode*, *Glassmorphism*, dan animasi yang mulus).

## 🚀 Teknologi yang Digunakan
- **Backend:** Python, FastAPI, Uvicorn
- **AI / LLM:** Google Gemini 2.5 Flash (`google-genai`), HuggingFace Embeddings (`all-MiniLM-L6-v2`)
- **Vector Store & Indexing:** FAISS-CPU, rank_bm25, LangChain
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

## 📦 Struktur Proyek
```text
/
├── backend/
│   ├── main.py        # Server FastAPI dan endpoint REST API
│   ├── ingest.py      # Skrip untuk membaca dataset JSON dan mem-build Vector DB & BM25
│   └── rag_engine.py  # Logika utama Hybrid Search dan pemanggilan Gemini API
├── frontend/
│   ├── index.html     # Layout UI Chatbot & TCO Modal
│   ├── style.css      # Styling premium (Glassmorphism)
│   └── script.js      # Logika asinkron chat & kalkulasi matematika TCO
├── astra_ud_trucks_rag_dataset.json # Knowledge Base mentah
├── requirements.txt   # Dependensi Python
├── .env.example       # Contoh environment variable untuk API Keys
└── README.md
```

## 🛠️ Cara Instalasi dan Menjalankan (Local)

### 1. Persiapan Environment
Pastikan Anda sudah menginstal **Python 3.10+**. Buka terminal di folder proyek ini dan jalankan:
```bash
# Buat Virtual Environment
python -m venv venv

# Aktifkan Virtual Environment (Windows)
.\venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt
```

### 2. Setup API Key
1. Ubah nama file `.env.example` menjadi `.env`.
2. Dapatkan API Key dari [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Masukkan API Key Anda ke dalam file `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

### 3. Build AI Index (Data Ingestion)
Sebelum menjalankan AI, Anda harus mengubah dataset JSON menjadi *Vector Database* lokal:
```bash
cd backend
python ingest.py
```
*(Proses ini membutuhkan waktu beberapa detik. Jika berhasil, folder `faiss_index` dan file `bm25_index.pkl` akan muncul di dalam folder `backend`)*.

### 4. Menjalankan Server Backend
Masih di dalam folder `backend`, jalankan server FastAPI:
```bash
uvicorn main:app --reload
```
Server akan berjalan di `http://127.0.0.1:8000`.

### 5. Mengakses Antarmuka (Frontend)
1. Buka folder `frontend`.
2. Buka (klik ganda) file `index.html` di browser Anda.
3. Chatbot siap digunakan! Jangan lupa mencoba fitur **TCO Calc** di sudut kanan atas layar.

---
*Proyek ini dikembangkan dalam rangka presentasi inovasi AI (Pre-sales & Post-sales Assistant).*
