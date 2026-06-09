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

### 1. Instalasi Awal (Hanya dilakukan sekali)
Pastikan Anda sudah menginstal **Python 3.10+**. Buka terminal di folder proyek ini (Gunakan PowerShell di VS Code) dan jalankan:
```powershell
# Buat Virtual Environment
python -m venv venv

# Aktifkan Virtual Environment
.\venv\Scripts\Activate.ps1

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

### 4. Menjalankan Server Backend (Terminal 1)
Buka terminal baru di VS Code, lalu jalankan perintah berikut secara berurutan untuk menyalakan "Otak AI" Anda:
```powershell
cd backend
..\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```
*(Biarkan terminal ini tetap menyala. Server AI akan berjalan di `http://127.0.0.1:8000`)*.

### 5. Mengakses Antarmuka (Frontend)
Karena UI terbaru (*Virtual Mechanic*) menggunakan React.js dan Babel secara dinamis, file HTML harus dijalankan melalui *local server* (tidak bisa sekadar klik ganda/`file:///`):
1. Buka folder proyek ini di **Visual Studio Code**.
2. Cari dan klik kanan pada file `UD TRUCKS/UD FleetSight.html`.
3. Pilih **"Open with Live Server"** (Pastikan Anda sudah menginstal ekstensi Live Server di VS Code).
4. Browser akan otomatis terbuka dan Anda bisa langsung mencoba fitur *Virtual Mechanic* di menu sebelah kiri.

---
*Proyek ini dikembangkan dalam rangka presentasi inovasi AI (Pre-sales & Post-sales Assistant).*
