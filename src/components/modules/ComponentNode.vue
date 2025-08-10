<script setup>
import { reactive } from 'vue'
import DialogBase from '@/layouts/DialogBase.vue'
import CreateNode from '@/components/elements/CreateNode.vue'

const editorStore = reactive({
  nodes: [],
  connections: [],
})

const createNode = (x, y, ...params) => {
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
    node.content.choices.push({
      id: 'choice_' + Date.now(),
      text,
    })
  }
}

const setBackgroundImage = (nodeId, url) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    node.content.backgroundImage = url
  }
}

const setMusic = (nodeId, url) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    node.content.music = url
  }
}

const setSoundEffect = (nodeId, url) => {
  const node = editorStore.nodes.find((n) => n.id === nodeId)
  if (node) {
    node.content.soundEffect = url
  }
}

defineExpose({
  createNode,
  addActionToNode,
  addChoiceToNode,
  setBackgroundImage,
  setMusic,
  setSoundEffect,
})
</script>

<template>
  <template v-for="node in editorStore.nodes" :key="node.id">
    <DialogBase
      :title="node.id"
      :component="CreateNode"
      :component-props="node"
      :settings="{
        alwaysVisible: true,
        noCloseButton: true,
        noFocusWindow: true,
        isDraggable: true,
        noInterpolateSize: true,
      }"
      v-bind:x="node.x"
      v-bind:y="node.y"
    />
  </template>
</template>
