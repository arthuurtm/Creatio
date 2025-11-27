// quest.js
import { computed } from 'vue'
import { useEditorStore, generateId } from '@/stores/editor.js'

export const quests = computed(() => {
  const editorStore = useEditorStore()

  function pushDefinition(type, params) {
    const id = generateId('quest')
    const definition = { id, type, ...params }
    editorStore.quests.push(definition)
    return id
  }

  return {
    text: 'Missões',
    icon: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6f8/lottie.json',
    definitions: {
      createMainQuest: {
        text: 'Missão Principal',
        icon: 'flag_checkered',
        params: [
          { key: 'title', label: 'Título', type: 'text', required: true },
          { key: 'description', label: 'Descrição', type: 'textarea' },
          {
            key: 'startEvent',
            label: 'Evento de Início',
            type: 'complex-array',
            itemType: 'event',
          },
        ],
        execute: (params) => pushDefinition('main_quest', params),
      },
      createSideQuest: {
        text: 'Missão Secundária',
        icon: 'explore',
        params: [
          { key: 'title', label: 'Título', type: 'text', required: true },
          { key: 'requiredLevel', label: 'Nível Mínimo', type: 'number', default: 1 },
        ],
        execute: (params) => pushDefinition('side_quest', params),
      },
    },
  }
})
