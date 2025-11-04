import { reactive } from 'vue'
import * as addFunctions from '@/composables/editor/set'

const base = {
  nodes: [],
  connections: [],
  objects: [],
  avatars: [],
  conditions: [],
  consequences: [],
  events: [],
  actions: [],
}

const baseState = {
  objects: { text: 'Objetos', icon: 'category' },
  avatars: { text: 'Avatares', icon: 'person' },
  conditions: { text: 'Condições', icon: 'rule' },
  consequences: { text: 'Consequências', icon: 'flash_on' },
  events: { text: 'Eventos', icon: 'event' },
  actions: { text: 'Ações', icon: 'bolt' },
}

const useEditorStore = reactive({
  ...structuredClone(base),

  $reset() {
    Object.assign(this, structuredClone(base))
  },

  $components: baseState,

  $add(key, subKey, ...args) {
    const fn = addFunctions[key]

    if (!fn) {
      console.warn(`[Editor] Função "${key}" não encontrada em addFunctions`)
      return
    }

    if (typeof fn === 'object' && subKey) {
      const subFn = fn.value?.[subKey]
      if (!subFn) {
        console.warn(`[Editor] Subfunção "${subKey}" não encontrada dentro de "${key}"`)
        return
      }
      if (typeof subFn.execute !== 'function') {
        console.warn(`[Editor] "${key}.${subKey}" não possui função execute válida`)
        return
      }
      return subFn.execute(...args)
    }

    // função simples
    if (typeof fn === 'function') {
      return fn(this, ...args)
    }

    console.warn(`[Editor] "${key}" não é uma função nem contém subfunções válidas`)
  },
})

function generateId(prefix) {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}_${time}_${rand}`
}

export { useEditorStore, generateId, addFunctions }
