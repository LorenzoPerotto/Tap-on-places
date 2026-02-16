<template>
  <header class="app-header">
    <div class="header-content">
      <button class="back-button" @click="goBack">
        ← Indietro
      </button>
      <h1>{{ title }}</h1>
      <div class="header-spacer"></div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    required: true
  }
})

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.app-header {
  background: rgba(0, 102, 204, 0.95);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.app-header h1 {
  color: white;
  font-size: 24px;
  text-align: center;
  flex: 1;
}

.header-spacer {
  width: 100px;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 18px;
  }

  .back-button {
    font-size: 12px;
    padding: 6px 12px;
  }

  .header-spacer {
    width: 80px;
  }
}
</style>
