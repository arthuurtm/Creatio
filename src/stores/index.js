import { useUserStore } from './user'
import { useFormStore } from './form'
import { useAppDynamicDialog } from './dialog'
import { useGlobalStore } from './global'

export function createStores() {
  return {
    user: useUserStore(),
    form: useFormStore(),
    dialog: useAppDynamicDialog(),
    global: useGlobalStore(),
  }
}
