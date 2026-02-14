from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime


# Auth Models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# Trip Models
class TripCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class TripResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    name: str
    created_at: datetime


# Airfare Search Models
class LocationInput(BaseModel):
    """Location can be airport code (IATA) or city name"""
    location: str = Field(..., description="Airport code (e.g., 'JFK') or city name (e.g., 'New York')")
    airport_code: Optional[str] = Field(None, description="Specific airport code if known")


class FlightSegment(BaseModel):
    origin: str = Field(..., description="Origin airport code or city")
    destination: str = Field(..., description="Destination airport code or city")
    departure_date: date


class AirfareSearchOneWay(BaseModel):
    search_type: str = "one-way"
    origin: str
    destination: str
    departure_date: date
    passengers: int = Field(default=1, ge=1, le=9)
    cabin_class: Optional[str] = Field(default="economy", description="economy, premium, business, first")


class AirfareSearchReturn(BaseModel):
    search_type: str = "return"
    origin: str
    destination: str
    departure_date: date
    return_date: date
    passengers: int = Field(default=1, ge=1, le=9)
    cabin_class: Optional[str] = Field(default="economy")


class AirfareSearchMultiCity(BaseModel):
    search_type: str = "multi-city"
    segments: List[FlightSegment] = Field(..., min_items=2, description="At least 2 flight segments")
    passengers: int = Field(default=1, ge=1, le=9)
    cabin_class: Optional[str] = Field(default="economy")


class AirfareSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    trip_id: Optional[int]
    search_type: str
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date]
    passengers: int
    search_results: Optional[dict]
    created_at: datetime


class FlightOption(BaseModel):
    """Flight option from search results"""
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    duration: str
    price: float
    currency: str = "USD"
    stops: int
    cabin_class: str

