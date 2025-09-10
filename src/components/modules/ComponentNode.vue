<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
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
  openContextMenu(
    [
      {
        items: [
          {
            text: 'Adicionar ação',
            icon: 'wb_incandescent',
            action: () => {
              openContextMenu([
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
                        const { urls } = await http.post({ type: 'file', route: 'upload' }, reqBody)
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
              ])
              return 'keep-open'
            },
          },
        ],
      },
    ],
    e,
  )
}

const createNode = (x, y, ...params) => {
  commitState()
  const id = 'node_' + Date.now()
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
      id: 'action_' + Date.now(),
      name: action.name,
      effect: action.effect,
    })
  }
}

const addChoiceToNode = (node, text) => {
  if (node) {
    commitState()
    node.content.choices.push({
      id: 'choice_' + Date.now(),
      text,
    })
  }
}

const setBackgroundImage = (node, url) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'action_bg_' + Date.now(),
      name: 'Definir imagem de fundo',
      effect: { type: 'setBackgroundImage', url },
    })
  }
}

const setMusic = (node, url) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'action_music_' + Date.now(),
      name: 'Tocar música',
      effect: { type: 'setMusic', url },
    })
  }
}

const setSoundEffect = (node, url) => {
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'action_sfx_' + Date.now(),
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
  editorStore.nodes = prev.nodes
  editorStore.connections = prev.connections
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
  editorStore.nodes = next.nodes
  editorStore.connections = next.connections
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
  <template v-for="node in editorStore.nodes" :key="node.id">
    <DialogBase
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
  </template>
  <CreateContextMenu ref="contextMenu" />
</template>
