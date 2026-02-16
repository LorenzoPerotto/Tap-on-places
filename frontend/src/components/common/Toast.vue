<template>
  <Transition name="toast">
    <div v-if="toastStore.visible" :class="['toast', toastStore.type]">
      <span class="toast-icon">{{ getIcon() }}</span>
      <span class="toast-message">{{ toastStore.message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

function getIcon() {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[toastStore.type] || 'ℹ'
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  min-width: 300px;
  font-weight: 500;
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
}

.toast.success {
  background: #4caf50;
  color: white;
}

.toast.error {
  background: #f44336;
  color: white;
}

.toast.warning {
  background: #ff9800;
  color: white;
}

.toast.info {
  background: #2196f3;
  color: white;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
