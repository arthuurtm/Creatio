import { useUserStore } from './user'
import { useFormStore } from './form'
import { useAppDynamicDialog } from './dialog'

export function createStores() {
  return {
    user: useUserStore(),
    form: useFormStore(),
    dialog: useAppDynamicDialog(),
  }
}
