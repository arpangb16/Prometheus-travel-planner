# Travel Planner - Airfare Booking API

A FastAPI-based travel booking application with user authentication, trip management, and airfare search capabilities.

## Features

- **User Authentication**: JWT-based authentication with user registration and login
- **Trip Management**: Create and manage trips for each user
- **Airfare Search**: Support for one-way, return, and multi-city flight searches
- **Location Flexibility**: Support for airport codes (IATA) and city names
- **Skyscanner Integration**: Integration with Skyscanner API for real-time flight data
- **Search History**: Save and retrieve previous airfare searches

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **DuckDB**: Embedded analytical database
- **JWT**: Secure token-based authentication
- **Pydantic**: Data validation using Python type annotations
- **Skyscanner API**: Flight search integration

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env and add your Skyscanner API key
```

3. **Run the application**:
```bash
uvicorn app.main:app --reload
```

4. **Access API documentation**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/token` - Login and get access token
- `GET /auth/me` - Get current user information

### Trips
- `POST /trips` - Create a new trip
- `GET /trips` - Get all trips for current user
- `GET /trips/{trip_id}` - Get a specific trip
- `DELETE /trips/{trip_id}` - Delete a trip

### Airfare Search
- `POST /airfare/search/one-way` - Search for one-way flights
- `POST /airfare/search/return` - Search for return flights
- `POST /airfare/search/multi-city` - Search for multi-city flights
- `GET /airfare/searches` - Get search history
- `GET /airfare/searches/{search_id}` - Get a specific search

## Usage Examples

### Register a User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_doe&password=securepassword123"
```

### Search One-Way Flights
```bash
curl -X POST "http://localhost:8000/airfare/search/one-way" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departure_date": "2024-06-15",
    "passengers": 1,
    "cabin_class": "economy"
  }'
```

### Search Return Flights
```bash
curl -X POST "http://localhost:8000/airfare/search/return" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departure_date": "2024-06-15",
    "return_date": "2024-06-22",
    "passengers": 2,
    "cabin_class": "economy"
  }'
```

### Search Multi-City Flights
```bash
curl -X POST "http://localhost:8000/airfare/search/multi-city" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "segments": [
      {
        "origin": "JFK",
        "destination": "LAX",
        "departure_date": "2024-06-15"
      },
      {
        "origin": "LAX",
        "destination": "SFO",
        "departure_date": "2024-06-20"
      },
      {
        "origin": "SFO",
        "destination": "JFK",
        "departure_date": "2024-06-25"
      }
    ],
    "passengers": 1,
    "cabin_class": "economy"
  }'
```

## Location Specification

The API supports flexible location input:
- **Airport codes**: Use IATA codes (e.g., "JFK", "LAX", "LHR")
- **City names**: Use city names (e.g., "New York", "Los Angeles")
- The Skyscanner service will handle location resolution

## Development Notes

- The application uses DuckDB as an embedded database - no separate database server required
- Mock flight data is returned when Skyscanner API key is not configured (for development)
- All endpoints require authentication except `/auth/register` and `/auth/token`
- Search results are saved to the database for history tracking

## Next Steps

- Add hotel booking functionality
- Add ground transportation booking
- Implement location autocomplete/validation
- Add price alerts and notifications
- Implement booking confirmation flow

