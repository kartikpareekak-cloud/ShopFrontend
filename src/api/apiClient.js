import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

api.interceptors.request.use(config => {
  // Check for both 'accessToken' (used by Redux) and 'token' (legacy)
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
