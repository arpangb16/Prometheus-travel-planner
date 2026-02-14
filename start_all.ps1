# Start Both Frontend and Backend Servers
# PowerShell script to start Prometheus Travel Planner

Write-Host "🚀 Starting Prometheus Travel Planner (Frontend + Backend)..." -ForegroundColor Cyan
Write-Host ""

# Kill existing processes on ports 8000 and 5173
Write-Host "🔍 Checking for existing processes..." -ForegroundColor Yellow

# Kill process on port 8000 (backend)
try {
    $backendConn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($backendConn) {
        $backendPID = $backendConn.OwningProcess
        Write-Host "   Stopping existing backend process (PID: $backendPID)..." -ForegroundColor Yellow
        Stop-Process -Id $backendPID -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
} catch {
    # Port might not be in use
}

# Kill process on port 5173 (frontend)
try {
    $frontendConn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($frontendConn) {
        $frontendPID = $frontendConn.OwningProcess
        Write-Host "   Stopping existing frontend process (PID: $frontendPID)..." -ForegroundColor Yellow
        Stop-Process -Id $frontendPID -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
} catch {
    # Port might not be in use
}

# Also try to kill by process name (fallback)
try {
    # Kill any uvicorn processes
    Get-Process | Where-Object { $_.ProcessName -like "*python*" -or $_.ProcessName -like "*node*" } | ForEach-Object {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
            if ($cmdLine -like "*uvicorn*app.main*" -or $cmdLine -like "*vite*") {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Skip if we can't get command line
        }
    }
} catch {
    # Process might not exist or command not available
}

Write-Host "✓ Cleaned up existing processes" -ForegroundColor Green
Write-Host ""

# Determine Python executable
$pythonCmd = "python3"
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
}

# Check if virtual environment exists and use it
if (Test-Path "venv") {
    if (Test-Path "venv/bin/python") {
        $pythonCmd = "venv/bin/python"
        $env:PATH = "$PWD/venv/bin:$env:PATH"
    } elseif (Test-Path "venv\Scripts\python.exe") {
        $pythonCmd = "venv\Scripts\python.exe"
    }
    Write-Host "✓ Using virtual environment" -ForegroundColor Green
} else {
    Write-Host "⚠️  Virtual environment not found. Using system Python..." -ForegroundColor Yellow
}

# Check Node.js version
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        Write-Host "   Please install Node.js 16 or higher: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 16) {
        Write-Host "❌ Node.js version 16 or higher is required" -ForegroundColor Red
        Write-Host "   Current version: $nodeVersion" -ForegroundColor Yellow
        Write-Host "   Please upgrade Node.js: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "   Please install Node.js 16 or higher: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if frontend node_modules exists
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    $installResult = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        Write-Host "   This might be due to Node.js version. Please upgrade to Node.js 16+" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
    Set-Location ..
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Green
Write-Host "   Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
$backendProcess = Start-Process -NoNewWindow -PassThru -FilePath $pythonCmd -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend (this will block)
try {
    Set-Location frontend
    npm run dev
} finally {
    Set-Location ..
    # Clean up backend process when frontend exits
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force
    }
}

