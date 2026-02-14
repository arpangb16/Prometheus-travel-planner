# Travel Planner Server Startup Script (Simple Version)
# Just starts the server - assumes dependencies are already installed

Write-Host "🚀 Starting Prometheus Travel Planner Server..." -ForegroundColor Cyan

# Use venv Python if available, otherwise system Python
if (Test-Path "venv/bin/python") {
    $pythonCmd = "venv/bin/python"
    Write-Host "Using virtual environment Python" -ForegroundColor Green
} elseif (Test-Path "venv\Scripts\python.exe") {
    $pythonCmd = "venv\Scripts\python.exe"
    Write-Host "Using virtual environment Python" -ForegroundColor Green
} else {
    $pythonCmd = "python3"
    if (-not (Get-Command python3 -ErrorAction SilentlyContinue)) {
        $pythonCmd = "python"
    }
    Write-Host "Using system Python" -ForegroundColor Yellow
}

# Start the server
Write-Host ""
Write-Host "Starting uvicorn server..." -ForegroundColor Green
Write-Host "Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Run uvicorn
& $pythonCmd -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

