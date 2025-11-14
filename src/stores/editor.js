import { reactive, toRaw, onMounted, onUnmounted, watch } from 'vue'
import { defineStore } from 'pinia'
import addFunctions from '@/composables/editor/set/index.js'
import { ws, http } from '@/functions'
import { useUndoRedo } from '@/composables/useHistoryRef'
import { useSyncProtection } from '@/composables/useSyncProtection'

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

function reset() {
  return models()
}

function generateId(prefix) {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}_${time}_${rand}`
}

const useEditorStore = defineStore('editor', () => {
  // dados
  const base = reactive(models())

  //aux
  const { commitState } = useUndoRedo(base, Object.keys(base))
  const { data, status, connect, send, disconnect } = ws(http.getApiUrl('ws'))
  const { isLocalStateNewer } = useSyncProtection(base)

  // funções
  function updateGameData() {
    const dataToSend = { base, ...base.info }
    send({ event: 'game:lab:update:json', payload: dataToSend })
  }
  function setEditorState(newState) {
    if (isLocalStateNewer(newState, Object.keys(base))) {
      return
    } else {
      Object.assign(useEditorStore, structuredClone(newState))
    }
  }

  onMounted(async () => {
    await connect()
  })

  onUnmounted(() => {
    disconnect()
    reset()
  })

  // watch
  watch(data, (newMessage) => {
    if (!newMessage || !newMessage.event) return
    if (newMessage.event === 'game:lab:get:json:success') {
      setEditorState(newMessage.payload)
    }
  })
  watch(
    base,
    () => {
      commitState()
      if (status.value === 'OPEN') updateGameData()
    },
    { deep: true },
  )

  // store
  const store = Object.assign(base, {
    $state: base,
    $properties: () => Object.keys(base),
    $rawState: () => toRaw(base),
    $reset: reset,
  })

  return store
})

export { useEditorStore, generateId, addFunctions }
