import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use(config => {
  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
  if (csrfCookie) {
    const token = csrfCookie.split('=')[1]
    config.headers['X-CSRFToken'] = token
  }
  return config
})

export default api
