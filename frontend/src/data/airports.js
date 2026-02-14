// Common airports database with city names and codes
// This is a subset of major airports - can be expanded
export const airports = [
  // US Airports
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
  { code: 'LAS', name: 'McCarran International', city: 'Las Vegas', country: 'USA' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
  { code: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', country: 'USA' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'USA' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis', country: 'USA' },
  { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'USA' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'USA' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'USA' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'USA' },
  { code: 'MDW', name: 'Chicago Midway International', city: 'Chicago', country: 'USA' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'USA' },
  { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International', city: 'Fort Lauderdale', country: 'USA' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington', country: 'USA' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'USA' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'USA' },
  
  // International Airports
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
  { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italy' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain' },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'UK' },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany' },
  { code: 'ZUR', name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland' },
  { code: 'CPH', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway' },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },
  
  // Asia
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India' },
  
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada' },
  
  // Australia
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia' },
  { code: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'Australia' },
  
  // Middle East
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  
  // Latin America
  { code: 'MEX', name: 'Benito Juárez International', city: 'Mexico City', country: 'Mexico' },
  { code: 'GRU', name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International', city: 'Rio de Janeiro', country: 'Brazil' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina' },
]

// Fuzzy search function
export const searchAirports = (query) => {
  if (!query || query.trim() === '') {
    return []
  }
  
  const searchTerm = query.toLowerCase().trim()
  
  return airports.filter(airport => {
    const codeMatch = airport.code.toLowerCase().includes(searchTerm)
    const cityMatch = airport.city.toLowerCase().includes(searchTerm)
    const nameMatch = airport.name.toLowerCase().includes(searchTerm)
    const countryMatch = airport.country.toLowerCase().includes(searchTerm)
    
    return codeMatch || cityMatch || nameMatch || countryMatch
  }).slice(0, 10) // Limit to 10 results
}

