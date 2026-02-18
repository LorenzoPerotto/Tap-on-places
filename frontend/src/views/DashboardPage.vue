<template>
  <div class="hero-background">
    <AppHeader title="Dashboard Amministratore" />

    <main class="dashboard-container">
      <div class="dashboard-header">
        <h1>📊 Dashboard Utente Comunale</h1>
        <p>Benvenuto, {{ authStore.userFullName }}</p>
      </div>

      <!-- Controllo accesso -->
      <div v-if="!authStore.isAdmin" class="access-denied">
        <div class="denied-icon">🚫</div>
        <h2>Accesso Negato</h2>
        <p>Solo gli utenti comunali possono accedere a questa sezione</p>
        <button class="btn-primary" @click="router.push('/')">
          Torna alla Home
        </button>
      </div>

      <!-- Dashboard per utenti comunali -->
      <div v-else class="dashboard-content">

        <!-- Statistiche Generali -->
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>Utenti Totali</h3>
              <p class="stat-number">{{ stats.totalUsers ?? '—' }}</p>
              <small>Registrati sulla piattaforma</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🗺️</div>
            <div class="stat-info">
              <h3>Itinerari Creati</h3>
              <p class="stat-number">{{ stats.totalItineraries ?? '—' }}</p>
              <small>Percorsi disponibili</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📍</div>
            <div class="stat-info">
              <h3>Attività</h3>
              <p class="stat-number">{{ stats.totalActivities ?? '—' }}</p>
              <small>Luoghi e punti d'interesse</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h3>Preferiti Totali</h3>
              <p class="stat-number">{{ stats.totalFavorites ?? '—' }}</p>
              <small>Salvataggi degli utenti</small>
            </div>
          </div>
        </div>

        <!-- Dati Affluenza -->
        <div class="dashboard-section">
          <h2>📈 Analisi Affluenza</h2>
          <div class="dashboard-grid">

            <div class="dashboard-card">
              <h3>Età Media Utenti</h3>
              <div class="eta-media-display">
                <div class="eta-media-number">{{ stats.etMediaUtenti || '—' }}</div>
                <div class="eta-media-label">anni</div>
              </div>
              <p class="chart-note">📊 Calcolata dalle date di nascita degli utenti registrati</p>
            </div>

            <div class="dashboard-card">
              <h3>Dettaglio Attività</h3>
              <div class="info-list" v-if="detailedInfo.length > 0">
                <div 
                  v-for="info in detailedInfo.filter(i => i.tipo === 'attivita').slice(0, 5)" 
                  :key="info.nome"
                  class="info-item"
                >
                  <div class="info-item-name">{{ info.nome }}</div>
                  <div class="info-item-stats">
                    <span>👥 {{ info.numPersone }} salvataggi</span>
                    <span v-if="info.etMedia">📊 Età media: {{ info.etMedia }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="chart-note">Nessun dato disponibile</p>
            </div>
          </div>
        </div>

        <!-- Luoghi più salvati -->
        <div class="dashboard-section">
          <h2>🏆 Top Luoghi Salvati</h2>
          <div class="dashboard-card wide">
            <table class="data-table" v-if="stats.topAttivita && stats.topAttivita.length > 0">
              <thead>
                <tr>
                  <th>Posizione</th>
                  <th>Luogo</th>
                  <th>Tipo</th>
                  <th>Salvataggi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(att, index) in stats.topAttivita" :key="att.nome">
                  <td>{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}</td>
                  <td><strong>{{ att.nome }}</strong></td>
                  <td>{{ att.tipo }}</td>
                  <td>{{ att.visite }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="chart-note">Nessuna attività salvata dagli utenti</p>
            <p class="chart-note">📊 Dati reali dal database</p>
          </div>
        </div>

        <!-- Top Itinerari -->
        <div class="dashboard-section" v-if="stats.topItinerari && stats.topItinerari.length > 0">
          <h2>🗺️ Top Itinerari Salvati</h2>
          <div class="dashboard-card wide">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Posizione</th>
                  <th>Itinerario</th>
                  <th>Tipologia</th>
                  <th>Salvataggi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, index) in stats.topItinerari" :key="it.nome">
                  <td>{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}</td>
                  <td><strong>{{ it.nome }}</strong></td>
                  <td>{{ it.tipologia || '—' }}</td>
                  <td>{{ it.visite }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Messaggio errore -->
        <div v-if="loadError" class="implementation-note">
          <h3>⚠️ Errore Caricamento Dati</h3>
          <p>{{ loadError }}</p>
          <button class="btn-primary" @click="loadDashboardData">🔄 Riprova</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/common/AppHeader.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const loadError = ref('')

const stats = ref({
  totalUsers: 0,
  totalItineraries: 0,
  totalActivities: 0,
  totalFavorites: 0,
  etMediaUtenti: 0,
  topAttivita: [],
  topItinerari: []
})

const detailedInfo = ref([])

onMounted(() => {
  if (!authStore.isAdmin) {
    return
  }
  loadDashboardData()
})

async function loadDashboardData() {
  loading.value = true
  loadError.value = ''

  try {
    // Carica statistiche globali e info dettagliate in parallelo
    const [statsResponse, infoResponse] = await Promise.all([
      api.dashboard.getStats(),
      api.dashboard.getAll()
    ])

    stats.value = statsResponse.data
    detailedInfo.value = infoResponse.data

    toastStore.success('Dashboard caricata con successo')
  } catch (error) {
    console.error('Errore caricamento dashboard:', error)
    loadError.value = error.response?.data?.error || 'Errore nel caricamento dei dati della dashboard'
    toastStore.error(loadError.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.hero-background {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/trento-bg.jpg') center/cover no-repeat;
  background-attachment: fixed;
}

.dashboard-container {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.dashboard-header h1 {
  color: #0066cc;
  margin-bottom: 10px;
}

.dashboard-header p {
  color: #666;
  font-size: 16px;
}

.access-denied {
  background: rgba(255, 255, 255, 0.95);
  padding: 60px;
  border-radius: 8px;
  text-align: center;
}

.denied-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.access-denied h2 {
  color: #f44336;
  margin-bottom: 15px;
}

.access-denied p {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 48px;
}

.stat-info h3 {
  color: #0066cc;
  font-size: 16px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #f7941d;
  margin: 0;
}

.stat-info small {
  color: #666;
  font-size: 12px;
}

.dashboard-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
}

.dashboard-section h2 {
  color: #0066cc;
  margin-bottom: 25px;
}

.dashboard-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-card.wide {
  grid-column: span 2;
}

.dashboard-card h3 {
  color: #0066cc;
  margin-bottom: 20px;
}

.chart-note {
  margin-top: 15px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.eta-media-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  padding: 30px 0;
}

.eta-media-number {
  font-size: 64px;
  font-weight: bold;
  color: #f7941d;
  line-height: 1;
}

.eta-media-label {
  font-size: 24px;
  color: #666;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #f7941d;
}

.info-item-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.info-item-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #0066cc;
}

.data-table tr:hover {
  background: #f9f9f9;
}

.implementation-note {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 20px;
  border-radius: 8px;
}

.implementation-note h3 {
  color: #856404;
  margin-bottom: 15px;
}

.implementation-note p {
  color: #856404;
  margin-bottom: 10px;
  line-height: 1.6;
}

.implementation-note ul {
  color: #856404;
  margin-left: 20px;
}

.implementation-note li {
  margin-bottom: 8px;
}

.btn-primary {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #f7941d;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #e68917;
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  .dashboard-card.wide {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>
