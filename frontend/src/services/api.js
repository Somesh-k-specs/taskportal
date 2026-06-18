import axios from 'axios'

const api = axios.create({
   baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskportal_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskportal_token')
      localStorage.removeItem('taskportal_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────
export const taskApi = {
  getAll:    (status) => api.get('/tasks', { params: status ? { status } : {} }),
  getById:   (id)     => api.get(`/tasks/${id}`),
  create:    (data)   => api.post('/tasks', data),
  update:    (id, data) => api.put(`/tasks/${id}`, data),
  delete:    (id)     => api.delete(`/tasks/${id}`),
}

// ─── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  getSuggestions:      () => api.get('/ai/suggestions'),
  generateDescription: (title) => api.post('/ai/generate-description', { title }),
}

export default api
