import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // Stato per la registrazione con conferma
  const awaitingConfirmation = ref(false)
  const pendingEmail = ref(null)
  const pendingCodice = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.isComunale === true)
  const userFullName = computed(() => user.value ? `${user.value.nome} ${user.value.cognome}` : '')
  const userEmail = computed(() => user.value?.email || '')
  const userNickname = computed(() => user.value?.nickname || '')

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = null
    user.value = null
    awaitingConfirmation.value = false
    pendingEmail.value = null
    pendingCodice.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function login(credentials) {
    try {
      const response = await api.auth.login(credentials)
      const { token: newToken, user: newUser } = response.data
      setAuth(newToken, newUser)
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Errore durante il login'
      }
    }
  }

  async function register(data) {
    try {
      const response = await api.auth.register(data)
      awaitingConfirmation.value = true
      pendingEmail.value = data.email
      pendingCodice.value = response.data.codiceConferma || null
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Errore durante la registrazione'
      }
    }
  }

  async function confirmRegistration(email, codice) {
    try {
      const response = await api.auth.confirm({ email, codice: Number(codice) })
      awaitingConfirmation.value = false
      pendingEmail.value = null
      pendingCodice.value = null
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Codice non valido'
      }
    }
  }

  async function checkAuth() {
    if (!token.value) return false

    try {
      const response = await api.auth.getProfile()
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    token,
    user,
    awaitingConfirmation,
    pendingEmail,
    pendingCodice,
    isAuthenticated,
    isAdmin,
    userFullName,
    userEmail,
    userNickname,
    setAuth,
    logout,
    login,
    register,
    confirmRegistration,
    checkAuth
  }
})
