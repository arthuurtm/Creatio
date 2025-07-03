import { createRouter, createWebHistory } from 'vue-router'
import { useFormStore } from '@/stores/form'
import { isAuthenticated } from '@/functions/auth'

// Errors
import ErrNotFound from '@/layouts/ErrNotFound.vue'

// Forms page
import Login from '@/views/form/FormLogin.vue'
import Signup from '@/views/form/FormSignup.vue'
import PasswordRescue from '@/views/form/FormPasswordRescue.vue'

// Main Pages
import ViewAbout from '@/views/ViewAbout.vue'
import ViewGameDetails from '@/views/ViewGameDetails.vue'
import ViewHome from '@/views/ViewHome.vue'

// Layouts
import AppMain from '@/layouts/AppHome.vue'
import CreateHome from '@/views/create/CreateHome.vue'
import EditGame from '@/views/create/EditGame.vue'
import CreateGameSettings from '@/views/create/CreateGameSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'ErrNotFound',
      component: ErrNotFound,
    },

    {
      path: '/',
      name: 'Main',
      component: ViewAbout,
    },

    {
      path: '/login',
      redirect: { name: 'Login' },
    },

    {
      path: '/app',
      component: AppMain,
      children: [
        {
          path: 'home',
          name: 'Home',
          component: ViewHome,
        },

        {
          path: 'create',
          name: 'Create',
          meta: { requiresAuth: true },
          component: CreateHome,
        },

        {
          path: 'create/init',
          name: 'CreateGame',
          meta: { requiresAuth: true },
          component: CreateGameSettings,
        },

        {
          path: 'create/:id',
          name: 'EditGame',
          meta: { requiresAuth: true, hiddenNavigator: true },
          component: EditGame,
          props: true,
        },

        {
          path: 'game/:id',
          name: 'GameDetails',
          component: ViewGameDetails,
          props: true,
        },
      ],
    },

    {
      path: '/account',
      children: [
        {
          path: 'login',
          name: 'Login',
          meta: { requiresAuth: false },
          component: Login,
        },
        {
          path: 'signup',
          name: 'Signup',
          meta: { requiresAuth: false },
          component: Signup,
        },
        {
          path: 'password/rescue',
          name: 'PasswordRescue',
          component: PasswordRescue,
        },
      ],
    },
  ],
})

// Router Guard
router.beforeEach(async (to, from, next) => {
  console.log(to, from, next)
  const isLoggedIn = await isAuthenticated()

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.name } })
  } else if ((to.name === 'Login' || to.name === 'Main') && isLoggedIn) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

router.beforeEach((to, from, next) => {
  useFormStore().$reset()
  next()
})

export default router
