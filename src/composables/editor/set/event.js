import { useEditorStore, generateId } from '@/stores/editor.js'

export const Events = {
  name: 'Eventos',
  icon: 'event',
  value: {
    onEnterNode: {
      name: 'Entrar no Nó',
      icon: 'input',
      params: [
        { key: 'nodeId', label: 'ID do Nó', type: 'select', options: 'nodes', required: true },
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
    onChoiceSelected: {
      name: 'Escolha Selecionada',
      icon: 'check_circle',
      params: [
        { key: 'choiceId', label: 'ID da Escolha', type: 'text', required: true },
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
      name: 'Tempo Decorrido',
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
    custom: {
      name: 'Custom',
      icon: 'extension',
      params: [
        { key: 'name', label: 'Nome do Evento', type: 'text', required: true },
        { key: 'params', label: 'Parâmetros Customizados (JSON)', type: 'textarea' },
      ],
      execute: (params) => {
        const { name, params: customParams } = params
        pushEvent(name ?? 'custom', customParams)
      },
    },
  },
}

function pushEvent(type, params) {
  const editorStore = useEditorStore()
  const id = generateId('event')
  const event = { id, type, ...params }
  editorStore.events.push(event)
  return id
}
