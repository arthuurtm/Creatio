import { createRouter, createWebHistory } from 'vue-router'
import { http } from '@/functions/'

// Errors
import ErrNotFound from '@/views/err/NotFoundView.vue'

// Pages
import FormLogin from '@/views/auth/FormLoginView.vue'
import FormSignup from '@/views/auth/FormSignupView.vue'
import FormPasswordRescue from '@/views/auth/FormPasswordRescueView.vue'
import ViewAbout from '@/views/about/AboutView.vue'
import ViewGameDetails from '@/views/game/general/GameDetailsView.vue'
import ViewHome from '@/views/user/HomeView.vue'
import ViewUserProfile from '@/views/user/UserProfileView.vue'
import ViewGameRun from '@/views/game/general/GameRunView.vue'
import ProjectsView from '@/views/game/edit/ProjectsView.vue'
import GameEdit from '@/views/game/edit/GameEditView.vue'

// Layouts
import LayoutBase from '@/layouts/LayoutBase.vue'
import LayoutForm from '@/layouts/LayoutPageForm.vue'

/**
 * @typedef {Object} RouteMeta
 * @property {boolean} [requiresAuth]
 * @property {boolean} [hiddenNavigator]
 * @property {boolean} [fullscreen]
 */

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LayoutBase,
      children: [
        { path: '', name: 'About', component: ViewAbout },
        { path: 'home', name: 'Home', component: ViewHome },
        { path: 'user/:username', name: 'UserProfile', component: ViewUserProfile, props: true },
        {
          path: 'games',
          children: [
            {
              path: ':id',
              name: 'GameDetails',
              component: ViewGameDetails,
              props: true,
              meta: { fullscreen: true, hiddenNavigator: true },
            },
          ],
        },
        {
          path: 'projects',
          children: [
            { path: '', name: 'CreateHome', component: ProjectsView, meta: { requiresAuth: true } },
            {
              path: ':id/edit',
              name: 'EditGame',
              component: GameEdit,
              props: true,
              meta: { requiresAuth: true, hiddenNavigator: true, fullscreen: true },
            },
          ],
        },
      ],
    },

    {
      path: '/auth',
      children: [
        { path: 'login', name: 'Login', component: FormLogin, meta: { requiresAuth: false } },
        { path: 'signup', name: 'Signup', component: FormSignup, meta: { requiresAuth: false } },
        { path: 'password/rescue', name: 'PasswordRescue', component: FormPasswordRescue },
      ],
    },

    // {
    //   path: '/games/:id/run',
    //   component: LayoutGame, // layout fullscreen especial
    //   children: [
    //     {
    //       path: '',
    //       name: 'GameRun',
    //       component: ViewGameRun,
    //       props: true,
    //       meta: { requiresAuth: true },
    //     },
    //   ],
    // },

    { path: '/login', redirect: { name: 'Login' } },
    { path: '/:pathMatch(.*)*', name: 'ErrNotFound', component: ErrNotFound },
  ],
})

// Router Guard
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

export default router
