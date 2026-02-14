from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.exceptions import RequestValidationError
from typing import List, Optional
from app.models import (
    AirfareSearchOneWay,
    AirfareSearchReturn,
    AirfareSearchMultiCity,
    AirfareSearchResponse,
    FlightSegment
)
from app.database import db
from app.services.amadeus import AmadeusService
import json
from datetime import date

router = APIRouter(prefix="/airfare", tags=["airfare"])
amadeus = AmadeusService()

# Temporary: Get default user ID for unauthenticated requests
def get_default_user_id() -> int:
    """Get default user ID for unauthenticated requests"""
    conn = db.connect()
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


@router.post("/search/one-way")
async def search_one_way(
    search: AirfareSearchOneWay,
    trip_id: Optional[int] = None
):
    """Search for one-way flights"""
    try:
        # Log the search request for debugging
        print(f"Search request: origin={search.origin}, destination={search.destination}, date={search.departure_date}, passengers={search.passengers}")
        
        # Search flights
        flights = await amadeus.search_flights(
            origin=search.origin,
            destination=search.destination,
            departure_date=search.departure_date,
            passengers=search.passengers,
            cabin_class=search.cabin_class or "economy"
        )
    except ValueError as e:
        # Amadeus API connection or validation errors
        error_msg = str(e)
        print(f"Amadeus API error: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        # Other unexpected errors
        import traceback
        error_trace = traceback.format_exc()
        error_msg = f"Flight search failed: {str(e)}"
        print(f"Unexpected error: {error_msg}")
        print(f"Traceback:\n{error_trace}")
        # Return more detailed error in development
        detail_msg = error_msg
        if "detail" in str(e).lower() or "error" in str(e).lower():
            detail_msg = str(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail_msg
        )
    
    # Save search to database
    try:
        conn = db.connect()
        conn.execute(
            """
            INSERT INTO airfare_searches 
            (trip_id, user_id, search_type, origin, destination, departure_date, passengers, search_results)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                trip_id,
                get_default_user_id(),
                "one-way",
                search.origin,
                search.destination,
                str(search.departure_date),  # Convert date to string
                search.passengers,
                json.dumps(flights)
            ]
        )
        
        conn.commit()
    except Exception as db_error:
        print(f"Database error: {db_error}")
        import traceback
        traceback.print_exc()
        # Continue even if database save fails - return the search results
        pass
    
    # Get the created search (or return results directly if DB save failed)
    try:
        result = conn.execute(
            """
            SELECT id, trip_id, search_type, origin, destination, departure_date, return_date, passengers, search_results, created_at
            FROM airfare_searches 
            WHERE user_id = ? AND origin = ? AND destination = ? AND departure_date = ?
            ORDER BY created_at DESC LIMIT 1
            """,
            [get_default_user_id(), search.origin, search.destination, str(search.departure_date)]
        ).fetchone()
        
        if result:
            return {
                "id": result[0],
                "trip_id": result[1],
                "search_type": result[2],
                "origin": result[3],
                "destination": result[4],
                "departure_date": result[5],
                "return_date": result[6],
                "passengers": result[7],
                "search_results": json.loads(result[8]) if result[8] else None,
                "created_at": result[9]
            }
    except Exception as db_error:
        print(f"Database query error: {db_error}")
        import traceback
        traceback.print_exc()
        # Fall through to return results directly
    
    # Return results directly if database operations failed
    return {
        "id": None,
        "trip_id": trip_id,
        "search_type": "one-way",
        "origin": search.origin,
        "destination": search.destination,
        "departure_date": str(search.departure_date),
        "return_date": None,
        "passengers": search.passengers,
        "search_results": flights,
        "created_at": None
    }


@router.post("/search/return")
async def search_return(
    search: AirfareSearchReturn,
    trip_id: Optional[int] = None
):
    """Search for return flights"""
    try:
        # Search flights
        flights = await amadeus.search_flights(
            origin=search.origin,
            destination=search.destination,
            departure_date=search.departure_date,
            return_date=search.return_date,
            passengers=search.passengers,
            cabin_class=search.cabin_class or "economy"
        )
    except ValueError as e:
        # Amadeus API connection or validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flight search failed: {str(e)}"
        )
    
    # Save search to database
    conn = db.connect()
    conn.execute(
        """
        INSERT INTO airfare_searches 
        (trip_id, user_id, search_type, origin, destination, departure_date, return_date, passengers, search_results)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            trip_id,
            get_default_user_id(),
            "return",
            search.origin,
            search.destination,
            search.departure_date,
            search.return_date,
            search.passengers,
            json.dumps(flights)
        ]
    )
    
    conn.commit()
    
    # Get the created search
    result = conn.execute(
        """
        SELECT id, trip_id, search_type, origin, destination, departure_date, return_date, passengers, search_results, created_at
        FROM airfare_searches 
        WHERE user_id = ? AND origin = ? AND destination = ? AND departure_date = ? AND return_date = ?
        ORDER BY created_at DESC LIMIT 1
        """,
        [get_default_user_id(), search.origin, search.destination, search.departure_date, search.return_date]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save search"
        )
    
    return {
        "id": result[0],
        "trip_id": result[1],
        "search_type": result[2],
        "origin": result[3],
        "destination": result[4],
        "departure_date": result[5],
        "return_date": result[6],
        "passengers": result[7],
        "search_results": json.loads(result[8]) if result[8] else None,
        "created_at": result[9]
    }


@router.post("/search/multi-city")
async def search_multi_city(
    search: AirfareSearchMultiCity,
    trip_id: Optional[int] = None
):
    """Search for multi-city flights"""
    try:
        # Convert segments to dict format
        segments_dict = [
            {
                "origin": seg.origin,
                "destination": seg.destination,
                "departure_date": seg.departure_date
            }
            for seg in search.segments
        ]
        
        # Search flights for all segments
        all_segments = await amadeus.search_multi_city(
            segments=segments_dict,
            passengers=search.passengers,
            cabin_class=search.cabin_class or "economy"
        )
    except ValueError as e:
        # Amadeus API connection or validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flight search failed: {str(e)}"
        )
    
    # Save search to database
    conn = db.connect()
    
    # Get first and last locations for main search record
    origin = search.segments[0].origin
    destination = search.segments[-1].destination
    
    conn.execute(
        """
        INSERT INTO airfare_searches 
        (trip_id, user_id, search_type, origin, destination, departure_date, passengers, search_results)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            trip_id,
            get_default_user_id(),
            "multi-city",
            origin,
            destination,
            search.segments[0].departure_date,
            search.passengers,
            json.dumps(all_segments)
        ]
    )
    
    conn.commit()
    
    # Get the created search ID
    result = conn.execute(
        """
        SELECT id FROM airfare_searches 
        WHERE user_id = ? AND origin = ? AND destination = ? AND departure_date = ? AND search_type = 'multi-city'
        ORDER BY created_at DESC LIMIT 1
        """,
        [get_default_user_id(), origin, destination, search.segments[0].departure_date]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save search"
        )
    
    search_id = result[0]
    
    # Save individual segments
    for idx, segment in enumerate(search.segments):
        conn.execute(
            """
            INSERT INTO multi_city_segments 
            (airfare_search_id, segment_order, origin, destination, departure_date)
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                search_id,
                idx + 1,
                segment.origin,
                segment.destination,
                segment.departure_date
            ]
        )
    
    conn.commit()
    
    # Fetch complete record
    result = conn.execute(
        """
        SELECT id, trip_id, search_type, origin, destination, departure_date, return_date, passengers, search_results, created_at
        FROM airfare_searches WHERE id = ?
        """,
        [search_id]
    ).fetchone()
    
    return {
        "id": result[0],
        "trip_id": result[1],
        "search_type": result[2],
        "origin": result[3],
        "destination": result[4],
        "departure_date": result[5],
        "return_date": result[6],
        "passengers": result[7],
        "search_results": json.loads(result[8]) if result[8] else None,
        "created_at": result[9]
    }


@router.get("/searches", response_model=List[AirfareSearchResponse])
async def get_search_history(
    trip_id: Optional[int] = None
):
    """Get airfare search history"""
    conn = db.connect()
    user_id = get_default_user_id()
    
    if trip_id:
        results = conn.execute(
            """
            SELECT id, trip_id, search_type, origin, destination, departure_date, return_date, passengers, search_results, created_at
            FROM airfare_searches 
            WHERE user_id = ? AND trip_id = ?
            ORDER BY created_at DESC
            """,
            [user_id, trip_id]
        ).fetchall()
    else:
        results = conn.execute(
            """
            SELECT id, trip_id, search_type, origin, destination, departure_date, return_date, passengers, search_results, created_at
            FROM airfare_searches 
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            [user_id]
        ).fetchall()
    
    return [
        {
            "id": row[0],
            "trip_id": row[1],
            "search_type": row[2],
            "origin": row[3],
            "destination": row[4],
            "departure_date": row[5],
            "return_date": row[6],
            "passengers": row[7],
            "search_results": json.loads(row[8]) if row[8] else None,
            "created_at": row[9]
        }
        for row in results
    ]


@router.get("/searches/{search_id}", response_model=AirfareSearchResponse)
async def get_search(
    search_id: int
):
    """Get a specific airfare search"""
    conn = db.connect()
    user_id = get_default_user_id()
    result = conn.execute(
        """
        SELECT id, trip_id, search_type, origin, destination, departure_date, return_date, passengers, search_results, created_at
        FROM airfare_searches 
        WHERE id = ? AND user_id = ?
        """,
        [search_id, user_id]
    ).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Search not found"
        )
    
    return {
        "id": result[0],
        "trip_id": result[1],
        "search_type": result[2],
        "origin": result[3],
        "destination": result[4],
        "departure_date": result[5],
        "return_date": result[6],
        "passengers": result[7],
        "search_results": json.loads(result[8]) if result[8] else None,
        "created_at": result[9]
    }

