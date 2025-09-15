<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ws, http, util } from '@/functions'
import DialogBase from '@/layouts/DialogBase.vue'
import CreateNode from '@/components/elements/CreateNode.vue'
import CreateContextMenu from '../elements/CreateContextMenu.vue'

const route = useRoute()
const { data, status, connect, send, disconnect } = ws(http.getApiUrl('ws'))
const contextMenu = ref({})
const editorStore = reactive({ nodes: [], connections: [] })
const gameBasicData = ref({ gameId: route.params.id, version: 1 })

onMounted(async () => {
  try {
    await connect()

    send({
      event: 'game:lab:get:json',
      payload: {
        gameId: gameBasicData.value.gameId,
        version: gameBasicData.value.version,
      },
    })
  } catch (error) {
    console.error('Falha ao conectar ao WebSocket:', error)
  }
})

watch(data, (newMessage) => {
  if (newMessage && newMessage.event === 'game:lab:get:json:success') {
    console.log('Dados iniciais do jogo recebidos!', newMessage.data)
    setEditorState(newMessage.data)
  }
})

watch(
  () => [editorStore],
  () => {
    updateGameData()
  },
  { deep: true },
)

function updateGameData() {
  const state = getEditorState()
  const dataToSend = { state, ...gameBasicData.value }
  send({ event: 'game:lab:update:json', payload: dataToSend })
}

function openContextMenu(items, event) {
  contextMenu.value.openContextMenu(items, event)
}

const handleNodeRightClick = (e, node) => {
  const selectedNode = editorStore.nodes.find((n) => n.id === node.id)
  if (!selectedNode.type === 'config') {
    openContextMenu(
      [
        {
          items: [{}],
        },
      ],
      e,
    )
  } else {
    openContextMenu(
      [
        {
          items: [
            {
              text: 'Adicionar Condição',
              icon: 'code',
            },
            {
              text: 'Adicionar Consequência',
              icon: 'falling',
            },
            {
              text: 'Adicionar ação',
              icon: 'wb_incandescent',
              action: () => {
                openContextMenu(
                  [
                    {
                      items: [
                        {
                          text: 'Imagem',
                          icon: 'image',
                          action: async () => {
                            const selectedFile = await util.selectFile('image/*')
                            const reqBody = new FormData()
                            reqBody.append('gameId', gameBasicData.value.gameId)
                            reqBody.append('version', gameBasicData.value.version)
                            reqBody.append('files', selectedFile.file)
                            const { urls } = await http.post(
                              { type: 'file', route: 'upload' },
                              reqBody,
                            )
                            setBackgroundImage(selectedNode, urls)
                          },
                        },
                        {
                          text: 'Áudio',
                          icon: 'volume_down_alt',
                          action: () => {
                            setMusic()
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
          ],
        },
      ],
      e,
    )
  }
}

const createNode = (x, y, params = {}) => {
  console.log('Creating node at', x, y, params)
  commitState()
  const id = 'node' + Date.now()
  const node = {
    id,
    x,
    y,
    type: params.type || 'default',
    content: {
      actions: [...(params.actions || [])],
      choices: [],
    },
    links: params.links || [],
  }
  editorStore.nodes.push(node)
  return node
}

const addActionToNode = (node, action) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'action' + Date.now(),
      name: action.name,
      effect: action.effect,
    })
  }
}

const addChoiceToNode = (node, text) => {
  if (node) {
    commitState()
    node.content.choices.push({
      id: 'choice' + Date.now(),
      text,
    })
  }
}

const setBackgroundImage = (node, url) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'actionBG' + Date.now(),
      name: 'Definir imagem de fundo',
      effect: { type: 'setBackgroundImage', url },
    })
  }
}

const setMusic = (node, url) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'actionMusic' + Date.now(),
      name: 'Tocar música',
      effect: { type: 'setMusic', url },
    })
  }
}

const setSoundEffect = (node, url) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'actionSFX' + Date.now(),
      name: 'Efeito sonoro',
      effect: { type: 'setSoundEffect', url },
    })
  }
}

// Gerar caminhos SVG para cada conexão
function getPortPosition(nodeId, port) {
  const selector = port ? `[data-port="${nodeId}:${port}"]` : `[data-port="${nodeId}:in"]`
  const el = document.querySelector(selector)

  if (el) {
    const rect = el.getBoundingClientRect()
    const svgRect = document.querySelector('.connections-layer').getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top + rect.height / 2 - svgRect.top,
    }
  }

  // Fallback: centro do nó
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (!node) return null
  return {
    x: node.x + 140, // largura/2
    y: node.y + 40, // altura/2
  }
}

const paths = computed(() => {
  return editorStore.connections
    .map((conn) => {
      const [fromNodeId, fromPort = 'out'] = conn.from.split(':')
      const [toNodeId, toPort = 'in'] = conn.to.split(':')

      const from = getPortPosition(fromNodeId, fromPort)
      const to = getPortPosition(toNodeId, toPort)

      if (!from || !to) return null

      const dx = (to.x - from.x) / 2
      const d = `
      M ${from.x} ${from.y}
      C ${from.x + dx} ${from.y},
        ${to.x - dx} ${to.y},
        ${to.x} ${to.y}
    `
      return { id: conn.from + '_' + conn.to, d }
    })
    .filter(Boolean)
})

function getEditorState() {
  return {
    nodes: editorStore.nodes,
    connections: editorStore.connections,
  }
}

function isLocalStateNewer(remoteState) {
  // Considera que o estado mais recente é o que tiver o maior timestamp de modificação
  // Adiciona um campo 'updatedAt' em cada node e connection ao criar/modificar
  const getLatestTimestamp = (arr) =>
    arr && arr.length ? Math.max(...arr.map((item) => item.updatedAt || 0)) : 0

  const localNodesTs = getLatestTimestamp(editorStore.nodes)
  const localConnsTs = getLatestTimestamp(editorStore.connections)
  const remoteNodesTs = getLatestTimestamp(remoteState.nodes)
  const remoteConnsTs = getLatestTimestamp(remoteState.connections)

  // Se algum local for mais recente que o remoto, retorna true
  return localNodesTs > remoteNodesTs || localConnsTs > remoteConnsTs
}

// Exemplo de uso: isLocalStateNewer(remoteState)

function setEditorState(state) {
  if (!isLocalStateNewer(state)) {
    editorStore.nodes.splice(0, editorStore.nodes.length, ...state.nodes)
    editorStore.connections.splice(0, editorStore.connections.length, ...state.connections)
  }
}

const undoStack = []
const redoStack = []

function commitState() {
  // cria uma cópia pura do estado atual
  const snapshot = {
    nodes: JSON.parse(JSON.stringify(editorStore.nodes)),
    connections: JSON.parse(JSON.stringify(editorStore.connections)),
  }

  undoStack.push(snapshot)
  redoStack.length = 0
}

function undo() {
  if (!undoStack.length) return
  // salva o estado atual para redo
  redoStack.push({
    nodes: JSON.parse(JSON.stringify(editorStore.nodes)),
    connections: JSON.parse(JSON.stringify(editorStore.connections)),
  })
  // recupera o último do undo
  const prev = undoStack.pop()
  editorStore.nodes.splice(0, editorStore.nodes.length, ...prev.nodes)
  editorStore.connections.splice(0, editorStore.connections.length, ...prev.connections)
}

function redo() {
  if (!redoStack.length) return
  // salva o estado atual para undo
  undoStack.push({
    nodes: JSON.parse(JSON.stringify(editorStore.nodes)),
    connections: JSON.parse(JSON.stringify(editorStore.connections)),
  })
  // recupera o próximo do redo
  const next = redoStack.pop()
  editorStore.nodes.splice(0, editorStore.nodes.length, ...next.nodes)
  editorStore.connections.splice(0, editorStore.connections.length, ...next.connections)
}

defineExpose({
  createNode,
  addActionToNode,
  addChoiceToNode,
  setBackgroundImage,
  setMusic,
  setSoundEffect,
  undo,
  redo,
  getEditorState,
  setEditorState,
})
</script>

<template>
  <div class="editor-canvas">
    <svg class="connections-layer">
      <path
        v-for="p in paths"
        :key="p.id"
        :d="p.d"
        fill="none"
        stroke="var(--text)"
        stroke-width="2"
        :stroke-dasharray="p.isLoop ? '6,3' : '0'"
      />
    </svg>

    <!-- Camada de nodes -->
    <div class="nodes-layer">
      <DialogBase
        v-for="node in editorStore.nodes"
        :key="node.id"
        v-on:contextmenu.stop="handleNodeRightClick($event, node)"
        v-on:contextmenu.prevent
        :title="node.id"
        :component="CreateNode"
        :component-props="{ node }"
        :always-visible="true"
        :no-close-button="true"
        :no-focus-window="true"
        :is-draggable="true"
        :no-interpolate-size="true"
        v-model:x="node.x"
        v-model:y="node.y"
      />
    </div>

    <CreateContextMenu ref="contextMenu" />
  </div>
</template>

<style scoped>
.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Conexões ficam atrás */
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* Nodes ficam na frente */
.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>

<style scoped>
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* não bloqueia clique */
}
</style>
