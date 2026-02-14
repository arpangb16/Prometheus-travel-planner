import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { airfareAPI, tripsAPI } from '../api'
import AirportAutocomplete from './AirportAutocomplete'
import './AirfareSearch.css'

function AirfareSearch() {
  const [activeTab, setActiveTab] = useState('one-way')
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [dateErrors, setDateErrors] = useState({})

  // One-way form
  const [oneWayForm, setOneWayForm] = useState({
    origin: '',
    destination: '',
    departure_date: null, // Date object for DatePicker
    passengers: 1,
    cabin_class: 'economy',
  })

  // Return form
  const [returnForm, setReturnForm] = useState({
    origin: '',
    destination: '',
    departure_date: null, // Date object for DatePicker
    return_date: null, // Date object for DatePicker
    passengers: 1,
    cabin_class: 'economy',
  })

  // Multi-city form
  const [multiCityForm, setMultiCityForm] = useState({
    segments: [{ origin: '', destination: '', departure_date: null }], // Date objects
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
    setError('')
    setResults(null)
    
    // Validate dates before submitting
    if (!validateFormDates('one-way')) {
      return
    }

    // Convert date to YYYY-MM-DD format
    const searchData = {
      ...oneWayForm,
      departure_date: oneWayForm.departure_date 
        ? oneWayForm.departure_date.toISOString().split('T')[0]
        : ''
    }

    setLoading(true)

    try {
      console.log('Submitting search with data:', searchData)
      const response = await airfareAPI.searchOneWay(searchData, selectedTrip || null)
      setResults(response.data)
    } catch (err) {
      console.error('Search error:', err)
      let errorMessage = 'Search failed'
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnSearch = async (e) => {
    e.preventDefault()
    setError('')
    setResults(null)
    
    // Validate dates before submitting
    if (!validateFormDates('return')) {
      return
    }

    // Convert dates to YYYY-MM-DD format
    const searchData = {
      ...returnForm,
      departure_date: returnForm.departure_date 
        ? returnForm.departure_date.toISOString().split('T')[0]
        : '',
      return_date: returnForm.return_date 
        ? returnForm.return_date.toISOString().split('T')[0]
        : ''
    }

    setLoading(true)

    try {
      console.log('Submitting search with data:', searchData)
      const response = await airfareAPI.searchReturn(searchData, selectedTrip || null)
      setResults(response.data)
    } catch (err) {
      console.error('Search error:', err)
      let errorMessage = 'Search failed'
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMultiCitySearch = async (e) => {
    e.preventDefault()
    setError('')
    setResults(null)
    
    // Validate dates before submitting
    if (!validateFormDates('multi-city')) {
      return
    }

    // Convert dates to YYYY-MM-DD format
    const searchData = {
      segments: multiCityForm.segments.map(seg => ({
        ...seg,
        departure_date: seg.departure_date 
          ? seg.departure_date.toISOString().split('T')[0]
          : ''
      })),
      passengers: multiCityForm.passengers,
      cabin_class: multiCityForm.cabin_class,
    }

    setLoading(true)

    try {
      console.log('Submitting search with data:', searchData)
      const response = await airfareAPI.searchMultiCity(searchData, selectedTrip || null)
      setResults(response.data)
    } catch (err) {
      console.error('Search error:', err)
      let errorMessage = 'Search failed'
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addSegment = () => {
    setMultiCityForm({
      ...multiCityForm,
      segments: [...multiCityForm.segments, { origin: '', destination: '', departure_date: null }],
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
    
    // Clear date errors when user updates
    if (field === 'departure_date') {
      setDateErrors({ ...dateErrors, [`multi-city-${index}`]: '' })
    }
    
    // Clear origin/destination errors when user updates
    if (field === 'origin' || field === 'destination') {
      setDateErrors({ ...dateErrors, [`multi-city-${index}`]: '' })
    }
  }

  // Validate date (Date object or string)
  const validateDate = (dateValue, fieldName) => {
    if (!dateValue) {
      return 'Date is required'
    }
    
    let date
    if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === 'string') {
      // Check if it matches YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dateValue)) {
        return 'Date must be in YYYY-MM-DD format (e.g., 2026-02-20)'
      }
      date = new Date(dateValue)
    } else {
      return 'Invalid date format'
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    // Check if date is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      return 'Date must be today or in the future'
    }
    
    return null
  }

  // Validate all dates before submission
  const validateFormDates = (formType) => {
    const errors = {}
    let hasErrors = false

    if (formType === 'one-way') {
      const error = validateDate(oneWayForm.departure_date, 'departure_date')
      if (error) {
        errors['one-way-departure'] = error
        hasErrors = true
      }
    } else if (formType === 'return') {
      const depError = validateDate(returnForm.departure_date, 'departure_date')
      if (depError) {
        errors['return-departure'] = depError
        hasErrors = true
      }
      
      const retError = validateDate(returnForm.return_date, 'return_date')
      if (retError) {
        errors['return-return'] = retError
        hasErrors = true
      }
      
      // Check return date is after departure date
      if (!depError && !retError && returnForm.departure_date && returnForm.return_date) {
        const depDate = returnForm.departure_date instanceof Date 
          ? returnForm.departure_date 
          : new Date(returnForm.departure_date)
        const retDate = returnForm.return_date instanceof Date 
          ? returnForm.return_date 
          : new Date(returnForm.return_date)
        if (retDate <= depDate) {
          errors['return-return'] = 'Return date must be after departure date'
          hasErrors = true
        }
      }
    } else if (formType === 'multi-city') {
      multiCityForm.segments.forEach((segment, index) => {
        const error = validateDate(segment.departure_date, `segment-${index}`)
        if (error) {
          errors[`multi-city-${index}`] = error
          hasErrors = true
        }
        
        // Check each segment date is after previous segment
        if (index > 0 && !error) {
          const prevDateValue = multiCityForm.segments[index - 1].departure_date
          const currDateValue = segment.departure_date
          const prevDate = prevDateValue instanceof Date 
            ? prevDateValue 
            : new Date(prevDateValue)
          const currDate = currDateValue instanceof Date 
            ? currDateValue 
            : new Date(currDateValue)
          if (currDate <= prevDate) {
            errors[`multi-city-${index}`] = 'Date must be after previous segment date'
            hasErrors = true
          }
        }
      })
    }

    setDateErrors(errors)
    return !hasErrors
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
                <div className="segment-value">{flight.airline_name || flight.airline}</div>
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
              <AirportAutocomplete
                label="Origin"
                value={oneWayForm.origin}
                onChange={(code) => setOneWayForm({ ...oneWayForm, origin: code })}
                placeholder="Enter city or airport code (e.g., New York or JFK)"
                required
              />
            </div>
            <div className="form-group">
              <AirportAutocomplete
                label="Destination"
                value={oneWayForm.destination}
                onChange={(code) => setOneWayForm({ ...oneWayForm, destination: code })}
                placeholder="Enter city or airport code (e.g., Los Angeles or LAX)"
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Date</label>
              <DatePicker
                selected={oneWayForm.departure_date}
                onChange={(date) => {
                  setOneWayForm({ ...oneWayForm, departure_date: date })
                  setDateErrors({ ...dateErrors, 'one-way-departure': '' })
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select departure date"
                className="date-picker-input"
                required
              />
              {dateErrors['one-way-departure'] && (
                <div className="date-error">{dateErrors['one-way-departure']}</div>
              )}
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
              <AirportAutocomplete
                label="Origin"
                value={returnForm.origin}
                onChange={(code) => setReturnForm({ ...returnForm, origin: code })}
                placeholder="Enter city or airport code (e.g., New York or JFK)"
                required
              />
            </div>
            <div className="form-group">
              <AirportAutocomplete
                label="Destination"
                value={returnForm.destination}
                onChange={(code) => setReturnForm({ ...returnForm, destination: code })}
                placeholder="Enter city or airport code (e.g., Los Angeles or LAX)"
                required
              />
            </div>
            <div className="form-group">
              <label>Departure Date</label>
              <DatePicker
                selected={returnForm.departure_date}
                onChange={(date) => {
                  setReturnForm({ ...returnForm, departure_date: date })
                  setDateErrors({ ...dateErrors, 'return-departure': '' })
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select departure date"
                className="date-picker-input"
                required
              />
              {dateErrors['return-departure'] && (
                <div className="date-error">{dateErrors['return-departure']}</div>
              )}
            </div>
            <div className="form-group">
              <label>Return Date</label>
              <DatePicker
                selected={returnForm.return_date}
                onChange={(date) => {
                  setReturnForm({ ...returnForm, return_date: date })
                  setDateErrors({ ...dateErrors, 'return-return': '' })
                }}
                minDate={returnForm.departure_date || new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select return date"
                className="date-picker-input"
                required
              />
              {dateErrors['return-return'] && (
                <div className="date-error">{dateErrors['return-return']}</div>
              )}
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
                    <AirportAutocomplete
                      label="Origin"
                      value={segment.origin}
                      onChange={(code) => updateSegment(index, 'origin', code)}
                      placeholder="Enter city or airport code"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <AirportAutocomplete
                      label="Destination"
                      value={segment.destination}
                      onChange={(code) => updateSegment(index, 'destination', code)}
                      placeholder="Enter city or airport code"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Departure Date</label>
                    <DatePicker
                      selected={segment.departure_date}
                      onChange={(date) => {
                        updateSegment(index, 'departure_date', date)
                        setDateErrors({ ...dateErrors, [`multi-city-${index}`]: '' })
                      }}
                      minDate={index > 0 && multiCityForm.segments[index - 1].departure_date 
                        ? multiCityForm.segments[index - 1].departure_date 
                        : new Date()}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select departure date"
                      className="date-picker-input"
                      required
                    />
                    {dateErrors[`multi-city-${index}`] && (
                      <div className="date-error">{dateErrors[`multi-city-${index}`]}</div>
                    )}
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

