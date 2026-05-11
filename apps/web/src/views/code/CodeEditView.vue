<script setup lang="ts">
import type { RequestStatusValues, SDKNode } from "@projeto/types";
import { debounce } from "lodash-es";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import ComponentNode from "@/components/modules/ComponentNode.vue";
import { editorConnection } from "@/composables/useWebsocketConnection.ts";
import { useEditorStore } from "@/stores/editor";
import Properties from "./Properties.vue";

const props = defineProps({ id: String });
const editorStore = useEditorStore();
const wsConn = editorConnection();
const delayedStatus = ref<RequestStatusValues>(wsConn.requestStatus.value);
const mapStatusIcon: Record<RequestStatusValues, string> = {
	IDLE: "cloud",
	SENDING: "cloud_sync",
	ERROR: "cloud_alert",
	WAITING: "cloud_sync",
	SUCCESS: "cloud_done",
};
const connectionIcon = computed(() => mapStatusIcon[delayedStatus.value]);

const updateDelayed = debounce((status: any) => {
	delayedStatus.value = status;
}, 500);

watch(wsConn.requestStatus, (newStatus) => updateDelayed(newStatus));

const flowNodes = computed({
	get: () => Object.values(editorStore.nodes),
	set: (newNodesArray) => {
		const newNodesDict: Record<string, SDKNode> = {};
		newNodesArray.forEach((node) => {
			newNodesDict[node.id] = node as SDKNode;
		});
		editorStore.setState({ nodes: newNodesDict });
	},
});

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

    <Properties />

    <v-container fluid class="pa-0">
      <ComponentNode
        v-model:nodes="flowNodes"
        v-model:edges="editorStore.connections"
      >
        <template #header>
          <v-toolbar
            class="position-absolute top-0 left-0 right-0 px-4 pt-2 bg-transparent"
            density="compact"
            flat
            style="z-index: 10; pointer-events: none;"
          >
            <div class="d-flex w-100 align-center" style="pointer-events: auto;">
              <v-spacer />
              <v-chip
                :color="delayedStatus === 'ERROR' ? 'error' : 'success'"
                :prepend-icon="connectionIcon"
                variant="outlined"
                elevation="2"
                class="font-weight-medium text-caption rounded-xl"
              >
                {{ wsConn.error.value?.message || 'Conectado' }}
              </v-chip>
            </div>
          </v-toolbar>
        </template>
      </ComponentNode>
    </v-container>

  </v-layout>
</template>
