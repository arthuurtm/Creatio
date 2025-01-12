// import './assets/main.css'

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as globalFunc from '@/utils/globalFunc.js';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import ActionOverlay from './components/ActionOverlay.vue';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

// Seleciona o elemento app
const appElement = document.getElementById('app');
const isMobile = window.innerWidth <= 768;

// Adiciona as classes mobile ou pc com base na largura da tela
if (isMobile) {
  appElement.classList.add('mobile');
} else {
  appElement.classList.add('pc');
}

// Configura o globalFunc
app.config.globalProperties.$globalFunc = globalFunc;

// Cria uma instância manual do componente ActionOverlay
const overlayInstance = createApp(ActionOverlay).mount(document.createElement('div'));

// Aguarda o DOM estar completamente carregado antes de adicionar o overlay
document.addEventListener('DOMContentLoaded', () => {
  appElement.appendChild(overlayInstance.$el);
});

// Configura o método global para controle do overlay
app.config.globalProperties.$overlay = {
  show(params) {
    overlayInstance.show(params);
  },
  hide() {
    overlayInstance.hide();
  },
};

// Configura o Pinia com persistência de estado
pinia.use(piniaPluginPersistedState);

app.use(pinia);
app.use(router);

// Monta a aplicação Vue no elemento #app
app.mount('#app');
