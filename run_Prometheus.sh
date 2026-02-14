#!/bin/bash
# Travel Planner Server Startup Script
# Bash script to start the FastAPI server

echo "🚀 Starting Prometheus Travel Planner Server..."

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Using system Python..."
    echo "   Consider running ./setup.sh first to create venv"
fi

# Skip dependency checks - assume they're already installed in venv
if [ -d "venv" ]; then
    echo "✓ Virtual environment detected - skipping dependency check"
fi

# Start the server
echo ""
echo "Starting uvicorn server..."
echo "Server will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "ReDoc Documentation: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run uvicorn with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

