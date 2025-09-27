import CreateDynamicParams from '@/components/elements/CreateDynamicParams.vue'
import { reactive, shallowRef } from 'vue'

const editorStore = reactive({
  nodes: [],
  connections: [],
  objects: [],
  players: [],
})

// fábrica de nodes
const createNode = (x, y, params = {}) => {
  const id = 'node' + Date.now()
  const node = {
    id,
    x,
    y,
    type: params.type || 'default',
    content: {
      actions: [...(params.actions || [])],
      choices: [],
      conditions: [],
      consequences: [],
    },
    links: params.links || [],
  }
  editorStore.nodes.push(node)
  return node
}

const conditionControllers = () => {
  function addHas() {}

  function has(key, ...values) {}
  return { addHas, has }
}

const menuItemsConstructor = (obj) => {
  return [
    {
      items: obj.map((def) => ({
        component: def.component,
        componentProps: def.componentProps,
        text: def.text,
        icon: 'code',
        action: () => def.action() ?? obj.addHas(...def.params),
      })),
    },
  ]
}

/**
 * @abstract Funções para o controle correto de editorStore
 * @param {Object} param0
 * @param {Object} param0.node
 * @param {import('@/components/elements/CreateContextMenu.vue').default} param0.openContextMenu
 * @param {MouseEvent} param0.event
 * @returns} param0
 */
const nodeOps = ({ openContextMenu }) => {
  const add = {
    action(node, action) {
      node.content.actions.push({
        id: 'action' + Date.now(),
        ...action,
      })
    },
    choice(node, text) {
      node.content.choices.push({
        id: 'choice' + Date.now(),
        text,
      })
    },
    condition(node, condition) {
      node.content.conditions.push({
        id: 'cond' + Date.now(),
        ...condition,
      })
    },
    consequence(node, consequence) {
      node.content.consequences.push({
        id: 'cons' + Date.now(),
        ...consequence,
      })
    },
    image(node, url) {
      nodeOps.addAction(node, {
        name: 'Definir imagem de fundo',
        effect: { type: 'setBackgroundImage', url },
      })
    },
  }

  /**
   *
   * @abstract Retorna dados dos recursos dos nós
   *
   */
  const get = {
    nodeMenu: (e) => {
      const definitions = [
        {
          text: 'Adicionar Condição',
          action: () => {
            use.openConditionMenu(e)
            return 'keep-open'
          },
        },
        { text: 'Adicionar Consequência' },
        {
          text: 'Adicionar ação',
          action: (e) => {
            openContextMenu(
              [
                {
                  items: [
                    {
                      text: 'Imagem',
                      icon: 'image',
                      action: async () => {
                        // const selectedFile = await util.selectFile('image/*')
                        // const reqBody = new FormData()
                        // reqBody.append('gameId', gameBasicData.value.gameId)
                        // reqBody.append('version', gameBasicData.value.version)
                        // reqBody.append('files', selectedFile.file)
                        // const { urls } = await http.post(
                        //   { type: 'file', route: 'upload' },
                        //   reqBody,
                        // )
                        // nodeOps.setBackgroundImage(selectedNode, urls)
                      },
                    },
                    {
                      text: 'Áudio',
                      icon: 'volume_down_alt',
                      action: () => {
                        nodeOps.setMusic()
                      },
                    },
                    {
                      text: 'Vídeo',
                      icon: 'play_arrow',
                    },
                  ],
                },
              ],
              e,
            )
            return 'keep-open'
          },
        },
      ]
      return menuItemsConstructor(definitions)
    },

    conditionsMenu: () => {
      const controller = conditionControllers()
      const definitions = [
        {
          text: 'Ter item',
          action: (e) => {
            openContextMenu(
              menuItemsConstructor([
                {
                  component: CreateDynamicParams,
                  componentProps: { data: { objects: editorStore.objects } },
                },
              ]),
              e,
            )
          },
        },
        { text: 'Não ter item', params: ['no_item', 'key_sword'] },
        { text: 'HP abaixo de', params: ['stat', 'hp', '<', 50] },
        { text: 'HP acima de', params: ['stat', 'hp', '>', 50] },
        { text: 'MP suficiente', params: ['stat', 'mp', '>=', 10] },
        { text: 'Classe', params: ['class', 'mage'] },
      ]
      return menuItemsConstructor(definitions)
    },
  }

  const set = {
    setBackgroundImage(node, url) {
      nodeOps.addAction(node, {
        name: 'Definir imagem de fundo',
        effect: { type: 'setBackgroundImage', url },
      })
    },
    setMusic(node, url) {
      nodeOps.addAction(node, {
        name: 'Tocar música',
        effect: { type: 'setMusic', url },
      })
    },
    setSoundEffect(node, url) {
      nodeOps.addAction(node, {
        name: 'Efeito sonoro',
        effect: { type: 'setSoundEffect', url },
      })
    },
  }

  const use = {
    openNodeMenu(e) {
      openContextMenu(get.nodeMenu(), e)
    },
    openConditionMenu(e) {
      openContextMenu(get.conditionsMenu(), e)
    },
  }

  return { add, get, set, use }
}

export { editorStore, createNode, nodeOps }
