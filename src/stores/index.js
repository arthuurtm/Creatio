import { useUserStore } from './user'
import { useFormStore } from './form'
import { useGlobalStore, useSettingsStore, useAppDynamicDialog } from './global'

export { useUserStore, useGlobalStore, useSettingsStore, useAppDynamicDialog, useFormStore }
export function createStores() {
  return {
    user: useUserStore(),
    form: useFormStore(),
    dialog: useAppDynamicDialog(),
    global: useGlobalStore(),
    settings: useSettingsStore(),
  }
}
