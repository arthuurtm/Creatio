<script setup>
import { useConnections } from '@/composables/editor/useDotConnection'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  style: { type: [Array, Object, String], default: () => null },
})
const emit = defineEmits(['node-context-menu', 'emit-event'])
const { handleStartConnection, paths } = useConnections(props.nodes)

function handleNodeRightClick(node, event) {
  emit('node-context-menu', { node, event })
}

function emitEventHandler(e) {
  if (e.name === 'start-connection') {
    handleStartConnection(e.data)
  } else {
    emit('emit-event', e)
  }
}
</script>

<template>
  <svg class="connections-layer">
    <path v-for="p in paths" :key="p?.id" :d="p?.d" :stroke-dasharray="p?.isLoop ? '6,3' : '0'" />
  </svg>

  <div class="nodes-layer" :style="style">
    <ComponentDialog
      v-for="node in props.nodes"
      :key="node.id"
      v-on:contextmenu.stop="handleNodeRightClick(node, $event)"
      v-on:contextmenu.prevent
      :title="node.id"
      v-model:x="node.x"
      v-model:y="node.y"
      is-visible
      no-close-button
      no-focus-window
      is-draggable
      no-interpolate-size
      no-overflow
    >
      <CNode :node="node" @emit-event="emitEventHandler" />
    </ComponentDialog>
  </div>
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
