#!/bin/bash

# Travel Planner Setup Script

echo "🚀 Setting up Travel Planner..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_PATH=./travel_planner.duckdb

# JWT Settings
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Skyscanner API (optional - will use mock data if not set)
SKYSCANNER_API_KEY=
SKYSCANNER_API_URL=https://partners.api.skyscanner.net/apiservices/v3
EOF
    echo "✅ .env file created with generated SECRET_KEY"
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"

