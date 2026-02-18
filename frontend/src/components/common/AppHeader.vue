<template>
  <header class="app-header">
    <nav class="header-nav">
      <button class="home-button" @click="goHome" title="Torna alla Home">
        ← Home
      </button>
    </nav>
    <div class="header-title">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-spacer"></div>
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

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.app-header {
  background: rgba(0, 102, 204, 0.95);
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.header-nav {
  flex-shrink: 0;
}

.home-button {
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateX(-2px);
}

.header-title {
  flex: 1;
  text-align: center;
}

.header-title h1 {
  color: white;
  font-size: 24px;
  margin: 0;
}

.header-spacer {
  width: 100px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header-title h1 {
    font-size: 18px;
  }

  .home-button {
    font-size: 12px;
    padding: 6px 12px;
  }

  .header-spacer {
    width: 80px;
  }
}
</style>

