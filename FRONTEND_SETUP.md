# Frontend Setup Instructions

## Quick Start

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Or use: `sudo apt install nodejs npm` (Linux)

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Start the frontend development server:**
```bash
npm run dev
```

4. **Start the backend server** (in a separate terminal):
```bash
# From project root
pwsh run_Prometheus.ps1
# or
./run_Prometheus.sh
```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Amadeus API Setup

1. **Get free Amadeus API credentials:**
   - Visit: https://developers.amadeus.com/
   - Sign up for a free account
   - Create a new app to get Client ID and Client Secret

2. **Add credentials to `.env` file:**
```bash
AMADEUS_CLIENT_ID=your-client-id-here
AMADEUS_CLIENT_SECRET=your-client-secret-here
AMADEUS_USE_PRODUCTION=false
```

**Note:** The app will use mock data if Amadeus credentials are not provided, so you can test the frontend without API keys.

## Features

- ✅ User registration and login
- ✅ Trip management (create, view, delete trips)
- ✅ Flight search:
  - One-way flights
  - Return flights
  - Multi-city flights
- ✅ Search history
- ✅ Responsive design
- ✅ Real-time flight search (with Amadeus API or mock data)

## Development

The frontend uses:
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Axios** - HTTP client

All components are in `frontend/src/components/` and can be easily modified.

