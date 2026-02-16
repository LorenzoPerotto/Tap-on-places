<template>
  <div class="hero-background">
    <AppHeader title="Login" />

    <main class="auth-container">
      <div class="auth-box">
        <h1>Accedi</h1>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              placeholder="email@esempio.com" 
              required
              :class="{ 'error': errors.email }"
            >
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="formData.password" 
              placeholder="Password" 
              required
              :class="{ 'error': errors.password }"
            >
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="loading"
          >
            {{ loading ? 'Accesso...' : 'Accedi' }}
          </button>
        </form>

        <div class="divider">
          <span>oppure</span>
        </div>

        <button class="btn-google" @click="handleGoogleLogin">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
          Continua con Google
        </button>

        <p class="auth-footer">
          Non hai un account? <RouterLink to="/registrazione">Registrati qui</RouterLink>
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
import { validateEmail } from '@/services/validation'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const errors = ref({})

const formData = ref({
  email: '',
  password: ''
})

async function handleLogin() {
  errors.value = {}

  // Validazione base
  if (!formData.value.email) {
    errors.value.email = 'Email obbligatoria'
    return
  }

  if (!formData.value.password) {
    errors.value.password = 'Password obbligatoria'
    return
  }

  const emailValidation = validateEmail(formData.value.email)
  if (!emailValidation.valid) {
    errors.value.email = emailValidation.message
    return
  }

  loading.value = true

  const result = await authStore.login(formData.value)

  loading.value = false

  if (result.success) {
    toastStore.success(result.message)
    setTimeout(() => {
      router.push('/profilo')
    }, 1000)
  } else {
    toastStore.error(result.message)
  }
}

function handleGoogleLogin() {
  // Implementazione futura Google OAuth
  toastStore.info('Login con Google in arrivo!')
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
  max-width: 450px;
}

.auth-box h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #0066cc;
}

.form-group {
  margin-bottom: 20px;
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

.divider {
  text-align: center;
  margin: 25px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #ddd;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 15px;
  color: #999;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-google:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
</style>
