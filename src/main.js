import './assets/css/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import pinia from './plugins/pinia'
import * as globalFunc from './functions/functions'
import userStorePlugin from './plugins/states'
import dialogsComponents from '@/plugins/dialogs'

const app = createApp(App)

// Configura as funções globais
app.config.globalProperties.$globalFunc = globalFunc

// Carrega configurações globais
app.use(router)
app.use(pinia)
app.use(userStorePlugin)
app.use(dialogsComponents)

app.mount('#app')
