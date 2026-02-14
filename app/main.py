from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.api import auth, trips, airfare

app = FastAPI(
    title="Travel Planner API",
    description="Airfare booking API with user authentication and trip management",
    version="1.0.0"
)

# CORS middleware - allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],  # Vite, React, Vue default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from frontend dist if it exists
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dist / "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes"""
        if not full_path.startswith(("api", "docs", "redoc", "openapi.json")):
            index_file = frontend_dist / "index.html"
            if index_file.exists():
                return FileResponse(str(index_file))
        return {"message": "Not found"}

# Include routers
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(airfare.router)


@app.get("/")
async def root():
    return {
        "message": "Travel Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

