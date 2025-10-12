import { reactive } from 'vue'

export const useEditorStore = reactive({
  nodes: [],
  connections: [],
  objects: [],
  avatars: [],
  conditions: [{ id: 'teste1', text: 'Ter', type: 'has', _value: 'pau' }],
  consequences: [{ id: 'teste1', text: 'Saúde', type: 'health', _value: -1 }],
  events: [{ id: 'teste1', text: 'Matar', type: 'kill', _value: null }],
  actions: [{ id: 'teste1', text: 'Curar', type: 'cure', _value: +10 }],
})

export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
}
