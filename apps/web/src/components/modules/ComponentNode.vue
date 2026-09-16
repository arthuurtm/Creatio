<script setup lang="ts">
import type { NodeConnection, SDKNode } from "@projeto/types";
import { Background } from "@vue-flow/background";
import {
  type Connection,
  ConnectionMode,
  VueFlow,
  type NodeChange,
  type NodeMouseEvent,
  useVueFlow,
} from "@vue-flow/core";
import { markRaw, ref, h, computed } from "vue";
import { MiniMap } from "@vue-flow/minimap";
import { NDropdown, NIcon } from "naive-ui";
import {
  ContentCopyOutlined,
  DeleteOutlined,
  CodeOutlined,
  ClearOutlined,
} from "@vicons/material";
import SDKNodeRenderer from "@/components/ui/Node.vue";
import { cloneNode, deleteNode } from "@/composables/useNodeFunctions";
import { useEditorStore } from "@/stores/editor";
import { useSettingsStore } from "@/stores/global";

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
const settingsStore = useSettingsStore();
const isDark = computed(() => settingsStore.theme === "dark");
const { project, screenToFlowCoordinate } = useVueFlow();

// ── Cores dos nós no MiniMapa ────────────────────────────────────────────────
function getMiniMapNodeColor(node: any): string {
  if (node.type === "variables") return "#06b6d4";
  if (node.type === "logics") return "#8b5cf6";
  if (node.type === "functions") return "#f59e0b";
  return "#3b82f6";
}

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
    (window as any).$dialog?.warning({
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

// ── Drag & Drop de blocos vindos da biblioteca ─────────────────────────────────
function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

async function onDrop(event: DragEvent) {
  event.preventDefault();
  const rawData = event.dataTransfer?.getData("application/vueflow");
  if (!rawData) return;

  try {
    const { def } = JSON.parse(rawData);
    if (!def) return;

    // Converte posição do mouse para coordenadas do canvas
    const position = screenToFlowCoordinate
      ? screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
      : project({ x: event.clientX, y: event.clientY });

    if (typeof def.execute === "function") {
      const result = def.execute({});
      await editorStore.addNode(result, position);
    }
  } catch (err) {
    console.error("Erro ao soltar bloco no canvas:", err);
  }
}
</script>

<template>
  <div
    class="canvas-wrapper"
    :class="isDark ? 'canvas-dark' : 'canvas-light'"
    @dragover="onDragOver"
    @drop="onDrop"
  >
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
      <slot />

      <!-- Padrão de fundo dinâmico de acordo com o tema -->
      <Background
        :gap="22"
        :size="1.2"
      />

      <!-- MiniMapa estilizado de acordo com o tema -->
      <MiniMap
        class="custom-minimap"
        :class="isDark ? 'minimap-dark' : 'minimap-light'"
        :node-color="getMiniMapNodeColor"
        :node-border-radius="4"
        :mask-color="isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(240, 244, 249, 0.65)'"
      />
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

.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Conexões (Edges) estilizadas com a identidade do Creatio */
.canvas-dark .vue-flow__edge-path {
  stroke: #50545a;
  stroke-width: 2.5px;
  transition: stroke 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.canvas-light .vue-flow__edge-path {
  stroke: #94a3b8;
  stroke-width: 2.5px;
  transition: stroke 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.vue-flow__edge:hover .vue-flow__edge-path,
.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: rgb(var(--v-theme-primary, 11, 87, 208)) !important;
  stroke-width: 3.5px !important;
}

/* Linha temporária durante o arrasto de uma conexão */
.vue-flow__connection-path {
  stroke: rgb(var(--v-theme-primary, 11, 87, 208));
  stroke-width: 2.5px;
  stroke-dasharray: 6;
  animation: connectionPulse 0.6s linear infinite;
}

@keyframes connectionPulse {
  from {
    stroke-dashoffset: 12;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* MiniMapa alinhado com o design system */
.custom-minimap {
  bottom: 20px !important;
  right: 20px !important;
  border-radius: 14px !important;
  backdrop-filter: blur(14px) !important;
  overflow: hidden !important;
}

.custom-minimap.minimap-dark {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  background-color: rgba(24, 24, 28, 0.9) !important;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4) !important;
}

.custom-minimap.minimap-light {
  border: 1px solid #e2e8f0 !important;
  background-color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.1) !important;
}

/* Remove contorno padrão pesado do Vue Flow para usar o contorno do nosso card */
.vue-flow__node {
  border-radius: 14px;
}
.vue-flow__node.selected {
  outline: none;
}
</style>
