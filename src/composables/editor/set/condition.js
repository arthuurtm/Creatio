import { useEditorStore, generateId } from '@/stores/editor.js'
import { computed } from 'vue'

export const conditions = computed(() => ({
  text: 'Condições',
  icon: 'check_circle',
  definitions: {
    // --- Personagem / Inventário ---
    hasItem: {
      text: 'Item',
      icon: 'inventory',
      params: [
        {
          key: 'itemId',
          label: 'Item',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'item'
          required: true,
        },
        { key: 'quantity', label: 'Quantidade Mínima', type: 'number', default: 1 },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'item', ...params }),
    },
    hasCurrency: {
      text: 'Moeda',
      icon: 'attach_money',
      params: [
        { key: 'currencyType', label: 'Tipo de Moeda', type: 'text', default: 'gold' },
        { key: 'amount', label: 'Quantidade Mínima', type: 'number', default: 1 },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'currency', ...params }),
    },
    hasStatus: {
      text: 'Status',
      icon: 'medication',
      params: [
        {
          key: 'statusId',
          label: 'Status',
          type: 'select',
          options: useEditorStore.statuses,
          required: true,
        },
        { key: 'active', label: 'Ativo?', type: 'boolean', default: true },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'status', ...params }),
    },
    hasAttribute: {
      text: 'Atributo',
      icon: 'bar_chart',
      params: [
        { key: 'attribute', label: 'Atributo (ex: FOR)', type: 'text', required: true },
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['>=', '<=', '==', '>', '<', '!='],
          default: '>=',
        },
        { key: 'value', label: 'Valor', type: 'text', required: true },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'attribute', ...params }),
    },
    hasSkill: {
      text: 'Habilidade',
      icon: 'school',
      params: [
        {
          key: 'skillId',
          label: 'Habilidade',
          type: 'select',
          options: useEditorStore.skills,
          required: true,
        },
        { key: 'level', label: 'Nível Mínimo', type: 'number', default: 1 },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'skill', ...params }),
    },
    hasCompanion: {
      text: 'Companheiro',
      icon: 'people',
      params: [
        {
          key: 'companionId',
          label: 'Companheiro',
          type: 'select',
          options: useEditorStore.companions,
          required: true,
        },
        { key: 'active', label: 'Ativo no grupo?', type: 'boolean', default: true },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'companion', ...params }),
    },
    hasRelation: {
      text: 'Relação',
      icon: 'group',
      params: [
        {
          key: 'targetId',
          label: 'Alvo da Relação',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'npc'
          required: true,
        },
        { key: 'level', label: 'Nível de Relação', type: 'number', default: 1 },
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['>=', '<=', '==', '>', '<', '!='],
          default: '>=',
        },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'relation', ...params }),
    },

    // --- Estado do Jogo ---
    hasFlag: {
      text: 'Flag',
      icon: 'flag',
      params: [
        {
          key: 'flagId',
          label: 'Flag',
          type: 'select',
          options: useEditorStore.flags,
          required: true,
        },
        { key: 'value', label: 'Valor', type: 'text', default: true },
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['==', '!=', '>=', '<='], // Comparador para o valor
          default: '==',
        },
      ],
      execute: (params) => pushCondition('has', { subtype: 'flag', ...params }),
    },
    isQuestActive: {
      text: 'Missão (Status)',
      icon: 'assignment',
      params: [
        {
          key: 'questId',
          label: 'Missão',
          type: 'select',
          options: useEditorStore.quests,
          required: true,
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['not_started', 'active', 'completed', 'failed'],
          default: 'active',
        },
      ],
      execute: (params) => pushCondition('quest', { subtype: 'status', ...params }),
    },
    isQuestStepComplete: {
      text: 'Missão (Etapa)',
      icon: 'rule',
      params: [
        {
          key: 'questId',
          label: 'Missão',
          type: 'select',
          options: useEditorStore.quests,
          required: true,
        },
        { key: 'stepKey', label: 'Etapa (Chave)', type: 'text', required: true },
        { key: 'completed', label: 'Completa?', type: 'boolean', default: true },
      ],
      execute: (params) => pushCondition('quest', { subtype: 'step', ...params }),
    },
    isNodeUnlocked: {
      text: 'Nó Destravado',
      icon: 'lock_open',
      params: [
        {
          key: 'nodeId',
          label: 'Nó',
          type: 'select',
          options: useEditorStore.nodes,
          required: true,
        },
        { key: 'unlocked', label: 'Destravado?', type: 'boolean', default: true },
      ],
      execute: (params) => pushCondition('node', { subtype: 'unlocked', ...params }),
    },
    checkObjectState: {
      text: 'Estado de Objeto',
      icon: 'toggle_on',
      params: [
        {
          key: 'objectId',
          label: 'Objeto',
          type: 'select',
          options: useEditorStore.objects,
          required: true,
        },
        { key: 'stateKey', label: 'Chave do Estado (ex: isOpen)', type: 'text', required: true },
        { key: 'value', label: 'Valor Esperado', type: 'text', required: true },
      ],
      execute: (params) => pushCondition('object', { subtype: 'state', ...params }),
    },
  },
}))

function pushCondition(type, params) {
  const editorStore = useEditorStore
  const id = generateId('cond')
  const condition = { id, type, ...params }
  editorStore.conditions.push(condition)
  return id
}
