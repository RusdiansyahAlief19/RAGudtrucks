from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from rag_engine import RAGEngine
import uvicorn
import pickle
import numpy as np
import pandas as pd
import math

# Normalization constants
RANGES = {
    'jarak_km': (0, 600),
    'suhu_mesin': (60, 120),
    'idle_minutes': (0, 120),
    'muatan_ton': (0, 35),
    'overspeed': (0, 30),
    'hard_brake': (0, 40),
    'cumulative_km': (0, 100000),
}

def norm(val, feature_name):
    min_v, max_v = RANGES.get(feature_name, (0, 100))
    if val < min_v: val = min_v
    if val > max_v: val = max_v
    return (val - min_v) / (max_v - min_v)

load_dotenv()

app = FastAPI(title="Astra UD Trucks Fleet Intelligence Platform API")

# Configure CORS so the frontend can interact with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str

class AkiRequest(BaseModel):
    jarak_km: float
    suhu_mesin: float
    idle_minutes: float
    suhu_mesin_r7: float
    cumulative_km: float

class BanRequest(BaseModel):
    jarak_km: float
    muatan_ton: float
    overspeed: float
    jarak_km_r7: float
    cumulative_km: float

class RemRequest(BaseModel):
    hard_brake: float
    jarak_km: float
    overspeed: float
    hard_brake_r7: float
    cumulative_km: float
    hard_brake_std: float

# Threshold berbasis persentil dataset dummy (BUKAN spesifikasi pabrikan
# resmi), dihitung otomatis saat startup dari data_dummy_fleetsight_FINAL.csv.
#
# Alasan: dataset ini adalah simulasi untuk keperluan prototyping Gate 1,
# bukan data sensor riil. Beberapa kolom punya rentang yang tidak
# merepresentasikan siklus penuh komponen di dunia nyata, contoh:
# - tebal_rem_mm: rentang 0-9.98mm (tidak pernah mencapai ~15-20mm
#   layaknya kampas rem baru), sehingga threshold mm absolut tidak valid.
# - kondisi_aki_pct: rentang 91.3-99.8% (tidak pernah ada skenario aki
#   gagal/rusak di bawah 91%), sehingga threshold absolut 70% tidak
#   pernah akan terpicu.
#
# Solusi: threshold dihitung relatif terhadap distribusi populasi data
# itu sendiri (persentil-15 = Kritis, persentil-50 = Perhatian/Aman),
# supaya sistem tetap adaptif terhadap skala data apa pun yang masuk.
#
# CATATAN UNTUK PRODUKSI: saat onboarding data sensor riil dari truk
# sungguhan, threshold ini WAJIB dikalibrasi ulang berdasarkan spesifikasi
# resmi pabrikan per komponen (bukan lagi persentil dummy).
THRESHOLDS = {}
DRIVER_STATS = {}
DRIVER_Z_LIMITS = {}

def skor_metrik_baru(z):
    z_min = DRIVER_Z_LIMITS.get('min', -1.66)
    z_max = DRIVER_Z_LIMITS.get('max', 2.12)
    # ALASAN DESAIN RENTANG TARGET [20, 98]:
    # 98 (Max): Menyisakan ruang untuk selalu membaik. Tidak ada manusia yang 100% sempurna tanpa kesalahan kecil.
    # 20 (Min): Mencegah demotivasi ekstrem. Skor 0 terkesan fiktif/tidak bekerja sama sekali, 
    #           sedangkan 20 menandakan kinerja sangat buruk namun masih dalam batas operasional manusia.
    if z_max == z_min: return 50
    skor = 98 - ((z - z_min) / (z_max - z_min)) * (98 - 20)
    return max(0, min(100, round(skor)))

# Initialize RAG Engine globally
engine = None
model_aki = None
model_ban = None
model_rem = None

@app.on_event("startup")
def startup_event():
    global engine, model_aki, model_ban, model_rem, THRESHOLDS
    
    try:
        df = pd.read_csv('../data_dummy_fleetsight_FINAL.csv')
        THRESHOLDS['rem_p15'] = df['tebal_rem_mm'].quantile(0.15)
        THRESHOLDS['rem_p50'] = df['tebal_rem_mm'].quantile(0.50)
        THRESHOLDS['ban_p15'] = df['kondisi_ban_pct'].quantile(0.15)
        THRESHOLDS['ban_p50'] = df['kondisi_ban_pct'].quantile(0.50)
        THRESHOLDS['aki_p15'] = df['kondisi_aki_pct'].quantile(0.15)
        THRESHOLDS['aki_p50'] = df['kondisi_aki_pct'].quantile(0.50)
        print("INFO: Threshold persentil berhasil dikalkulasi dari dataset.")
        print(f"      REM: Kritis < {THRESHOLDS['rem_p15']:.2f}, Perhatian < {THRESHOLDS['rem_p50']:.2f}")
        print(f"      BAN: Kritis < {THRESHOLDS['ban_p15']:.2f}, Perhatian < {THRESHOLDS['ban_p50']:.2f}")
        print(f"      AKI: Kritis < {THRESHOLDS['aki_p15']:.2f}, Perhatian < {THRESHOLDS['aki_p50']:.2f}")
        
        driver_stats = df.groupby('sopir').agg({
            'hard_brake': 'mean',
            'overspeed': 'mean',
            'idle_minutes': 'mean'
        })
        DRIVER_STATS['hard_brake'] = (driver_stats['hard_brake'].mean(), driver_stats['hard_brake'].std())
        DRIVER_STATS['overspeed'] = (driver_stats['overspeed'].mean(), driver_stats['overspeed'].std())
        DRIVER_STATS['idle_minutes'] = (driver_stats['idle_minutes'].mean(), driver_stats['idle_minutes'].std())
        
        # Calculate z_min and z_max
        zs_list = []
        for idx, row in driver_stats.iterrows():
            zs = []
            for col in ['hard_brake', 'overspeed', 'idle_minutes']:
                mean, std = DRIVER_STATS[col]
                z = (row[col] - mean) / std if std > 0 else 0
                zs.append(z)
            zs_list.append(np.mean(zs))
        
        DRIVER_Z_LIMITS['min'] = min(zs_list)
        DRIVER_Z_LIMITS['max'] = max(zs_list)
        print(f"INFO: Z-score limits untuk driver berhasil dikalkulasi. Min={DRIVER_Z_LIMITS['min']:.2f}, Max={DRIVER_Z_LIMITS['max']:.2f}")

    except Exception as e:
        print(f"WARNING: Gagal memuat data_dummy untuk threshold. Error: {e}")

    try:
        engine = RAGEngine()
    except Exception as e:
        print(f"WARNING: Gagal memuat RAG Engine saat startup. Apakah dataset sudah di-ingest? Error: {e}")
        
    try:
        model_aki = pickle.load(open("models/model_aki.pkl", "rb"))
        model_ban = pickle.load(open("models/model_ban.pkl", "rb"))
        model_rem = pickle.load(open("models/model_rem.pkl", "rb"))
        print("INFO: Model Prediksi Telematis berhasil dimuat.")
    except Exception as e:
        print(f"WARNING: Gagal memuat model prediksi telematis. Error: {e}")

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    if engine is None:
        return {"error": "Sistem RAG Engine belum siap atau indeks belum di-generate."}
        
    try:
        result = engine.generate_answer(request.query)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict/aki")
def predict_aki(request: AkiRequest):
    if model_aki is None: return {"error": "Model aki tidak tersedia"}
    try:
        X = np.array([[request.jarak_km, request.suhu_mesin, request.idle_minutes, request.suhu_mesin_r7, request.cumulative_km]])
        pred = model_aki["model"].predict(model_aki["poly"].transform(X))[0]
        return {"prediction": max(0.0, min(100.0, float(pred)))}
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict/ban")
def predict_ban(request: BanRequest):
    if model_ban is None: return {"error": "Model ban tidak tersedia"}
    try:
        X = np.array([[request.jarak_km, request.muatan_ton, request.overspeed, request.jarak_km_r7, request.cumulative_km]])
        pred = model_ban["model"].predict(model_ban["poly"].transform(X))[0]
        return {"prediction": max(0.0, min(100.0, float(pred)))}
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict/rem")
def predict_rem(request: RemRequest):
    if model_rem is None: return {"error": "Model rem tidak tersedia"}
    try:
        X = np.array([[request.hard_brake, request.jarak_km, request.overspeed, request.hard_brake_r7, request.cumulative_km, request.hard_brake_std]])
        pred = model_rem["model"].predict(model_rem["poly"].transform(X))[0]
        return {"prediction": max(0.0, float(pred))}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/dashboard/drivers")
def get_dashboard_drivers():
    try:
        df = pd.read_csv('../data_dummy_fleetsight_FINAL.csv')
    except Exception as e:
        return {"error": f"Failed to read CSV: {str(e)}"}
        
    # Agregat per sopir (rata-rata harian)
    driver_stats = df.groupby('sopir').agg({
        'hard_brake': 'mean',
        'overspeed': 'mean',
        'idle_minutes': 'mean',
        'plat': 'first' # Asumsi 1 supir memegang 1 truk dominan
    }).reset_index()
    
    results = []
    for _, row in driver_stats.iterrows():
        z_hb = (row['hard_brake'] - DRIVER_STATS['hard_brake'][0]) / DRIVER_STATS['hard_brake'][1] if DRIVER_STATS['hard_brake'][1] > 0 else 0
        z_os = (row['overspeed'] - DRIVER_STATS['overspeed'][0]) / DRIVER_STATS['overspeed'][1] if DRIVER_STATS['overspeed'][1] > 0 else 0
        z_id = (row['idle_minutes'] - DRIVER_STATS['idle_minutes'][0]) / DRIVER_STATS['idle_minutes'][1] if DRIVER_STATS['idle_minutes'][1] > 0 else 0
        
        avg_z = np.mean([z_hb, z_os, z_id])
        
        s_hb = skor_metrik_baru(z_hb)
        s_os = skor_metrik_baru(z_os)
        s_idle = skor_metrik_baru(z_id)
        skor_akhir = skor_metrik_baru(avg_z)
        
        results.append({
            "name": row['sopir'],
            "plate": row['plat'],
            "score": skor_akhir,
            "breakdown": {
                "hard_brake": s_hb,
                "overspeed": s_os,
                "idle": s_idle
            },
            "raw": {
                "hard_brake": round(row['hard_brake'], 1),
                "overspeed": round(row['overspeed'], 1),
                "idle": round(row['idle_minutes'], 1)
            }
        })
        
    return sorted(results, key=lambda x: x['score'], reverse=True)


def calculate_truck_state(plat, group_to_calc, row):
    # Calculate real cumulative_km and rolling features if missing
    real_cumulative_km = group_to_calc['jarak_km'].sum()
    real_jarak_roll7 = group_to_calc.tail(7)['jarak_km'].mean() if len(group_to_calc) >= 7 else row['jarak_km']
    real_hard_brake_roll7 = group_to_calc.tail(7)['hard_brake'].mean() if len(group_to_calc) >= 7 else row['hard_brake']
    real_hard_brake_std7 = group_to_calc.tail(7)['hard_brake'].std() if len(group_to_calc) >= 7 else 0
    real_suhu_mesin_roll7 = group_to_calc.tail(7)['suhu_mesin'].mean() if len(group_to_calc) >= 7 else row['suhu_mesin']
    
    # Prepare inputs
    X_rem = np.array([[
        norm(row['hard_brake'], 'hard_brake'),
        norm(row['jarak_km'], 'jarak_km'),
        norm(row['overspeed'], 'overspeed'),
        norm(real_hard_brake_roll7, 'hard_brake'),
        norm(real_cumulative_km, 'cumulative_km'),
        norm(real_hard_brake_std7, 'hard_brake')
    ]])
    X_ban = np.array([[
        norm(row['jarak_km'], 'jarak_km'),
        norm(row['muatan_ton'], 'muatan_ton'),
        norm(row['overspeed'], 'overspeed'),
        norm(real_jarak_roll7, 'jarak_km'),
        norm(real_cumulative_km, 'cumulative_km')
    ]])
    X_aki = np.array([[
        norm(row['jarak_km'], 'jarak_km'),
        norm(row['suhu_mesin'], 'suhu_mesin'),
        norm(row['idle_minutes'], 'idle_minutes'),
        norm(real_suhu_mesin_roll7, 'suhu_mesin'),
        norm(real_cumulative_km, 'cumulative_km')
    ]])
    
    # Predict raw values
    rem_mm = float(model_rem["model"].predict(model_rem["poly"].transform(X_rem))[0])
    ban_pct = float(model_ban["model"].predict(model_ban["poly"].transform(X_ban))[0])
    aki_pct = float(model_aki["model"].predict(model_aki["poly"].transform(X_aki))[0])
    
    # Clamp ranges just to be safe
    rem_mm = max(0.0, rem_mm)
    ban_pct = max(0.0, min(100.0, ban_pct))
    aki_pct = max(0.0, min(100.0, aki_pct))
    
    # Normalization specifically for Display Score (15mm max)
    rem_score = min(100.0, (rem_mm / 15.0) * 100.0)
    truck_score = math.floor((rem_score + ban_pct + aki_pct) / 3.0)
    
    # Weakest link logic for status (ALL components use Percentiles from dummy distribution)
    truck_status = "aman"
    if rem_mm < THRESHOLDS.get('rem_p15', 4.46) or ban_pct < THRESHOLDS.get('ban_p15', 82.5) or aki_pct < THRESHOLDS.get('aki_p15', 94.3):
        truck_status = "kritis"
    elif rem_mm < THRESHOLDS.get('rem_p50', 7.13) or ban_pct < THRESHOLDS.get('ban_p50', 89.7) or aki_pct < THRESHOLDS.get('aki_p50', 96.1):
        truck_status = "perhatian"
        
    return {
        "rem_mm": rem_mm, "ban_pct": ban_pct, "aki_pct": aki_pct, 
        "rem_score": rem_score, "truck_score": truck_score, 
        "truck_status": truck_status, "real_cumulative_km": real_cumulative_km
    }

@app.get("/api/dashboard/truck/{plat_id}")
def get_truck_detail(plat_id: str, day: int = 365):
    try:
        df = pd.read_csv('../data_dummy_fleetsight_FINAL.csv')
    except Exception as e:
        return {"error": f"Failed to read CSV: {str(e)}"}
        
    # Find the matching truck by normalized ID
    target_group = None
    target_plat = None
    for plat, group in df.groupby('plat'):
        if plat.lower().replace(" ", "") == plat_id.lower().strip():
            target_group = group
            target_plat = plat
            break
            
    if target_group is None:
        return {"error": "Truck not found"}
        
    # Determine the days to generate history for the chart
    base_days = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 365]
    history_days = [d for d in base_days if d <= day]
    if day not in history_days:
        history_days.append(day)
        
    # History arrays
    rem_history = []
    ban_history = []
    aki_history = []
    labels = []
    
    for d in history_days:
        subgroup = target_group[target_group['hari'] <= d]
        if subgroup.empty:
            continue
        row = subgroup.iloc[-1]
        state = calculate_truck_state(target_plat, subgroup, row)
        rem_history.append(round(state['rem_score'], 1))
        ban_history.append(round(state['ban_pct'], 1))
        aki_history.append(round(state['aki_pct'], 1))
        labels.append(f"H-{d}")
        
    # The final current state
    current_subgroup = target_group[target_group['hari'] <= day]
    if current_subgroup.empty:
        return {"error": "No data available for the specified day"}
        
    current_row = current_subgroup.iloc[-1]
    current_state = calculate_truck_state(target_plat, current_subgroup, current_row)
    
    return {
        "id": plat_id,
        "plate": target_plat,
        "model": current_row.get('model', 'UD Quester'),
        "driver": current_row.get('sopir', 'Driver'),
        "score": current_state['truck_score'],
        "status": current_state['truck_status'],
        "cumulative_km": round(current_state['real_cumulative_km'], 1),
        "components": [
            {"key": "rem", "name": "Kampas Rem", "value": round(current_state['rem_score'], 1), "raw": f"{current_state['rem_mm']:.1f} mm"},
            {"key": "ban", "name": "Set Ban", "value": round(current_state['ban_pct'], 1), "raw": f"{current_state['ban_pct']:.1f} %"},
            {"key": "aki", "name": "Aki", "value": round(current_state['aki_pct'], 1), "raw": f"{current_state['aki_pct']:.1f} %"},
        ],
        "history": {
            "labels": labels,
            "rem": rem_history,
            "ban": ban_history,
            "aki": aki_history
        }
    }

@app.get("/api/dashboard/data")
def get_dashboard_data(day: int = None):
    try:
        df = pd.read_csv('../data_dummy_fleetsight_FINAL.csv')
    except Exception as e:
        return {"error": f"Failed to read CSV: {str(e)}"}
    
    trucks = []
    alerts = []
    
    # Group by plat to calculate cumulative values
    for plat, group in df.groupby('plat'):
        if day is not None:
            # Filter up to the specified day
            subgroup = group[group['hari'] <= day]
            if subgroup.empty:
                continue # Skip if no data for this day
            row = subgroup.iloc[-1]
            group_to_calc = subgroup
        else:
            row = group.loc[group['hari'].idxmax()]
            group_to_calc = group
            
        # Use the extracted helper
        state = calculate_truck_state(plat, group_to_calc, row)
        rem_mm = state['rem_mm']
        ban_pct = state['ban_pct']
        aki_pct = state['aki_pct']
        rem_score = state['rem_score']
        truck_score = state['truck_score']
        truck_status = state['truck_status']
        real_cumulative_km = state['real_cumulative_km']
            
        if rem_mm < THRESHOLDS.get('rem_p15', 4.46):
            alerts.append({"tone": "danger", "truck": plat, "text": f"Kampas rem kritis ({rem_mm:.1f} mm)", "time": "Baru saja", "truckId": plat.lower().replace(" ", "")})
        elif rem_mm < THRESHOLDS.get('rem_p50', 7.13):
            alerts.append({"tone": "warning", "truck": plat, "text": f"Kampas rem tipis ({rem_mm:.1f} mm)", "time": "1 jam lalu", "truckId": plat.lower().replace(" ", "")})
            
        if ban_pct < THRESHOLDS.get('ban_p15', 82.5):
            alerts.append({"tone": "danger", "truck": plat, "text": f"Kondisi ban kritis ({ban_pct:.1f}%)", "time": "Baru saja", "truckId": plat.lower().replace(" ", "")})
        elif ban_pct < THRESHOLDS.get('ban_p50', 89.7):
            alerts.append({"tone": "warning", "truck": plat, "text": f"Kondisi ban perlu perhatian ({ban_pct:.1f}%)", "time": "1 jam lalu", "truckId": plat.lower().replace(" ", "")})

        if aki_pct < THRESHOLDS.get('aki_p15', 94.3):
            alerts.append({"tone": "danger", "truck": plat, "text": f"Kondisi aki ngedrop ({aki_pct:.1f}%)", "time": "Baru saja", "truckId": plat.lower().replace(" ", "")})
        elif aki_pct < THRESHOLDS.get('aki_p50', 96.1):
            alerts.append({"tone": "warning", "truck": plat, "text": f"Aki perlu perhatian ({aki_pct:.1f}%)", "time": "1 jam lalu", "truckId": plat.lower().replace(" ", "")})
            
        trucks.append({
            "id": plat.lower().replace(" ", ""),
            "plate": plat,
            "model": row.get('model', 'UD Quester'),
            "driver": row.get('sopir', 'Driver'),
            "score": truck_score,
            "status": truck_status,
            "cumulative_km": round(real_cumulative_km, 1),
            "components": [
                {"key": "rem", "name": "Kampas Rem", "value": rem_score, "raw": f"{rem_mm:.1f} mm"},
                {"key": "ban", "name": "Set Ban", "value": ban_pct, "raw": f"{ban_pct:.1f} %"},
                {"key": "aki", "name": "Aki", "value": aki_pct, "raw": f"{aki_pct:.1f} %"},
            ]
        })
        
    active_trucks = len(trucks)
    critical_trucks = len([t for t in trucks if t['status'] == 'kritis'])
    avg_score = math.floor(sum([t['score'] for t in trucks]) / active_trucks) if active_trucks > 0 else 0
    
    return {
        "summary": {
            "activeTrucks": active_trucks,
            "criticalTrucks": critical_trucks,
            "avgScore": avg_score
        },
        "trucks": sorted(trucks, key=lambda x: x['score']),
        "alerts": alerts
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
