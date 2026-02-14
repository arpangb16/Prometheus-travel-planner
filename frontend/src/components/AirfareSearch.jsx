import React, { useState, useEffect } from 'react'
import { airfareAPI, tripsAPI } from '../api'
import './AirfareSearch.css'

function AirfareSearch() {
  const [activeTab, setActiveTab] = useState('one-way')
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  // One-way form
  const [oneWayForm, setOneWayForm] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    passengers: 1,
    cabin_class: 'economy',
  })

  // Return form
  const [returnForm, setReturnForm] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers: 1,
    cabin_class: 'economy',
  })

  // Multi-city form
  const [multiCityForm, setMultiCityForm] = useState({
    segments: [{ origin: '', destination: '', departure_date: '' }],
    passengers: 1,
    cabin_class: 'economy',
  })

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await tripsAPI.getAll()
      setTrips(response.data)
    } catch (err) {
      console.error('Failed to load trips')
    }
  }

  const handleOneWaySearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await airfareAPI.searchOneWay(oneWayForm, selectedTrip || null)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await airfareAPI.searchReturn(returnForm, selectedTrip || null)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMultiCitySearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await airfareAPI.searchMultiCity(
        {
          segments: multiCityForm.segments,
          passengers: multiCityForm.passengers,
          cabin_class: multiCityForm.cabin_class,
        },
        selectedTrip || null
      )
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const addSegment = () => {
    setMultiCityForm({
      ...multiCityForm,
      segments: [...multiCityForm.segments, { origin: '', destination: '', departure_date: '' }],
    })
  }

  const removeSegment = (index) => {
    if (multiCityForm.segments.length > 1) {
      setMultiCityForm({
        ...multiCityForm,
        segments: multiCityForm.segments.filter((_, i) => i !== index),
      })
    }
  }

  const updateSegment = (index, field, value) => {
    const newSegments = [...multiCityForm.segments]
    newSegments[index][field] = value
    setMultiCityForm({ ...multiCityForm, segments: newSegments })
  }

  const renderFlightResults = (flights) => {
    if (!flights || (Array.isArray(flights) && flights.length === 0)) {
      return <p>No flights found</p>
    }

    if (typeof flights === 'object' && flights.outbound) {
      // Return trip
      return (
        <div>
          <h3>Outbound Flights</h3>
          {renderFlightList(flights.outbound)}
          <h3 style={{ marginTop: '2rem' }}>Return Flights</h3>
          {renderFlightList(flights.return)}
        </div>
      )
    }

    if (Array.isArray(flights) && flights[0]?.segment) {
      // Multi-city
      return flights.map((segmentData, idx) => (
        <div key={idx} style={{ marginBottom: '2rem' }}>
          <h3>Segment {idx + 1}: {segmentData.segment.origin} → {segmentData.segment.destination}</h3>
          {renderFlightList(segmentData.flights)}
        </div>
      ))
    }

    return renderFlightList(flights)
  }

  const renderFlightList = (flights) => {
    if (!flights || flights.length === 0) return <p>No flights found</p>

    return (
      <div className="flight-results">
        {flights.map((flight, idx) => (
          <div key={idx} className="flight-card">
            <div className="flight-header">
              <div>
                <div className="segment-value">{flight.airline}</div>
                <div className="segment-label">{flight.flight_number}</div>
              </div>
              <div className="flight-price">
                ${flight.price} {flight.currency}
              </div>
            </div>
            <div className="flight-details">
              <div className="flight-segment">
                <span className="segment-label">From</span>
                <span className="segment-value">{flight.origin}</span>
              </div>
              <div className="flight-segment">
                <span className="segment-label">To</span>
                <span className="segment-value">{flight.destination}</span>
              </div>
              <div className="flight-segment">
                <span className="segment-label">Departure</span>
                <span className="segment-value">
                  {new Date(flight.departure_time).toLocaleString()}
                </span>
              </div>
              <div className="flight-segment">
                <span className="segment-label">Arrival</span>
                <span className="segment-value">
                  {new Date(flight.arrival_time).toLocaleString()}
                </span>
              </div>
              <div className="flight-segment">
                <span className="segment-label">Duration</span>
                <span className="segment-value">{flight.duration}</span>
              </div>
              <div className="flight-segment">
                <span className="segment-label">Stops</span>
                <span className="segment-value">
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Search Flights</h2>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'one-way' ? 'active' : ''}`}
            onClick={() => setActiveTab('one-way')}
          >
            One-Way
          </button>
          <button
            className={`tab ${activeTab === 'return' ? 'active' : ''}`}
            onClick={() => setActiveTab('return')}
          >
            Return
          </button>
          <button
            className={`tab ${activeTab === 'multi-city' ? 'active' : ''}`}
            onClick={() => setActiveTab('multi-city')}
          >
            Multi-City
          </button>
        </div>

        <div className="form-group">
          <label>Associate with Trip (Optional)</label>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
          >
            <option value="">None</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error">{error}</div>}

        {activeTab === 'one-way' && (
          <form onSubmit={handleOneWaySearch}>
            <div className="form-group">
              <label>Origin (Airport Code or City)</label>
              <input
                type="text"
                value={oneWayForm.origin}
                onChange={(e) => setOneWayForm({ ...oneWayForm, origin: e.target.value })}
                placeholder="e.g., JFK or New York"
                required
              />
            </div>
            <div className="form-group">
              <label>Destination (Airport Code or City)</label>
              <input
                type="text"
                value={oneWayForm.destination}
                onChange={(e) => setOneWayForm({ ...oneWayForm, destination: e.target.value })}
                placeholder="e.g., LAX or Los Angeles"
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Date</label>
              <input
                type="date"
                value={oneWayForm.departure_date}
                onChange={(e) => setOneWayForm({ ...oneWayForm, departure_date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Passengers</label>
              <input
                type="number"
                value={oneWayForm.passengers}
                onChange={(e) => setOneWayForm({ ...oneWayForm, passengers: parseInt(e.target.value) })}
                min="1"
                max="9"
                required
              />
            </div>
            <div className="form-group">
              <label>Cabin Class</label>
              <select
                value={oneWayForm.cabin_class}
                onChange={(e) => setOneWayForm({ ...oneWayForm, cabin_class: e.target.value })}
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        )}

        {activeTab === 'return' && (
          <form onSubmit={handleReturnSearch}>
            <div className="form-group">
              <label>Origin (Airport Code or City)</label>
              <input
                type="text"
                value={returnForm.origin}
                onChange={(e) => setReturnForm({ ...returnForm, origin: e.target.value })}
                placeholder="e.g., JFK or New York"
                required
              />
            </div>
            <div className="form-group">
              <label>Destination (Airport Code or City)</label>
              <input
                type="text"
                value={returnForm.destination}
                onChange={(e) => setReturnForm({ ...returnForm, destination: e.target.value })}
                placeholder="e.g., LAX or Los Angeles"
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Date</label>
              <input
                type="date"
                value={returnForm.departure_date}
                onChange={(e) => setReturnForm({ ...returnForm, departure_date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Return Date</label>
              <input
                type="date"
                value={returnForm.return_date}
                onChange={(e) => setReturnForm({ ...returnForm, return_date: e.target.value })}
                required
                min={returnForm.departure_date || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Passengers</label>
              <input
                type="number"
                value={returnForm.passengers}
                onChange={(e) => setReturnForm({ ...returnForm, passengers: parseInt(e.target.value) })}
                min="1"
                max="9"
                required
              />
            </div>
            <div className="form-group">
              <label>Cabin Class</label>
              <select
                value={returnForm.cabin_class}
                onChange={(e) => setReturnForm({ ...returnForm, cabin_class: e.target.value })}
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        )}

        {activeTab === 'multi-city' && (
          <form onSubmit={handleMultiCitySearch}>
            {multiCityForm.segments.map((segment, index) => (
              <div key={index} className="segment-form">
                <h4>Segment {index + 1}</h4>
                <div className="segment-form-row">
                  <div className="form-group">
                    <label>Origin</label>
                    <input
                      type="text"
                      value={segment.origin}
                      onChange={(e) => updateSegment(index, 'origin', e.target.value)}
                      placeholder="e.g., JFK"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <input
                      type="text"
                      value={segment.destination}
                      onChange={(e) => updateSegment(index, 'destination', e.target.value)}
                      placeholder="e.g., LAX"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Departure Date</label>
                    <input
                      type="date"
                      value={segment.departure_date}
                      onChange={(e) => updateSegment(index, 'departure_date', e.target.value)}
                      required
                      min={index > 0 ? multiCityForm.segments[index - 1].departure_date : new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                {multiCityForm.segments.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeSegment(index)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove Segment
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addSegment} style={{ marginBottom: '1rem' }}>
              + Add Segment
            </button>
            <div className="form-group">
              <label>Passengers</label>
              <input
                type="number"
                value={multiCityForm.passengers}
                onChange={(e) => setMultiCityForm({ ...multiCityForm, passengers: parseInt(e.target.value) })}
                min="1"
                max="9"
                required
              />
            </div>
            <div className="form-group">
              <label>Cabin Class</label>
              <select
                value={multiCityForm.cabin_class}
                onChange={(e) => setMultiCityForm({ ...multiCityForm, cabin_class: e.target.value })}
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        )}

        {results && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Search Results</h3>
            {renderFlightResults(results.search_results)}
          </div>
        )}
      </div>
    </div>
  )
}

export default AirfareSearch

