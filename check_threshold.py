import pandas as pd

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')

print("=== Statistik tebal_rem_mm ===")
print(df['tebal_rem_mm'].describe())

print()
print("=== Distribusi kategori dengan threshold kritis<7, perhatian<9 ===")
total = len(df)
kritis = (df['tebal_rem_mm'] < 7).sum()
perhatian = ((df['tebal_rem_mm'] >= 7) & (df['tebal_rem_mm'] < 9)).sum()
aman = (df['tebal_rem_mm'] >= 9).sum()
print(f"Kritis (<7mm): {kritis} baris ({kritis/total*100:.1f}%)")
print(f"Perhatian (7-9mm): {perhatian} baris ({perhatian/total*100:.1f}%)")
print(f"Aman (>=9mm): {aman} baris ({aman/total*100:.1f}%)")

print()
print("=== Sama, tapi threshold lama kritis<7, perhatian<8 (pembanding) ===")
perhatian_lama = ((df['tebal_rem_mm'] >= 7) & (df['tebal_rem_mm'] < 8)).sum()
aman_lama = (df['tebal_rem_mm'] >= 8).sum()
print(f"Perhatian (7-8mm): {perhatian_lama} baris ({perhatian_lama/total*100:.1f}%)")
print(f"Aman (>=8mm): {aman_lama} baris ({aman_lama/total*100:.1f}%)")
