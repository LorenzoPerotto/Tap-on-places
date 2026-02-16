import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  const savedActivities = ref([])
  const savedItineraries = ref([])

  const savedActivitiesCount = computed(() => savedActivities.value.length)
  const savedItinerariesCount = computed(() => savedItineraries.value.length)

  function addActivity(activity) {
    if (!savedActivities.value.find(a => a._id === activity._id)) {
      savedActivities.value.push(activity)
      saveToStorage()
    }
  }

  function removeActivity(activityId) {
    savedActivities.value = savedActivities.value.filter(a => a._id !== activityId)
    saveToStorage()
  }

  function isActivitySaved(activityId) {
    return savedActivities.value.some(a => a._id === activityId)
  }

  function addItinerary(itinerary) {
    if (!savedItineraries.value.find(i => i._id === itinerary._id)) {
      savedItineraries.value.push(itinerary)
      saveToStorage()
    }
  }

  function removeItinerary(itineraryId) {
    savedItineraries.value = savedItineraries.value.filter(i => i._id !== itineraryId)
    saveToStorage()
  }

  function isItinerarySaved(itineraryId) {
    return savedItineraries.value.some(i => i._id === itineraryId)
  }

  function saveToStorage() {
    localStorage.setItem('savedActivities', JSON.stringify(savedActivities.value))
    localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries.value))
  }

  function loadFromStorage() {
    const activities = localStorage.getItem('savedActivities')
    const itineraries = localStorage.getItem('savedItineraries')

    if (activities) savedActivities.value = JSON.parse(activities)
    if (itineraries) savedItineraries.value = JSON.parse(itineraries)
  }

  return {
    savedActivities,
    savedItineraries,
    savedActivitiesCount,
    savedItinerariesCount,
    addActivity,
    removeActivity,
    isActivitySaved,
    addItinerary,
    removeItinerary,
    isItinerarySaved,
    saveToStorage,
    loadFromStorage
  }
})
