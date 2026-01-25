<script setup lang="ts">
import { VueFlow, type Connection, ConnectionMode, type NodeComponent } from "@vue-flow/core"
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import type { GameConnection, GameNode } from "#types/domain/editor/models.ts";
import Node from "../ui/Node.vue";

const props = defineProps<{
  nodes: GameNode[];
  edges: GameConnection[]
}>();
const emit = defineEmits(["emit-event", "update:nodes", "update:edges"]);
const nodeTypes: Record<string, NodeComponent> = {
  dialog: Node as NodeComponent,
  combat: Node as NodeComponent,
  event: Node as NodeComponent,
}


function emitEventHandler(e: { command: string;[key: string]: any }) {
  emit("emit-event", e);
}

function onConnect(connection: Connection) {
  emit('update:edges', [
    ...props.edges,
    {
      id: crypto.randomUUID(),
      source: connection.source!,
      target: connection.target!,
    },
  ])

}
</script>

<template>
  <div class="nodes-layer">
    <VueFlow :nodes="nodes" :edges="edges" :node-types="nodeTypes" :connection-mode="ConnectionMode.Loose"
      @connect="onConnect">
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
