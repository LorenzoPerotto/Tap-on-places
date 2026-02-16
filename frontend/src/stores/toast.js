import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const type = ref('info')
  const visible = ref(false)

  function show(msg, toastType = 'info') {
    message.value = msg
    type.value = toastType
    visible.value = true

    setTimeout(() => {
      visible.value = false
    }, 3000)
  }

  function success(msg) {
    show(msg, 'success')
  }

  function error(msg) {
    show(msg, 'error')
  }

  function info(msg) {
    show(msg, 'info')
  }

  function warning(msg) {
    show(msg, 'warning')
  }

  return {
    message,
    type,
    visible,
    show,
    success,
    error,
    info,
    warning
  }
})
