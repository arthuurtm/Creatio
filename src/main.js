// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as globalFunc from '@/utils/globalFunc.js';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.globalProperties.$globalFunc = globalFunc;

app.use(createPinia())
app.use(router)

app.mount('#app')
