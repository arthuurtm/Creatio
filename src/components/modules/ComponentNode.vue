<script setup lang="ts">
import { useConnections } from "@/composables/useDotConnection";
import type { GameNode } from "#types/domain/editor/models.ts";
import type { CSSProperties } from "vue";
import CNode from "../ui/Node.vue";

const props = defineProps<{
  nodes: GameNode[];
  style?: CSSProperties | CSSProperties[] | string;
}>();
const emit = defineEmits(["emit-event", "update:nodes"]);
const { handleStartConnection, paths } = useConnections();

function emitEventHandler(e: { command: string;[key: string]: any }) {
  emit("emit-event", e);
}
</script>

<template>
  <svg class="connections-layer">
    <path v-for="p in paths" :key="p?.id" :d="p?.d" stroke-dasharray="0" />
  </svg>

  <div class="nodes-layer" :style="style">
    <template v-for="node in props.nodes" :key="node.id">
      <CNode :node="node" v-model:position="node.position" @emit-event="emitEventHandler"
        @dot-connection="handleStartConnection" />
    </template>
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
