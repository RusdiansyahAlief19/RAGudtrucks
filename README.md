# Astra UD Trucks - Fleet Intelligence Platform

Fleet Intelligence Platform adalah asisten kecerdasan buatan (AI Assistant) tingkat *Enterprise* berbasis **Retrieval-Augmented Generation (RAG)** yang dikembangkan khusus untuk Astra UD Trucks. Sistem ini dirancang untuk memberikan informasi teknis, operasional, dan rekomendasi truk (seperti Quester dan Kuzer) kepada *fleet manager*, pengemudi, mekanik, maupun calon pembeli secara akurat, cepat, dan **bebas halusinasi**.

## 🌟 Fitur Utama

1. **Hybrid Search RAG Engine**: Menggunakan kombinasi **Vector Search (FAISS)** berbasis Semantic dan **Keyword Search (BM25)** yang digabungkan menggunakan *Reciprocal Rank Fusion* (RRF) untuk hasil pencarian dokumen internal Astra UD Trucks yang paling akurat.
2. **Anti-Halusinasi Terjamin**: Didukung oleh LLM canggih Google **Gemini 2.5 Flash**, AI dikunci (di-*grounding*) hanya untuk menjawab dari dataset yang disediakan.
3. **Conversational TCO**: Jika ditanya seputar "harga" atau "rekomendasi truk", AI secara otomatis menyertakan kisaran harga investasi dasar.
4. **Interactive TCO Calculator**: Dilengkapi antarmuka kalkulator interaktif visual untuk menghitung *Total Cost of Ownership* (Estimasi BBM, Servis & Ban per tahun) secara *real-time*.
5. **Premium UI/UX**: Tampilan *frontend* berbasis *Vanilla Web* dan *React.js* dengan estetika mewah (*Dark Mode*, *Glassmorphism*, dan animasi yang mulus).

## 📊 Predictive Maintenance Dashboard (FleetSight)
Selain fitur *Virtual Mechanic* berbasis RAG, platform ini juga dilengkapi dengan *Dashboard FleetSight* untuk memantau kesehatan armada secara prediktif:
- **Weakest-Link Status**: Penentuan status truk secara keseluruhan (Aman/Perhatian/Kritis) ditentukan oleh komponen terlemah (Rem, Ban, atau Aki).
- **Threshold Persentil Dinamis**: Batas status tidak di-*hardcode* secara statis, melainkan dikalkulasi secara dinamis pada saat *startup* berdasarkan distribusi data menggunakan *Percentile* (15% terbawah = Kritis, 15-50% = Perhatian). Hal ini menjamin ketahanan terhadap anomali skala data.
- **Toggle Snapshot Simulasi**: Mendemonstrasikan secara interaktif progresi keausan (*wear-and-tear*) armada tanpa *preventive maintenance* pada titik waktu spesifik (Hari ke-90, 180, dan 365).
- **API Endpoint**: Data prediktif diolah di backend melalui *endpoint* `/api/dashboard/data?day=X` yang mendukung kalkulasi jarak kumulatif dan *rolling features* secara dinamis.

## 🚀 Teknologi yang Digunakan
- **Backend:** Python, FastAPI, Uvicorn, Pandas
- **Machine Learning (Predictive):** Scikit-Learn (Linear Regression + Polynomial Features), Pickle (`model_rem.pkl`, `model_ban.pkl`, `model_aki.pkl`)
- **AI / LLM:** Google Gemini 2.5 Flash (`google-genai`), HuggingFace Embeddings (`all-MiniLM-L6-v2`)
- **Vector Store & Indexing:** FAISS-CPU, rank_bm25, LangChain
- **Frontend:** HTML5, CSS3, React.js (via Babel/CDN)

## 📦 Struktur Proyek
```text
/
├── backend/
│   ├── main.py        # Server FastAPI (Endpoint RAG & Predictive Dashboard)
│   ├── models/        # Model ML tersimpan (model_rem.pkl, model_ban.pkl, model_aki.pkl)
│   ├── ingest.py      # Skrip untuk membaca dataset JSON dan mem-build Vector DB & BM25
│   └── rag_engine.py  # Logika utama Hybrid Search dan pemanggilan Gemini API
├── UD TRUCKS/
│   ├── UD FleetSight.html  # Main entry point UI React app
│   └── app/screens/        # React components (Dashboard.js, Predictive.js, dsb.)
├── data_dummy_fleetsight_FINAL.csv # Dataset simulasi telematika armada
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
