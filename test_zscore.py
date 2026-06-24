import urllib.request, json
res = urllib.request.urlopen('http://127.0.0.1:8000/api/dashboard/drivers')
data = json.loads(res.read())
print(f"{'Nama':<15} | {'Skor':<4} | {'HB':<5} | {'OS':<5} | {'Idle':<5}")
print("-" * 45)
for d in data:
    print(f"{d['name']:<15} | {d['score']:<4} | {d['breakdown']['hard_brake']:<5} | {d['breakdown']['overspeed']:<5} | {d['breakdown']['idle']:<5}")
