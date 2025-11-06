import { useEditorStore, generateId } from '@/stores/editor.js'
import { computed } from 'vue'

export const events = computed(() => ({
  text: 'Eventos',
  icon: 'event',
  definitions: {
    onGameLoad: {
      text: 'Ao Carregar Jogo',
      icon: 'power_settings_new',
      params: [
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onGameLoad', params),
    },
    onEnterNode: {
      text: 'Entrar no Nó',
      icon: 'input',
      params: [
        {
          key: 'nodeId',
          label: 'Nó',
          type: 'select',
          options: useEditorStore.nodes,
          required: true,
        },
        { key: 'conditions', label: 'Condições', type: 'complex-array', itemType: 'condition' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onEnterNode', params),
    },
    onObjectInteract: {
      text: 'Interagir com Objeto',
      icon: 'ads_click',
      params: [
        {
          key: 'objectId',
          label: 'Objeto',
          type: 'select',
          options: useEditorStore.objects,
          required: true,
        },
        { key: 'conditions', label: 'Condições', type: 'complex-array', itemType: 'condition' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onObjectInteract', params),
    },
    onRegionEnter: {
      text: 'Entrar na Região',
      icon: 'place',
      params: [
        {
          key: 'regionId',
          label: 'Região (Trigger)',
          type: 'select',
          options: useEditorStore.regions,
          required: true,
        },
        { key: 'conditions', label: 'Condições', type: 'complex-array', itemType: 'condition' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onRegionEnter', params),
    },
    onChoiceSelected: {
      text: 'Escolha Selecionada',
      icon: 'check_circle',
      params: [
        { key: 'choiceId', label: 'ID da Escolha (do Nó)', type: 'text', required: true },
        { key: 'conditions', label: 'Condições', type: 'complex-array', itemType: 'condition' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onChoiceSelected', params),
    },
    onTimeElapsed: {
      text: 'Tempo Decorrido',
      icon: 'timer',
      params: [
        { key: 'duration', label: 'Duração (s)', type: 'number', required: true },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onTimeElapsed', params),
    },
    onFlagChanged: {
      text: 'Flag Alterada',
      icon: 'flag',
      params: [
        {
          key: 'flagId',
          label: 'Flag',
          type: 'select',
          options: useEditorStore.flags,
          required: true,
        },
        { key: 'value', label: 'Valor (Opcional)', type: 'text' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
          itemType: 'consequence',
        },
      ],
      execute: (params) => pushEvent('onFlagChanged', params),
    },
  },
}))

function pushEvent(type, params) {
  const editorStore = useEditorStore
  const id = generateId('event')
  const event = { id, type, ...params }
  editorStore.events.push(event)
  return id
}
