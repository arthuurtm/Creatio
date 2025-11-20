<script setup>
import { ref } from 'vue'
import CNode from '@/components/ui/CNode.vue'
import { useConnections } from '@/composables/editor/useDotConnection'
import { nodeOps } from '@/composables/editor/useNodeFunctions'

/** @typedef {import('@/stores/editor').EditorState} EditorState */
const props = defineProps({
  /** @type {EditorState['nodes']} */
  nodes: { type: Array, default: () => [] },
})

const contextMenu = ref({})
const nodeUtils = nodeOps()
const { handleStartConnection, paths } = useConnections(props.nodes)

function openContextMenu(items, event) {
  contextMenu.value.openContextMenu(items, event)
}

function handleNodeRightClick(node, e) {
  const selectedNode = props.nodes.find((n) => n.id === node.id)
  nodeUtils.ui({ openContextMenu }).mainNodeMenu(selectedNode, e)
}

function emitEventHandler(e) {
  switch (e.name) {
    case 'start-connection': {
      handleStartConnection(e.data)
      break
    }
  }
}
</script>

<template>
  <svg class="connections-layer">
    <path v-for="p in paths" :key="p?.id" :d="p?.d" :stroke-dasharray="p?.isLoop ? '6,3' : '0'" />
  </svg>

  <!-- Camada de nodes -->
  <div class="nodes-layer">
    <ComponentDialog
      v-for="node in props.nodes"
      :key="node.id"
      v-on:contextmenu.stop="handleNodeRightClick(node, $event)"
      v-on:contextmenu.prevent
      :title="node.id"
      :component="CNode"
      :component-props="{ node }"
      :is-visible="true"
      :no-close-button="true"
      :no-focus-window="true"
      :is-draggable="true"
      :no-interpolate-size="true"
      v-model:x="node.x"
      v-model:y="node.y"
      @emit-event="emitEventHandler"
    />
  </div>

  <CContextMenu ref="contextMenu" />
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
