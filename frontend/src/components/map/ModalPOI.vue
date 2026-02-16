<template>
  <Transition name="modal">
    <div class="modal" @click.self="$emit('close')">
      <div class="modal-content">
        <span class="close" @click="$emit('close')">&times;</span>

        <div class="modal-header-with-favorite">
          <h2>{{ poi.nome }}</h2>
          <FavoriteIcon
            v-if="authStore.isAuthenticated"
            :item-id="poi._id"
            item-type="place"
            :item="poi"
            class="favorite-icon-large"
          />
        </div>

        <img 
          v-if="poi.image" 
          :src="poi.image" 
          :alt="poi.nome"
          class="modal-poi-image"
        >

        <div class="poi-details">
          <p><strong>Tipo:</strong> {{ poi.tipo }}</p>
          <p v-if="poi.tipologia"><strong>Tipologia:</strong> {{ poi.tipologia }}</p>
          <p v-if="poi.descrizione"><strong>Descrizione:</strong> {{ poi.descrizione }}</p>
          <p v-if="poi.tempo"><strong>Tempo visita:</strong> {{ poi.tempo }} minuti</p>
          <p v-if="poi.budget"><strong>Budget:</strong> €{{ poi.budget }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn-primary" @click="addToItinerary">
            Aggiungi a Percorso
          </button>
          <button class="btn-secondary" @click="$emit('close')">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import FavoriteIcon from '@/components/common/FavoriteIcon.vue'

const props = defineProps({
  poi: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const toastStore = useToastStore()

function addToItinerary() {
  const savedPois = JSON.parse(localStorage.getItem('tempItinerary') || '[]')

  if (!savedPois.find(p => p._id === props.poi._id)) {
    savedPois.push(props.poi)
    localStorage.setItem('tempItinerary', JSON.stringify(savedPois))
    toastStore.success('Aggiunto al percorso temporaneo')
  } else {
    toastStore.info('Già presente nel percorso')
  }
}
</script>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.close {
  position: absolute;
  right: 20px;
  top: 15px;
  font-size: 30px;
  cursor: pointer;
  color: #999;
  font-weight: bold;
}

.close:hover {
  color: #333;
}

.modal-header-with-favorite {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header-with-favorite h2 {
  color: #0066cc;
  margin: 0;
}

.modal-poi-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.poi-details {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.poi-details p {
  margin-bottom: 8px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 20px;
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

.btn-primary:hover {
  background: #e68917;
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
