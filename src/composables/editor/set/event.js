import { useEditorStore, generateId } from '@/stores/editor.js'

export const Events = {
  name: 'Eventos',
  icon: 'event',
  value: {
    onEnterNode: {
      name: 'Entrar no Nó',
      icon: 'input',
      execute: (nodeId, conditions = [], consequences = []) =>
        pushEvent('onEnterNode', { nodeId, conditions, consequences }),
    },
    onChoiceSelected: {
      name: 'Escolha Selecionada',
      icon: 'check_circle',
      execute: (choiceId, conditions = [], consequences = []) =>
        pushEvent('onChoiceSelected', { choiceId, conditions, consequences }),
    },
    onTimeElapsed: {
      name: 'Tempo Decorrido',
      icon: 'timer',
      execute: (duration, consequences = []) =>
        pushEvent('onTimeElapsed', { duration, consequences }),
    },
    custom: {
      name: 'Custom',
      icon: 'extension',
      execute: (name, params) => pushEvent(name ?? 'custom', params),
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
