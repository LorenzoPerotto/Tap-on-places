<template>
  <div class="hero-background">
    <AppHeader title="Lista Itinerari" />

    <main class="search-itinerary-container">
      <h1>Trova il Tuo Itinerario Perfetto</h1>

      <div class="search-filters">
        <div class="filter-group">
          <label for="tipologia">Tipologia</label>
          <select id="tipologia" v-model="filters.tipologia">
            <option value="">Tutte</option>
            <option value="Storico">Storico</option>
            <option value="Culturale">Culturale</option>
            <option value="Natura">Natura</option>
            <option value="Enogastronomico">Enogastronomico</option>
            <option value="Sportivo">Sportivo</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="tempo">Tempo Max (min)</label>
          <input 
            type="number" 
            id="tempo" 
            v-model.number="filters.tempo"
            placeholder="Es: 180"
          >
        </div>

        <div class="filter-group">
          <label for="budget">Budget Max (€)</label>
          <input 
            type="number" 
            id="budget" 
            v-model.number="filters.budget"
            placeholder="Es: 50"
          >
        </div>
      </div>

      <button class="btn-search" @click="searchItineraries" :disabled="loading">
        {{ loading ? 'Ricerca...' : '🔍 Cerca Itinerari' }}
      </button>

      <LoadingSpinner v-if="loading" message="Ricerca itinerari..." />

      <div v-else-if="results.length > 0" class="results-container">
        <div 
          v-for="itinerary in results" 
          :key="itinerary._id"
          class="itinerary-result"
        >

          <FavoriteIcon
            v-if="authStore.isAuthenticated"
            :item-id="itinerary._id"
            item-type="itinerary"
            :item="itinerary"
          />

          <div class="itinerary-info">
            <h3>{{ itinerary.nome }}</h3>
            <p v-if="itinerary.descrizione">{{ itinerary.descrizione }}</p>
            <p v-if="itinerary.tipologia"><strong>Tipologia:</strong> {{ itinerary.tipologia }}</p>
            <p v-if="itinerary.tempo"><strong>Durata:</strong> {{ itinerary.tempo }} minuti</p>
            <p v-if="itinerary.budget"><strong>Budget:</strong> €{{ itinerary.budget }}</p>

            <button class="btn-secondary" @click="viewItinerary(itinerary)">
              Visualizza Dettagli
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="searched" class="empty-state">
        <p>😔 Nessun itinerario trovato con questi filtri</p>
        <button class="btn-primary" @click="clearFilters">
          Cancella Filtri
        </button>
      </div>
    </main>

    <!-- Modal dettagli itinerario -->
    <Transition name="modal">
      <div v-if="selectedItinerary" class="modal-overlay" @click.self="selectedItinerary = null">
        <div class="modal-content">
          <button class="modal-close" @click="selectedItinerary = null">&times;</button>
          <h2>🗺️ {{ selectedItinerary.nome }}</h2>
          <div class="modal-details">
            <p v-if="selectedItinerary.descrizione"><strong>📝 Descrizione:</strong> {{ selectedItinerary.descrizione }}</p>
            <p v-if="selectedItinerary.tipologia"><strong>🎯 Tipologia:</strong> {{ selectedItinerary.tipologia }}</p>
            <p v-if="selectedItinerary.tempo"><strong>⏱️ Durata:</strong> {{ selectedItinerary.tempo }} minuti</p>
            <p v-if="selectedItinerary.budget"><strong>💰 Budget:</strong> €{{ selectedItinerary.budget }}</p>
          </div>
          <div v-if="selectedItinerary.activitiesDetails && selectedItinerary.activitiesDetails.length > 0" class="modal-activities">
            <h3>📍 Tappe dell'itinerario</h3>
            <div v-for="(act, index) in selectedItinerary.activitiesDetails" :key="act._id" class="modal-activity-item">
              <span class="activity-number">{{ index + 1 }}</span>
              <div class="activity-detail-info">
                <strong>{{ act.nome }}</strong>
                <small v-if="act.tipo">🏷️ {{ act.tipo }}</small>
                <small v-if="act.tempo">⏱️ {{ act.tempo }} min</small>
                <small v-if="act.budget">💰 €{{ act.budget }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/common/AppHeader.vue'
import FavoriteIcon from '@/components/common/FavoriteIcon.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const searched = ref(false)
const results = ref([])
const selectedItinerary = ref(null)

const filters = ref({
  tipologia: '',
  tempo: null,
  budget: null
})

async function searchItineraries() {
  loading.value = true
  searched.value = true

  try {
    const response = await api.itineraries.searchWithFilters(filters.value)
    results.value = response.data

    toastStore.success(`Trovati ${results.value.length} itinerari`)
  } catch (error) {
    console.error('Error searching itineraries:', error)
    toastStore.error('Errore nella ricerca')
    results.value = []
  } finally {
    loading.value = false
  }
}


async function viewItinerary(itinerary) {
  try {
    const response = await api.itineraries.getById(itinerary._id)
    const details = response.data

    // Carica le attività dell'itinerario se ci sono activities IDs
    let activitiesDetails = []
    if (details.activities && details.activities.length > 0) {
      const actPromises = details.activities.map(actId => 
        api.activities.getById(actId).then(r => r.data).catch(() => null)
      )
      activitiesDetails = (await Promise.all(actPromises)).filter(Boolean)
    }

    selectedItinerary.value = { ...itinerary, ...details, activitiesDetails }
  } catch (error) {
    console.error('Error loading itinerary details:', error)
    // Fallback: mostra quello che abbiamo
    selectedItinerary.value = { ...itinerary, activitiesDetails: [] }
  }
}

function clearFilters() {
  filters.value = {
    tipologia: '',
    tempo: null,
    budget: null
  }
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

.search-itinerary-container {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.search-itinerary-container h1 {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  font-size: 36px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.search-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  color: white;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.filter-group input,
.filter-group select {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.btn-search {
  width: 100%;
  padding: 15px 50px;
  border: none;
  border-radius: 8px;
  background: #f7941d;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 40px;
  transition: all 0.3s ease;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.itinerary-result {
  background: white;
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.itinerary-result:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}


.itinerary-info {
  padding: 20px;
}

.itinerary-info h3 {
  color: #0066cc;
  margin-bottom: 10px;
}

.itinerary-info p {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.btn-secondary {
  width: 100%;
  padding: 10px 20px;
  border: 2px solid #f7941d;
  border-radius: 8px;
  background: transparent;
  color: #f7941d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-secondary:hover {
  background: #f7941d;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
}

.empty-state p {
  font-size: 20px;
  color: #666;
  margin-bottom: 20px;
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
}

@media (max-width: 768px) {
  .search-itinerary-container {
    padding: 20px;
  }

  .search-itinerary-container h1 {
    font-size: 28px;
  }

  .results-container {
    grid-template-columns: 1fr;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  font-weight: bold;
}

.modal-close:hover {
  color: #333;
}

.modal-content h2 {
  color: #0066cc;
  margin-bottom: 20px;
  padding-right: 30px;
}

.modal-details {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.modal-details p {
  margin-bottom: 8px;
  color: #333;
  line-height: 1.6;
}

.modal-activities h3 {
  color: #0066cc;
  margin-bottom: 15px;
}

.modal-activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.activity-number {
  width: 28px;
  height: 28px;
  background: #f7941d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  flex-shrink: 0;
}

.activity-detail-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-detail-info strong {
  color: #333;
  font-size: 14px;
}

.activity-detail-info small {
  color: #888;
  font-size: 12px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
