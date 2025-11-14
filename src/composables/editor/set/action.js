import { useEditorStore, generateId } from '@/stores/editor.js'
import { computed } from 'vue'

export const actions = computed(() => {
  const editorStore = useEditorStore()

  function pushAction(type, params) {
    const id = generateId('action')
    const action = { id, type, ...params }
    editorStore.actions.push(action)
    return id
  }

  return {
    text: 'Ação',
    icon: 'play_arrow',
    definitions: {
      // --- Diálogo e UI ---
      showDialogue: {
        text: 'Mostrar Diálogo',
        icon: 'chat',
        params: [
          { key: 'speaker', label: 'Nome do Orador', type: 'text', required: true },
          { key: 'text', label: 'Texto do Diálogo', type: 'textarea', required: true },
          {
            key: 'avatarId',
            label: 'Avatar (Opcional)',
            type: 'select',
            options: editorStore.avatars,
          },
        ],
        execute: (params) => pushAction('showDialogue', params),
      },
      hideUI: {
        text: 'Esconder UI',
        icon: 'visibility_off',
        params: [
          {
            key: 'element',
            label: 'Elemento da UI',
            type: 'select',
            options: ['all', 'dialogue_box', 'hotbar', 'hud'],
            default: 'all',
          },
        ],
        execute: (params) => pushAction('hideUI', params),
      },
      showUI: {
        text: 'Mostrar UI',
        icon: 'visibility',
        params: [
          {
            key: 'element',
            label: 'Elemento da UI',
            type: 'select',
            options: ['all', 'dialogue_box', 'hotbar', 'hud'],
            default: 'all',
          },
        ],
        execute: (params) => pushAction('showUI', params),
      },

      // --- Cena e Animação ---
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
      animateObject: {
        text: 'Animar Objeto',
        icon: 'animation',
        params: [
          {
            key: 'targetId',
            label: 'Alvo',
            type: 'select',
            options: editorStore.objects, // Ou Avatars
            required: true,
          },
          { key: 'animationName', label: 'Nome da Animação', type: 'text', required: true },
        ],
        execute: (params) => pushAction('animateObject', params),
      },
      wait: {
        text: 'Aguardar',
        icon: 'pause',
        params: [{ key: 'duration', label: 'Duração (s)', type: 'number', required: true }],
        execute: (params) => pushAction('wait', params),
      },

      // --- Mídia ---
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
    },
  }
})
