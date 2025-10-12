import { useEditorStore, generateId } from '@/stores/editor.js'

export const Actions = {
  setBackgroundImage: {
    name: 'Mudar Fundo',
    icon: 'image',
    execute: (url) => pushAction('setBackgroundImage', { url }),
  },
  setMusic: {
    name: 'Tocar Música',
    icon: 'music_note',
    execute: (url) => pushAction('setMusic', { url }),
  },
  setSoundEffect: {
    name: 'Efeito Sonoro',
    icon: 'volume_up',
    execute: (url) => pushAction('setSoundEffect', { url }),
  },
  showDialogue: {
    name: 'Mostrar Diálogo',
    icon: 'chat',
    execute: (speaker, text) => pushAction('showDialogue', { speaker, text }),
  },
  moveCamera: {
    name: 'Mover Câmera',
    icon: 'videocam',
    execute: (x, y, duration) => pushAction('moveCamera', { x, y, duration }),
  },
}

function pushAction(type, params) {
  const editorStore = useEditorStore()
  const id = generateId('action')
  const action = { id, type, ...params }
  editorStore.actions.push(action)
  return id
}
