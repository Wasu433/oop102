import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export const register = (name, username, email, password) =>
  client.post('/auth/register', { name, username, email, password })

export const login = (loginId, password) =>
  client.post('/auth/login', { login: loginId, password })

export const getRateLimit = (apiKey) =>
  client.get('/rate-limit', { headers: { 'X-API-Key': apiKey } })

export const createApiKey = (userId, name) =>
  client.post('/keys', { user_id: userId, name })

export const getUserKeys = (userId) =>
  client.get('/keys', { params: { user_id: userId } })

export const getCars = (apiKey, params = {}) =>
  client.get('/cars', { headers: { 'X-API-Key': apiKey }, params })

// ── localStorage helpers ──

export const saveSession = (user) =>
  localStorage.setItem('carapi_user', JSON.stringify(user))

export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem('carapi_user'))
  } catch {
    return null
  }
}

export const clearSession = () =>
  localStorage.removeItem('carapi_user')

export const saveUserKeys = (userId, keys) =>
  localStorage.setItem(`carapi_keys_${userId}`, JSON.stringify(keys))

export const loadUserKeys = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`carapi_keys_${userId}`)) || []
  } catch {
    return []
  }
}

export const saveLikes = (userId, carIds) =>
  localStorage.setItem(`carapi_likes_${userId}`, JSON.stringify(carIds))

export const loadLikes = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`carapi_likes_${userId}`)) || []
  } catch {
    return []
  }
}
