import { useEditorStore } from '@/stores/editor'
const editorStore = useEditorStore

// fábrica de nodes
const createNode = (x, y, params = {}) => {
  const id = 'node' + Date.now()
  const node = {
    id,
    x,
    y,
    type: params.type || 'default',
    content: {
      choices: [],
      actions: [],
      events: [],
    },
    links: params.links || [],
  }
  editorStore.nodes.push(node)
  return node
}

const _menuItemsConstructor = (obj) => {
  return [
    {
      items: obj.map((def) => ({
        ...def,
        component: def.component,
        componentProps: def.componentProps,
        text: def.text || def.label,
        icon: def.icon,
        action: def.action ? () => def.action() : null,
      })),
    },
  ]
}

/**
 *
 * @param {editorStore} modules
 * @param {Event} e
 * @param {String} node
 * @param {import('@/components/elements/CreateContextMenu.vue').default} openContextMenu
 * @returns
 */
const _buildAutoMenu = (modules, e, node, openContextMenu) => {
  const categories = Object.entries(modules)
  const definitions = categories.map(([key, module]) => ({
    text: `Adicionar ${module.name ?? key.charAt(0).toUpperCase() + key.slice(1)}`,
    icon: module.icon || 'add_circle',

    action: () => {
      const items = Object.entries(module.value).map(([subKey, subModule]) => ({
        text: subModule.text,
      }))

      openContextMenu(_menuItemsConstructor(items), e)
      return 'keep-open'
    },
  }))
  return _menuItemsConstructor(definitions)
}

/**
 * @abstract Funções para o controle correto de editorStore
 * @param {Object} param0
 * @param {import('@/components/elements/CreateContextMenu.vue').default} param0.openContextMenu
 */
const nodeOps = () => {
  const get = {
    event: {
      name: 'Evento',
      icon: 'event',
      value: { ...editorStore.events },
    },
    condition: {
      name: 'Condição',
      icon: 'help_outline',
      value: { ...editorStore.conditions },
    },
    consequence: {
      name: 'Consequência',
      icon: 'flash_on',
      value: { ...editorStore.consequences },
    },
    action: {
      name: 'Ação',
      icon: 'play_arrow',
      value: { ...editorStore.actions },
    },
  }

  const exec = () => {}

  const ui = ({ openContextMenu }) => {
    function mainNodeMenu(node, e) {
      openContextMenu(_buildAutoMenu(get, e, node, openContextMenu), e)
    }

    return { mainNodeMenu }
  }

  return { ui, get }
}

export { editorStore, createNode, nodeOps }
