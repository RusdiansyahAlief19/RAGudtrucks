import pandas as pd

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')

print("=== 1. BUKTI KOLOM HILANG ===")
print("Daftar Kolom di CSV Asli:")
print(df.columns.tolist())

# Cek kolom cumulative_km
if 'cumulative_km' in df.columns:
    print("Kolom cumulative_km ADA. Menampilkan 5 baris terakhir DA 7723 EF:")
    print(df[df['plat']=='DA 7723 EF'][['hari', 'jarak_km', 'cumulative_km']].tail(5))
else:
    print("Kolom cumulative_km TIDAK ADA di dalam CSV Asli.")

if 'hard_brake_roll7' in df.columns:
    print("Kolom hard_brake_roll7 ADA.")
else:
    print("Kolom hard_brake_roll7 TIDAK ADA di dalam CSV Asli.")


print("\n=== 3. BUKTI KONSISTENSI (SEBELUM vs SESUDAH FIX) ===")
da7723ef = df[df['plat'] == 'DA 7723 EF'].sort_values('hari')
baris_terakhir = da7723ef.iloc[-1]

print("A. Data SEBELUM Fix (menggunakan .get() fallback karena kolom tidak ada):")
print(f"   cumulative_km    = {baris_terakhir.get('cumulative_km', 15000)} (Fallback Default)")
print(f"   hard_brake_roll7 = {baris_terakhir.get('hard_brake_roll7', 5)} (Fallback Default)")
print(f"   jarak_km_roll7   = {baris_terakhir.get('jarak_km_roll7', 150)} (Fallback Default)")

print("\nB. Data SESUDAH Fix (kalkulasi dinamis dari pandas):")
real_cumulative_km = da7723ef['jarak_km'].sum()
real_hard_brake_roll7 = da7723ef.tail(7)['hard_brake'].mean()
real_jarak_km_roll7 = da7723ef.tail(7)['jarak_km'].mean()

print(f"   cumulative_km    = {real_cumulative_km:.1f} (SUM jarak_km 365 hari)")
print(f"   hard_brake_roll7 = {real_hard_brake_roll7:.1f} (MEAN 7 hari terakhir)")
print(f"   jarak_km_roll7   = {real_jarak_km_roll7:.1f} (MEAN 7 hari terakhir)")
