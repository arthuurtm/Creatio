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
  $categories: [
    { key: 'objects', name: 'Objetos', icon: 'category' },
    { key: 'avatars', name: 'Avatares', icon: 'person' },
    { key: 'conditions', name: 'Condições', icon: 'rule' },
    { key: 'consequences', name: 'Consequências', icon: 'flash_on' },
    { key: 'events', name: 'Eventos', icon: 'event' },
    { key: 'actions', name: 'Ações', icon: 'bolt' },
  ],
  ...structuredClone(base),
}

const useEditorStore = (() => {
  const state = reactive(structuredClone(baseState))

  const $reset = () => {
    Object.assign(state, structuredClone(baseState))
  }

  /**
   * Adiciona algo ao editor, chamando a função correspondente em addFunctions
   * @param {keyof typeof addFunctions} key - Nome da função em addFunctions
   * @param {...any} args - Argumentos a serem passados à função
   */
  const $add = (key, subKey, ...args) => {
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

    // caso 3: função simples
    if (typeof fn === 'function') {
      return fn(state, ...args)
    }

    console.warn(`[Editor] "${key}" não é uma função nem contém subfunções válidas`)
  }

  return { ...state, $reset, $add }
})()

function generateId(prefix) {
  const time = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e6).toString(36)
  return `${prefix}_${time}_${rand}`
}

export { useEditorStore, generateId, addFunctions }
