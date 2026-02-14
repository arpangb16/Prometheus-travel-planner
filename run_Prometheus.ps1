# Travel Planner Server Startup Script
# PowerShell script to start the FastAPI server

Write-Host "🚀 Starting Prometheus Travel Planner Server..." -ForegroundColor Cyan

# Determine Python executable
$pythonCmd = "python3"
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
}

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    
    # Activate virtual environment based on OS
    if ($IsWindows -or $env:OS -like "*Windows*") {
        if (Test-Path "venv\Scripts\Activate.ps1") {
            & "venv\Scripts\Activate.ps1"
        } else {
            Write-Host "⚠️  PowerShell activation script not found. Using venv Python directly..." -ForegroundColor Yellow
            $pythonCmd = "venv\Scripts\python.exe"
        }
    } else {
        # Linux/Mac - use venv's Python directly or source bash activate
        if (Test-Path "venv/bin/python") {
            $pythonCmd = "venv/bin/python"
            $env:PATH = "$PWD/venv/bin:$env:PATH"
        } else {
            Write-Host "⚠️  Virtual environment Python not found. Using system Python..." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  Virtual environment not found. Using system Python..." -ForegroundColor Yellow
    Write-Host "   Consider running ./setup.sh first to create venv" -ForegroundColor Yellow
}

# Skip dependency checks - assume they're already installed in venv
if (Test-Path "venv") {
    Write-Host "✓ Virtual environment detected - skipping dependency check" -ForegroundColor Green
}

# Start the server
Write-Host ""
Write-Host "Starting uvicorn server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "ReDoc Documentation: http://localhost:8000/redoc" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run uvicorn with auto-reload
& $pythonCmd -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

