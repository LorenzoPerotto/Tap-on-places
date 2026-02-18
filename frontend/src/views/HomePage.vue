<template>
  <div class="home-layout">
    <!-- Sezione mappa a sinistra -->
    <div class="map-section">
      <div class="header-left">
        <div class="logo" @click="router.push('/')">
          <img src="/unnamed.jpeg" alt="Logo Comune di Trento">
        </div>
        <h1 class="site-title">Tap On Places - Scopri Trento</h1>
      </div>

      <div class="map-container-home">
        <LeafletMap 
          :pois="pois" 
          :center="trentoCenter"
          @poi-click="handlePoiClick"
        />
      </div>
    </div>

    <!-- Sidebar navigazione a destra -->
    <aside class="sidebar-navigation">
      <div class="nav-header">
        <h2>Menù Navigazione</h2>
        <select class="language-select" v-model="selectedLanguage">
          <option value="it">🇮🇹 Italiano</option>
          <option value="en" disabled>🇬🇧 English — in lavorazione</option>
          <option value="de" disabled>🇩🇪 Deutsch — in lavorazione</option>
          <option value="pl" disabled>🇵🇱 Polski — in lavorazione</option>
        </select>
      </div>

      <nav class="sidebar-nav">
        <button class="btn-sidebar" @click="router.push('/lista-itinerari')">
          <span class="icon">🗺️</span>
          <span>Lista Itinerari</span>
        </button>

        <button class="btn-sidebar" @click="router.push('/genera-itinerario')">
          <span class="icon">✨</span>
          <span>Genera Itinerario AI</span>
        </button>

        <button class="btn-sidebar" @click="router.push('/crea-percorso')">
          <span class="icon">📍</span>
          <span>Crea Percorso</span>
        </button>

        <button class="btn-sidebar" @click="router.push('/ricerca-attivita')">
          <span class="icon">🔍</span>
          <span>Ricerca Attività</span>
        </button>

        <div class="nav-divider"></div>

        <button 
          v-if="authStore.isAuthenticated" 
          class="btn-sidebar" 
          @click="router.push('/profilo')"
        >
          <span class="icon">👤</span>
          <span>Il Mio Profilo</span>
        </button>

        <button 
          v-if="authStore.isAdmin" 
          class="btn-sidebar" 
          @click="router.push('/dashboard')"
        >
          <span class="icon">📊</span>
          <span>Dashboard Admin</span>
        </button>

        <button 
          v-if="authStore.isAuthenticated" 
          class="btn-sidebar" 
          @click="handleLogout"
        >
          <span class="icon">🚪</span>
          <span>Logout</span>
        </button>

        <button 
          v-else
          class="btn-sidebar btn-login-sidebar" 
          @click="router.push('/login')"
        >
          <span class="icon">🔐</span>
          <span>Accedi / Registrati</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <p class="small-text">© 2026 Comune di Trento</p>
        <p class="small-text">Tap On Places v1.0</p>
      </div>
    </aside>

    <!-- Modal dettagli POI -->
    <ModalPOI 
      v-if="selectedPoi"
      :poi="selectedPoi"
      @close="selectedPoi = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import LeafletMap from '@/components/map/LeafletMap.vue'
import ModalPOI from '@/components/map/ModalPOI.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const selectedLanguage = ref('it')
const selectedPoi = ref(null)
const pois = ref([])

const trentoCenter = { lat: 46.0678, lng: 11.1211 }

onMounted(async () => {
  await loadPois()
})

async function loadPois() {
  try {
    const response = await api.poi.getAll()
    pois.value = response.data
  } catch (error) {
    console.error('Error loading POIs:', error)
    toastStore.error('Errore nel caricamento dei luoghi')
  }
}

function handlePoiClick(poi) {
  selectedPoi.value = poi
}

function handleLogout() {
  authStore.logout()
  toastStore.success('Logout effettuato')
  router.push('/')
}
</script>

<style scoped>
.home-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
              url('/trento-bg.jpg') center/cover no-repeat;
  position: relative;
}

.header-left {
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo img {
  height: 80px;
  width: auto;
  cursor: pointer;
}

.site-title {
  color: white;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.map-container-home {
  flex: 1;
  position: relative;
  padding: 20px;
}

.sidebar-navigation {
  width: 320px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

.nav-header {
  padding: 30px 20px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 2px solid #f7941d;
}

.nav-header h2 {
  color: white;
  font-size: 24px;
  margin-bottom: 15px;
  text-align: center;
}

.language-select {
  width: 100%;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-sidebar {
  width: 100%;
  padding: 18px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
  backdrop-filter: blur(10px);
}

.btn-sidebar:hover {
  background: #f7941d;
  transform: translateX(-5px);
  box-shadow: 0 4px 12px rgba(247, 148, 29, 0.4);
}

.btn-sidebar .icon {
  font-size: 24px;
  width: 30px;
  text-align: center;
}

.btn-login-sidebar {
  background: linear-gradient(135deg, #f7941d 0%, #e68917 100%);
  margin-top: 10px;
  font-weight: 700;
}

.btn-login-sidebar:hover {
  transform: translateX(-5px) scale(1.02);
  box-shadow: 0 6px 16px rgba(247, 148, 29, 0.6);
}

.nav-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #f7941d, transparent);
  margin: 10px 0;
}

.sidebar-footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.small-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin: 5px 0;
}

@media (max-width: 1024px) {
  .home-layout {
    flex-direction: column;
  }

  .sidebar-navigation {
    width: 100%;
    max-height: 50vh;
  }

  .map-section {
    height: 50vh;
  }
}

@media (max-width: 768px) {
  .logo img {
    height: 60px;
  }

  .site-title {
    font-size: 18px;
  }
}
</style>
