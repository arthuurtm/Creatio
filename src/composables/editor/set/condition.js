import { useEditorStore, generateId } from '@/stores/editor.js'

export const Conditions = {
  name: 'Condições',
  icon: 'check_circle',
  value: {
    hasItem: {
      name: 'Item',
      icon: 'inventory',
      execute: (itemId, quantity = 1, playerId) =>
        pushCondition('has', { subtype: 'item', itemId, quantity, playerId }),
    },
    hasCurrency: {
      name: 'Moeda',
      icon: 'attach_money',
      execute: (currencyType = 'gold', amount = 1, playerId) =>
        pushCondition('has', { subtype: 'currency', currencyType, amount, playerId }),
    },
    hasStatus: {
      name: 'Status',
      icon: 'medication',
      execute: (statusId, active = true, playerId) =>
        pushCondition('has', { subtype: 'status', statusId, active, playerId }),
    },
    hasAttribute: {
      name: 'Atributo',
      icon: 'bar_chart',
      execute: (attribute, comparator = '>=', value, playerId) =>
        pushCondition('has', { subtype: 'attribute', attribute, comparator, value, playerId }),
    },
    hasLevel: {
      name: 'Level',
      icon: 'trending_up',
      execute: (comparator = '>=', value, playerId) =>
        pushCondition('has', { subtype: 'level', comparator, value, playerId }),
    },
    hasSkill: {
      name: 'Habilidade',
      icon: 'school',
      execute: (skillId, level = 1, playerId) =>
        pushCondition('has', { subtype: 'skill', skillId, level, playerId }),
    },
    hasCompanion: {
      name: 'Companheiro',
      icon: 'people',
      execute: (companionId, active = true, playerId) =>
        pushCondition('has', { subtype: 'companion', companionId, active, playerId }),
    },
    hasFlag: {
      name: 'Flag',
      icon: 'flag',
      execute: (flagId, value = true, playerId) =>
        pushCondition('has', { subtype: 'flag', flagId, value, playerId }),
    },
    hasRelation: {
      name: 'Relação',
      icon: 'group',
      execute: (targetId, relationType, level = 1, comparator = '>=', playerId) =>
        pushCondition('has', {
          subtype: 'relation',
          targetId,
          relationType,
          level,
          comparator,
          playerId,
        }),
    },
    stat: {
      name: 'Estatística',
      icon: 'equalizer',
      execute: (stat, comparator = '>=', value, playerId) =>
        pushCondition('stat', { stat, comparator, value, playerId }),
    },
    custom: {
      name: 'Custom',
      icon: 'extension',
      execute: (params) => pushCondition('custom', params),
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
