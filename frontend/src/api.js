import axios from 'axios'

// Use relative path to leverage Vite proxy in development
// This avoids CORS issues since requests go through the same origin
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use relative paths in development (Vite proxy will handle it)
  : 'http://127.0.0.1:8000' // Direct URL in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add error interceptor for better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error)
      return Promise.reject(new Error('Request timeout. Please try again.'))
    }
    if (error.message === 'Network Error') {
      console.error('Network error:', error)
      return Promise.reject(new Error('Cannot connect to server. Make sure the backend is running on http://localhost:8000'))
    }
    return Promise.reject(error)
  }
)

// Authentication disabled - no token needed
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    return api.post('/auth/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  getMe: () => api.get('/auth/me'),
}

// Trips API
export const tripsAPI = {
  create: (tripData) => api.post('/trips', tripData),
  getAll: () => api.get('/trips'),
  getOne: (tripId) => api.get(`/trips/${tripId}`),
  delete: (tripId) => api.delete(`/trips/${tripId}`),
}

// Airfare API
export const airfareAPI = {
  searchOneWay: (searchData, tripId = null) =>
    api.post('/airfare/search/one-way', searchData, {
      params: tripId ? { trip_id: tripId } : {},
    }),
  searchReturn: (searchData, tripId = null) =>
    api.post('/airfare/search/return', searchData, {
      params: tripId ? { trip_id: tripId } : {},
    }),
  searchMultiCity: (searchData, tripId = null) =>
    api.post('/airfare/search/multi-city', searchData, {
      params: tripId ? { trip_id: tripId } : {},
    }),
  getHistory: (tripId = null) =>
    api.get('/airfare/searches', {
      params: tripId ? { trip_id: tripId } : {},
    }),
  getSearch: (searchId) => api.get(`/airfare/searches/${searchId}`),
}

export default api

