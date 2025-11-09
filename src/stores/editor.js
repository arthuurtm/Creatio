import { reactive, toRaw } from 'vue'
import addFunctions from '@/composables/editor/set/index.js'

const base = reactive({
  // Estrutura
  nodes: [],
  connections: [],
  regions: [],

  // Dados do Jogo
  objects: [], // Itens, NPCs, Inimigos, Contêineres, etc.
  avatars: [], // Personagens dos jogadores
  flags: [], // Flags/variáveis globais
  statuses: [], // Definições de status (envenenado, abençoado)
  skills: [], // Definições de habilidades
  companions: [], // Definições de companheiros
  quests: [], // Definições de missões

  // Lógica (Instâncias)
  conditions: [],
  consequences: [],
  events: [],
  actions: [],
})

const useEditorStore = reactive({
  ...base,
  $reset() {
    Object.assign(this, structuredClone(toRaw(base)))
  },
  $getState: base,
  $getKeysName: Object.keys(base),
})

function generateId(prefix) {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}_${time}_${rand}`
}

export { useEditorStore, generateId, addFunctions }
