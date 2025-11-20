import { reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'
import addFunctions from '@/composables/editor/set/index.js'
import { useUndoRedo } from '@/composables/useHistoryRef'

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

export const useEditorStore = defineStore('editor', () => {
  const base = reactive(models())

  // undo/redo
  const { commitState } = useUndoRedo(base, Object.keys(base))

  function setState(newState) {
    Object.assign(base, newState)
    commitState()
  }

  function reset() {
    Object.assign(base, models())
  }

  function raw() {
    const clean = {}
    const template = models()

    for (const key in template) {
      clean[key] = toRaw(base[key])
    }

    return clean
  }

  const store = Object.assign(base, {
    get $state() {
      return base
    },
    $properties: () => Object.keys(base),
    $rawState: raw,
    $reset: reset,
    $setState: setState,
  })

  return store
})

export { generateId, addFunctions }
