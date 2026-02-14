import httpx
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from app.config import settings
from app.services.airline_codes import get_airline_name


class AmadeusService:
    """
    Amadeus Flight Search API Service
    Uses Amadeus Self-Service API for flight search
    """
    def __init__(self):
        self.client_id = getattr(settings, 'amadeus_client_id', None)
        self.client_secret = getattr(settings, 'amadeus_client_secret', None)
        self.base_url = "https://test.api.amadeus.com"  # Test API URL
        self.token_url = f"{self.base_url}/v1/security/oauth2/token"
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[float] = None  # Store as timestamp
    
    async def _get_access_token(self) -> str:
        """Get or refresh Amadeus OAuth2 access token"""
        # Check if we have a valid token
        if self._access_token and self._token_expires_at:
            current_time = datetime.now().timestamp()
            if current_time < self._token_expires_at:
                return self._access_token
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Amadeus API credentials are required. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env file")
        
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
                if not self._access_token:
                    raise ValueError("Failed to obtain access token from Amadeus API")
                # Token expires in data.get("expires_in") seconds (usually 1799 = ~30 min)
                expires_in = data.get("expires_in", 1799)
                self._token_expires_at = datetime.now().timestamp() + expires_in - 60  # Refresh 1 min early
                return self._access_token
        except httpx.HTTPStatusError as e:
            error_msg = f"Amadeus API authentication failed: {e.response.status_code}"
            try:
                error_data = e.response.json()
                if "error_description" in error_data:
                    error_msg += f" - {error_data['error_description']}"
            except:
                error_msg += f" - {e.response.text}"
            raise ValueError(error_msg) from e
        except httpx.RequestError as e:
            raise ValueError(f"Failed to connect to Amadeus API at {self.token_url}: {str(e)}") from e
        except Exception as e:
            raise ValueError(f"Amadeus API error: {str(e)}") from e
    
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
        Raises ValueError if API connection fails
        """
        token = await self._get_access_token()
        
        if not token:
            raise ValueError("Failed to obtain Amadeus API access token")
        
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
                
                # Debug: Check response structure
                if "data" not in data or not data.get("data"):
                    error_detail = data.get("errors", [])
                    if error_detail:
                        error_msg = "; ".join([err.get("detail", str(err)) for err in error_detail])
                        raise ValueError(f"Amadeus API returned no flight data: {error_msg}")
                    raise ValueError(f"No flight data in response. Response keys: {list(data.keys())}")
                
                # Parse Amadeus response into our format
                flights = self._parse_amadeus_response(data, return_date is not None)
                
                if not flights or (isinstance(flights, list) and len(flights) == 0):
                    raise ValueError("No flights found for the given search criteria")
                
                return flights
        
        except httpx.HTTPStatusError as e:
            error_msg = f"Amadeus API request failed: {e.response.status_code}"
            try:
                error_data = e.response.json()
                if "errors" in error_data:
                    error_details = "; ".join([err.get("detail", "") for err in error_data["errors"]])
                    error_msg += f" - {error_details}"
                elif "error_description" in error_data:
                    error_msg += f" - {error_data['error_description']}"
            except:
                error_msg += f" - {e.response.text}"
            raise ValueError(error_msg) from e
        except httpx.RequestError as e:
            raise ValueError(f"Failed to connect to Amadeus API at {self.base_url}: {str(e)}") from e
        except ValueError:
            # Re-raise ValueError (from parsing or validation)
            raise
        except Exception as e:
            raise ValueError(f"Unexpected error in Amadeus flight search: {str(e)}") from e
    
    def _parse_amadeus_response(self, data: Dict[str, Any], is_return: bool = False) -> List[Dict[str, Any]]:
        """Parse Amadeus API response into our standard format"""
        flights = []
        outbound_flights = []
        return_flights = []
        
        if "data" not in data:
            return flights if not is_return else {"outbound": [], "return": []}
        
        for offer in data["data"]:
            # Amadeus returns complex nested structure
            # Extract relevant information
            price = float(offer.get("price", {}).get("total", 0))
            currency = offer.get("price", {}).get("currency", "USD")
            
            # Get itinerary segments - for return flights, there are typically 2 itineraries
            itineraries = offer.get("itineraries", [])
            
            if is_return:
                # For return flights, first itinerary is outbound, second is return
                for idx, itinerary in enumerate(itineraries):
                    segments = itinerary.get("segments", [])
                    if not segments:
                        continue
                    
                    first_segment = segments[0]
                    last_segment = segments[-1]
                    
                    try:
                        departure_time = datetime.fromisoformat(
                            first_segment.get("departure", {}).get("at", "").replace("Z", "+00:00")
                        )
                        arrival_time = datetime.fromisoformat(
                            last_segment.get("arrival", {}).get("at", "").replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError) as e:
                        # Skip invalid date formats
                        continue
                    
                    duration_str = itinerary.get("duration", "")
                    stops = len(segments) - 1
                    
                    # Get airline from first segment
                    carrier_code = first_segment.get("carrierCode", "")
                    flight_number = first_segment.get("number", "")
                    airline_name = get_airline_name(carrier_code)
                    
                    flight_data = {
                        "airline": carrier_code,
                        "airline_name": airline_name,
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
                    }
                    
                    if idx == 0:
                        outbound_flights.append(flight_data)
                    else:
                        return_flights.append(flight_data)
            else:
                # One-way flight - process first itinerary only
                if itineraries:
                    itinerary = itineraries[0]
                    segments = itinerary.get("segments", [])
                    if not segments:
                        continue
                    
                    first_segment = segments[0]
                    last_segment = segments[-1]
                    
                    try:
                        departure_time = datetime.fromisoformat(
                            first_segment.get("departure", {}).get("at", "").replace("Z", "+00:00")
                        )
                        arrival_time = datetime.fromisoformat(
                            last_segment.get("arrival", {}).get("at", "").replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError) as e:
                        # Skip invalid date formats
                        continue
                    
                    duration_str = itinerary.get("duration", "")
                    stops = len(segments) - 1
                    
                    # Get airline from first segment
                    carrier_code = first_segment.get("carrierCode", "")
                    flight_number = first_segment.get("number", "")
                    airline_name = get_airline_name(carrier_code)
                    
                    flights.append({
                        "airline": carrier_code,
                        "airline_name": airline_name,
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
        
        if is_return:
            # Sort by price and return structured format
            outbound_flights.sort(key=lambda x: x["price"])
            return_flights.sort(key=lambda x: x["price"])
            return {
                "outbound": outbound_flights,
                "return": return_flights
            }
        
        flights.sort(key=lambda x: x["price"])
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

