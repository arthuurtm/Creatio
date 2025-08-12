import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/functions/auth'

// Errors
import ErrNotFound from '@/layouts/ErrNotFound.vue'

// Pages
import FormLogin from '@/views/form/FormLogin.vue'
import FormSignup from '@/views/form/FormSignup.vue'
import FormPasswordRescue from '@/views/form/FormPasswordRescue.vue'
import ViewAbout from '@/views/ViewAbout.vue'
import ViewGameDetails from '@/views/ViewGameDetails.vue'
import ViewHome from '@/views/ViewHome.vue'
import ViewUserProfile from '@/views/ViewUserProfile.vue'
import ViewGameRun from '@/views/ViewGameRun.vue'
import CreateHome from '@/views/create/CreateHome.vue'
import CreateGameSettings from '@/views/create/CreateGameSettings.vue'
import EditGame from '@/views/create/EditGame.vue'

// Layouts
import AppHome from '@/layouts/AppHome.vue'
import AppCreateGame from '@/layouts/AppCreateGame.vue'
import AppGame from '@/layouts/AppGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'About',
      component: ViewAbout,
    },

    {
      path: '/home',
      component: AppHome,
      children: [
        {
          path: '',
          name: 'Home',
          component: ViewHome,
        },
      ],
    },

    {
      path: '/auth',
      children: [
        {
          path: 'login',
          name: 'Login',
          meta: { requiresAuth: false },
          component: FormLogin,
        },
        {
          path: 'signup',
          name: 'Signup',
          meta: { requiresAuth: false },
          component: FormSignup,
        },
        {
          path: 'password/rescue',
          name: 'PasswordRescue',
          component: FormPasswordRescue,
        },
      ],
    },

    {
      path: '/u/:username',
      name: 'UserProfile',
      component: ViewUserProfile,
      props: true,
    },

    {
      path: '/games',
      component: AppGame,
      children: [
        {
          path: ':id',
          name: 'GameDetails',
          component: ViewGameDetails,
          props: true,
        },
        {
          path: ':id/run',
          name: 'GameRun',
          component: ViewGameRun,
          props: true,
        },
      ],
    },

    {
      path: '/games/create',
      component: AppCreateGame,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'CreateHome',
          component: CreateHome,
        },
        {
          path: 'init',
          name: 'CreateGame',
          component: CreateGameSettings,
        },
        {
          path: ':id',
          name: 'EditGame',
          component: EditGame,
          props: true,
          meta: { hiddenNavigator: true },
        },
      ],
    },

    // Redirecionamentos e erros
    {
      path: '/login',
      redirect: { name: 'Login' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'ErrNotFound',
      component: ErrNotFound,
    },
  ],
})

// Router Guard
router.beforeEach(async (to, from, next) => {
  const isLoggedIn = await isAuthenticated()

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.name } })
  } else if ((to.name === 'Login' || to.name === 'About') && isLoggedIn) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
