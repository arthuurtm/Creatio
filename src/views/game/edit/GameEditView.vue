<script setup lang="ts">
import ComponentNode from "#src/components/modules/ComponentNode.vue";
import {
  ref,
  shallowRef,
  markRaw,
  onMounted,
  onUnmounted,
  computed,
} from "vue";
import { useEditorStore } from "@/stores/editor";
import { categories, nodes } from "@/lib/editor/index";
import {
  getNodeContextMenuItems,
  cloneNode,
  deleteNode,
} from "@/composables/useNodeFunctions";
import TabDataPanelView from "./TabDataPanelView.vue";
import ComponentQuickEditPanel from "@/components/modules/ComponentQuickEditPanel.vue";
import { editorConnection } from "@/composables/useWebsocketConnection.ts";

const props = defineProps({ id: String });
const editorStore = useEditorStore();
let panning = false;

const {
  start: connect,
  stop: disconnect,
  send,
  error,
  requestStatus,
} = editorConnection();

const connectionInfo = computed(() => {
  const status = requestStatus.value;
  const currentError = error.value;
  const map = {
    icon: {
      IDLE: "cloud",
      SENDING: "cloud_sync",
      ERROR: "cloud_alert",
      WAITING: "cloud_sync",
      SUCCESS: "cloud_done",
    },
    message: {
      IDLE: null,
      SENDING: "Sincronizando...",
      ERROR: currentError ?? "Desconectado",
      WAITING: null,
      SUCCESS: null,
    },
  };
  return {
    icon: map.icon[status] || "cloud_alert",
    message: map.message[status],
  };
});
const tabData = ref({
  isVisible: false,
  fullscreen: true,
  component: null,
  noFocusWindow: true,
  title: "Editor",
});
const quickPanelData = ref({
  visible: false,
  data: {},
});
const navLinks = computed(() => ({
  left: [
    {
      text: "Painel de dados",
      action: () => handleGameEditorTab(TabDataPanelView, "Painel de dados"),
    },
  ],
  right: [
    {
      icon: connectionInfo.value.icon,
      text: connectionInfo.value.message,
      classes: ["symbolic", "no-padding", "no-scalling"],
    },
    { icon: `help`, action: (e) => openContextMenu({ text: "Ajuda..." }, e) },
  ],
}));

function handleGameEditorTab(tab: any | null = null, title: string) {
  tabData.value.component = shallowRef(markRaw(tab)) ?? {};
  tabData.value.title = title ?? "";
  if (!tabData.value.isVisible) tabData.value.isVisible = true;
}

function handleCloseEditorTab() {
  tabData.value.isVisible = false;
  tabData.value.component = null;
}

// function handleCommandListAction(item) {
//   console.log(item);
//   switch (item.command) {
//     case "NODE.CLONE": {
//       cloneNode(item.data.node);
//       break;
//     }

//     case "NODE.DELETE": {
//       deleteNode(item.data.node.id);
//       break;
//     }

//     case "NODE.OPEN_PROPERTIES_SCREEN": {
//       quickPanelData.value = {
//         visible: true,
//         data: item.data.node,
//       };
//       break;
//     }

//     case "NODE.OPEN_ADD_DATA_MENU": {
//       openContextMenu(
//         Object.values(categories).map((c) => c.value),
//         item.data.event,
//       );
//       break;
//     }

//     case "NODE.OPEN_CONTEXT_MENU": {
//       openContextMenu(getNodeContextMenuItems(item.data.node), item.data.event);
//       break;
//     }

//     default: {
//       console.log("Comando desconhecido para o menu de contexto: ", item);
//     }
//   }
// }

onMounted(async () => {
  editorStore.setGameId(props.id);
  await connect();
  send({ event: "game:lab:get:json", payload: editorStore });
});
onUnmounted(() => {
  disconnect();
  editorStore.$reset();
});
</script>

<template>
  <v-layout style="height: 100vh">
    <v-container style="position: relative; height: 100%;" fluid class="pa-0">

      <div class="editor-viewport" style="height: 100%; width: 100%;">
        <ComponentNode :nodes="editorStore.nodes" :edges="editorStore.connections" />
      </div>

      <v-fade-transition>
        <div v-if="!tabData.isVisible" class="hud-top-tools d-flex justify-space-between pa-4"
          style="position: absolute; top: 0; left: 0; z-index: 10; pointer-events: none; width: 100%;">
          <div class="d-flex ga-2">
            <v-btn v-for="(btn, i) in navLinks.left" :key="`left-${i}`" color="grey" :text="btn.text"
              :prepend-icon="btn.icon" :class="btn.classes" style="pointer-events: auto;" variant="elevated"
              @click="btn.action && btn.action($event)" />

            <v-btn style="pointer-events: auto;" text="Linha do Tempo" prepend-icon="add"
              @click="nodes.definitions.createDialogBlock.execute($event)" />
          </div>

          <div class="d-flex ga-2">
            <v-btn v-for="(btn, i) in navLinks.right" :key="`right-${i}`" :text="btn.text"
              :icon="!btn.text ? btn.icon : undefined" :prepend-icon="btn.text ? btn.icon : undefined"
              :class="btn.classes" style="pointer-events: auto;" @click="btn.action && btn.action($event)" />
          </div>
        </div>
      </v-fade-transition>

      <v-navigation-drawer v-model="quickPanelData.visible" location="right" temporary width="400" elevation="10"
        :scrim="false">
        <ComponentQuickEditPanel v-model="quickPanelData.data" />
      </v-navigation-drawer>
    </v-container>

    <v-dialog v-model="tabData.isVisible" fullscreen transition="dialog-bottom-transition">
      <component :is="tabData.component" @close="handleCloseEditorTab" />
    </v-dialog>
  </v-layout>
</template>
