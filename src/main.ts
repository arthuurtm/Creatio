import { createApp } from 'vue'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'

import pinia from './plugins/pinia'
import { vuetify } from '@/plugins/vuetify'

import '@/assets/css/main.css'
import 'vue-toastification/dist/index.css'
import '@/assets/css/elements/e-toast.css'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(Toast)
app.use(vuetify)
app.mount('#app')
