import React, { useState, useEffect } from 'react'
import { airfareAPI, tripsAPI } from '../api'
import './SearchHistory.css'

function SearchHistory() {
  const [searches, setSearches] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTrips()
    loadHistory()
  }, [selectedTrip])

  const loadTrips = async () => {
    try {
      const response = await tripsAPI.getAll()
      setTrips(response.data)
    } catch (err) {
      console.error('Failed to load trips')
    }
  }

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await airfareAPI.getHistory(selectedTrip || null)
      setSearches(response.data)
    } catch (err) {
      setError('Failed to load search history')
    } finally {
      setLoading(false)
    }
  }

  const renderFlightResults = (flights) => {
    if (!flights) return <p>No results</p>

    if (typeof flights === 'object' && flights.outbound) {
      return (
        <div>
          <p><strong>Outbound:</strong> {flights.outbound.length} flights</p>
          <p><strong>Return:</strong> {flights.return.length} flights</p>
        </div>
      )
    }

    if (Array.isArray(flights) && flights[0]?.segment) {
      return <p><strong>Segments:</strong> {flights.length}</p>
    }

    if (Array.isArray(flights)) {
      return <p><strong>Flights found:</strong> {flights.length}</p>
    }

    return <p>No results</p>
  }

  if (loading) return <div className="container"><div className="loading">Loading history...</div></div>

  return (
    <div className="container">
      <div className="card">
        <h2>Search History</h2>

        <div className="form-group">
          <label>Filter by Trip</label>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
          >
            <option value="">All Searches</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error">{error}</div>}

        {searches.length === 0 ? (
          <p>No search history yet. Start searching for flights!</p>
        ) : (
          <div>
            {searches.map((search) => (
              <div key={search.id} className="search-history-item">
                <div className="search-header">
                  <div>
                    <h3>{search.search_type.toUpperCase()} - {search.origin} → {search.destination}</h3>
                    <p>
                      {new Date(search.departure_date).toLocaleDateString()}
                      {search.return_date && ` - ${new Date(search.return_date).toLocaleDateString()}`}
                    </p>
                    <p>Passengers: {search.passengers}</p>
                  </div>
                  <div>
                    <p className="search-date">
                      {new Date(search.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {search.search_results && (
                  <div className="search-results-summary">
                    {renderFlightResults(search.search_results)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchHistory

