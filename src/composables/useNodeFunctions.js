import { useEditorStore } from '@/stores/editor'

function createNode(x, y, params = {}) {
  const editorStore = useEditorStore()
  const id = 'node' + Date.now()
  const node = {
    id,
    position: { x, y },
    type: params.type || 'default',
    content: params.content || {},
    links: params.links || [],
  }
  editorStore.nodes.push(node)
  return id
}

// Função interna para deletar (exemplo simples)
const deleteNode = (nodeId) => {
  const editorStore = useEditorStore()
  const index = editorStore.nodes.findIndex((n) => n.id === nodeId)
  if (index > -1) {
    editorStore.nodes.splice(index, 1)
    // Nota: Idealmente você também deve remover os links conectados a este node aqui
  }
}

const cloneNode = (node) => {
  createNode(node.x + 20, node.y + 20, {
    type: node.type,
  })
}

function getNodeContextMenuItems(node) {
  return [
    { text: 'Duplicar', icon: 'content_copy', command: 'NODE.CLONE', node },
    {
      text: 'Excluir',
      icon: 'delete',
      classes: 'destructive',
      command: 'NODE.DELETE',
      node,
    },
    {
      text: 'Propriedades',
      icon: 'tune',
      command: 'NODE.OPEN_PROPERTIES_SCREEN',
      node,
    },
  ]
}

export { createNode, deleteNode, cloneNode, getNodeContextMenuItems }
