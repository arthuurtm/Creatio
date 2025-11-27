import { actions } from './actions'
import { events } from './events'
import { conditions } from './conditions'
import { consequences } from './consequences'
import { objects } from './objects'
import { quests } from './quests'
import { skills } from './skills'
import { assets } from './assets'
import { nodes } from './nodes'

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
 * @typedef {'actions' | 'events' | 'conditions' | 'consequences' | 'objects' | 'quests' | 'skills' | 'assets' | 'nodes'} CategoryKey
 */

/**
 * Define as informações de exibição para cada categoria principal no editor.
 * @typedef {Object} ComponentConfig
 * @property {string} text - O nome de exibição.
 * @property {string} icon - O ícone (Material Design Icon).
 */

/**
 * O mapa de módulos importados, mapeando as chaves de categoria para seus respectivos
 * objetos de definição (computados ou estáticos) do editor.
 *
 * @type {Object<CategoryKey, import('vue').ComputedRef<EditorConfig>>}
 */
const metadata = {
  actions,
  events,
  conditions,
  consequences,
  objects,
  quests,
  skills,
  assets,
  nodes,
}

/**
 * Extrai o mapa de definições (subcategorias) de uma categoria principal.
 *
 * @param {CategoryKey | null} [categoryKey=null] - A chave da categoria (ex: 'condition').
 * @returns {Object<string, Object> | FallbackItem[]} Retorna o mapa de definições (ex: { hasItem: ... })
 * ou um array de fallback se a categoria não for encontrada.
 */
function getSubCategories(categoryKey = null) {
  // Assume que o objeto de definição importado segue a estrutura { value: { definitions: ... } }
  // O uso de 'value' sugere que os objetos importados são ComputedRefs do Vue.
  return metadata[categoryKey]?.value?.definitions ?? {}
}

/**
 * Agregador central para as configurações reativas (Computadas) do editor.
 * Expõe as definições de Ações, Eventos, Condições e Consequências,
 * além de um método utilitário para extrair as subcategorias e as configurações de componentes.
 *
 * @typedef {Object} AddFunctions
 * @property {import('vue').ComputedRef<EditorConfig>} actions - Configuração reativa para Ações.
 * @property {import('vue').ComputedRef<EditorConfig>} events - Configuração reativa para Eventos.
 * @property {import('vue').ComputedRef<EditorConfig>} conditions - Configuração reativa para Condições.
 * @property {import('vue').ComputedRef<EditorConfig>} consequences - Configuração reativa para Consequências.
 * @property {import('vue').ComputedRef<EditorConfig>} objects - Configuração reativa para Objetos.
 * @property {import('vue').ComputedRef<EditorConfig>} quests - Configuração reativa para Missões.
 * @property {import('vue').ComputedRef<EditorConfig>} skills - Configuração reativa para Habilidades.
 * @property {import('vue').ComputedRef<EditorConfig>} assets - Configuração reativa para Recursos.
 * @property {import('vue').ComputedRef<EditorConfig>} nodes - Configuração reativa para Linhas do tempo.
 * @property {function(CategoryKey | null): (Object<string, Object> | FallbackItem[])} getSubCategories - Método para extrair as definições.
 * @property {Object<CategoryKey, ComponentConfig>} components - Mapeamento das configurações de exibição para cada categoria.
 */

/**
 * @type {AddFunctions}
 */
const addFunctions = {
  ...metadata,
  getSubCategories,
  components: metadata,
}

export default addFunctions
