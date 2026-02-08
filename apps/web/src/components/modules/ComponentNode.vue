<script setup lang="ts">
import { VueFlow, type Connection, ConnectionMode, type NodeComponent } from "@vue-flow/core"
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import type { GameConnection, GameNode } from "@projeto/types";
import Node from "../ui/Node.vue";
import { markRaw } from "vue";

const nodes = defineModel<GameNode[]>('nodes', { required: true, default: [] })
const edges = defineModel<GameConnection[]>('edges', { required: true, default: [] })

const emit = defineEmits<{ (e: "open-panel", nodeId: string): void }>();

const nodeTypes: Record<string, NodeComponent> = {
  dialog: markRaw(Node) as NodeComponent,
  combat: markRaw(Node) as NodeComponent,
  event: markRaw(Node) as NodeComponent,
}

function onConnect(connection: Connection) {
  edges.value = [
    ...edges.value,
    {
      id: crypto.randomUUID(),
      source: connection.source!,
      target: connection.target!,
      markerEnd: 'arrowclosed',
    },
  ]
}
</script>

<template>
  <div class="nodes-layer">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" :node-types="nodeTypes" :connection-mode="ConnectionMode.Loose"
      :fit-view-on-init="true" @connect="onConnect" @node:open-panel="emit('open-panel', $event)">
      <Background />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<style scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}
</style>

<style>
/* espessura da linha */
.vue-flow__edge-path {
  stroke-width: 3px;
}

/* tamanho da seta */
.vue-flow__edge-marker {
  transform: scale(1.6);
  transform-origin: center;
}

</style>
