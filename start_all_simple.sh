#!/bin/bash
# Simple version - starts both servers
# Recommended for Linux/Mac

echo "🚀 Starting Prometheus Travel Planner..."
echo ""

# Kill existing processes on ports 8000 and 5173
echo "🔍 Checking for existing processes..."

# Kill process on port 8000 (backend)
if command -v lsof > /dev/null 2>&1; then
    BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   Stopping existing backend process (PID: $BACKEND_PID)..."
        kill -9 $BACKEND_PID 2>/dev/null
        sleep 1
    fi
    
    # Kill process on port 5173 (frontend)
    FRONTEND_PID=$(lsof -ti:5173 2>/dev/null)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   Stopping existing frontend process (PID: $FRONTEND_PID)..."
        kill -9 $FRONTEND_PID 2>/dev/null
        sleep 1
    fi
elif command -v fuser > /dev/null 2>&1; then
    # Alternative using fuser
    fuser -k 8000/tcp 2>/dev/null
    fuser -k 5173/tcp 2>/dev/null
    sleep 1
else
    # Fallback: try to kill by process name
    pkill -f "uvicorn.*app.main" 2>/dev/null
    pkill -f "vite.*frontend" 2>/dev/null
    sleep 1
fi

echo "✓ Cleaned up existing processes"
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON_CMD="python"
    echo "✓ Using virtual environment"
else
    PYTHON_CMD="python3"
    echo "⚠️  Virtual environment not found. Using system Python..."
fi

# Check Node.js version
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 16 ]; then
        echo "❌ Node.js version 16 or higher is required"
        echo "   Current version: $NODE_VERSION"
        echo "   Please upgrade Node.js: https://nodejs.org/"
        exit 1
    fi
    echo "✓ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js 16 or higher: https://nodejs.org/"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    if ! npm install; then
        echo "❌ Failed to install frontend dependencies"
        echo "   This might be due to Node.js version. Please upgrade to Node.js 16+"
        cd ..
        exit 1
    fi
    cd ..
    echo "✓ Frontend dependencies installed"
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT TERM

# Start backend in background
echo ""
echo "🔧 Starting Backend Server..."
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

$PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend (this will be the foreground process)
echo "🎨 Starting Frontend Server..."
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

cd frontend
npm run dev

# Cleanup on exit
cleanup

