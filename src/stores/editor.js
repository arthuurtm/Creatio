import { reactive } from 'vue'

const state = {
  nodes: [],
  connections: [],
  objects: [],
  avatars: [],
  conditions: [],
  consequences: [],
  events: [],
  actions: [],
}

export const useEditorStore = reactive({
  ...structuredClone(state),
  $reset() {
    Object.assign(this, structuredClone(state))
  },
})

export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
}
