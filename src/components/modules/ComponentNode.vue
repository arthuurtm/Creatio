<script setup lang="ts">
import { useConnections } from '@/composables/useDotConnection'
import type { GameNode } from '@/types/editor-models'
import type { CSSProperties } from 'vue'

const props = defineProps<{
  nodes: GameNode[]
  style?: CSSProperties | CSSProperties[] | string
}>()
const emit = defineEmits(['emit-event'])
const { handleStartConnection, paths } = useConnections()

function emitEventHandler(e: { command: string; [key: string]: any }) {
  console.log(e)
  switch (e.command) {
    case 'NODE.CONNECTION': {
      handleStartConnection(e.data)
      break
    }
    default: {
      emit('emit-event', e)
    }
  }
}
</script>

<template>
  <svg class="connections-layer">
    <path v-for="p in paths" :key="p?.id" :d="p?.d" stroke-dasharray="0" />
  </svg>

  <div class="nodes-layer" :style="style">
    <ComponentDialog
      v-for="node in props.nodes"
      :key="node.id"
      v-on:contextmenu.stop="
        emitEventHandler({ command: 'NODE.OPEN_CONTEXT_MENU', data: { node, event: $event } })
      "
      v-on:contextmenu.prevent
      :title="node.id"
      v-model:x="node.position.x"
      v-model:y="node.position.y"
      is-visible
      no-focus-window
      is-draggable
      no-title-bar
      no-interpolate-size
      no-overflow
      background="var(--surface-3)"
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
