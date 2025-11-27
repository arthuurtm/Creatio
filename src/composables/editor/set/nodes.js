import { computed } from 'vue'
import { createNode } from '../useNodeFunctions'

export const nodes = computed(() => {
  const createActionNode = (x, y, extra = {}) => createNode(x, y, extra)

  return {
    text: 'Linhas do tempo',
    icon: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f52e/lottie.json',

    definitions: {
      createDialogBlock: {
        text: 'Ação de narrativa',
        icon: 'code',
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
