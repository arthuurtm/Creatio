// object.js
import { computed } from 'vue'
import { useEditorStore, generateId } from '@/stores/editor.js'

export const objects = computed(() => {
  const editorStore = useEditorStore()

  function pushDefinition(type, params) {
    const id = generateId('object')
    const definition = { id, type, ...params }
    editorStore.objects.push(definition)
    return id
  }

  return {
    text: 'Objetos',
    icon: 'category',
    definitions: {
      createItem: {
        text: 'Criar Item',
        icon: 'inventory_2',
        params: [
          { key: 'name', label: 'Nome', type: 'text', required: true },
          {
            key: 'inventoryIcon',
            label: 'Ícone (Inventário)',
            type: 'file',
            assetType: 'image',
            options: editorStore.assets,
          },
          { key: 'stackable', label: 'Empilhável', type: 'checkbox', default: true },
          { key: 'maxStack', label: 'Máx. Pilha', type: 'number', default: 99 },
        ],
        execute: (params) => pushDefinition('item', params),
      },
    },
  }
})
