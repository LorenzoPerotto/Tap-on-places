import axios from 'axios'

// Configurazione base - istanza axios unica
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: aggiunge token JWT a ogni richiesta
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor: gestione errori globali
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido → logout
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Non fare redirect qui, lo gestisce lo store
    }
    return Promise.reject(error)
  }
)

// --- API strutturate ---

const api = {
  // Autenticazione
  auth: {
    login(data) {
      return apiClient.post('/utenti/login', data)
    },
    register(data) {
      return apiClient.post('/utenti', data)
    },
    confirm(data) {
      return apiClient.post('/utenti/conferma', data)
    },
    getProfile() {
      return apiClient.get('/utenti/me')
    }
  },

  // Attività
  activities: {
    searchByName(nome) {
      return apiClient.get('/attivita', { params: { nome } })
    },
    getById(id) {
      return apiClient.get(`/attivita/${id}`)
    },
    save(id) {
      return apiClient.post(`/attivita/salva/${id}`)
    }
  },

  // Itinerari
  itineraries: {
    searchWithFilters(filters) {
      const params = {}
      if (filters.tipologia) params.tipologia = filters.tipologia
      if (filters.tempo) params.tempo = filters.tempo
      if (filters.budget) params.budget = filters.budget
      return apiClient.get('/itinerari', { params })
    },
    search(nome) {
      return apiClient.get('/itinerari/search', { params: { nome } })
    },
    getById(id) {
      return apiClient.get(`/itinerari/${id}`)
    },
    create(data) {
      return apiClient.post('/itinerari', data)
    },
    save(id) {
      return apiClient.post(`/itinerari/salva/${id}`)
    }
  },

  // Dashboard comunale (informazioni)
  dashboard: {
    getAll(specifiche) {
      const params = specifiche ? { specifiche } : {}
      return apiClient.get('/informazioni', { params })
    },
    getStats() {
      return apiClient.get('/informazioni/statistiche-globali')
    },
    getActivityInfo(id) {
      return apiClient.get(`/informazioni/attivita/${id}`)
    },
    getItineraryInfo(id) {
      return apiClient.get(`/informazioni/itinerario/${id}`)
    }
  },

  // POI (punti di interesse) - alias per attività con ricerca vuota
  poi: {
    getAll() {
      return apiClient.get('/attivita')
    }
  }
}

export default api
export { apiClient }