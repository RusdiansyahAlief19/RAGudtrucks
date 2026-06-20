import pickle
import pandas as pd
import numpy as np

# Load models
m_rem = pickle.load(open('backend/models/model_rem.pkl', 'rb'))
m_ban = pickle.load(open('backend/models/model_ban.pkl', 'rb'))
m_aki = pickle.load(open('backend/models/model_aki.pkl', 'rb'))

print("--- FEATURE NAMES IN ---")
print("REM:", m_rem['model'].feature_names_in_ if hasattr(m_rem['model'], 'feature_names_in_') else "No feature_names_in_")
print("BAN:", m_ban['model'].feature_names_in_ if hasattr(m_ban['model'], 'feature_names_in_') else "No feature_names_in_")
print("AKI:", m_aki['model'].feature_names_in_ if hasattr(m_aki['model'], 'feature_names_in_') else "No feature_names_in_")

# Actually, the features are in m_rem['features']
print("REM features (dict):", m_rem.get('features'))
print("BAN features (dict):", m_ban.get('features'))
print("AKI features (dict):", m_aki.get('features'))

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')

# Get last row for a specific truck (e.g., first unique plat)
truck_plat = df['plat'].unique()[0]
truck_df = df[df['plat'] == truck_plat].sort_values('hari')
sample = truck_df.iloc[-1]
print("\n--- SAMPLE ROW (Raw CSV) ---")
print(sample)

# Prepare arrays for prediction
# Let's assume the order from main.py is correct
X_rem_raw = np.array([[sample['hard_brake'], sample['jarak_km'], sample['overspeed'], sample.get('hard_brake_r7', 5), sample.get('cumulative_km', 15000), sample.get('hard_brake_std', 2)]])
X_ban_raw = np.array([[sample['jarak_km'], sample['muatan_ton'], sample['overspeed'], sample.get('jarak_km_r7', 150), sample.get('cumulative_km', 15000)]])
X_aki_raw = np.array([[sample['jarak_km'], sample['suhu_mesin'], sample['idle_minutes'], sample.get('suhu_mesin_r7', 85), sample.get('cumulative_km', 15000)]])

print("\n--- PREDICTION ON RAW CSV ROW ---")
try:
    print("REM output:", m_rem['model'].predict(m_rem['poly'].transform(X_rem_raw))[0])
except Exception as e:
    print("REM error:", e)

try:
    print("BAN output:", m_ban['model'].predict(m_ban['poly'].transform(X_ban_raw))[0])
except Exception as e:
    print("BAN error:", e)

try:
    print("AKI output:", m_aki['model'].predict(m_aki['poly'].transform(X_aki_raw))[0])
except Exception as e:
    print("AKI error:", e)

