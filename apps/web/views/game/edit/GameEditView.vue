<script setup lang="ts">
import ComponentNode from "#src/components/modules/ComponentNode.vue";
import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch
} from "vue";
import { useEditorStore } from "@/stores/editor";
import { nodes } from "@/lib/editor/index";
import TabDataPanelView from "./TabDataPanelView.vue";
import { editorConnection } from "@/composables/useWebsocketConnection.ts";
import { debounce } from "lodash-es";
import type { RequestStatusValues } from "#types/shared/websocket.ts";

const props = defineProps({ id: String });
const editorStore = useEditorStore();
const wsConn = editorConnection();
const delayedStatus = ref(wsConn.requestStatus.value)
const mapStatusIcon: Record<RequestStatusValues, string> = {
  IDLE: "cloud",
  SENDING: "cloud_sync",
  ERROR: "cloud_alert",
  WAITING: "cloud_sync",
  SUCCESS: "cloud_done",
};
const connectionIcon = computed(() => mapStatusIcon[delayedStatus.value]);
const tabData = ref({
  properties: {
    visible: false
  }
});

const updateDelayed = debounce((status: any) => {
  delayedStatus.value = status
}, 500)

watch(wsConn.requestStatus, (newStatus) => updateDelayed(newStatus))

onMounted(async () => {
  editorStore.setGameId(props.id);
  await wsConn.start();
  wsConn.send({ event: "game:lab:get:json", payload: editorStore });
});

onUnmounted(() => {
  wsConn.stop();
  editorStore.$reset();
});

watch(wsConn.requestStatus, (newStatus) => debounce(() => {
  delayedStatus.value = newStatus
}, 500))
</script>

<template>
  <v-layout style="height: 100%">
    <v-container fluid class="pa-0">
      <ComponentNode v-model:nodes="editorStore.nodes" v-model:edges="editorStore.connections" />
    </v-container>

    <v-fade-transition>
      <div class="hud-top-tools d-flex justify-space-between pa-4"
        style="position: absolute; top: 0; left: 0; z-index: 1000; pointer-events: none; width: 100%;">

        <div class="d-flex ga-2">
          <v-btn class="elevation-4" style="pointer-events: auto;" text="Propriedades" prepend-icon="flowchart"
            @click="tabData.properties.visible = true" variant="outlined" color="surface-variant" />

          <v-btn class="elevation-4" style="pointer-events: auto;" text="Linha do Tempo" prepend-icon="add"
            @click="nodes.definitions.createDialogBlock.execute($event)" variant="outlined" color="surface-variant" />
        </div>

        <div class="d-flex ga-2">
          <!-- <v-btn :icon="connectionIcon ?? undefined"
            :prepend-icon="wsConn.requestStatus ===  connectionIcon : undefined" variant="outlined"
            :color="wsConn.error ? 'red' : undefined" /> -->
        </div>
      </div>
    </v-fade-transition>

    <v-dialog v-model="tabData.properties.visible" fullscreen transition="slide-x-transition">
      <TabDataPanelView />
    </v-dialog>
  </v-layout>
</template>
