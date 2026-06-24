import urllib.request
import time
import subprocess
import threading
import sys

def serve():
    subprocess.run(["python", "-m", "http.server", "8080"], cwd="UD TRUCKS", capture_output=True)

threading.Thread(target=serve, daemon=True).start()
time.sleep(2)
# I cannot easily render React without a browser.
print("Done")
