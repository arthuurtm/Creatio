import { defineAsyncComponent } from 'vue'

export default {
  install(app) {
    const components = import.meta.glob('@/components/dialogs/*.vue')
    const registeredComponents = []

    for (const path in components) {
      const componentName = path
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')

      app.component(
        componentName,
        defineAsyncComponent(() => components[path]()),
      )

      registeredComponents.push(componentName)
    }
  },
}
