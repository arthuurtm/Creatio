import { useUserStore, useAppDynamicDialog } from '@/stores/dialog'

export default {
  install(app) {
    const userStore = useUserStore()
    app.provide('userStore', userStore)

    const dynamicDialog = useAppDynamicDialog()
    app.provide('dynamicDialog', dynamicDialog)
  },
}
