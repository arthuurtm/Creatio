import { useEditorStore, generateId } from '@/stores/editor.js'

export const Consequences = {
  heal: {
    name: 'Curar',
    icon: 'healing',
    execute: (amount, targetId) => pushConsequence('heal', { amount, targetId }),
  },
  damage: {
    name: 'Dano',
    icon: 'dangerous',
    execute: (amount, targetId) => pushConsequence('damage', { amount, targetId }),
  },
  gainItem: {
    name: 'Receber Item',
    icon: 'inventory',
    execute: (itemId, quantity = 1, playerId) =>
      pushConsequence('gainItem', { itemId, quantity, playerId }),
  },
  loseItem: {
    name: 'Perder Item',
    icon: 'remove_circle',
    execute: (itemId, quantity = 1, playerId) =>
      pushConsequence('loseItem', { itemId, quantity, playerId }),
  },
  transferItem: {
    name: 'Transferir Item',
    icon: 'swap_horiz',
    execute: (fromId, toId, itemId, quantity = 1) =>
      pushConsequence('transferItem', { fromId, toId, itemId, quantity }),
  },
  displayMessage: {
    name: 'Exibir Mensagem',
    icon: 'message',
    execute: (text, style = 'default') => pushConsequence('displayMessage', { text, style }),
  },
  setBackground: {
    name: 'Mudar Fundo',
    icon: 'image',
    execute: (url) => pushConsequence('setBackground', { url }),
  },
  setMusic: {
    name: 'Tocar Música',
    icon: 'music_note',
    execute: (url, loop = true) => pushConsequence('setMusic', { url, loop }),
  },
  playSound: {
    name: 'Tocar Efeito Sonoro',
    icon: 'volume_up',
    execute: (url) => pushConsequence('playSound', { url }),
  },
  showImage: {
    name: 'Mostrar Imagem',
    icon: 'image',
    execute: (url, duration = 0) => pushConsequence('showImage', { url, duration }),
  },
  unlockNode: {
    name: 'Destravar Nó',
    icon: 'lock_open',
    execute: (nodeId) => pushConsequence('unlockNode', { nodeId }),
  },
  teleport: {
    name: 'Teletransportar',
    icon: 'travel_explore',
    execute: (targetNodeId) => pushConsequence('teleport', { targetNodeId }),
  },
  modifyRelation: {
    name: 'Modificar Relação',
    icon: 'group',
    execute: (targetId, value) => pushConsequence('modifyRelation', { targetId, value }),
  },
  setFlag: {
    name: 'Definir Flag',
    icon: 'flag',
    execute: (flagId, value) => pushConsequence('setFlag', { flagId, value }),
  },
}

function pushConsequence(type, params) {
  const editorStore = useEditorStore()
  const id = generateId('cons')
  const cons = { id, type, ...params }
  editorStore.consequences.push(cons)
  return id
}
