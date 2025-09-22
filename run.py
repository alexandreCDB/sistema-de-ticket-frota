import subprocess

# Backend
backend_cmd = "uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

# Frontend
frontend_cmd = "npm run dev --prefix frontend"

# Inicia ambos
backend_proc = subprocess.Popen(backend_cmd, shell=True)
frontend_proc = subprocess.Popen(frontend_cmd, shell=True)

try:
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    backend_proc.terminate()
    frontend_proc.terminate()
