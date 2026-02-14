import httpx
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from app.config import settings


class AmadeusService:
    """
    Amadeus Flight Search API Service
    Uses Amadeus Self-Service API for flight search
    """
    def __init__(self):
        self.client_id = getattr(settings, 'amadeus_client_id', None)
        self.client_secret = getattr(settings, 'amadeus_client_secret', None)
        self.base_url = "https://test.api.amadeus.com"  # Use test API by default
        self.token_url = f"{self.base_url}/v1/security/oauth2/token"
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None
    
    async def _get_access_token(self) -> str:
        """Get or refresh Amadeus OAuth2 access token"""
        # Check if we have a valid token
        if self._access_token and self._token_expires_at:
            if datetime.now() < self._token_expires_at:
                return self._access_token
        
        if not self.client_id or not self.client_secret:
            # Return empty token - will use mock data
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.token_url,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": self.client_id,
                        "client_secret": self.client_secret
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                self._access_token = data.get("access_token")
                # Token expires in data.get("expires_in") seconds (usually 1799 = ~30 min)
                expires_in = data.get("expires_in", 1799)
                self._token_expires_at = datetime.now().timestamp() + expires_in - 60  # Refresh 1 min early
                return self._access_token
        except Exception as e:
            print(f"Amadeus token error: {e}")
            return None
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date] = None,
        passengers: int = 1,
        cabin_class: str = "ECONOMY"
    ) -> List[Dict[str, Any]]:
        """
        Search for flights using Amadeus API
        Returns list of flight options
        """
        token = await self._get_access_token()
        
        if not token:
            # Use mock data if no API credentials
            return self._get_mock_flights(origin, destination, departure_date, return_date)
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                if return_date:
                    # Return trip - use Flight Offers Search API
                    url = f"{self.base_url}/v2/shopping/flight-offers"
                    params = {
                        "originLocationCode": origin.upper(),
                        "destinationLocationCode": destination.upper(),
                        "departureDate": departure_date.strftime("%Y-%m-%d"),
                        "returnDate": return_date.strftime("%Y-%m-%d"),
                        "adults": passengers,
                        "max": 10  # Limit results
                    }
                    
                    response = await client.get(url, headers=headers, params=params, timeout=30.0)
                else:
                    # One-way trip
                    url = f"{self.base_url}/v2/shopping/flight-offers"
                    params = {
                        "originLocationCode": origin.upper(),
                        "destinationLocationCode": destination.upper(),
                        "departureDate": departure_date.strftime("%Y-%m-%d"),
                        "adults": passengers,
                        "max": 10
                    }
                    
                    response = await client.get(url, headers=headers, params=params, timeout=30.0)
                
                response.raise_for_status()
                data = response.json()
                
                # Parse Amadeus response into our format
                return self._parse_amadeus_response(data, return_date is not None)
        
        except httpx.HTTPError as e:
            print(f"Amadeus API error: {e}")
            # Fallback to mock data on API errors
            print("Using mock flight data (Amadeus API unavailable)")
            return self._get_mock_flights(origin, destination, departure_date, return_date)
        except Exception as e:
            print(f"Unexpected error in Amadeus service: {e}")
            # Fallback to mock data on any error
            print("Using mock flight data due to error")
            return self._get_mock_flights(origin, destination, departure_date, return_date)
    
    def _parse_amadeus_response(self, data: Dict[str, Any], is_return: bool = False) -> List[Dict[str, Any]]:
        """Parse Amadeus API response into our standard format"""
        flights = []
        
        if "data" not in data:
            return flights
        
        for offer in data["data"]:
            # Amadeus returns complex nested structure
            # Extract relevant information
            price = float(offer.get("price", {}).get("total", 0))
            currency = offer.get("price", {}).get("currency", "USD")
            
            # Get itinerary segments
            itineraries = offer.get("itineraries", [])
            
            for itinerary in itineraries:
                segments = itinerary.get("segments", [])
                if not segments:
                    continue
                
                first_segment = segments[0]
                last_segment = segments[-1]
                
                departure_time = datetime.fromisoformat(
                    first_segment.get("departure", {}).get("at", "").replace("Z", "+00:00")
                )
                arrival_time = datetime.fromisoformat(
                    last_segment.get("arrival", {}).get("at", "").replace("Z", "+00:00")
                )
                
                duration_str = itinerary.get("duration", "")
                stops = len(segments) - 1
                
                # Get airline from first segment
                carrier_code = first_segment.get("carrierCode", "")
                flight_number = first_segment.get("number", "")
                
                flights.append({
                    "airline": carrier_code,  # You might want to map this to airline name
                    "flight_number": f"{carrier_code}{flight_number}",
                    "origin": first_segment.get("departure", {}).get("iataCode", ""),
                    "destination": last_segment.get("arrival", {}).get("iataCode", ""),
                    "departure_time": departure_time.isoformat(),
                    "arrival_time": arrival_time.isoformat(),
                    "duration": duration_str,
                    "price": price,
                    "currency": currency,
                    "stops": stops,
                    "cabin_class": "economy"
                })
        
        # Sort by price
        flights.sort(key=lambda x: x["price"])
        
        if is_return and len(flights) > 0:
            # For return trips, split into outbound and return
            mid_point = len(flights) // 2
            return {
                "outbound": flights[:mid_point] if mid_point > 0 else flights,
                "return": flights[mid_point:] if mid_point < len(flights) else []
            }
        
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
                "stops": random.choice([0, 0, 0, 1, 1, 2]),
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
        cabin_class: str = "ECONOMY"
    ) -> List[Dict[str, Any]]:
        """Search for multi-city flights"""
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

