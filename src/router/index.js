import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/LoginView.vue';
import Home from '@/views/HomeView.vue';
import { isAuthenticated } from '@/utils/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
    },
  ],
});

// Middleware de autenticação
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
