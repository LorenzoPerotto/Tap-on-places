<template>
  <div class="hero-background">
    <AppHeader title="Crea Percorso Personalizzato" />

    <main class="create-route-container">
      <!-- Mappa a sinistra -->
      <div class="route-map">
        <LeafletMap 
          :pois="allPois" 
          :center="trentoCenter"
          @poi-click="handlePoiClick"
        />
      </div>

      <!-- Builder percorso a destra -->
      <aside class="route-builder">
        <h2>🛤️ Il Tuo Percorso</h2>

        <form @submit.prevent="createItinerary">
          <div class="form-group">
            <label for="nome">Nome Percorso *</label>
            <input 
              type="text" 
              id="nome"
              v-model="formData.nome"
              placeholder="Es: La mia giornata a Trento"
              required
            >
          </div>

          <div class="form-group">
            <label for="descrizione">Descrizione *</label>
            <textarea 
              id="descrizione"
              v-model="formData.descrizione"
              placeholder="Descrivi il tuo percorso..."
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tipologia">Tipologia *</label>
            <select id="tipologia" v-model="formData.tipologia" required>
              <option value="">Seleziona...</option>
              <option value="Storico">Storico</option>
              <option value="Culturale">Culturale</option>
              <option value="Natura">Natura</option>
              <option value="Enogastronomico">Enogastronomico</option>
              <option value="Sportivo">Sportivo</option>
              <option value="Misto">Misto</option>
            </select>
          </div>

          <div class="waypoints-section">
            <h3>📍 Tappe del Percorso</h3>

            <!-- Casella di ricerca tappe -->
            <div class="search-tappe-wrapper">
              <div class="search-input-container">
                <span class="search-icon">🔍</span>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Cerca una tappa da aggiungere..."
                  class="search-tappe-input"
                  @focus="showSearchResults = true"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="search-clear-btn"
                  @click="searchQuery = ''; showSearchResults = false"
                >×</button>
              </div>
              <div v-if="showSearchResults && filteredSearchResults.length > 0" class="search-results-dropdown">
                <div
                  v-for="poi in filteredSearchResults"
                  :key="poi._id"
                  class="search-result-item"
                  @click="addActivityFromSearch(poi)"
                >
                  <span class="result-name">{{ poi.nome }}</span>
                  <span class="result-type">{{ poi.tipo }}</span>
                </div>
              </div>
              <div v-if="showSearchResults && searchQuery && filteredSearchResults.length === 0" class="search-no-results">
                Nessun risultato per "{{ searchQuery }}"
              </div>
            </div>

            <div v-if="selectedActivities.length === 0" class="empty-waypoints">
              <p>Nessuna tappa selezionata</p>
              <p class="hint">Clicca sui marker della mappa o cerca attività per aggiungerle</p>
            </div>

            <draggable 
              v-else
              v-model="selectedActivities" 
              class="waypoints-list"
              item-key="_id"
            >
              <template #item="{element, index}">
                <div class="waypoint-item">
                  <div class="waypoint-number">{{ index + 1 }}</div>
                  <div class="waypoint-info">
                    <strong>{{ element.nome }}</strong>
                    <small v-if="element.tempo">⏱️ {{ element.tempo }} min</small>
                  </div>
                  <button 
                    type="button"
                    class="btn-remove"
                    @click="removeActivity(index)"
                  >
                    ×
                  </button>
                </div>
              </template>
            </draggable>
          </div>

          <div class="route-summary" v-if="selectedActivities.length > 0">
            <h4>Riepilogo</h4>
            <p><strong>Tappe:</strong> {{ selectedActivities.length }}</p>
            <p><strong>Tempo totale:</strong> {{ totalTime }} minuti</p>
            <p><strong>Budget stimato:</strong> €{{ totalBudget }}</p>
          </div>

          <button 
            type="submit" 
            class="btn-generate"
            :disabled="!canCreate || saving"
          >
            {{ saving ? 'Creazione...' : '✨ Crea Percorso' }}
          </button>

          <button 
            type="button"
            class="btn-secondary-full"
            @click="clearAll"
          >
            🗑️ Cancella Tutto
          </button>
        </form>

        <div class="suggested-places">
          <h3>💡 Luoghi Suggeriti</h3>
          <button 
            v-for="poi in suggestedPois" 
            :key="poi._id"
            class="suggestion-item"
            @click="addActivity(poi)"
          >
            <span>{{ poi.nome }}</span>
            <span class="suggestion-type">{{ poi.tipo }}</span>
          </button>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/common/AppHeader.vue'
import LeafletMap from '@/components/map/LeafletMap.vue'
import api from '@/services/api'
import draggable from 'vuedraggable'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const saving = ref(false)
const allPois = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)
const selectedActivities = ref([])

const formData = ref({
  nome: '',
  descrizione: '',
  tipologia: ''
})

const trentoCenter = { lat: 46.0678, lng: 11.1211 }

const suggestedPois = computed(() => {
  return allPois.value.filter(poi => 
    !selectedActivities.value.find(a => a._id === poi._id)
  ).slice(0, 5)
})

const filteredSearchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return allPois.value.filter(poi =>
    poi.nome.toLowerCase().includes(query) &&
    !selectedActivities.value.find(a => a._id === poi._id)
  ).slice(0, 8)
})

const totalTime = computed(() => {
  return selectedActivities.value.reduce((sum, act) => sum + (act.tempo || 0), 0)
})

const totalBudget = computed(() => {
  return selectedActivities.value.reduce((sum, act) => sum + (act.budget || 0), 0)
})

const canCreate = computed(() => {
  return formData.value.nome && 
         formData.value.descrizione && 
         formData.value.tipologia && 
         selectedActivities.value.length >= 2 &&
         authStore.isAuthenticated
})

onMounted(async () => {
  await loadPois()
  loadTempItinerary()
})

async function loadPois() {
  try {
    const response = await api.poi.getAll()
    allPois.value = response.data
  } catch (error) {
    console.error('Error loading POIs:', error)
  }
}

function loadTempItinerary() {
  const temp = localStorage.getItem('tempItinerary')
  if (temp) {
    selectedActivities.value = JSON.parse(temp)
  }
}

function handlePoiClick(poi) {
  if (!selectedActivities.value.find(a => a._id === poi._id)) {
    addActivity(poi)
  } else {
    toastStore.info('Attività già aggiunta al percorso')
  }
}

function addActivity(activity) {
  selectedActivities.value.push(activity)
  localStorage.setItem('tempItinerary', JSON.stringify(selectedActivities.value))
  toastStore.success(`${activity.nome} aggiunta al percorso`)
}

function addActivityFromSearch(activity) {
  addActivity(activity)
  searchQuery.value = ''
  showSearchResults.value = false
}

function removeActivity(index) {
  const removed = selectedActivities.value.splice(index, 1)
  localStorage.setItem('tempItinerary', JSON.stringify(selectedActivities.value))
  toastStore.info(`${removed[0].nome} rimossa`)
}

async function createItinerary() {
  if (!authStore.isAuthenticated) {
    toastStore.error('Devi effettuare il login per creare un percorso')
    router.push('/login')
    return
  }

  if (selectedActivities.value.length < 2) {
    toastStore.error('Devi selezionare almeno 2 tappe')
    return
  }

  saving.value = true

  try {
    const payload = {
      nome: formData.value.nome,
      descrizione: formData.value.descrizione,
      tipologia: formData.value.tipologia,
      startPoint: {
        lat: selectedActivities.value[0].coordinate?.lat || trentoCenter.lat,
        lng: selectedActivities.value[0].coordinate?.lng || trentoCenter.lng
      },
      endPoint: {
        lat: selectedActivities.value[selectedActivities.value.length - 1].coordinate?.lat || trentoCenter.lat,
        lng: selectedActivities.value[selectedActivities.value.length - 1].coordinate?.lng || trentoCenter.lng
      },
      activities: selectedActivities.value.map(a => a._id)
    }

    const response = await api.itineraries.create(payload)

    toastStore.success('Percorso creato con successo!')

    // Pulisci dati temporanei
    localStorage.removeItem('tempItinerary')
    selectedActivities.value = []
    formData.value = { nome: '', descrizione: '', tipologia: '' }

    // Vai al profilo
    setTimeout(() => {
      router.push('/profilo')
    }, 1500)
  } catch (error) {
    console.error('Error creating itinerary:', error)
    toastStore.error(error.response?.data?.error || 'Errore nella creazione del percorso')
  } finally {
    saving.value = false
  }
}

function clearAll() {
  selectedActivities.value = []
  localStorage.removeItem('tempItinerary')
  formData.value = { nome: '', descrizione: '', tipologia: '' }
  toastStore.info('Percorso cancellato')
}
</script>

<style scoped>
.hero-background {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
              url('/trento-bg.jpg') center/cover no-repeat;
}

.create-route-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 120px);
}

.route-map {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.route-builder {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 25px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.route-builder h2 {
  color: #0066cc;
  margin-bottom: 20px;
  font-size: 24px;
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

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.waypoints-section {
  margin-bottom: 25px;
}

.waypoints-section h3 {
  color: #0066cc;
  font-size: 18px;
  margin-bottom: 15px;
}

/* Search tappe */
.search-tappe-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.search-input-container {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  transition: border-color 0.3s ease;
}

.search-input-container:focus-within {
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-tappe-input {
  flex: 1;
  border: none !important;
  outline: none;
  padding: 12px 0;
  font-size: 14px;
  background: transparent;
  box-shadow: none !important;
}

.search-clear-btn {
  background: #ccc;
  border: none;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.search-clear-btn:hover {
  background: #999;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #e3f2fd;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.result-type {
  font-size: 12px;
  color: #888;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.search-no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 0 8px 8px;
  padding: 14px;
  text-align: center;
  color: #999;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.empty-waypoints {
  text-align: center;
  padding: 30px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.empty-waypoints p {
  color: #666;
  margin-bottom: 5px;
}

.empty-waypoints .hint {
  font-size: 12px;
  color: #999;
}

.waypoints-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waypoint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s ease;
}

.waypoint-item:hover {
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.waypoint-number {
  width: 30px;
  height: 30px;
  background: #f7941d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.waypoint-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.waypoint-info strong {
  color: #333;
  font-size: 14px;
}

.waypoint-info small {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

.btn-remove {
  width: 30px;
  height: 30px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.route-summary {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.route-summary h4 {
  color: #0066cc;
  margin-bottom: 10px;
}

.route-summary p {
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
}

.btn-generate {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: #f7941d;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.btn-generate:hover:not(:disabled) {
  background: #e68917;
  transform: scale(1.02);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary-full {
  width: 100%;
  padding: 12px;
  border: 2px solid #f44336;
  border-radius: 8px;
  background: transparent;
  color: #f44336;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary-full:hover {
  background: #f44336;
  color: white;
}

.suggested-places {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.suggested-places h3 {
  color: #0066cc;
  font-size: 16px;
  margin-bottom: 15px;
}

.suggestion-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  text-align: left;
}

.suggestion-item:hover {
  background: #f7941d;
  color: white;
  border-color: #f7941d;
}

.suggestion-type {
  font-size: 12px;
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .create-route-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .route-map {
    height: 400px;
  }

  .route-builder {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .create-route-container {
    padding: 10px;
  }

  .route-builder {
    padding: 15px;
  }

  .route-map {
    height: 300px;
  }
}
</style>
