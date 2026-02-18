<template>
  <div class="hero-background">
    <AppHeader title="Registrazione" />

    <main class="auth-container">
      <div class="auth-box">
        <h1>Registrazione</h1>

        <!-- Form registrazione se non in attesa di conferma -->
        <form v-if="!authStore.awaitingConfirmation" @submit.prevent="handleRegister">
          <div class="form-row">
            <div class="form-group">
              <label for="nome">Nome *</label>
              <input 
                type="text" 
                id="nome" 
                v-model="formData.nome" 
                :class="{ 'error': errors.nome }"
                placeholder="Nome" 
                required
              >
              <span v-if="errors.nome" class="error-message">{{ errors.nome }}</span>
            </div>
            <div class="form-group">
              <label for="cognome">Cognome *</label>
              <input 
                type="text" 
                id="cognome" 
                v-model="formData.cognome" 
                :class="{ 'error': errors.cognome }"
                placeholder="Cognome" 
                required
              >
              <span v-if="errors.cognome" class="error-message">{{ errors.cognome }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="nickname">Nickname *</label>
            <input 
              type="text" 
              id="nickname" 
              v-model="formData.nickname" 
              :class="{ 'error': errors.nickname }"
              placeholder="Scegli un nickname univoco" 
              required
            >
            <span v-if="errors.nickname" class="error-message">{{ errors.nickname }}</span>
          </div>

          <div class="form-group">
            <label for="email-reg">Email *</label>
            <input 
              type="email" 
              id="email-reg" 
              v-model="formData.email" 
              :class="{ 'error': errors.email }"
              placeholder="email@esempio.com" 
              required
            >
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="data-nascita">Data di Nascita *</label>
            <input 
              type="date" 
              id="data-nascita" 
              v-model="formData.dataNascita" 
              :class="{ 'error': errors.dataNascita }"
              required
            >
            <span v-if="errors.dataNascita" class="error-message">{{ errors.dataNascita }}</span>
          </div>

          <div class="form-group">
            <label for="password-reg">Password *</label>
            <input 
              type="password" 
              id="password-reg" 
              v-model="formData.password" 
              :class="{ 'error': errors.password }"
              placeholder="Minimo 8 caratteri" 
              required
            >
            <small class="password-hint">
              Password sicura: minimo 8 caratteri, 1 maiuscola, 1 minuscola, 1 numero, 1 simbolo (@$!%*?&)
            </small>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="loading"
          >
            {{ loading ? 'Registrazione...' : 'Registrati' }}
          </button>
        </form>

        <!-- Form conferma codice -->
        <div v-else class="confirmation-section">
          <div class="confirmation-icon">✉️</div>
          <h2>Conferma la tua email</h2>

          <!-- Banner con codice di conferma -->
          <div v-if="authStore.pendingCodice" class="code-banner">
            Inserisci il codice <strong>{{ authStore.pendingCodice }}</strong> per continuare
          </div>

          <p>Email: <span class="email-highlight">{{ authStore.pendingEmail }}</span></p>

          <form @submit.prevent="handleConfirm">
            <div class="form-group">
              <label for="confirmation-code">Codice di conferma</label>
              <input 
                type="text" 
                id="confirmation-code" 
                v-model="confirmationCode" 
                maxlength="4"
                placeholder="0000"
                class="code-input"
                required
              >
              <span v-if="codeError" class="error-message">{{ codeError }}</span>
            </div>

            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="confirmLoading"
            >
              {{ confirmLoading ? 'Verifica...' : 'Conferma' }}
            </button>
          </form>

          <button class="btn-secondary-link" @click="cancelConfirmation">
            Torna indietro
          </button>
        </div>

        <p class="auth-footer" v-if="!authStore.awaitingConfirmation">
          Hai già un account? <RouterLink to="/login">Accedi qui</RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/common/AppHeader.vue'
import { validateRegistrationData, validateConfirmationCode } from '@/services/validation'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const confirmLoading = ref(false)
const errors = ref({})
const codeError = ref('')

const formData = ref({
  nome: '',
  cognome: '',
  nickname: '',
  email: '',
  dataNascita: '',
  password: ''
})

const confirmationCode = ref('')

async function handleRegister() {
  errors.value = {}

  // Validazione client-side
  const validation = validateRegistrationData(formData.value)
  if (!validation.valid) {
    errors.value = validation.errors
    toastStore.error('Correggi gli errori nel form')
    return
  }

  loading.value = true

  const result = await authStore.register(formData.value)

  loading.value = false

  if (result.success) {
    toastStore.success(result.message)
    // authStore.awaitingConfirmation diventa true automaticamente
  } else {
    toastStore.error(result.message)
  }
}

async function handleConfirm() {
  codeError.value = ''

  // Validazione codice
  const validation = validateConfirmationCode(confirmationCode.value)
  if (!validation.valid) {
    codeError.value = validation.message
    return
  }

  confirmLoading.value = true

  const result = await authStore.confirmRegistration(
    authStore.pendingEmail,
    confirmationCode.value
  )

  confirmLoading.value = false

  if (result.success) {
    toastStore.success(result.message)
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } else {
    toastStore.error(result.message)
    codeError.value = result.message
  }
}

function cancelConfirmation() {
  authStore.awaitingConfirmation = false
  authStore.pendingEmail = null
  authStore.pendingCodice = null
  confirmationCode.value = ''
}
</script>

<style scoped>
.hero-background {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/trento-bg.jpg') center/cover no-repeat;
  background-attachment: fixed;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
}

.auth-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
}

.auth-box h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #0066cc;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input.error {
  border-color: #f44336;
}

.form-group input:focus {
  outline: none;
  border-color: #f7941d;
}

.error-message {
  display: block;
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.password-hint {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.btn-primary {
  width: 100%;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #f7941d;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  background: #e68917;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.auth-footer a {
  color: #f7941d;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Confirmation section */
.confirmation-section {
  text-align: center;
}

.confirmation-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.confirmation-section h2 {
  color: #0066cc;
  margin-bottom: 15px;
}

.confirmation-section p {
  margin-bottom: 10px;
  color: #666;
}

.email-highlight {
  font-weight: bold;
  color: #f7941d;
  font-size: 16px;
  margin-bottom: 25px !important;
}

.code-input {
  text-align: center;
  font-size: 24px;
  letter-spacing: 8px;
  font-weight: bold;
}

.btn-secondary-link {
  margin-top: 15px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.btn-secondary-link:hover {
  color: #333;
}

.code-banner {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 2px solid #4caf50;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 20px;
  font-size: 17px;
  color: #2e7d32;
  text-align: center;
}

.code-banner strong {
  font-size: 22px;
  letter-spacing: 3px;
  color: #1b5e20;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .auth-box {
    padding: 25px;
  }
}
</style>
