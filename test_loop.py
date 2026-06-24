import subprocess
import time
from playwright.sync_api import sync_playwright

print("Starting HTTP server for frontend...")
# Start frontend server
fe_proc = subprocess.Popen(["python", "-m", "http.server", "8080"], cwd="UD TRUCKS")
time.sleep(2)

print("Starting backend server...")
be_proc = subprocess.Popen(["..\\venv\\Scripts\\python.exe", "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"], cwd="backend")
time.sleep(5)

req_count = 0
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    def handle_request(request):
        global req_count
        if "http://127.0.0.1:8000" in request.url:
            req_count += 1
            print(f"Request: {request.url}")
            
    page.on("request", handle_request)
    
    print("Navigating to app...")
    page.goto("http://localhost:8080")
    time.sleep(2)
    
    print("Clicking Predictive Maintenance...")
    # Assuming there's a nav button for predictive
    page.evaluate("document.querySelector('[data-screen=\"predictive\"]').click()")
    time.sleep(5)
    
    print(f"Total backend requests in 5 seconds: {req_count}")
    browser.close()

fe_proc.terminate()
be_proc.terminate()
