import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/LoginView.vue';
import Games from '@/views/GamesView.vue';
import GameRun from '@/views/RunView.vue';
import { isAuthenticated } from '@/utils/auth';

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
  { 
    path: '/',
    name: 'Games',
    component: Games
  },
  {
    path: '/run/:id',
    name: 'GameRun',
    component: GameRun,
    meta: { requiresAuth: true },
    props: true, // Passa o parâmetro como prop para o componente
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware de autenticação para redirecionar não autenticados
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
