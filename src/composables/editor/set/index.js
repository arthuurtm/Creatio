import { actions } from './action'
import { events } from './event'
import { conditions } from './condition'
import { consequences } from './consequence'
import { objects } from './objects'
import { quests } from './quests'
import { skills } from './skills'
import { assets } from './asset'

/**
 * Define a estrutura do objeto de configuração para uma categoria do editor.
 * (Este é o valor resolvido de dentro do 'computed' importado).
 *
 * @typedef {Object} EditorConfig
 * @property {string} text - O nome de exibição (ex: "Condições").
 * @property {string} icon - O ícone (ex: "check_circle").
 * @property {Object<string, Object>} definitions - O mapa de definições (ex: { hasItem: {...} }).
 */

/**
 * Define um item de fallback para a UI quando nenhuma subcategoria é encontrada.
 *
 * @typedef {Object} FallbackItem
 * @property {string} text - O texto de exibição.
 * @property {string} [icon] - O ícone opcional.
 */

/**
 * Chaves de categoria válidas para {@link AddFunctions}.
 * @typedef {'actions' | 'events' | 'conditions' | 'consequences' | 'objects' | 'quests' | 'skills' | 'assets'} CategoryKey
 */

/**
 * Agregador central para as configurações reativas (Computadas) do editor.
 * Expõe as definições de Ações, Eventos, Condições e Consequências,
 * além de um método utilitário para extrair as subcategorias.
 *
 * @typedef {Object} AddFunctions
 * @property {import('vue').ComputedRef<EditorConfig>} action - Configuração reativa para Ações.
 * @property {import('vue').ComputedRef<EditorConfig>} event - Configuração reativa para Eventos.
 * @property {import('vue').ComputedRef<EditorConfig>} condition - Configuração reativa para Condições.
 * @property {import('vue').ComputedRef<EditorConfig>} consequence - Configuração reativa para Consequências.
 * @property {function(CategoryKey | null): (Object<string, Object> | FallbackItem[])} getSubCategories - Método para extrair as definições.
 */

const components = {
  actions: { text: 'Ações', icon: 'bolt' },
  events: { text: 'Eventos', icon: 'event' },
  conditions: { text: 'Condições', icon: 'rule' },
  consequences: { text: 'Consequências', icon: 'flash_on' },
  objects: { text: 'Objetos', icon: 'category' },
  quests: { text: 'Missões', icon: 'assignment' },
  skills: { text: 'Habilidades', icon: 'build' },
  assets: { text: 'Recursos', icon: 'image' },
}

/** @type {CategoryKey} */
const metadata = { actions, events, conditions, consequences, objects, quests, skills, assets }

/**
 * Extrai o mapa de definições (subcategorias) de uma categoria principal.
 *
 * @param {CategoryKey | null} [categoryKey=null] - A chave da categoria (ex: 'condition').
 * @returns {Object<string, Object> | FallbackItem[]} Retorna o mapa de definições (ex: { hasItem: ... })
 * ou um array de fallback se a categoria não for encontrada.
 */
function getSubCategories(categoryKey = null) {
  return metadata[categoryKey]?.value?.definitions ?? {}
}

/**
 * @type {AddFunctions}
 */
const addFunctions = {
  ...metadata,
  getSubCategories,
  components,
}

export default addFunctions
