import React, { useState, useRef, useEffect } from 'react'
import { searchAirports } from '../data/airports'
import './AirportAutocomplete.css'

function AirportAutocomplete({ value, onChange, placeholder, label, required }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAirport, setSelectedAirport] = useState(null)
  const wrapperRef = useRef(null)

  // Initialize with value if provided (airport code)
  useEffect(() => {
    if (value) {
      const airport = searchAirports(value).find(a => a.code === value)
      if (airport) {
        setSelectedAirport(airport)
        setQuery(`${airport.code} - ${airport.city}`)
      } else {
        setQuery(value)
      }
    }
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const inputValue = e.target.value
    setQuery(inputValue)
    setSelectedAirport(null)

    if (inputValue.length >= 1) {
      const results = searchAirports(inputValue)
      setSuggestions(results)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    // If user clears the input, clear the value
    if (inputValue === '') {
      onChange('')
    }
  }

  const handleSelect = (airport) => {
    setSelectedAirport(airport)
    setQuery(`${airport.code} - ${airport.city}`)
    setSuggestions([])
    setShowSuggestions(false)
    onChange(airport.code) // Send airport code to parent
  }

  const handleFocus = () => {
    if (query.length >= 1 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Enter' && suggestions.length > 0 && showSuggestions) {
      e.preventDefault()
      handleSelect(suggestions[0])
    }
  }

  return (
    <div className="airport-autocomplete" ref={wrapperRef}>
      <label>{label}</label>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Enter city or airport code"}
        required={required}
        className="airport-input"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="airport-suggestions">
          {suggestions.map((airport, index) => (
            <li
              key={`${airport.code}-${index}`}
              onClick={() => handleSelect(airport)}
              className="airport-suggestion-item"
            >
              <div className="airport-code">{airport.code}</div>
              <div className="airport-details">
                <div className="airport-city">{airport.city}</div>
                <div className="airport-name">{airport.name}</div>
              </div>
              <div className="airport-country">{airport.country}</div>
            </li>
          ))}
        </ul>
      )}
      {showSuggestions && query.length >= 1 && suggestions.length === 0 && (
        <ul className="airport-suggestions">
          <li className="airport-suggestion-item no-results">No airports found</li>
        </ul>
      )}
    </div>
  )
}

export default AirportAutocomplete

