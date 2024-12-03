import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/LoginView.vue';
import Games from '@/views/GamesView.vue';
import GameRun from '@/views/RunView.vue';
import ResetReq from '@/views/ResetPassdRequest.vue';
import ResetPassd from '@/views/ResetPassd.vue';
import { isAuthenticated } from '@/utils/auth';

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { requiresAuth: false },
  },
  { 
    path: '/',
    name: 'Games',
    component: Games,
    meta: { requiresAuth: false },
  },
  {
    path: '/run/:id',
    name: 'GameRun',
    component: GameRun,
    meta: { requiresAuth: true },
    props: true, // Passa o parâmetro como prop para o componente
  },
  { 
    path: '/password/reset', 
    name: 'Reset Password', 
    component: ResetPassd,
    meta: { requiresAuth: false },
  },
  { 
    path: '/password/request-reset', 
    name: 'Request Reset Password', 
    component: ResetReq,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware de autenticação para redirecionar usuários
router.beforeEach((to, from, next) => {
  const isLoggedIn = isAuthenticated();

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  
  } else if (to.path === '/login' && isLoggedIn) {
    next({ path: '/' });
  
  } else {
    next();
  }
});

export default router;
