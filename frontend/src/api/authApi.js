import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export const register = (name, username, email, password) =>
  client.post('/auth/register', { name, username, email, password })

export const login = (loginId, password) =>
  client.post('/auth/login', { login: loginId, password })

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
