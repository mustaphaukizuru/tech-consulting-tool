import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Projects ──────────────────────────────────────
export const projectAPI = {
  getAll:    ()       => api.get('/projects'),
  getById:   (id)     => api.get(`/projects/${id}`),
  create:    (data)   => api.post('/projects', data),
  update:    (id, d)  => api.put(`/projects/${id}`, d),
  delete:    (id)     => api.delete(`/projects/${id}`),
  byClient:  (id)     => api.get(`/projects/client/${id}`),
}

export default api
