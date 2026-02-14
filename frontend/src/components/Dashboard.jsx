import React from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="container">
      <div className="card">
        <h2>Welcome to Prometheus Travel Planner</h2>
        <p>Plan your trips, search for flights, and manage your travel bookings all in one place.</p>
        
        <div className="dashboard-grid">
          <Link to="/trips" className="dashboard-card">
            <h3>📋 My Trips</h3>
            <p>View and manage your trips</p>
          </Link>
          
          <Link to="/search" className="dashboard-card">
            <h3>✈️ Search Flights</h3>
            <p>Find the best flight deals</p>
          </Link>
          
          <Link to="/history" className="dashboard-card">
            <h3>📊 Search History</h3>
            <p>View your previous searches</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

