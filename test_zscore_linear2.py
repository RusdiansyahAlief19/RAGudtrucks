import pandas as pd
import numpy as np

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')
driver_stats = df.groupby('sopir').agg({
    'hard_brake': 'mean',
    'overspeed': 'mean',
    'idle_minutes': 'mean'
})

stats = {}
for col in ['hard_brake', 'overspeed', 'idle_minutes']:
    stats[col] = (driver_stats[col].mean(), driver_stats[col].std())

def avg_z(row):
    zs = []
    for col in ['hard_brake', 'overspeed', 'idle_minutes']:
        mean, std = stats[col]
        z = (row[col] - mean) / std if std > 0 else 0
        zs.append(z)
    return np.mean(zs)

driver_stats['avg_z'] = driver_stats.apply(avg_z, axis=1)

z_min = driver_stats['avg_z'].min()
z_max = driver_stats['avg_z'].max()

def skor_metrik_baru(z):
    # Mapping [z_min, z_max] to [98, 20]
    skor = 98 - ((z - z_min) / (z_max - z_min)) * (98 - 20)
    return max(0, min(100, round(skor)))

driver_stats['skor_final'] = driver_stats['avg_z'].apply(skor_metrik_baru)
for col in ['hard_brake', 'overspeed', 'idle_minutes']:
    mean, std = stats[col]
    driver_stats['z_'+col] = (driver_stats[col] - mean) / std
    driver_stats['score_'+col] = driver_stats['z_'+col].apply(skor_metrik_baru)

driver_stats = driver_stats.reset_index().sort_values('skor_final', ascending=False)
print(f"| {'Nama':<15} | {'Skor':<4} | {'HB':<5} | {'OS':<5} | {'Idle':<5} |")
print("-" * 50)
for idx, row in driver_stats.iterrows():
    print(f"| {row['sopir']:<15} | {row['skor_final']:<4} | {row['score_hard_brake']:<5} | {row['score_overspeed']:<5} | {row['score_idle_minutes']:<5} |")
