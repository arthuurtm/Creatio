import { createApp } from 'vue'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'

import pinia from './plugins/pinia'
import { showToast } from './plugins/toast'

import * as globalFunc from './functions'

import './assets/css/main.css'
import 'vue-toastification/dist/index.css'
import '@/assets/css/elements/e-toast.css'

const app = createApp(App)

// Configurações globais
app.use(router)
app.use(pinia)
app.use(Toast)

// Configura as funções globais
app.config.globalProperties.$globalFunc = globalFunc
app.config.globalProperties.$toast = showToast

app.mount('#app')
