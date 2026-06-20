import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

df = pd.read_csv('data_dummy_fleetsight_FINAL.csv')

out_dir = r"C:\Users\ASUS\.gemini\antigravity\brain\5459df2e-fbcb-4600-9391-dfaefa5e5b3c"

# Set style
sns.set_theme(style="whitegrid")

# 1. Rem: Tren penurunan ketebalan vs Waktu (hari) untuk salah satu plat
plt.figure(figsize=(10,5))
df_truck = df[df['plat'] == df['plat'].unique()[0]].sort_values('hari')
sns.lineplot(data=df_truck, x='hari', y='tebal_rem_mm', color='red', linewidth=2)
plt.title('Tren Penurunan Ketebalan Kampas Rem (Simulasi)')
plt.xlabel('Hari ke-')
plt.ylabel('Ketebalan (mm)')
plt.savefig(os.path.join(out_dir, 'chart_rem_trend.png'))
plt.close()

# 2. Rem: Korelasi hard_brake vs wear (tebal_rem_mm)
plt.figure(figsize=(8,5))
sns.scatterplot(data=df, x='hard_brake', y='tebal_rem_mm', alpha=0.3, color='darkred')
plt.title('Korelasi Hard Brake vs Ketebalan Kampas Rem')
plt.xlabel('Intensitas Hard Brake')
plt.ylabel('Ketebalan Kampas Rem (mm)')
plt.savefig(os.path.join(out_dir, 'chart_rem_corr.png'))
plt.close()

# 3. Ban: Tren degradasi ban vs muatan_ton
plt.figure(figsize=(10,5))
sns.scatterplot(data=df, x='muatan_ton', y='kondisi_ban_pct', alpha=0.4, color='orange')
plt.title('Pengaruh Muatan (Ton) Terhadap Kondisi Ban (%)')
plt.xlabel('Muatan (Ton)')
plt.ylabel('Kondisi Ban (%)')
plt.savefig(os.path.join(out_dir, 'chart_ban_corr.png'))
plt.close()

# 4. Aki: Suhu mesin vs Kondisi aki
plt.figure(figsize=(10,5))
sns.scatterplot(data=df, x='suhu_mesin', y='kondisi_aki_pct', alpha=0.4, color='blue')
plt.title('Korelasi Suhu Mesin vs Kesehatan Aki (SoH)')
plt.xlabel('Suhu Mesin (Celcius Equivalen)')
plt.ylabel('Kondisi Aki (%)')
plt.savefig(os.path.join(out_dir, 'chart_aki_corr.png'))
plt.close()

print("Charts generated!")
