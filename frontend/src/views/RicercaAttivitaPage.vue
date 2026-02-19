<template>
  <div class="hero-background">
    <AppHeader title="Ricerca Attività" />

    <main class="search-activity-container">
      <h1>Cerca Attività a Trento</h1>

      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          v-model="searchQuery"
          placeholder="Cerca per nome (es: MUSE, Castello, Duomo...)"
          @keyup.enter="searchActivities"
        >
        <button class="btn-search" @click="searchActivities" :disabled="loading">
          {{ loading ? 'Ricerca...' : '🔍 Cerca' }}
        </button>
      </div>

      <LoadingSpinner v-if="loading" message="Ricerca in corso..." />

      <div v-else-if="results.length > 0" class="results-container">
        <div 
          v-for="activity in results" 
          :key="activity._id"
          class="activity-detail"
        >
          <div class="activity-header">
            <h2>{{ activity.nome }}</h2>
            <FavoriteIcon
              v-if="authStore.isAuthenticated"
              :item-id="activity._id"
              item-type="place"
              :item="activity"
              class="favorite-icon-large"
            />
          </div>



          <div class="activity-info-detail">
            <p><strong>📍 Tipo:</strong> {{ activity.tipo }}</p>
            <p v-if="activity.tipologia"><strong>🎯 Tipologia:</strong> {{ activity.tipologia }}</p>
            <p v-if="activity.descrizione"><strong>📝 Descrizione:</strong> {{ activity.descrizione }}</p>
            <p v-if="activity.tempo"><strong>⏱️ Tempo visita:</strong> {{ activity.tempo }} minuti</p>
            <p v-if="activity.budget"><strong>💰 Budget:</strong> €{{ activity.budget }}</p>
            <p v-if="activity.coordinate">
              <strong>📌 Coordinate:</strong> 
              {{ activity.coordinate.lat.toFixed(4) }}, {{ activity.coordinate.lng.toFixed(4) }}
            </p>
          </div>

          <div class="activity-actions">
            <button 
              v-if="authStore.isAuthenticated"
              class="btn-primary" 
              @click="saveActivity(activity)"
              :disabled="savingId === activity._id"
            >
              {{ savingId === activity._id ? 'Salvataggio...' : '💾 Salva Attività' }}
            </button>
            <button class="btn-secondary" @click="addToRoute(activity)">
              ➕ Aggiungi a Percorso
            </button>
            <button class="btn-secondary" @click="viewOnMap(activity)">
              🗺️ Visualizza su Mappa
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="searched && !loading" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Nessuna attività trovata</h3>
        <p>Prova a cercare con un altro termine</p>
        <button class="btn-primary" @click="clearSearch">
          Nuova Ricerca
        </button>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>Cerca un'attività</h3>
        <p>Inserisci il nome di un luogo, museo, monumento o attività che ti interessa</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/common/AppHeader.vue'
import FavoriteIcon from '@/components/common/FavoriteIcon.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const loading = ref(false)
const searched = ref(false)
const results = ref([])
const savingId = ref(null)



async function searchActivities() {
  if (!searchQuery.value.trim()) {
    toastStore.error('Inserisci un termine di ricerca')
    return
  }

  loading.value = true
  searched.value = true

  try {
    const response = await api.activities.searchByName(searchQuery.value)

    // Ottieni dettagli completi per ogni attività
    const detailedResults = await Promise.all(
      response.data.map(async (activity) => {
        try {
          const detailResponse = await api.activities.getById(activity._id || extractIdFromSelf(activity.self))
          return {
            ...detailResponse.data,
            _id: activity._id || extractIdFromSelf(activity.self)
          }
        } catch (error) {
          console.error('Error fetching activity details:', error)
          return {
            ...activity,
            _id: activity._id || extractIdFromSelf(activity.self)
          }
        }
      })
    )

    results.value = detailedResults
    toastStore.success(`Trovate ${results.value.length} attività`)
  } catch (error) {
    console.error('Error searching activities:', error)
    toastStore.error(error.response?.data?.error || 'Errore nella ricerca')
    results.value = []
  } finally {
    loading.value = false
  }
}

function extractIdFromSelf(selfUrl) {
  // Estrae ID da URL tipo "/api/v1/attività/123"
  return selfUrl.split('/').pop()
}



async function saveActivity(activity) {
  if (!authStore.isAuthenticated) {
    toastStore.error('Devi effettuare il login per salvare attività')
    router.push('/login')
    return
  }

  savingId.value = activity._id

  try {
    await api.activities.save(activity._id)

    // Aggiungi ai preferiti localmente
    favoritesStore.savedActivities.push(activity)
    favoritesStore.saveToStorage()

    toastStore.success('Attività salvata con successo!')
  } catch (error) {
    console.error('Error saving activity:', error)
    toastStore.error(error.response?.data?.error || 'Errore nel salvataggio')
  } finally {
    savingId.value = null
  }
}

function addToRoute(activity) {
  // Salva nel localStorage per uso futuro in "Crea Percorso"
  const tempRoute = JSON.parse(localStorage.getItem('tempItinerary') || '[]')

  if (!tempRoute.find(a => a._id === activity._id)) {
    tempRoute.push(activity)
    localStorage.setItem('tempItinerary', JSON.stringify(tempRoute))
    toastStore.success('Attività aggiunta al percorso temporaneo')
  } else {
    toastStore.info('Attività già presente nel percorso')
  }
}

function viewOnMap(activity) {
  if (activity.coordinate) {
    toastStore.info('Apertura mappa in arrivo...')
    // Implementa navigazione a mappa con focus su questo POI
    router.push({ 
      path: '/', 
      query: { 
        lat: activity.coordinate.lat, 
        lng: activity.coordinate.lng 
      } 
    })
  } else {
    toastStore.error('Coordinate non disponibili')
  }
}

function clearSearch() {
  searchQuery.value = ''
  results.value = []
  searched.value = false
}
</script>

<style scoped>
.hero-background {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/trento-bg.jpg') center/cover no-repeat;
  background-attachment: fixed;
}

.search-activity-container {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.search-activity-container h1 {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  font-size: 36px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.search-box {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
}

.search-input {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
}

.btn-search {
  padding: 15px 50px;
  border: none;
  border-radius: 8px;
  background: #f7941d;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-search:hover:not(:disabled) {
  background: #e68917;
  transform: scale(1.05);
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.activity-detail {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h2 {
  color: #0066cc;
  margin: 0;
}



.activity-info-detail {
  line-height: 1.8;
  margin-bottom: 20px;
}

.activity-info-detail p {
  margin-bottom: 10px;
  color: #333;
  font-size: 15px;
}

.activity-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #f7941d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e68917;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 2px solid #f7941d;
  color: #f7941d;
}

.btn-secondary:hover {
  background: #f7941d;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #0066cc;
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .search-activity-container {
    padding: 20px;
  }

  .search-activity-container h1 {
    font-size: 28px;
  }

  .search-box {
    flex-direction: column;
  }

  .activity-main-image {
    height: 200px;
  }

  .activity-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
