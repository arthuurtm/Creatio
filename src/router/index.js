import { createRouter, createWebHistory } from 'vue-router'
import { useFormStore } from '@/stores/form'
import { isAuthenticated } from '@/functions/auth'

// Errors
import ErrNotFound from '@/configs/errors/ErrNotFound.vue'

// Forms page
import Login from '@/configs/forms/FormLogin.vue'
import Signup from '@/configs/forms/FormSignup.vue'
import PasswordRescue from '@/configs/forms/FormPasswordRescue.vue'

// Main Pages
import ViewAbout from '@/views/ViewAbout.vue'
import ViewCreate from '@/views/ViewCreate.vue'
import ViewGameRun from '@/views/ViewGameRun.vue'
import ViewHome from '@/views/ViewHome.vue'

// Layouts
import AppMain from '@/layouts/AppHome.vue'

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
          path: 'create/:id?',
          name: 'Create',
          component: ViewCreate,
          meta: { requiresAuth: true, hiddenNavigator: true },
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
          props: { configFile: 'login' },
          meta: { requiresAuth: false },
          component: Login,
        },
        {
          path: 'signup',
          name: 'Signup',
          props: { configFile: 'signup' },
          meta: { requiresAuth: false },
          component: Signup,
        },
        {
          path: 'password/rescue',
          name: 'PasswordRescue',
          props: { configFile: 'passwordRescue' },
          component: PasswordRescue,
        },
      ],
    },
  ],
})

// Router Guard
router.beforeEach(async (to, from, next) => {
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
