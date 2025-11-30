import { useEditorStore } from '@/stores/editor'

// mantendo a fábrica de nodes igual
const createNode = (x, y, params = {}) => {
  const editorStore = useEditorStore()
  const id = 'node' + Date.now()
  const node = {
    id,
    x,
    y,
    type: params.type || 'default',
    content: {
      actions: [],
      events: [],
    },
    links: params.links || [],
  }
  editorStore.nodes.push(node)
  return node
}

/**
 * @abstract Funções para o controle de editorStore focado em gerenciamento
 */
const nodeOps = () => {
  const editorStore = useEditorStore()

  // Função interna para deletar (exemplo simples)
  const deleteNode = (nodeId) => {
    const index = editorStore.nodes.findIndex((n) => n.id === nodeId)
    if (index > -1) {
      editorStore.nodes.splice(index, 1)
      // Nota: Idealmente você também deve remover os links conectados a este node aqui
    }
  }

  // Função interna para acionar o QuickEdit
  const triggerQuickEdit = (node) => {
    console.log('Abrindo QuickEdit para:', node.id)
    editorStore.selectedNode = node // Exemplo hipotético
  }

  const ui = ({ openContextMenu }) => {
    function mainNodeMenu(node, e) {
      // Definição estática das ações administrativas
      const menuOptions = [
        {
          text: 'Duplicar',
          icon: 'content_copy',
          action: () => {
            // Exemplo rápido de duplicar (deslocando um pouco o X/Y)
            createNode(node.x + 20, node.y + 20, {
              type: node.type,
              // Clonar conteúdo se necessário
            })
          },
        },
        {
          text: 'Excluir',
          icon: 'delete',
          classes: 'destructive',
          action: () => deleteNode(node.id),
        },
        {
          text: 'Propriedades',
          icon: 'tune', // ou 'edit', 'settings'
          action: () => triggerQuickEdit(node),
        },
      ]

      openContextMenu(menuOptions, e)
    }

    return { mainNodeMenu }
  }

  return { ui }
}

export { createNode, nodeOps }
