import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const toastStore = useToastStore()
    const authStore = useAuthStore()

    if (error.response?.status === 401) {
      authStore.logout()
      toastStore.error('Sessione scaduta. Effettua nuovamente il login.')
    } else if (error.response?.status === 403) {
      toastStore.error('Non hai i permessi per questa operazione')
    } else if (error.response?.status >= 500) {
      toastStore.error('Errore del server. Riprova più tardi.')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
