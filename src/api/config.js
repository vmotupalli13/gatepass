import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('gatepass_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap server error messages so the frontend sees the real error text
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
