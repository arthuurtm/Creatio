/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
import Antd from 'ant-design-vue'
import { createApp, type App as VueApp } from 'vue'
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify'
import { registerPlugins } from '@/plugins'
import App from './App.vue'
import pinia from './plugins/pinia'
import 'unfonts.css'
import '@/assets/css/main.css'
function resolveGLobalComponents (instance: VueApp<Element>) {
  instance.use(Antd)
}

const app = createApp(App)
app.use(pinia)
app.use(Vue3Toasity, { useHandler: resolveGLobalComponents } as ToastContainerOptions)
registerPlugins(app)
app.mount('#app')
