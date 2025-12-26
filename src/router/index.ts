import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { http } from '@/functions/'

// 1. Definição de Tipos para o Meta (Type Safety)
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    hiddenNavigator?: boolean
    fullscreen?: boolean
  }
}

// 2. Imports de Componentes e Layouts
const LayoutBase = () => import('@/layouts/LayoutBase.vue')
const LayoutForm = () => import('@/layouts/LayoutPageForm.vue')

// 3. Array de Rotas Tipado
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LayoutBase,
    children: [
      {
        path: '',
        name: 'About',
        component: () => import('@/views/about/AboutView.vue'),
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/user/HomeView.vue'),
      },
      {
        path: 'user/:username',
        name: 'UserProfile',
        component: () => import('@/views/user/UserProfileView.vue'),
        props: true,
      },
      {
        path: 'games',
        children: [
          {
            path: ':id',
            name: 'GameDetails',
            component: () => import('@/views/game/general/GameDetailsView.vue'),
            props: true,
            meta: { fullscreen: true, hiddenNavigator: true },
          },
        ],
      },
      {
        path: 'projects',
        children: [
          {
            path: '',
            name: 'CreateHome',
            component: () => import('@/views/game/edit/ProjectsView.vue'),
            meta: { requiresAuth: true },
          },
          {
            path: ':id/edit',
            name: 'EditGame',
            component: () => import('@/views/game/edit/GameEditView.vue'),
            props: true,
            meta: { requiresAuth: true, hiddenNavigator: true, fullscreen: true },
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    component: LayoutForm,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/FormLoginView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'signup',
        name: 'Signup',
        component: () => import('@/views/auth/FormSignupView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'password/rescue',
        name: 'PasswordRescue',
        component: () => import('@/views/auth/FormPasswordRescueView.vue'),
      },
    ],
  },
  { path: '/login', redirect: { name: 'Login' } },
  {
    path: '/:pathMatch(.*)*',
    name: 'ErrNotFound',
    component: () => import('@/views/err/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 4. Navigation Guard
router.beforeEach(async (to, from, next) => {
  const isLoggedIn = await http.auth.isAuthenticated()

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'About') && isLoggedIn) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

// 5. Tratamento de Erros de Importação (Vuetify/Vite)
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module') && !localStorage.getItem('vuetify:dynamic-reload')) {
    localStorage.setItem('vuetify:dynamic-reload', 'true')
    location.assign(to.fullPath)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
