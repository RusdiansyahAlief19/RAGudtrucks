import pandas as pd
df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')

for col in ['tebal_rem_mm', 'kondisi_ban_pct', 'kondisi_aki_pct']:
    print(f"=== {col} ===")
    print(df[col].describe())
    print(f"Persentil 15%: {df[col].quantile(0.15):.2f}")
    print(f"Persentil 50%: {df[col].quantile(0.50):.2f}")
    print()
