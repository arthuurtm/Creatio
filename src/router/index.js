import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from '@/utils/auth';
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Signup from '@/views/Signup.vue';
import NotFound from '@/views/errors/NotFound.vue';
import Create from '@/views/Create.vue';
import About from '@/views/About.vue';

const routes = [
  { 
    // 404
    path: '/:pathMatch(.*)*',
    name: 'Not_Found',
    component: NotFound 
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { requiresAuth: false },
  },
  { 
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false },
  },
  { 
    path: '/password/reset', 
    name: 'Password_Reset', 
    component: ResetPassword,
  },
  { 
    path: '/signup', 
    name: 'Signup', 
    component: Signup,
    meta: { requiresAuth: false },
  },
  {
    path: '/create/:id?',
    name: 'Create',
    component: Create,
    meta: {requiresAuth: true },
    props: true
  },
  {
    path: '/',
    name: 'About',
    component: About,
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
    next({ path: '/home' });

  } else {
    // Permite navegação
    next();
  }
});


export default router;
