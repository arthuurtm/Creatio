import { defineStore } from 'pinia'
import { getSubCategories, categories } from '@/lib/editor/index.js'
import type { EditorState } from '@/types/editor-models'

const models = (): EditorState => ({
  // Estrutura
  nodes: [],
  connections: [],

  // Dados do Jogo
  info: {
    id: null,
    title: '',
    version: '1.0.0',
    description: '',
  },
  objects: [],
  avatars: [],
  flags: [],
  statuses: [],
  skills: [],
  companions: [],
  quests: [],
  assets: [],

  // Lógica (Instâncias)
  conditions: [],
  consequences: [],
  events: [],
  actions: [],
})
function generateId(prefix: string) {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}_${time}_${rand}`
}

export const useEditorStore = defineStore('editor', {
  state: () => models(),
  actions: {
    setState(newState: Partial<EditorState>) {
      this.$patch(newState)
    },
    getModel() {
      return models()
    },
  },
})

export { generateId, getSubCategories, categories }
