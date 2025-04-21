import './assets/css/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import pinia from './plugins/pinia'
import * as globalFunc from './functions/functions'
import userStorePlugin from './plugins/states'
import dialogsComponents from '@/configs/global/dialogs'
import { showToast } from './plugins/toast'
import Toast from 'vue-toastification'
import elements from './plugins/elements'

import 'vue-toastification/dist/index.css'
import '@/assets/css/elements/e-toast.css'

const app = createApp(App)

// Configura as funções globais
app.config.globalProperties.$globalFunc = globalFunc
app.config.globalProperties.$toast = showToast

// Carrega configurações globais
app.use(router)
app.use(pinia)
app.use(userStorePlugin)
app.use(dialogsComponents)
app.use(Toast)
app.use(elements)

app.mount('#app')
