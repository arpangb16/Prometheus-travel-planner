import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import TripList from './components/TripList'
import AirfareSearch from './components/AirfareSearch'
import SearchHistory from './components/SearchHistory'
import './App.css'

function App() {
  // Authentication disabled - always show app
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>✈️ Prometheus Travel Planner</h1>
        </header>

        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/trips"
            element={<TripList />}
          />
          <Route
            path="/search"
            element={<AirfareSearch />}
          />
          <Route
            path="/history"
            element={<SearchHistory />}
          />
          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App

