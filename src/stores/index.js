import { useUserStore } from './user'
import { useFormStore } from './form'
import { useGlobalStore, useSettingsStore, useAppDynamicDialog } from './global'

export function createStores() {
  return {
    user: useUserStore(),
    form: useFormStore(),
    dialog: useAppDynamicDialog(),
    global: useGlobalStore(),
    settings: useSettingsStore(),
  }
}
