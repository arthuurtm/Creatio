<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, h } from "vue";
import { NodeEditor, type GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { VuePlugin, Presets, type VueArea2D } from "rete-vue-plugin";
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

import type { NodeConnection, SDKNode } from "@projeto/types";

// Configuração Rete
class CustomNode extends ClassicPreset.Node {
  astData: any;
  nodeType: string;
  width = 280;
  height = 120;
  constructor(id: string, nodeType: string, astData: any) {
    super(astData?.params?.name || 'Nó');
    this.id = id;
    this.nodeType = nodeType;
    this.astData = astData;
  }
}
class CustomConnection extends ClassicPreset.Connection<CustomNode, CustomNode> {}

type Schemes = GetSchemes<CustomNode, CustomConnection>;
type AreaExtra = VueArea2D<Schemes>;

const container = ref<HTMLElement | null>(null);
const editorStore = useEditorStore();
const settingsStore = useSettingsStore();
const isDark = computed(() => settingsStore.theme === "dark");

let editor: NodeEditor<Schemes> | null = null;
let area: AreaPlugin<Schemes, AreaExtra> | null = null;

const emit = defineEmits<{ openCodePanel: [] }>();

const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedNodeId = ref<string | null>(null);
const menuOptions = ref<any[]>([]);

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

onMounted(async () => {
  if (!container.value) return;

  editor = new NodeEditor<Schemes>();
  area = new AreaPlugin<Schemes, AreaExtra>(container.value);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VuePlugin<Schemes, AreaExtra>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        node(context) {
          return SDKNodeRenderer;
        },
      },
    })
  );

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);

  // Integração com Drag and Drop da biblioteca de blocos
  container.value.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  });
  
  container.value.addEventListener("drop", async (e) => {
    e.preventDefault();
    const rawData = e.dataTransfer?.getData("application/vueflow");
    if (!rawData) return;
    try {
      const { def } = JSON.parse(rawData);
      if (!def || typeof def.execute !== "function") return;
      const result = def.execute({});
      
      const transform = area!.area.transform;
      const x = (e.clientX - transform.x) / transform.k;
      const y = (e.clientY - transform.y) / transform.k;
      
      await editorStore.addNode(result, { x, y });
    } catch (err) {
      console.error(err);
    }
  });

  // Context Menu adaptado para o Rete
  area.addPipe((context) => {
    if (context.type === "contextmenu") {
      context.data.event.preventDefault();
      menuX.value = context.data.event.clientX;
      menuY.value = context.data.event.clientY;

      if (context.data.context === "root") {
        selectedNodeId.value = null;
        menuOptions.value = [
          { label: "Ver Código JavaScript", key: "view_code", icon: renderIcon(CodeOutlined) },
          { type: "divider", key: "d1" },
          { label: "Limpar Tela", key: "clear", icon: renderIcon(ClearOutlined) },
        ];
        showMenu.value = true;
      } else if (context.data.context instanceof CustomNode) {
        selectedNodeId.value = context.data.context.id;
        menuOptions.value = [
          { label: "Duplicar Nó", key: "clone", icon: renderIcon(ContentCopyOutlined) },
          { type: "divider", key: "d1" },
          { label: "Excluir Nó", key: "delete", icon: renderIcon(DeleteOutlined) },
        ];
        showMenu.value = true;
      }
    } else if (context.type === "pointerdown") {
      showMenu.value = false;
    } else if (context.type === "nodedragged") {
      // Sincroniza posição do Rete de volta pro Pinia
      const storeNode = editorStore.nodes.find(n => n.id === context.data.id);
      if (storeNode) {
        const view = area?.nodeViews.get(context.data.id);
        if (view) {
          storeNode.position = { x: view.position.x, y: view.position.y };
        }
      }
    }
    return context;
  });

  // Sincronização Store -> Rete
  await syncStoreToRete();
  await syncConnectionsToRete();

  // Watchers para atualizar o Rete quando a store for modificada
  watch(() => editorStore.nodes.length, syncStoreToRete);
  watch(() => editorStore.connections.length, syncConnectionsToRete);
});

async function syncStoreToRete() {
  if (!editor || !area) return;

  const currentReteNodes = editor.getNodes();
  const storeNodes = editorStore.nodes;

  for (const rNode of currentReteNodes) {
    if (!storeNodes.find((n) => n.id === rNode.id)) {
      await editor.removeNode(rNode.id);
    }
  }

  for (const sNode of storeNodes) {
    const existing = editor.getNode(sNode.id);
    if (!existing) {
      const newNode = new CustomNode(sNode.id, sNode.type, sNode.data);
      const socket = new ClassicPreset.Socket("default");
      newNode.addInput("in", new ClassicPreset.Input(socket));
      newNode.addOutput("out", new ClassicPreset.Output(socket));
      
      await editor.addNode(newNode);
      await area.translate(newNode.id, { x: sNode.position.x, y: sNode.position.y });
    }
  }
}

async function syncConnectionsToRete() {
  if (!editor) return;
  const currentReteConns = editor.getConnections();
  const storeConns = editorStore.connections;

  for (const rConn of currentReteConns) {
    if (!storeConns.find((c) => c.source === rConn.source && c.target === rConn.target)) {
      await editor.removeConnection(rConn.id);
    }
  }

  for (const sConn of storeConns) {
    const exists = currentReteConns.find((c) => c.source === sConn.source && c.target === sConn.target);
    if (!exists) {
      const sourceNode = editor.getNode(sConn.source);
      const targetNode = editor.getNode(sConn.target);
      if (sourceNode && targetNode) {
        await editor.addConnection(new CustomConnection(sourceNode, "out", targetNode, "in"));
      }
    }
  }
}

onBeforeUnmount(() => {
  if (area) area.destroy();
});

function handleMenuSelect(key: string) {
  showMenu.value = false;

  if (key === "clone" && selectedNodeId.value) {
    const node = editorStore.nodes.find(n => n.id === selectedNodeId.value);
    if (node) cloneNode(node as any);
  } else if (key === "delete" && selectedNodeId.value) {
    deleteNode(selectedNodeId.value);
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
</script>

<template>
  <div class="canvas-wrapper" :class="isDark ? 'canvas-dark' : 'canvas-light'">
    <div class="rete-container" ref="container"></div>

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

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.rete-container {
  width: 100%;
  height: 100%;
  background-size: 22px 22px;
  background-image: radial-gradient(circle, #00000020 1px, transparent 1.5px);
}
.canvas-dark .rete-container {
  background-color: #0f1115;
  background-image: radial-gradient(circle, #ffffff20 1px, transparent 1.5px);
}
.canvas-light .rete-container {
  background-color: #f8fafc;
}

/* Conexões (Edges) do Rete estilizadas com a identidade do Creatio */
:deep(.rete-connection) path {
  stroke: #94a3b8;
  stroke-width: 2.5px;
}

.canvas-dark :deep(.rete-connection) path {
  stroke: #50545a;
}
</style>
