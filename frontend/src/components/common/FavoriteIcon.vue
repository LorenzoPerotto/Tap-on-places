<template>
  <button 
    :class="['favorite-icon', { active: isFavorite }]"
    @click.stop="toggleFavorite"
    :title="isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
  >
    {{ isFavorite ? '❤️' : '🤍' }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    validator: (value) => ['place', 'itinerary'].includes(value)
  },
  item: {
    type: Object,
    required: true
  }
})

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const isFavorite = computed(() => {
  if (props.itemType === 'place') {
    return favoritesStore.isActivitySaved(props.itemId)
  } else {
    return favoritesStore.isItinerarySaved(props.itemId)
  }
})

function toggleFavorite() {
  if (props.itemType === 'place') {
    if (isFavorite.value) {
      favoritesStore.removeActivity(props.itemId)
      toastStore.info('Rimosso dai preferiti')
    } else {
      favoritesStore.addActivity(props.item)
      toastStore.success('Aggiunto ai preferiti')
    }
  } else {
    if (isFavorite.value) {
      favoritesStore.removeItinerary(props.itemId)
      toastStore.info('Rimosso dai preferiti')
    } else {
      favoritesStore.addItinerary(props.item)
      toastStore.success('Aggiunto ai preferiti')
    }
  }
}
</script>

<style scoped>
.favorite-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  padding: 8px;
  transition: all 0.3s ease;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  border-radius: 50%;
}

.favorite-icon:hover {
  transform: scale(1.2);
  background: rgba(255, 255, 255, 0.3);
}

.favorite-icon.active {
  animation: heartbeat 0.3s ease;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
</style>
