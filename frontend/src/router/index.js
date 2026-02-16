import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/registrazione',
    name: 'Registrazione',
    component: () => import('@/views/RegistrazionePage.vue')
  },
  {
    path: '/profilo',
    name: 'Profilo',
    component: () => import('@/views/ProfiloPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lista-itinerari',
    name: 'ListaItinerari',
    component: () => import('@/views/ListaItinerariPage.vue')
  },
  {
    path: '/ricerca-attivita',
    name: 'RicercaAttivita',
    component: () => import('@/views/RicercaAttivitaPage.vue')
  },
  {
    path: '/crea-percorso',
    name: 'CreaPercorso',
    component: () => import('@/views/CreaPercorsoPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/genera-itinerario',
    name: 'GeneraItinerario',
    component: () => import('@/views/GeneraItinerarioPage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
