import { useEditorStore, generateId } from '@/stores/editor.js'

export const conditions = {
  text: 'Condições',
  icon: 'check_circle',
  value: {
    hasItem: {
      text: 'Item',
      icon: 'inventory',
      params: [
        { key: 'itemId', label: 'ID do Item', type: 'select', options: 'items', required: true },
        { key: 'quantity', label: 'Quantidade Mínima', type: 'number', default: 1 },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'item', ...params }),
    },
    hasCurrency: {
      text: 'Moeda',
      icon: 'attach_money',
      params: [
        { key: 'currencyType', label: 'Tipo de Moeda', type: 'text', default: 'gold' },
        { key: 'amount', label: 'Quantidade Mínima', type: 'number', default: 1 },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'currency', ...params }),
    },
    hasStatus: {
      text: 'Status',
      icon: 'medication',
      params: [
        {
          key: 'statusId',
          label: 'ID do Status',
          type: 'select',
          options: 'statuses',
          required: true,
        },
        { key: 'active', label: 'Ativo?', type: 'boolean', default: true },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'status', ...params }),
    },
    hasAttribute: {
      text: 'Atributo',
      icon: 'bar_chart',
      params: [
        { key: 'attribute', label: 'Atributo', type: 'text', required: true },
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['>=', '<=', '==', '>', '<', '!='],
          default: '>=',
        },
        { key: 'value', label: 'Valor', type: 'text', required: true },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'attribute', ...params }),
    },
    hasLevel: {
      text: 'Level',
      icon: 'trending_up',
      params: [
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['>=', '<=', '==', '>', '<', '!='],
          default: '>=',
        },
        { key: 'value', label: 'Nível', type: 'number', required: true },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'level', ...params }),
    },
    hasSkill: {
      text: 'Habilidade',
      icon: 'school',
      params: [
        {
          key: 'skillId',
          label: 'ID da Habilidade',
          type: 'select',
          options: 'skills',
          required: true,
        },
        { key: 'level', label: 'Nível Mínimo', type: 'number', default: 1 },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'skill', ...params }),
    },
    hasCompanion: {
      text: 'Companheiro',
      icon: 'people',
      params: [
        {
          key: 'companionId',
          label: 'ID do Companheiro',
          type: 'select',
          options: 'companions',
          required: true,
        },
        { key: 'active', label: 'Ativo?', type: 'boolean', default: true },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'companion', ...params }),
    },
    hasFlag: {
      text: 'Flag',
      icon: 'flag',
      params: [
        { key: 'flagId', label: 'ID da Flag', type: 'select', options: 'flags', required: true },
        { key: 'value', label: 'Valor', type: 'text', default: true },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'flag', ...params }),
    },
    hasRelation: {
      text: 'Relação',
      icon: 'group',
      params: [
        {
          key: 'targetId',
          label: 'Alvo da Relação',
          type: 'select',
          options: 'characters',
          required: true,
        },
        { key: 'relationType', label: 'Tipo de Relação', type: 'text', required: true },
        { key: 'level', label: 'Nível Mínimo', type: 'number', default: 1 },
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['>=', '<=', '==', '>', '<', '!='],
          default: '>=',
        },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('has', { subtype: 'relation', ...params }),
    },
    stat: {
      text: 'Estatística',
      icon: 'equalizer',
      params: [
        { key: 'stat', label: 'Estatística', type: 'text', required: true },
        {
          key: 'comparator',
          label: 'Comparador',
          type: 'select',
          options: ['>=', '<=', '==', '>', '<', '!='],
          default: '>=',
        },
        { key: 'value', label: 'Valor', type: 'text', required: true },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushCondition('stat', params),
    },
    custom: {
      text: 'Custom',
      icon: 'extension',
      params: [
        {
          key: 'params',
          label: 'Parâmetros Customizados (JSON)',
          type: 'textarea',
          required: true,
        },
      ],
      execute: (params) => pushCondition('custom', params.params),
    },
  },
}

function pushCondition(type, params) {
  const editorStore = useEditorStore()
  const id = generateId('cond')
  const condition = { id, type, ...params }
  editorStore.conditions.push(condition)
  return id
}
