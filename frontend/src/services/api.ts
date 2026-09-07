import axios from "axios"

// Cliente axios único para toda la app. baseURL = origen pelón (VITE_API_URL)
// + "/api", igual que el env.json de Newman en el backend (baseUrl sin /api,
// cada request lo agrega).
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
})

// Placeholder: cuando exista AuthContext con login real, esto lee el token
// de ahí en vez de devolver null siempre.
function getToken(): string | null {
  return null
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
