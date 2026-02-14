import React, { useState, useEffect } from 'react'
import { tripsAPI } from '../api'
import './TripList.css'

function TripList() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [tripName, setTripName] = useState('')

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await tripsAPI.getAll()
      setTrips(response.data)
    } catch (err) {
      setError('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrip = async (e) => {
    e.preventDefault()
    try {
      await tripsAPI.create({ name: tripName })
      setTripName('')
      setShowForm(false)
      loadTrips()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create trip')
    }
  }

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return
    
    try {
      await tripsAPI.delete(tripId)
      loadTrips()
    } catch (err) {
      setError('Failed to delete trip')
    }
  }

  if (loading) return <div className="container"><div className="loading">Loading trips...</div></div>

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Trips</h2>
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Trip'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreateTrip} style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div className="form-group">
              <label>Trip Name</label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g., Summer Vacation 2024"
                required
              />
            </div>
            <button type="submit" className="btn">Create Trip</button>
          </form>
        )}

        {trips.length === 0 ? (
          <p>No trips yet. Create your first trip!</p>
        ) : (
          <div className="trip-list">
            {trips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <h3>{trip.name}</h3>
                <p>Created: {new Date(trip.created_at).toLocaleDateString()}</p>
                <button
                  className="btn btn-danger"
                  style={{ marginTop: '1rem' }}
                  onClick={() => handleDeleteTrip(trip.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TripList

