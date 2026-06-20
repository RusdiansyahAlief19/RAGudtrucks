import pickle
import pandas as pd
import numpy as np

# Load models
m_rem = pickle.load(open('backend/models/model_rem.pkl', 'rb'))
m_ban = pickle.load(open('backend/models/model_ban.pkl', 'rb'))
m_aki = pickle.load(open('backend/models/model_aki.pkl', 'rb'))

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')
sample = df.iloc[-1]

# Normalization constants (based on previously discovered max/mins)
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

# Normalize sample
X_rem_norm = np.array([[
    norm(sample['hard_brake'], 'hard_brake'),
    norm(sample['jarak_km'], 'jarak_km'),
    norm(sample['overspeed'], 'overspeed'),
    norm(sample.get('hard_brake_r7', 5), 'hard_brake'),
    norm(sample.get('cumulative_km', 15000), 'cumulative_km'),
    norm(sample.get('hard_brake_std', 2), 'hard_brake')
]])

X_ban_norm = np.array([[
    norm(sample['jarak_km'], 'jarak_km'),
    norm(sample['muatan_ton'], 'muatan_ton'),
    norm(sample['overspeed'], 'overspeed'),
    norm(sample.get('jarak_km_r7', 150), 'jarak_km'),
    norm(sample.get('cumulative_km', 15000), 'cumulative_km')
]])

X_aki_norm = np.array([[
    norm(sample['jarak_km'], 'jarak_km'),
    norm(sample['suhu_mesin'], 'suhu_mesin'),
    norm(sample['idle_minutes'], 'idle_minutes'),
    norm(sample.get('suhu_mesin_r7', 85), 'suhu_mesin'),
    norm(sample.get('cumulative_km', 15000), 'cumulative_km')
]])

print("\n--- PREDICTION ON NORMALIZED CSV ROW ---")
print("REM output:", m_rem['model'].predict(m_rem['poly'].transform(X_rem_norm))[0])
print("BAN output:", m_ban['model'].predict(m_ban['poly'].transform(X_ban_norm))[0])
print("AKI output:", m_aki['model'].predict(m_aki['poly'].transform(X_aki_norm))[0])
