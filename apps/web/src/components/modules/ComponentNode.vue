<script setup lang="ts">
import type { SDKNode } from "@projeto/types";
import { Background } from "@vue-flow/background";
import { type Connection, ConnectionMode, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { editorConnection } from "@/composables/useWebsocketConnection.ts";
import { useEditorStore } from "@/stores/editor";

const props = defineProps({ id: String });
const editorStore = useEditorStore();
const wsConn = editorConnection();

const flowNodes = computed({
	get: () =>
		Object.values(editorStore.nodes).map((node) => ({
			...node,
			label: node.params?.name || node.params?.varId || node.type.toUpperCase(),
		})),
	set: (newNodesArray) => {
		const newNodesDict: Record<string, SDKNode> = {};
		newNodesArray.forEach((node) => {
			const { label, ...cleanNode } = node as any;
			newNodesDict[cleanNode.id] = cleanNode;
		});
		editorStore.setState({ nodes: newNodesDict });
	},
});

function onConnect(connection: Connection) {
	editorStore.connections.push({
		id: crypto.randomUUID(),
		source: connection.source,
		target: connection.target,
	});
}

onMounted(async () => {
	editorStore.setId(Number(props.id));
	await wsConn.start();
	wsConn.send({ event: "project:lab:get:json", payload: editorStore });
});

onUnmounted(() => {
	wsConn.stop();
	editorStore.$reset();
});
</script>

<template>
  <v-layout full-height>
    <v-container fluid class="pa-0 position-relative h-100">

      <VueFlow
        v-model:nodes="flowNodes"
        v-model:edges="editorStore.connections"
        :connection-mode="ConnectionMode.Loose"
        :fit-view-on-init="true"
        @connect="onConnect"
      >
        <Background />
        <MiniMap />
      </VueFlow>

    </v-container>
  </v-layout>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow__node.selected {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

.vue-flow__node-event { background-color: #4CAF50; }      /* Verde */
.vue-flow__node-statement { background-color: #2196F3; }  /* Azul */
.vue-flow__node-logic { background-color: #FF9800; }      /* Laranja */
.vue-flow__node-loop { background-color: #9C27B0; }       /* Roxo */
.vue-flow__node-expression { background-color: #9E9E9E; } /* Cinza */

.vue-flow__edge-path { stroke-width: 3px; }
.vue-flow__handle { width: 10px; height: 10px; }
</style>
