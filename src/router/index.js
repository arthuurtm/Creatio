import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from '@/utils/auth';

// *root
import FormLayout from '@/layouts/FormLayout.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import NotFound from '@/views/NotFound.vue';

// /accounts
import Login from '@/views/Login.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Signup from '@/views/Signup.vue';

// /
import Create from '@/views/Create.vue';
import About from '@/views/About.vue';
import Games from '@/views/Games.vue';
import Home from '@/views/Home.vue';


const routes = [
  
  { 
    path: '/:pathMatch(.*)*',
    name: 'Not_Found',
    component: NotFound 
  },

  {
    path: '',
    name: 'About',
    component: About,
    meta: { requiresAuth:false, showNavigator:false },
    props: true
  },

  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'games',
        name: 'Games',
        component: Games,
      },

      {
        path: 'home',
        name: 'Home',
        redirect: {name: 'Games'}
        // name: 'Home',
        // component: Games, //temporário
      },

      {
        path: 'create/:id?',
        name: 'Create',
        component: Create,
        meta: {requiresAuth: true },
        props: true
      },
    ]
  },

  {
    path: '/accounts',
    component: FormLayout,
    children: [
      {
        path: '',
        name: 'ROOT_Accounts',
        redirect: {name: 'Login'}
      },

      {
        path: 'signup',
        name: 'Signup',
        component: Signup,
        meta: { requiresAuth: false }
      },
    
      { 
        path: 'login', 
        name: 'Login', 
        component: Login,
        meta: { requiresAuth: false },
      },
    
      { 
        path: 'password/reset', 
        name: 'Password_Reset', 
        component: ResetPassword,
      },
    ]
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
    console.log('Vue Router > situation: 1');
    next({ name: 'Login', query: { redirect: to.fullPath } });

  } else if (to.name === 'Login' && isLoggedIn) {
    console.log('Vue Router > situation: 2');
    next({ name: 'Home' });
    
  } else {
    console.log('Vue Router > situation: 3');
    next();

  }

});

export default router;
