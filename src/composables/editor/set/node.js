import { computed } from 'vue'
import { createNode } from '../useNodeFunctions'

export const nodes = computed(() => {
  const createActionNode = (x, y, extra = {}) => createNode(x, y, extra)

  return {
    text: 'Editor',
    icon: 'edit_note',

    definitions: {
      createDialogBlock: {
        text: 'Ação de diálogo',
        icon: 'code',
        params: [
          // se quiser, pode ter parâmetros como no assets:
          // { key: 'message', label: 'Texto', type: 'textarea' }
        ],
        execute: (e) => createActionNode(e.pageX, e.pageY),
      },

      createConfigBlock: {
        text: 'Ação de configuração',
        icon: 'settings_applications',
        execute: (e) => createActionNode(e.pageX, e.pageY, { type: 'config' }),
      },

      // submenu automático
      addActionBlockMenu: {
        text: 'Adicionar bloco de ação',
        icon: 'folder_code',
        submenu: ['createDialogBlock', 'createConfigBlock'],
        keepOpen: true,
      },
    },
  }
})
