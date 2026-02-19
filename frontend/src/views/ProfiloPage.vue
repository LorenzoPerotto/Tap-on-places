<template>
  <div class="hero-background">
    <AppHeader title="Il Mio Profilo" />

    <main class="profile-container">
      <div class="profile-header">
        <div class="user-avatar">
          <span class="avatar-icon">👤</span>
        </div>
        <h1>Ciao, {{ authStore.userFullName }}!</h1>
        <p class="user-email">{{ authStore.userEmail }}</p>
        <p class="user-nickname">@{{ authStore.userNickname }}</p>
      </div>

      <div class="saved-activities">
        <h2>Attività Salvate ({{ favoritesStore.savedActivitiesCount }})</h2>

        <LoadingSpinner v-if="loading" message="Caricamento..." />

        <div v-else-if="favoritesStore.savedActivitiesCount > 0" class="activities-grid">
          <div 
            v-for="activity in favoritesStore.savedActivities" 
            :key="activity._id"
            class="activity-card"
          >


            <FavoriteIcon
              :item-id="activity._id"
              item-type="place"
              :item="activity"
            />

            <h3>{{ activity.nome }}</h3>
            <p><strong>Tipo:</strong> {{ activity.tipo }}</p>
            <p v-if="activity.tempo"><strong>Tempo:</strong> {{ activity.tempo }} min</p>
            <p v-if="activity.budget"><strong>Budget:</strong> €{{ activity.budget }}</p>

            <button class="btn-secondary" @click="viewDetails(activity)">
              Visualizza
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>📍 Non hai ancora salvato attività</p>
          <button class="btn-primary" @click="router.push('/ricerca-attivita')">
            Esplora Attività
          </button>
        </div>
      </div>

      <div class="saved-activities">
        <h2>Itinerari Salvati ({{ favoritesStore.savedItinerariesCount }})</h2>

        <div v-if="favoritesStore.savedItinerariesCount > 0" class="activities-grid">
          <div 
            v-for="itinerary in favoritesStore.savedItineraries" 
            :key="itinerary._id"
            class="activity-card"
          >


            <FavoriteIcon
              :item-id="itinerary._id"
              item-type="itinerary"
              :item="itinerary"
            />

            <h3>{{ itinerary.nome }}</h3>
            <p v-if="itinerary.tipologia"><strong>Tipologia:</strong> {{ itinerary.tipologia }}</p>
            <p v-if="itinerary.tempo"><strong>Durata:</strong> {{ itinerary.tempo }} min</p>
            <p v-if="itinerary.budget"><strong>Budget:</strong> €{{ itinerary.budget }}</p>

            <button class="btn-secondary" @click="viewItinerary(itinerary)">
              Visualizza
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>🗺️ Non hai ancora salvato itinerari</p>
          <button class="btn-primary" @click="router.push('/lista-itinerari')">
            Esplora Itinerari
          </button>
        </div>
      </div>

      <div class="create-itinerary-section">
        <h2>Crea il Tuo Itinerario</h2>
        <p>Personalizza il tuo percorso scegliendo le attività che preferisci</p>
        <button class="btn-primary" @click="router.push('/crea-percorso')">
          Crea Percorso Personalizzato
        </button>
      </div>
    </main>

    <!-- Modal dettagli attività -->
    <Transition name="modal">
      <div v-if="selectedActivity" class="modal-overlay" @click.self="selectedActivity = null">
        <div class="modal-content">
          <button class="modal-close" @click="selectedActivity = null">&times;</button>
          <h2>📍 {{ selectedActivity.nome }}</h2>
          <div class="modal-details">
            <p><strong>📍 Tipo:</strong> {{ selectedActivity.tipo }}</p>
            <p v-if="selectedActivity.tipologia"><strong>🎯 Tipologia:</strong> {{ selectedActivity.tipologia }}</p>
            <p v-if="selectedActivity.descrizione"><strong>📝 Descrizione:</strong> {{ selectedActivity.descrizione }}</p>
            <p v-if="selectedActivity.tempo"><strong>⏱️ Tempo visita:</strong> {{ selectedActivity.tempo }} minuti</p>
            <p v-if="selectedActivity.budget"><strong>💰 Budget:</strong> €{{ selectedActivity.budget }}</p>
            <p v-if="selectedActivity.coordinate"><strong>🌍 Coordinate:</strong> {{ selectedActivity.coordinate.lat.toFixed(4) }}, {{ selectedActivity.coordinate.lng.toFixed(4) }}</p>
          </div>
        </div>
      </div>
    </Transition>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import AppHeader from '@/components/common/AppHeader.vue'
import FavoriteIcon from '@/components/common/FavoriteIcon.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()

const loading = ref(false)
const selectedActivity = ref(null)
const selectedItinerary = ref(null)

onMounted(() => {
  favoritesStore.loadFromStorage()
})

function viewDetails(activity) {
  selectedActivity.value = activity
}

async function viewItinerary(itinerary) {
  try {
    const response = await api.itineraries.getById(itinerary._id)
    const details = response.data

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
    selectedItinerary.value = { ...itinerary, activitiesDetails: [] }
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

.profile-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f7941d, #e68917);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-icon {
  font-size: 50px;
}

.profile-header h1 {
  color: #0066cc;
  margin-bottom: 10px;
}

.user-email {
  color: #666;
  margin-bottom: 5px;
}

.user-nickname {
  color: #f7941d;
  font-weight: 600;
  font-size: 18px;
}

.saved-activities {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.saved-activities h2 {
  color: #0066cc;
  margin-bottom: 20px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.activity-card {
  background: white;
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}



.activity-card h3 {
  padding: 0 20px;
  color: #0066cc;
  margin-bottom: 10px;
}

.activity-card p {
  padding: 0 20px;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.activity-card .btn-secondary {
  margin: 15px 20px 20px;
  display: block;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.create-itinerary-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.create-itinerary-section h2 {
  color: #0066cc;
  margin-bottom: 10px;
}

.create-itinerary-section p {
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
  transform: translateY(-2px);
}

.btn-secondary {
  padding: 10px 20px;
  border: 2px solid #f7941d;
  border-radius: 8px;
  background: transparent;
  color: #f7941d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  width: 100%;
}

.btn-secondary:hover {
  background: #f7941d;
  color: white;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 20px;
  }

  .activities-grid {
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
