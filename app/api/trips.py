from fastapi import APIRouter, Depends, HTTPException, status
from app.models import TripCreate, TripResponse
from app.database import db
from typing import List, Optional

router = APIRouter(prefix="/trips", tags=["trips"])

# Temporary: Get default user ID (1) or create anonymous user
def get_default_user_id() -> int:
    """Get default user ID for unauthenticated requests"""
    conn = db.connect()
    # Try to get or create a default user
    result = conn.execute("SELECT id FROM users LIMIT 1").fetchone()
    if result:
        return result[0]
    # Create anonymous user if none exists
    conn.execute(
        "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
        ["anonymous", "anonymous@example.com", "no_password"]
    )
    conn.commit()
    result = conn.execute("SELECT id FROM users WHERE username = 'anonymous'").fetchone()
    return result[0] if result else 1


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(trip: TripCreate):
    """Create a new trip for the current user"""
    conn = db.connect()
    user_id = get_default_user_id()
    conn.execute(
        """
        INSERT INTO trips (user_id, name)
        VALUES (?, ?)
        """,
        [user_id, trip.name]
    )
    
    conn.commit()
    
    # Get the created trip
    result = conn.execute(
        "SELECT id, user_id, name, created_at FROM trips WHERE user_id = ? AND name = ? ORDER BY created_at DESC LIMIT 1",
        [user_id, trip.name]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create trip"
        )
    
    return {
        "id": result[0],
        "user_id": result[1],
        "name": result[2],
        "created_at": result[3]
    }


@router.get("", response_model=List[TripResponse])
async def get_trips():
    """Get all trips"""
    conn = db.connect()
    user_id = get_default_user_id()
    results = conn.execute(
        "SELECT id, user_id, name, created_at FROM trips WHERE user_id = ? ORDER BY created_at DESC",
        [user_id]
    ).fetchall()
    
    return [
        {
            "id": row[0],
            "user_id": row[1],
            "name": row[2],
            "created_at": row[3]
        }
        for row in results
    ]


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: int):
    """Get a specific trip"""
    conn = db.connect()
    user_id = get_default_user_id()
    result = conn.execute(
        "SELECT id, user_id, name, created_at FROM trips WHERE id = ? AND user_id = ?",
        [trip_id, user_id]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    return {
        "id": result[0],
        "user_id": result[1],
        "name": result[2],
        "created_at": result[3]
    }


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: int):
    """Delete a trip"""
    conn = db.connect()
    user_id = get_default_user_id()
    result = conn.execute(
        "DELETE FROM trips WHERE id = ? AND user_id = ?",
        [trip_id, user_id]
    )
    conn.commit()
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

