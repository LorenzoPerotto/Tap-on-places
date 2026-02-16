<template>
  <div ref="mapContainer" class="leaflet-map"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  pois: {
    type: Array,
    default: () => []
  },
  center: {
    type: Object,
    default: () => ({ lat: 46.0678, lng: 11.1211 })
  },
  zoom: {
    type: Number,
    default: 13
  }
})

const emit = defineEmits(['poi-click'])

const mapContainer = ref(null)
let map = null
const markers = []

onMounted(() => {
  initMap()
})

watch(() => props.pois, () => {
  updateMarkers()
}, { deep: true })

function initMap() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  map = L.map(mapContainer.value).setView(
    [props.center.lat, props.center.lng], 
    props.zoom
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  updateMarkers()
}

function updateMarkers() {
  if (!map) return

  markers.forEach(marker => map.removeLayer(marker))
  markers.length = 0

  props.pois.forEach(poi => {
    const marker = L.marker([poi.coordinate.lat, poi.coordinate.lng])
      .addTo(map)

    const popupContent = `
      <div class="popup-content">
        ${poi.image ? `<img src="${poi.image}" class="popup-image" alt="${poi.nome}">` : ''}
        <h3 class="popup-title">${poi.nome}</h3>
        <p class="popup-description">${poi.descrizione || ''}</p>
      </div>
    `

    marker.bindPopup(popupContent)

    marker.on('click', () => {
      emit('poi-click', poi)
    })

    markers.push(marker)
  })
}
</script>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1;
}
</style>

<style>
.popup-content {
  text-align: left;
  min-width: 200px;
}

.popup-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  color: #0066cc;
  margin-bottom: 8px;
}

.popup-description {
  font-size: 14px;
  margin-bottom: 12px;
  color: #555;
}
</style>
