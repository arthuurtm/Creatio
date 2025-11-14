// skill.js
import { computed } from 'vue'
import { useEditorStore, generateId } from '@/stores/editor.js'

export const skills = computed(() => {
  const editorStore = useEditorStore()

  function pushDefinition(type, params) {
    const id = generateId('skill')
    const definition = { id, type, ...params }
    editorStore.skills.push(definition)
    return id
  }

  return {
    text: 'Habilidades',
    icon: 'star',
    definitions: {
      createActiveSkill: {
        text: 'Habilidade Ativa',
        icon: 'bolt',
        params: [
          { key: 'name', label: 'Nome', type: 'text', required: true },
          { key: 'costType', label: 'Custo', type: 'select', options: ['Mana', 'Energia', 'Vida'] },
          { key: 'costAmount', label: 'Valor do Custo', type: 'number', default: 10 },
        ],
        execute: (params) => pushDefinition('active', params),
      },
    },
  }
})
