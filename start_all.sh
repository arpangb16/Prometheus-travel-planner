#!/bin/bash
# Start Both Frontend and Backend Servers
# Bash script to start Prometheus Travel Planner

echo "🚀 Starting Prometheus Travel Planner (Frontend + Backend)..."
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

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Determine Python executable
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON_CMD="python"
    echo -e "${GREEN}✓ Using virtual environment${NC}"
else
    PYTHON_CMD="python3"
    echo -e "${YELLOW}⚠️  Virtual environment not found. Using system Python...${NC}"
fi

# Check Node.js version
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo -e "${YELLOW}❌ Node.js version 16 or higher is required${NC}"
        echo -e "   Current version: $(node --version)"
        echo -e "   Please upgrade Node.js: https://nodejs.org/"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"
else
    echo -e "${YELLOW}❌ Node.js is not installed${NC}"
    echo -e "   Please install Node.js 16 or higher: https://nodejs.org/"
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    if ! npm install; then
        echo -e "${YELLOW}❌ Failed to install frontend dependencies${NC}"
        echo -e "   This might be due to Node.js version. Please upgrade to Node.js 16+"
        cd ..
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT TERM

# Start backend server
echo ""
echo -e "${GREEN}🔧 Starting Backend Server...${NC}"
echo -e "   ${CYAN}Backend: http://localhost:8000${NC}"
echo -e "   ${CYAN}API Docs: http://localhost:8000/docs${NC}"
echo ""

$PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server (foreground - shows output)
echo ""
echo -e "${GREEN}🎨 Starting Frontend Server...${NC}"
echo -e "   ${CYAN}Frontend: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

cd frontend
npm run dev
cd ..

# Cleanup on exit
cleanup

