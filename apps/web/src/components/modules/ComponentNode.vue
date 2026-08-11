<script setup lang="ts">
import type { NodeConnection, SDKNode } from "@projeto/types";
import { Background } from "@vue-flow/background";
import {
  type Connection,
  ConnectionMode,
  VueFlow,
  type NodeChange,
  type NodeMouseEvent,
} from "@vue-flow/core";
import { markRaw, ref, h } from "vue";
import { MiniMap } from "@vue-flow/minimap";
import { NDropdown, NIcon } from "naive-ui";
import { ContentCopyOutlined, DeleteOutlined, CodeOutlined, ClearOutlined } from "@vicons/material";
import SDKNodeRenderer from "@/components/ui/Node.vue";
import { cloneNode, deleteNode } from "@/composables/useNodeFunctions";
import { useEditorStore } from "@/stores/editor";

const nodeTypes = {
  variables: markRaw(SDKNodeRenderer),
  logics: markRaw(SDKNodeRenderer),
  functions: markRaw(SDKNodeRenderer),
};

const nodes = defineModel<SDKNode[]>("nodes", { required: true });
const edges = defineModel<NodeConnection[]>("edges", { required: true });

const emit = defineEmits<{
  onConnect: [connection: Connection];
  openCodePanel: [];
}>();

const editorStore = useEditorStore();

// ── Context Menu State ────────────────────────────────────────────────────────
const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedNode = ref<SDKNode | null>(null);
const menuOptions = ref<any[]>([]);

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function onNodeContextMenu(e: NodeMouseEvent) {
  e.event.preventDefault();
  selectedNode.value = e.node as unknown as SDKNode;
  const mouseEv = e.event as MouseEvent;
  const touchEv = e.event as TouchEvent;
  menuX.value = mouseEv.clientX ?? touchEv.touches?.[0]?.clientX ?? 0;
  menuY.value = mouseEv.clientY ?? touchEv.touches?.[0]?.clientY ?? 0;

  menuOptions.value = [
    {
      label: "Duplicar Nó",
      key: "clone",
      icon: renderIcon(ContentCopyOutlined),
    },
    {
      type: "divider",
      key: "d1",
    },
    {
      label: "Excluir Nó",
      key: "delete",
      icon: renderIcon(DeleteOutlined),
    },
  ];

  showMenu.value = true;
}

function onPaneContextMenu(e: MouseEvent) {
  e.preventDefault();
  selectedNode.value = null;
  menuX.value = e.clientX;
  menuY.value = e.clientY;

  menuOptions.value = [
    {
      label: "Ver Código JavaScript",
      key: "view_code",
      icon: renderIcon(CodeOutlined),
    },
    {
      type: "divider",
      key: "d1",
    },
    {
      label: "Limpar Tela",
      key: "clear",
      icon: renderIcon(ClearOutlined),
    },
  ];

  showMenu.value = true;
}

function handleMenuSelect(key: string) {
  showMenu.value = false;

  if (key === "clone" && selectedNode.value) {
    cloneNode(selectedNode.value as any);
  } else if (key === "delete" && selectedNode.value) {
    deleteNode(selectedNode.value.id);
  } else if (key === "view_code") {
    emit("openCodePanel");
  } else if (key === "clear") {
    const d = (window as any).$dialog?.warning({
      title: "Limpar tela?",
      content: "Todos os nós e conexões serão removidos.",
      positiveText: "Limpar",
      negativeText: "Cancelar",
      onPositiveClick: () => {
        editorStore.clearState();
      },
    });
  }
}

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
  <div style="width: 100%; height: 100%; position: relative;">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :connection-mode="ConnectionMode.Loose"
      :fit-view-on-init="true"
      @nodes-change="onNodesChange"
      @connect="onConnect"
      @node-context-menu="onNodeContextMenu"
      @pane-context-menu="onPaneContextMenu"
      :node-types="nodeTypes"
    >
      <slot name="header" />
      <Background />
      <MiniMap />
    </VueFlow>

    <!-- Context Menu Dropdown -->
    <NDropdown
      placement="bottom-start"
      trigger="manual"
      :x="menuX"
      :y="menuY"
      :options="menuOptions"
      :show="showMenu"
      :on-clickoutside="() => (showMenu = false)"
      @select="handleMenuSelect"
    />
  </div>
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
