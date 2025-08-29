<script setup>
import { reactive, ref } from 'vue'
import DialogBase from '@/layouts/DialogBase.vue'
import CreateNode from '@/components/elements/CreateNode.vue'
import CreateContextMenu from '../elements/CreateContextMenu.vue'

const contextMenu = ref({})
const editorStore = reactive({
  nodes: [],
  connections: [],
})

function openContextMenu(items, event) {
  contextMenu.value.openContextMenu(items, event)
}

const handleNodeRightClick = (e) => {
  openContextMenu(
    [
      {
        items: [
          {
            text: 'Adicionar ação',
            icon: 'wb_incandescent',
            action: () => {
              addActionToNode()
              return 'keep-open'
            },
          },
          {
            text: 'Adicionar mídia',
            icon: 'add_circle',
            action: () => {
              openContextMenu([{
                items: [
                  {
                    text: 'Imagem',
                    icon: 'image',
                    action: () => setBackgroundImage()
                  },
                  {
                    text: 'Áudio',
                    icon: 'volume_down_alt',
                    action: () => setMusic()
                  },
                  {
                    text: 'Vídeo',
                    icon: 'play_arrow'
                  }
                ]
              }])
              return 'keep-open'
            }
          },
        ],
      },
    ],
    e
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
    content: params.content || [],
    actions: params.actions || [],
    links: params.links || [],
  }
  editorStore.nodes.push(node)
}

const addActionToNode = (nodeId, action) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    commitState()
    node.content.actions.push({
      id: 'action_' + Date.now(),
      name: action.name,
      effect: action.effect,
    })
  }
}

const addChoiceToNode = (nodeId, text) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    commitState()
    node.content.choices.push({
      id: 'choice_' + Date.now(),
      text,
    })
  }
}

const setBackgroundImage = (nodeId, url) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    commitState()
    node.content.backgroundImage = url
  }
}

const setMusic = (nodeId, url) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    commitState()
    node.content.music = url
  }
}

const setSoundEffect = (nodeId, url) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    commitState()
    node.content.soundEffect = url
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
  redo
})
</script>

<template>
  <template v-for="node in editorStore.nodes" :key="node.id">
    <DialogBase v-on:contextmenu.stop="handleNodeRightClick" v-on:contextmenu.prevent :title="node.id"
      :component="CreateNode" :component-props="{ node }" :always-visible="true" :no-close-button="true"
      :no-focus-window="true" :is-draggable="true" :no-interpolate-size="true" v-bind:x="node.x" v-bind:y="node.y" />
  </template>
  <CreateContextMenu ref="contextMenu" />
</template>
