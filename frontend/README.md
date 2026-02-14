# Prometheus Travel Planner - Frontend

React-based frontend for the Prometheus Travel Planner application.

## Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory and can be served by the FastAPI backend.

## Features

- User authentication (login/register)
- Trip management
- Flight search (one-way, return, multi-city)
- Search history
- Responsive design

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`. Make sure the backend is running before using the frontend.

