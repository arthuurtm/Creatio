<script setup lang="ts">
import type { NodeConnection, SDKNode } from "@projeto/types";
import { Background } from "@vue-flow/background";
import {
  type Connection,
  ConnectionMode,
  VueFlow,
  type NodeChange,
} from "@vue-flow/core";
import { markRaw } from "vue";
import { MiniMap } from "@vue-flow/minimap";
import SDKNodeRenderer from "@/components/ui/Node.vue";

const nodeTypes = {
  variables: markRaw(SDKNodeRenderer),
  logics: markRaw(SDKNodeRenderer),
  functions: markRaw(SDKNodeRenderer),
};

const nodes = defineModel<SDKNode[]>("nodes", { required: true });
const edges = defineModel<NodeConnection[]>("edges", { required: true });

const emit = defineEmits<{
  onConnect: [connection: Connection];
}>();


function onNodesChange(changes: NodeChange[]) {
  for (const change of changes) {
    if (change.type === "position" && change.position) {
      const node = nodes.value.find((n) => n.id === change.id);
      if (node) node.position = change.position;
    }
  }
}

function onConnect(connection: Connection) {
  edges.value = [
    ...edges.value,
    {
      id: crypto.randomUUID(),
      source: connection.source,
      target: connection.target,
      data: { type: "execution" },
    } as NodeConnection,
  ];
}
</script>

<template>
  <v-layout full-height>
    <v-container fluid class="pa-0 position-relative h-100">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :connection-mode="ConnectionMode.Loose"
        :fit-view-on-init="true"
        @nodes-change="onNodesChange"
        @connect="onConnect"
        :node-types="nodeTypes"
      >
        <slot name="header" />
        <Background />
        <MiniMap />
      </VueFlow>
    </v-container>
  </v-layout>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";

.vue-flow__node.selected {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 5px #1976d2;
}
.vue-flow__edge-path {
  stroke-width: 3px;
}
.vue-flow__handle {
  width: 10px;
  height: 10px;
  background-color: #ffffff;
  border: 2px solid #333;
}
</style>
