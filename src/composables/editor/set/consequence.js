import { useEditorStore, generateId } from '@/stores/editor.js'

export const Consequences = {
  text: 'Consequências',
  icon: 'flash_on',
  value: {
    heal: {
      text: 'Curar',
      icon: 'healing',
      params: [
        { key: 'amount', label: 'Quantidade a curar', type: 'number', required: true },
        { key: 'targetId', label: 'ID do alvo', type: 'select', options: 'characters' },
      ],
      execute: (params) => pushConsequence('heal', params),
    },
    damage: {
      text: 'Dano',
      icon: 'dangerous',
      params: [
        { key: 'amount', label: 'Quantidade de dano', type: 'number', required: true },
        { key: 'targetId', label: 'ID do alvo', type: 'select', options: 'characters' },
      ],
      execute: (params) => pushConsequence('damage', params),
    },
    gainItem: {
      text: 'Receber Item',
      icon: 'inventory',
      params: [
        { key: 'itemId', label: 'ID do Item', type: 'select', options: 'items', required: true },
        { key: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushConsequence('gainItem', params),
    },
    loseItem: {
      text: 'Perder Item',
      icon: 'remove_circle',
      params: [
        { key: 'itemId', label: 'ID do Item', type: 'select', options: 'items', required: true },
        { key: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
        { key: 'playerId', label: 'ID do Jogador', type: 'select', options: 'players' },
      ],
      execute: (params) => pushConsequence('loseItem', params),
    },
    transferItem: {
      text: 'Transferir Item',
      icon: 'swap_horiz',
      params: [
        { key: 'fromId', label: 'De (ID)', type: 'select', options: 'containers', required: true },
        { key: 'toId', label: 'Para (ID)', type: 'select', options: 'containers', required: true },
        { key: 'itemId', label: 'ID do Item', type: 'select', options: 'items', required: true },
        { key: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
      ],
      execute: (params) => pushConsequence('transferItem', params),
    },
    displayMessage: {
      text: 'Exibir Mensagem',
      icon: 'message',
      params: [
        { key: 'text', label: 'Mensagem', type: 'textarea', required: true },
        {
          key: 'style',
          label: 'Estilo',
          type: 'select',
          options: ['default', 'alert', 'info'],
          default: 'default',
        },
      ],
      execute: (params) => pushConsequence('displayMessage', params),
    },
    setBackground: {
      text: 'Mudar Fundo',
      icon: 'image',
      params: [{ key: 'url', label: 'URL da Imagem', type: 'text', required: true }],
      execute: (params) => pushConsequence('setBackground', params),
    },
    setMusic: {
      text: 'Tocar Música',
      icon: 'music_note',
      params: [
        { key: 'url', label: 'URL da Música', type: 'text', required: true },
        { key: 'loop', label: 'Repetir?', type: 'boolean', default: true },
      ],
      execute: (params) => pushConsequence('setMusic', params),
    },
    playSound: {
      text: 'Tocar Efeito Sonoro',
      icon: 'volume_up',
      params: [{ key: 'url', label: 'URL do Efeito', type: 'text', required: true }],
      execute: (params) => pushConsequence('playSound', params),
    },
    showImage: {
      text: 'Mostrar Imagem',
      icon: 'image',
      params: [
        { key: 'url', label: 'URL da Imagem', type: 'text', required: true },
        { key: 'duration', label: 'Duração (s)', type: 'number', default: 0 },
      ],
      execute: (params) => pushConsequence('showImage', params),
    },
    unlockNode: {
      text: 'Destravar Nó',
      icon: 'lock_open',
      params: [
        { key: 'nodeId', label: 'ID do Nó', type: 'select', options: 'nodes', required: true },
      ],
      execute: (params) => pushConsequence('unlockNode', params),
    },
    teleport: {
      text: 'Teletransportar',
      icon: 'travel_explore',
      params: [
        {
          key: 'targetNodeId',
          label: 'Nó de Destino',
          type: 'select',
          options: 'nodes',
          required: true,
        },
      ],
      execute: (params) => pushConsequence('teleport', params),
    },
    modifyRelation: {
      text: 'Modificar Relação',
      icon: 'group',
      params: [
        {
          key: 'targetId',
          label: 'Alvo da Relação',
          type: 'select',
          options: 'characters',
          required: true,
        },
        { key: 'value', label: 'Valor (Alteração)', type: 'number', required: true },
      ],
      execute: (params) => pushConsequence('modifyRelation', params),
    },
    setFlag: {
      text: 'Definir Flag',
      icon: 'flag',
      params: [
        { key: 'flagId', label: 'ID da Flag', type: 'select', options: 'flags', required: true },
        { key: 'value', label: 'Valor', type: 'text', required: true },
      ],
      execute: (params) => pushConsequence('setFlag', params),
    },
  },
}

function pushConsequence(type, params) {
  const editorStore = useEditorStore()
  const id = generateId('cons')
  const cons = { id, type, ...params }
  editorStore.consequences.push(cons)
  return id
}
