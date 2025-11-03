import { useEditorStore, generateId } from '@/stores/editor.js'

export const Actions = {
  text: 'Ação',
  icon: 'play_arrow',
  value: {
    setBackgroundImage: {
      text: 'Mudar Fundo',
      icon: 'image',
      params: [{ key: 'url', label: 'URL da Imagem', type: 'text', required: true }],
      execute: (params) => pushAction('setBackgroundImage', params),
    },
    setMusic: {
      text: 'Tocar Música',
      icon: 'music_note',
      params: [{ key: 'url', label: 'URL da Música', type: 'text', required: true }],
      execute: (params) => pushAction('setMusic', params),
    },
    setSoundEffect: {
      text: 'Efeito Sonoro',
      icon: 'volume_up',
      params: [{ key: 'url', label: 'URL do Efeito', type: 'text', required: true }],
      execute: (params) => pushAction('setSoundEffect', params),
    },
    showDialogue: {
      text: 'Mostrar Diálogo',
      icon: 'chat',
      params: [
        { key: 'speaker', label: 'Nome do Orador', type: 'text', required: true },
        { key: 'text', label: 'Texto do Diálogo', type: 'textarea', required: true },
      ],
      execute: (params) => pushAction('showDialogue', params),
    },
    moveCamera: {
      text: 'Mover Câmera',
      icon: 'videocam',
      params: [
        { key: 'x', label: 'Posição X', type: 'number', required: true },
        { key: 'y', label: 'Posição Y', type: 'number', required: true },
        { key: 'duration', label: 'Duração (s)', type: 'number', required: true },
      ],
      execute: (params) => pushAction('moveCamera', params),
    },
  },
}

function pushAction(type, params) {
  const editorStore = useEditorStore()
  const id = generateId('action')
  const action = { id, type, ...params }
  editorStore.actions.push(action)
  return id
}
