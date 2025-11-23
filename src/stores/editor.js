import { defineStore } from 'pinia'
import addFunctions from '@/composables/editor/set/index.js'

const models = () => ({
  // Estrutura
  nodes: [],
  connections: [],
  regions: [],

  // Dados do Jogo
  info: {
    id: null,
    title: '',
    version: '1.0.0',
    description: '',
  },
  objects: [],
  avatars: [],
  flags: [], // Flags/variáveis globais
  statuses: [], // Definições de status (envenenado, abençoado)
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

function generateId(prefix) {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}_${time}_${rand}`
}

export const useEditorStore = defineStore('editor', {
  state: () => models(),
  actions: {
    setState(newState) {
      this.$patch(newState)
    },
  },
})

export { generateId, addFunctions }
