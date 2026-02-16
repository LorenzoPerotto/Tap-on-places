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
              <p class="stat-number">{{ stats.totalUsers || 0 }}</p>
              <small>Registrati sulla piattaforma</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🗺️</div>
            <div class="stat-info">
              <h3>Itinerari Creati</h3>
              <p class="stat-number">{{ stats.totalItineraries || 0 }}</p>
              <small>Percorsi disponibili</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📍</div>
            <div class="stat-info">
              <h3>Attività</h3>
              <p class="stat-number">{{ stats.totalActivities || 0 }}</p>
              <small>Luoghi e punti d'interesse</small>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h3>Preferiti Totali</h3>
              <p class="stat-number">{{ stats.totalFavorites || 0 }}</p>
              <small>Salvataggi degli utenti</small>
            </div>
          </div>
        </div>

        <!-- Dati Affluenza -->
        <div class="dashboard-section">
          <h2>📈 Analisi Affluenza</h2>
          <div class="dashboard-grid">

            <div class="dashboard-card">
              <h3>Visitatori per Fascia Oraria</h3>
              <div class="chart-placeholder">
                <div class="chart-bar" style="height: 60%">
                  <span>Mattina</span>
                  <span class="bar-value">120</span>
                </div>
                <div class="chart-bar" style="height: 85%">
                  <span>Pomeriggio</span>
                  <span class="bar-value">180</span>
                </div>
                <div class="chart-bar" style="height: 45%">
                  <span>Sera</span>
                  <span class="bar-value">85</span>
                </div>
              </div>
              <p class="chart-note">📊 Dati simulati - Integrazione real-time in sviluppo</p>
            </div>

            <div class="dashboard-card">
              <h3>Visitatori per Età Media</h3>
              <div class="age-distribution">
                <div class="age-group">
                  <span class="age-label">18-25</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 35%"></div>
                  </div>
                  <span class="age-value">35%</span>
                </div>
                <div class="age-group">
                  <span class="age-label">26-40</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 45%"></div>
                  </div>
                  <span class="age-value">45%</span>
                </div>
                <div class="age-group">
                  <span class="age-label">41-60</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 25%"></div>
                  </div>
                  <span class="age-value">25%</span>
                </div>
                <div class="age-group">
                  <span class="age-label">60+</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 15%"></div>
                  </div>
                  <span class="age-value">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Luoghi più visitati -->
        <div class="dashboard-section">
          <h2>🏆 Top Luoghi Visitati</h2>
          <div class="dashboard-card wide">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Posizione</th>
                  <th>Luogo</th>
                  <th>Visite</th>
                  <th>Età Media</th>
                  <th>Fascia Oraria Picco</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🥇</td>
                  <td><strong>MUSE</strong></td>
                  <td>1,245</td>
                  <td>32 anni</td>
                  <td>14:00 - 17:00</td>
                </tr>
                <tr>
                  <td>🥈</td>
                  <td><strong>Piazza Duomo</strong></td>
                  <td>980</td>
                  <td>38 anni</td>
                  <td>11:00 - 13:00</td>
                </tr>
                <tr>
                  <td>🥉</td>
                  <td><strong>Castello del Buonconsiglio</strong></td>
                  <td>756</td>
                  <td>41 anni</td>
                  <td>10:00 - 12:00</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td><strong>Doss Trento</strong></td>
                  <td>623</td>
                  <td>29 anni</td>
                  <td>16:00 - 19:00</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td><strong>Teatro Sociale</strong></td>
                  <td>412</td>
                  <td>45 anni</td>
                  <td>20:00 - 22:00</td>
                </tr>
              </tbody>
            </table>
            <p class="chart-note">📊 Dati simulati - Sistema di tracking in sviluppo</p>
          </div>
        </div>

        <!-- Domanda Trasporti -->
        <div class="dashboard-section">
          <h2>🚌 Domanda Trasporti Pubblici</h2>
          <div class="dashboard-grid">
            <div class="transport-card">
              <div class="transport-icon">🚌</div>
              <h3>Autobus</h3>
              <div class="transport-stats">
                <p><strong>Capacità:</strong> 450/500</p>
                <div class="capacity-bar">
                  <div class="capacity-fill" style="width: 90%"></div>
                </div>
                <p class="capacity-status warning">⚠️ Alta affluenza</p>
              </div>
            </div>

            <div class="transport-card">
              <div class="transport-icon">🚂</div>
              <h3>Treni</h3>
              <div class="transport-stats">
                <p><strong>Capacità:</strong> 320/600</p>
                <div class="capacity-bar">
                  <div class="capacity-fill" style="width: 53%"></div>
                </div>
                <p class="capacity-status ok">✅ Normale</p>
              </div>
            </div>

            <div class="transport-card">
              <div class="transport-icon">🚡</div>
              <h3>Funivia</h3>
              <div class="transport-stats">
                <p><strong>Capacità:</strong> 85/120</p>
                <div class="capacity-bar">
                  <div class="capacity-fill" style="width: 71%"></div>
                </div>
                <p class="capacity-status ok">✅ Normale</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Nota implementazione -->
        <div class="implementation-note">
          <h3>ℹ️ Nota sui Dati</h3>
          <p>
            I dati visualizzati in questa dashboard sono simulati a scopo dimostrativo.
            L'integrazione con sistemi real-time di monitoraggio affluenza, analytics e 
            tracking utenti sarà implementata nelle prossime versioni della piattaforma.
          </p>
          <p>
            <strong>Funzionalità future:</strong>
          </p>
          <ul>
            <li>📊 Analytics real-time con grafici interattivi</li>
            <li>📱 Heatmap di movimento turisti</li>
            <li>🔔 Alert automatici per sovraccarico</li>
            <li>📈 Trend storici e previsioni</li>
            <li>📥 Export dati in CSV/Excel</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/common/AppHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  totalUsers: 0,
  totalItineraries: 0,
  totalActivities: 0,
  totalFavorites: 0
})

onMounted(() => {
  if (!authStore.isAdmin) {
    return
  }

  // Simula caricamento dati
  setTimeout(() => {
    stats.value = {
      totalUsers: 1247,
      totalItineraries: 45,
      totalActivities: 127,
      totalFavorites: 3856
    }
  }, 500)
})
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

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
  border-bottom: 2px solid #e0e0e0;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 80px;
  background: linear-gradient(to top, #f7941d, #ffc107);
  border-radius: 8px 8px 0 0;
  padding: 10px;
  color: white;
  font-weight: bold;
  position: relative;
}

.chart-bar span {
  position: absolute;
  bottom: -30px;
  font-size: 12px;
  color: #666;
}

.bar-value {
  position: absolute !important;
  top: -25px !important;
  bottom: auto !important;
  color: #333 !important;
}

.chart-note {
  margin-top: 15px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.age-distribution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.age-group {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 15px;
}

.age-label {
  font-weight: 600;
  color: #333;
}

.progress-bar {
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7941d, #ffc107);
  transition: width 0.3s ease;
}

.age-value {
  font-weight: bold;
  color: #f7941d;
  text-align: right;
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

.transport-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.transport-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.transport-card h3 {
  color: #0066cc;
  margin-bottom: 20px;
}

.transport-stats {
  text-align: left;
}

.capacity-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.capacity-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}

.capacity-status {
  font-weight: 600;
  margin-top: 10px;
}

.capacity-status.ok {
  color: #4caf50;
}

.capacity-status.warning {
  color: #ff9800;
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
