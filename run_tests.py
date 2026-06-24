import subprocess
import time
import urllib.request
import json
import sys
import os

print("Starting server...")
python_exe = r"d:\6. ASTRA CHALLENGE\venv\Scripts\python.exe"
process = subprocess.Popen(
    [python_exe, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=r"d:\6. ASTRA CHALLENGE\backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    encoding="utf-8"
)

startup_logs = []
ready = False
start_time = time.time()

while time.time() - start_time < 30: # 30 sec timeout
    line = process.stdout.readline()
    if line:
        startup_logs.append(line.strip())
        if "Application startup complete." in line:
            ready = True
            break
    else:
        time.sleep(0.1)

print("\n--- STARTUP LOGS ---")
for log in startup_logs:
    print(log)
print("--------------------\n")

if not ready:
    print("Server failed to start within 30 seconds.")
    process.terminate()
    sys.exit(1)

def fetch(url):
    try:
        res = urllib.request.urlopen(url)
        return json.loads(res.read())
    except Exception as e:
        return {"error": str(e)}

print("Fetching /api/dashboard/data...")
d_data = fetch("http://127.0.0.1:8000/api/dashboard/data")

print("Fetching /api/dashboard/truck/da7723ef?day=365...")
t_data = fetch("http://127.0.0.1:8000/api/dashboard/truck/da7723ef?day=365")

print("Fetching /api/dashboard/drivers...")
dr_data = fetch("http://127.0.0.1:8000/api/dashboard/drivers")

print("\n--- ENDPOINT 1: /api/dashboard/data ---")
print(json.dumps({k: d_data[k] for k in ('summary', 'alerts')} , indent=2))
print("trucks array length:", len(d_data.get('trucks', [])))

print("\n--- ENDPOINT 2: /api/dashboard/truck/da7723ef?day=365 ---")
print(json.dumps(t_data, indent=2))

print("\n--- ENDPOINT 3: /api/dashboard/drivers ---")
print("First driver:", json.dumps(dr_data[0], indent=2) if len(dr_data)>0 else "Empty")
print("Last driver:", json.dumps(dr_data[-1], indent=2) if len(dr_data)>0 else "Empty")
print("Total drivers:", len(dr_data))

process.terminate()
