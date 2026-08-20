import subprocess
import sys
import os
import time

def main():
    print("=========================================================")
    print("       NeuroPath AI — Launching Full System")
    print("=========================================================")
    print("1. Starting Python FastAPI Backend on http://127.0.0.1:8000...")
    
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = os.path.join(os.path.dirname(__file__), "backend")

    backend_cmd = [
        sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"
    ]
    
    backend_process = subprocess.Popen(
        backend_cmd,
        cwd=os.path.join(os.path.dirname(__file__), "backend"),
        env=backend_env
    )

    time.sleep(2)
    print("2. Starting React + Vite Frontend on http://localhost:3000...")

    frontend_cmd = ["npm", "run", "dev"] if os.name != 'nt' else ["npm.cmd", "run", "dev"]
    frontend_process = subprocess.Popen(
        frontend_cmd,
        cwd=os.path.join(os.path.dirname(__file__), "frontend")
    )

    print("\nNeuroPath AI is live!")
    print("Backend API:  http://127.0.0.1:8000/api/docs")
    print("Frontend UI: http://localhost:3000")
    print("Press Ctrl+C to stop both servers.\n")

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
