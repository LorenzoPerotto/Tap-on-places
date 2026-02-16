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
          <img 
            v-if="itinerary.coverImage"
            :src="itinerary.coverImage"
            :alt="itinerary.nome"
            class="itinerary-cover-image"
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

    // Aggiungi immagini di copertina
    results.value = results.value.map(it => ({
      ...it,
      coverImage: getCoverImage(it.tipologia)
    }))

    toastStore.success(`Trovati ${results.value.length} itinerari`)
  } catch (error) {
    console.error('Error searching itineraries:', error)
    toastStore.error('Errore nella ricerca')
    results.value = []
  } finally {
    loading.value = false
  }
}

function getCoverImage(tipologia) {
  const images = {
    'Storico': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
    'Culturale': 'https://images.unsplash.com/photo-1565911783875-5238b2a76a13?w=800',
    'Natura': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'Enogastronomico': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'Sportivo': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
  }
  return images[tipologia] || 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'
}

function viewItinerary(itinerary) {
  toastStore.info(`Visualizzazione itinerario: ${itinerary.nome}`)
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

.itinerary-cover-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
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
</style>
