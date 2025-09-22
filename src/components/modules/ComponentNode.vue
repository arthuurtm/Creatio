<script setup>
import { reactive, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ws, http, util } from '@/functions'
import DialogBase from '@/layouts/DialogBase.vue'
import CreateNode from '@/components/elements/CreateNode.vue'
import CreateContextMenu from '../elements/CreateContextMenu.vue'
import { useConnections } from '@/composables/useDotConnection'

const route = useRoute()
const { data, status, error, requestStatus, connect, send, disconnect } = ws(http.getApiUrl('ws'))
const contextMenu = ref({})
const editorStore = reactive({ nodes: [], connections: [] })
const gameBasicData = ref({ gameId: route.params.id, version: 1 })
const { handleStartConnection, paths, forceUpdatePaths } = useConnections(editorStore)

onMounted(async () => {
  await connect()
})

// Este watcher será o responsável por carregar os dados iniciais
const stopWatch = watch(status, (newStatus) => {
  if (newStatus === 'OPEN') {
    send({
      event: 'game:lab:get:json',
      payload: {
        gameId: gameBasicData.value.gameId,
        version: gameBasicData.value.version,
      },
    })
    stopWatch()
  }
})

// Este watcher continua como estava, ele ouve TODAS as mensagens
watch(data, (newMessage) => {
  if (!newMessage || !newMessage.event) return
  if (newMessage.event === 'game:lab:get:json:success') {
    setEditorState(newMessage.data)
    nextTick(() => {
      forceUpdatePaths()
    })
  }
})

// Este watcher para enviar updates continua igual, pois está correto.
watch(
  () => editorStore,
  () => {
    console.log('Anistia já!')
    commitState()
    if (status.value === 'OPEN') {
      updateGameData()
    }
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
    node.content.actions.push({
      id: 'action' + Date.now(),
      name: action.name,
      effect: action.effect,
    })
  }
}

const addChoiceToNode = (node, text) => {
  if (node) {
    node.content.choices.push({
      id: 'choice' + Date.now(),
      text,
    })
  }
}

const setBackgroundImage = (node, url) => {
  if (node) {
    node.content.actions.push({
      id: 'actionBG' + Date.now(),
      name: 'Definir imagem de fundo',
      effect: { type: 'setBackgroundImage', url },
    })
  }
}

const setMusic = (node, url) => {
  if (node) {
    node.content.actions.push({
      id: 'actionMusic' + Date.now(),
      name: 'Tocar música',
      effect: { type: 'setMusic', url },
    })
  }
}

const setSoundEffect = (node, url) => {
  if (node) {
    node.content.actions.push({
      id: 'actionSFX' + Date.now(),
      name: 'Efeito sonoro',
      effect: { type: 'setSoundEffect', url },
    })
  }
}

function getEditorState() {
  return {
    nodes: editorStore.nodes,
    connections: editorStore.connections,
  }
}

function isLocalStateNewer(remoteState) {
  const getLatestTimestamp = (arr) =>
    arr && arr.length ? Math.max(...arr.map((item) => item.updatedAt || 0)) : 0

  const localNodesTs = getLatestTimestamp(editorStore.nodes)
  const localConnsTs = getLatestTimestamp(editorStore.connections)
  const remoteNodesTs = getLatestTimestamp(remoteState.nodes)
  const remoteConnsTs = getLatestTimestamp(remoteState.connections)

  // Se algum local for mais recente que o remoto, retorna true
  return localNodesTs > remoteNodesTs || localConnsTs > remoteConnsTs
}

function setEditorState(state) {
  if (!isLocalStateNewer(state)) {
    editorStore.nodes.splice(0, editorStore.nodes.length, ...state.nodes)
    editorStore.connections.splice(0, editorStore.connections.length, ...state.connections)
  }
}

const undoStack = []
const redoStack = []

function commitState() {
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

function emitEventHandler(e) {
  if (e.name === 'start-connection') {
    handleStartConnection(e.data)
  }
}

const connectionMap = {
  icon: {
    IDLE: 'cloud',
    SENDING: 'cloud_sync',
    ERROR: 'cloud_alert',
    WAITING: 'cloud_sync',
    SUCCESS: 'cloud_done',
  },
  message: {
    IDLE: null,
    SENDING: 'Salvando...',
    ERROR: error || 'Ocorreu um erro.',
    WAITING: null,
    SUCCESS: null,
  },
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
    <div style="position: absolute; top: 0; right: 0.5rem; z-index: 3; display: flex">
      <CreateButton
        :buttons="[
          {
            icon: 'help',
            class: 'symbolic no-padding',
            action: (e) => {
              openContextMenu(
                [
                  {
                    items: [
                      {
                        text: 'Para começar a adicionar ações no seu jogo basta clicar botão direito que um menu com várias opções irá aparecer.',
                      },
                    ],
                  },
                ],
                e,
              )
            },
          },
          {
            icon: connectionMap.icon[requestStatus],
            text: connectionMap.message[requestStatus],
            class: 'symbolic no-padding no-scalling',
            style: {
              cursor: requestStatus != 'ERROR' ? 'inherit' : 'pointer',
            },
            action: requestStatus === 'ERROR' && (async () => await connect()),
          },
        ]"
      />
    </div>

    <svg class="connections-layer">
      <path v-for="p in paths" :key="p?.id" :d="p?.d" :stroke-dasharray="p?.isLoop ? '6,3' : '0'" />
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
        @emit-event="emitEventHandler"
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

path {
  pointer-events: stroke;
  fill: none;
  stroke: var(--text);
  stroke-width: 2;
}

path:hover {
  stroke: aqua;
  stroke-width: 4 !important;
}
</style>
