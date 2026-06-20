import pandas as pd

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')

print("=== PERSENTIL THRESHOLD (Kritis < 15%, Perhatian 15-50%, Aman > 50%) ===")

for col in ['tebal_rem_mm', 'kondisi_ban_pct', 'kondisi_aki_pct']:
    p15 = df[col].quantile(0.15)
    p50 = df[col].quantile(0.50)
    print(f"{col}:")
    print(f"  Kritis (15th percentile)  : < {p15:.2f}")
    print(f"  Perhatian (50th percentile): < {p50:.2f}")
    print(f"  Aman                       : >= {p50:.2f}")
    print()
