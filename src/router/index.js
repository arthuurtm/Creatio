import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Signup from '@/views/Signup.vue';
import Teste from '@/views/pages/Teste.vue';
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
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false },
  },
  { 
    path: '/password/reset', 
    name: 'Reset Password', 
    component: ResetPassword,
    meta: { requiresAuth: false },
  },
  { 
    path: '/signup', 
    name: 'Signup', 
    component: Signup,
    meta: { requiresAuth: false },
  },
  { 
    path: '/teste', 
    name: 'Teste', 
    component: Teste,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware de autenticação para redirecionar usuários
router.beforeEach(async (to, from, next) => {
  const isLoggedIn = await isAuthenticated();

  if (to.meta.requiresAuth && !isLoggedIn) {
    // Redireciona para a página de login com a rota atual como parâmetro
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.path === '/login' && isLoggedIn) {
    // Se o usuário já está autenticado, redireciona para a página inicial
    next({ path: '/' });
  } else {
    // Permite navegação
    next();
  }
});


export default router;
