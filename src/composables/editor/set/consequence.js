import { useEditorStore, generateId } from '@/stores/editor.js'
import { computed } from 'vue'

export const consequences = computed(() => ({
  text: 'Consequências',
  icon: 'flash_on',
  definitions: {
    // --- Personagem ---
    heal: {
      text: 'Curar',
      icon: 'healing',
      params: [
        { key: 'amount', label: 'Quantidade a curar', type: 'number', required: true },
        {
          key: 'targetId',
          label: 'Alvo',
          type: 'select',
          options: useEditorStore.avatars, // Alvo pode ser um jogador
        },
      ],
      execute: (params) => pushConsequence('heal', params),
    },
    damage: {
      text: 'Dano',
      icon: 'dangerous',
      params: [
        { key: 'amount', label: 'Quantidade de dano', type: 'number', required: true },
        {
          key: 'targetId',
          label: 'Alvo',
          type: 'select',
          options: useEditorStore.objects, // Alvo pode ser um NPC/Inimigo (filtrar por tipo)
        },
      ],
      execute: (params) => pushConsequence('damage', params),
    },
    modifyCurrency: {
      text: 'Modificar Moeda',
      icon: 'attach_money',
      params: [
        { key: 'currencyType', label: 'Tipo de Moeda', type: 'text', default: 'gold' },
        { key: 'amount', label: 'Valor (positivo ou negativo)', type: 'number', required: true },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushConsequence('modifyCurrency', params),
    },
    addStatus: {
      text: 'Adicionar Status',
      icon: 'add_reaction',
      params: [
        {
          key: 'statusId',
          label: 'Status',
          type: 'select',
          options: useEditorStore.statuses, // Puxa das definições de status
          required: true,
        },
        { key: 'duration', label: 'Duração (s, 0=infinito)', type: 'number', default: 0 },
        { key: 'targetId', label: 'Alvo', type: 'select', options: useEditorStore.avatars },
      ],
      execute: (params) => pushConsequence('addStatus', params),
    },
    removeStatus: {
      text: 'Remover Status',
      icon: 'remove_reaction',
      params: [
        {
          key: 'statusId',
          label: 'Status',
          type: 'select',
          options: useEditorStore.statuses,
          required: true,
        },
        { key: 'targetId', label: 'Alvo', type: 'select', options: useEditorStore.avatars },
      ],
      execute: (params) => pushConsequence('removeStatus', params),
    },

    // --- Inventário ---
    gainItem: {
      text: 'Receber Item',
      icon: 'inventory',
      params: [
        {
          key: 'itemId',
          label: 'Item',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'item'
          required: true,
        },
        { key: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushConsequence('gainItem', params),
    },
    loseItem: {
      text: 'Perder Item',
      icon: 'remove_circle',
      params: [
        {
          key: 'itemId',
          label: 'Item',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'item'
          required: true,
        },
        { key: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
        {
          key: 'playerId',
          label: 'Jogador',
          type: 'select',
          options: useEditorStore.avatars,
        },
      ],
      execute: (params) => pushConsequence('loseItem', params),
    },
    transferItem: {
      text: 'Transferir Item',
      icon: 'swap_horiz',
      params: [
        {
          key: 'fromId',
          label: 'De (Contêiner)',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'container'
          required: true,
        },
        {
          key: 'toId',
          label: 'Para (Contêiner)',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'container'
          required: true,
        },
        {
          key: 'itemId',
          label: 'Item',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'item'
          required: true,
        },
        { key: 'quantity', label: 'Quantidade', type: 'number', default: 1 },
      ],
      execute: (params) => pushConsequence('transferItem', params),
    },

    // --- Estado do Jogo ---
    setFlag: {
      text: 'Definir Flag',
      icon: 'flag',
      params: [
        {
          key: 'flagId',
          label: 'Flag',
          type: 'select',
          options: useEditorStore.flags,
          required: true,
        },
        { key: 'value', label: 'Valor', type: 'text', required: true },
      ],
      execute: (params) => pushConsequence('setFlag', params),
    },
    startQuest: {
      text: 'Iniciar Missão',
      icon: 'assignment',
      params: [
        {
          key: 'questId',
          label: 'Missão',
          type: 'select',
          options: useEditorStore.quests,
          required: true,
        },
      ],
      execute: (params) => pushConsequence('startQuest', params),
    },
    updateQuestStep: {
      text: 'Atualizar Missão',
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
        {
          key: 'status',
          label: 'Novo Status',
          type: 'select',
          options: ['active', 'completed', 'failed'],
          default: 'active',
        },
      ],
      execute: (params) => pushConsequence('updateQuestStep', params),
    },
    modifyRelation: {
      text: 'Modificar Relação',
      icon: 'group',
      params: [
        {
          key: 'targetId',
          label: 'Alvo da Relação',
          type: 'select',
          options: useEditorStore.objects, // Componente deve filtrar por type: 'npc'
          required: true,
        },
        { key: 'value', label: 'Valor (Alteração)', type: 'number', required: true },
      ],
      execute: (params) => pushConsequence('modifyRelation', params),
    },

    // --- Mundo / Cena ---
    displayMessage: {
      text: 'Exibir Mensagem',
      icon: 'message',
      params: [
        { key: 'text', label: 'Mensagem', type: 'textarea', required: true },
        {
          key: 'style',
          label: 'Estilo',
          type: 'select',
          options: ['default', 'alert', 'info', 'notification'],
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
    spawnObject: {
      text: 'Spawnar Objeto',
      icon: 'add_box',
      params: [
        {
          key: 'objectDefId',
          label: 'Objeto (Definição)',
          type: 'select',
          options: useEditorStore.objects, // Puxa de uma lista de 'prefabs'
          required: true,
        },
        { key: 'x', label: 'Posição X', type: 'number', default: 0 },
        { key: 'y', label: 'Posição Y', type: 'number', default: 0 },
      ],
      execute: (params) => pushConsequence('spawnObject', params),
    },
    teleport: {
      text: 'Teletransportar',
      icon: 'travel_explore',
      params: [
        {
          key: 'targetNodeId',
          label: 'Nó de Destino',
          type: 'select',
          options: useEditorStore.nodes,
          required: true,
        },
      ],
      execute: (params) => pushConsequence('teleport', params),
    },
    unlockNode: {
      text: 'Destravar Nó',
      icon: 'lock_open',
      params: [
        {
          key: 'nodeId',
          label: 'Nó',
          type: 'select',
          options: useEditorStore.nodes,
          required: true,
        },
      ],
      execute: (params) => pushConsequence('unlockNode', params),
    },
  },
}))

function pushConsequence(type, params) {
  const editorStore = useEditorStore
  const id = generateId('cons')
  const cons = { id, type, ...params }
  editorStore.consequences.push(cons)
  return id
}
