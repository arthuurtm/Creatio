import type { App } from 'vue'
import router from '../router'
import pinia from './pinia'

export function registerPlugins (app: App) {
  app
    .use(router)
    .use(pinia)
}
