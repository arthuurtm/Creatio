// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import overlay from './plugins/overlay';
import * as globalFunc from './utils/functions.js';

// Cria o aplicativo Vue
const app = createApp(App);

// Configura as funções globais
app.config.globalProperties.$globalFunc = globalFunc;
// Configura plugins
app.use(router);
app.use(pinia);
app.use(overlay);

// Observa mudanças no tamanho da janela e atualiza classes no elemento #app
const appElement = document.getElementById('app');
globalFunc.observeResize(appElement);

// Monta o aplicativo
app.mount('#app');
