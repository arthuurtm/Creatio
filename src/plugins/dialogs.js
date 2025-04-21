import { defineAsyncComponent } from 'vue'

export default {
  install(app) {
    const components = import.meta.glob('@/configs/dialogs/*.vue')
    const registeredComponents = []

    for (const path in components) {
      const componentName = path
        .split('/')
        .pop() // Pega o último item (nome do arquivo)
        .replace(/\.\w+$/, '') // Remove a extensão do arquivo

      app.component(
        componentName,
        defineAsyncComponent(() => components[path]()),
      )

      registeredComponents.push(componentName)
    }
  },
}
