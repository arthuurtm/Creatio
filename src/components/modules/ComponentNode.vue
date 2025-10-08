<script setup>
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ws, http, util } from '@/functions'
import DialogBase from '@/components/modules/ComponentDialog.vue'
import CreateNode from '@/components/elements/CreateNode.vue'
import CreateContextMenu from '../elements/CreateContextMenu.vue'
import { useConnections } from '@/composables/useDotConnection'
import { editorStore, nodeOps, createNode, resetEditorStore } from '@/composables/useNodeFunctions'

const route = useRoute()
const contextMenu = ref({})
const gameBasicData = ref({ gameId: route.params.id, version: 1 })
const { data, status, error, requestStatus, connect, send, disconnect } = ws(http.getApiUrl('ws'))
const nodeUtils = nodeOps({ openContextMenu })
const { handleStartConnection, paths, forceUpdatePaths } = useConnections(editorStore)

onMounted(async () => {
  await connect()
})
onUnmounted(() => {
  disconnect()
  resetEditorStore()
})

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

watch(data, (newMessage) => {
  if (!newMessage || !newMessage.event) return
  if (newMessage.event === 'game:lab:get:json:success') {
    setEditorState(newMessage.data)
    nextTick(() => {
      forceUpdatePaths()
    })
  }
})

watch(
  () => editorStore,
  () => {
    console.log('era zoeira plmr')
    commitState()
    if (status.value === 'OPEN') {
      updateGameData()
    }
  },
  { deep: true },
)

function updateGameData() {
  const state = editorStore
  const dataToSend = { state, ...gameBasicData.value }
  send({ event: 'game:lab:update:json', payload: dataToSend })
}

function openContextMenu(items, event) {
  contextMenu.value.openContextMenu(items, event)
}

const handleNodeRightClick = (e, node) => {
  const selectedNode = editorStore.nodes.find((n) => n.id === node.id)
  nodeUtils.use.openNodeMenu(e, selectedNode)
}

function isLocalStateNewer(remoteState) {
  const getLatestTimestamp = (arr) =>
    arr && arr.length ? Math.max(...arr.map((item) => item.updatedAt || 0)) : 0
  const localNodesTs = getLatestTimestamp(editorStore.nodes)
  const localConnsTs = getLatestTimestamp(editorStore.connections)
  const remoteNodesTs = getLatestTimestamp(remoteState.nodes)
  const remoteConnsTs = getLatestTimestamp(remoteState.connections)
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
  switch (e.name) {
    case 'start-connection': {
      handleStartConnection(e.data)
      break
    }
    case 'handle-node-menu': {
      nodeUtils.use.openNodeMenu()
      break
    }
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
  undo,
  redo,
  setEditorState,
})
</script>

<template>
  <div style="position: absolute; top: 0; right: 0.5rem; z-index: 3; display: flex">
    <CreateButton
      :buttons="[
        {
          icon: 'developer_mode_tv',
          class: 'symbolic no-padding',
          action: () => openContextMenu([{ items: [{ text: editorStore }] }]),
        },
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
</template>

<style scoped>
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
