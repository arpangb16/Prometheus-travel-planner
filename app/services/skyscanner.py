import httpx
from typing import List, Optional, Dict, Any
from datetime import date
from app.config import settings
from app.models import FlightOption


class SkyscannerService:
    def __init__(self):
        self.api_key = settings.skyscanner_api_key
        self.base_url = settings.skyscanner_api_url
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        } if self.api_key else {}
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date] = None,
        passengers: int = 1,
        cabin_class: str = "economy"
    ) -> List[Dict[str, Any]]:
        """
        Search for flights using Skyscanner API
        Returns list of flight options
        """
        if not self.api_key:
            # Mock data for development when API key is not set
            return self._get_mock_flights(origin, destination, departure_date, return_date)
        
        try:
            # Note: Skyscanner API structure may vary - this is a template
            # You'll need to adapt based on actual Skyscanner API documentation
            async with httpx.AsyncClient() as client:
                if return_date:
                    # Return trip
                    response = await client.post(
                        f"{self.base_url}/flights/search",
                        json={
                            "query": {
                                "market": "US",
                                "locale": "en-US",
                                "currency": "USD",
                                "queryLegs": [
                                    {
                                        "originPlaceId": {"iata": origin},
                                        "destinationPlaceId": {"iata": destination},
                                        "date": {"year": departure_date.year, "month": departure_date.month, "day": departure_date.day}
                                    },
                                    {
                                        "originPlaceId": {"iata": destination},
                                        "destinationPlaceId": {"iata": origin},
                                        "date": {"year": return_date.year, "month": return_date.month, "day": return_date.day}
                                    }
                                ],
                                "adults": passengers,
                                "cabinClass": cabin_class
                            }
                        },
                        headers=self.headers,
                        timeout=30.0
                    )
                else:
                    # One-way trip
                    response = await client.post(
                        f"{self.base_url}/flights/search",
                        json={
                            "query": {
                                "market": "US",
                                "locale": "en-US",
                                "currency": "USD",
                                "queryLegs": [
                                    {
                                        "originPlaceId": {"iata": origin},
                                        "destinationPlaceId": {"iata": destination},
                                        "date": {"year": departure_date.year, "month": departure_date.month, "day": departure_date.day}
                                    }
                                ],
                                "adults": passengers,
                                "cabinClass": cabin_class
                            }
                        },
                        headers=self.headers,
                        timeout=30.0
                    )
                
                response.raise_for_status()
                data = response.json()
                
                # Parse Skyscanner response into our format
                return self._parse_skyscanner_response(data)
        
        except httpx.HTTPError as e:
            # Fallback to mock data on API errors
            print(f"Skyscanner API error: {e}")
            return self._get_mock_flights(origin, destination, departure_date, return_date)
    
    def _parse_skyscanner_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Skyscanner API response into our standard format"""
        # This is a placeholder - adapt based on actual Skyscanner API response structure
        flights = []
        # Implementation depends on actual API response format
        return flights
    
    def _get_mock_flights(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """Generate mock flight data for development/testing"""
        import random
        from datetime import datetime, timedelta
        
        flights = []
        airlines = ["American Airlines", "Delta", "United", "Southwest", "JetBlue"]
        
        # Generate 5-10 mock flights
        for i in range(random.randint(5, 10)):
            departure_time = datetime.combine(
                departure_date,
                datetime.min.time().replace(hour=random.randint(6, 22))
            )
            duration_hours = random.randint(2, 12)
            arrival_time = departure_time + timedelta(hours=duration_hours)
            
            flights.append({
                "airline": random.choice(airlines),
                "flight_number": f"{random.choice(['AA', 'DL', 'UA', 'WN', 'B6'])}{random.randint(100, 9999)}",
                "origin": origin,
                "destination": destination,
                "departure_time": departure_time.isoformat(),
                "arrival_time": arrival_time.isoformat(),
                "duration": f"{duration_hours}h {random.randint(0, 59)}m",
                "price": round(random.uniform(200, 1500), 2),
                "currency": "USD",
                "stops": random.choice([0, 0, 0, 1, 1, 2]),  # More direct flights
                "cabin_class": "economy"
            })
        
        # Sort by price
        flights.sort(key=lambda x: x["price"])
        
        if return_date:
            # Add return flights
            return_flights = []
            for i in range(random.randint(5, 10)):
                departure_time = datetime.combine(
                    return_date,
                    datetime.min.time().replace(hour=random.randint(6, 22))
                )
                duration_hours = random.randint(2, 12)
                arrival_time = departure_time + timedelta(hours=duration_hours)
                
                return_flights.append({
                    "airline": random.choice(airlines),
                    "flight_number": f"{random.choice(['AA', 'DL', 'UA', 'WN', 'B6'])}{random.randint(100, 9999)}",
                    "origin": destination,
                    "destination": origin,
                    "departure_time": departure_time.isoformat(),
                    "arrival_time": arrival_time.isoformat(),
                    "duration": f"{duration_hours}h {random.randint(0, 59)}m",
                    "price": round(random.uniform(200, 1500), 2),
                    "currency": "USD",
                    "stops": random.choice([0, 0, 0, 1, 1, 2]),
                    "cabin_class": "economy"
                })
            
            return_flights.sort(key=lambda x: x["price"])
            return {"outbound": flights, "return": return_flights}
        
        return flights
    
    async def search_multi_city(
        self,
        segments: List[Dict[str, Any]],
        passengers: int = 1,
        cabin_class: str = "economy"
    ) -> List[Dict[str, Any]]:
        """Search for multi-city flights"""
        # For multi-city, we'll search each segment and combine results
        # This is a simplified approach - production would need more sophisticated logic
        all_segments = []
        for segment in segments:
            flights = await self.search_flights(
                origin=segment["origin"],
                destination=segment["destination"],
                departure_date=segment["departure_date"],
                passengers=passengers,
                cabin_class=cabin_class
            )
            all_segments.append({
                "segment": segment,
                "flights": flights
            })
        return all_segments

