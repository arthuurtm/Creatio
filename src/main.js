import { createApp } from 'vue'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'
import { createStores } from './stores'

import pinia from './plugins/pinia'
import elements from './plugins/elements'
import { showToast } from './plugins/toast'
import dialogsComponents from '@/plugins/dialogs'

import * as globalFunc from './functions/functions'

import './assets/css/main.css'
import 'vue-toastification/dist/index.css'
import '@/assets/css/elements/e-toast.css'

const app = createApp(App)

// Configurações globais
app.use(router)
app.use(pinia)
app.use(dialogsComponents)
app.use(Toast)
app.use(elements)

// Configura as funções globais
app.config.globalProperties.$globalFunc = globalFunc
app.config.globalProperties.$toast = showToast

// Configura o store
const allStores = createStores()
app.provide('stores', allStores)

app.mount('#app')
