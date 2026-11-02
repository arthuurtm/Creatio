<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h } from "vue";
import {
  createReteEditor,
  AreaExtensions,
  type ReteEditorInstance,
} from "@projeto/editor";
import { NDropdown, NIcon } from "naive-ui";
import {
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FitScreenOutlined,
  DeleteSweepOutlined,
  CenterFocusStrongOutlined,
  AutoFixHighOutlined,
} from "@vicons/material";
import { useEditor } from "@/composables/useEditor";
import { jsAdapter } from "@projeto/compiler";
import {
  applyInteraction,
  deserialize,
  serialize,
} from "@projeto/types";
import CustomNode from "./CustomNode.vue";
import CustomControl from "./CustomControl.vue";

const container = ref<HTMLElement | null>(null);
const editorState = useEditor();

let instance: ReteEditorInstance | null = null;
let editor: ReteEditorInstance["editor"] | null = null;
let area: ReteEditorInstance["area"] | null = null;

const emit = defineEmits<{
  openCodePanel: [];
  editorReady: [];
}>();

const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedNodeId = ref<string | null>(null);
const menuOptions = ref<any[]>([]);

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/**
 * Cada opção já contém sua própria ação.
 * Assim, não é necessário manter um switch/case separado para cada botão.
 */
const menuItems = [
  {
    label: "Voltar",
    key: "canvas_undo",
    icon: renderIcon(CenterFocusStrongOutlined),
    disabled: true,
    action: () => {},
  },
  {
    label: "Avançar",
    key: "canvas_redo",
    icon: renderIcon(CenterFocusStrongOutlined),
    disabled: true,
    action: () => {},
  },
  { type: "divider", key: "d1" },
  {
    label: "Zoom +",
    key: "canvas_zoom_in",
    icon: renderIcon(ZoomInOutlined),
    action: async () => {
      if (!area) return;
      const current = area.area.transform.k;
      await area.area.zoom(Math.min(current * 1.3, 5));
    },
  },
  {
    label: "Zoom −",
    key: "canvas_zoom_out",
    icon: renderIcon(ZoomOutOutlined),
    action: async () => {
      if (!area) return;
      const current = area.area.transform.k;
      await area.area.zoom(Math.max(current * 0.75, 0.1));
    },
  },
  {
    label: "Ajustar à tela",
    key: "canvas_fit",
    icon: renderIcon(FitScreenOutlined),
    action: async () => {
      if (!area || !editor) return;
      await AreaExtensions.zoomAt(area, editor.getNodes());
    },
  },
  {
    label: "Organizar automaticamente",
    key: "canvas_arrange",
    icon: renderIcon(AutoFixHighOutlined),
    action: async () => {
      if (!instance?.arrange || !area || !editor) return;
      await instance.arrange.layout();
      await AreaExtensions.zoomAt(area, editor.getNodes());
    },
  },
  { type: "divider", key: "d2" },
  {
    label: "Limpar lousa",
    key: "canvas_clear",
    icon: renderIcon(DeleteSweepOutlined),
    action: async () => {
      await editor?.clear();
    },
  },
];

// Geração de código diretamente a partir do grafo do Rete.
const generateCode = async (): Promise<string> => {
  if (!editor) return "";
  const data = serialize(editor);
  return await jsAdapter.graphToCode(data);
};

defineExpose({ generateCode });

onMounted(async () => {
  if (!container.value) return;

  instance = await createReteEditor(container.value, {
    customNode: CustomNode,
    customControl: CustomControl,
  });

  editor = instance.editor;
  area = instance.area;

  editorState.setEditorInstance(editor, area);
  emit("editorReady");

  // Alterações estruturais do grafo.
  const editorChangeEvents = new Set([
    "nodecreated",
    "noderemoved",
    "connectioncreated",
    "connectionremoved",
    "nodeupdated",
    "cleared",
  ]);

  editor.addPipe((context) => {
    if (context.type === "nodecreated" && editor) {
      applyInteraction(editor, (id) => area?.update("node", id));
    }

    if (editorChangeEvents.has(context.type)) {
      void editorState.syncToCloud();
    }

    return context;
  });

  // Alterações de posição e tamanho na área de edição.
  const areaChangeEvents = new Set(["nodetranslated", "noderesized"]);

  area.addPipe((context) => {
    if (areaChangeEvents.has(context.type)) {
      void editorState.syncToCloud();
    }

    return context;
  });

  await editorState.loadSnippets();

  // Permite arrastar snippets do catálogo diretamente para o canvas.
  container.value.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  });

  container.value.addEventListener("drop", async (event) => {
    event.preventDefault();

    const snippetCode = event.dataTransfer?.getData("text/plain");
    if (!snippetCode || !editor || !area) return;

    try {
      const transform = area.area.transform;
      const x = (event.clientX - transform.x) / transform.k;
      const y = (event.clientY - transform.y) / transform.k;

      const graphData = await jsAdapter.codeToGraph(snippetCode);
      await deserialize(editor, graphData);
      applyInteraction(editor, (id) => area?.update("node", id));

      if (graphData.nodes?.length > 0) {
        const lastNode = graphData.nodes[graphData.nodes.length - 1];
        if (lastNode) await area.translate(lastNode.id, { x, y });
      }
    } catch (error) {
      console.error("[Rete Studio] Erro ao soltar snippet:", error);
    }
  });

  // Menu de contexto do editor.
  area.addPipe((context) => {
    if (context.type === "contextmenu") {
      context.data.event.preventDefault();
      menuX.value = context.data.event.clientX;
      menuY.value = context.data.event.clientY;

      const selectedContext = context.data.context;

      if (
        typeof selectedContext === "object" &&
        selectedContext !== null &&
        "id" in selectedContext
      ) {
        // Menu exibido ao clicar com o botão direito sobre um nó.
        selectedNodeId.value = String(selectedContext.id);

        menuOptions.value = [
          {
            label: "Excluir nó",
            key: "delete",
            icon: renderIcon(DeleteOutlined),
            action: async () => {
              if (!selectedNodeId.value || !editor) return;
              await editor.removeNode(selectedNodeId.value);
            },
          },
        ];
      } else {
        // Menu exibido ao clicar com o botão direito na lousa.
        selectedNodeId.value = null;
        menuOptions.value = menuItems;
      }

      showMenu.value = true;
    } else if (context.type === "pointerdown") {
      showMenu.value = false;
    }

    return context;
  });
});

onBeforeUnmount(() => {
  instance?.destroy();
});
</script>

<template>
  <div class="canvas-wrapper">
    <div ref="container" class="rete-container"></div>
    <slot name="header" />

    <NDropdown
      to="body"
      placement="bottom-start"
      trigger="manual"
      :x="menuX"
      :y="menuY"
      :options="menuOptions"
      :show="showMenu"
      :on-clickoutside="() => (showMenu = false)"
      @select="(_, option) => {
        void (option as any).action?.();
        showMenu = false;
      }"
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
  border-top-left-radius: calc(var(--radius-md) + 2px);
  border-top-right-radius: calc(var(--radius-md) + 2px);
  background-color: var(--color-surface);
  background-size: var(--canvas-dot-size) var(--canvas-dot-size);
  background-image: radial-gradient(
    circle,
    var(--canvas-dot-color) 2px,
    transparent 1.5px
  );
}

:deep(.rete-connection) path {
  stroke: var(--color-primary);
  stroke-width: 3px;
}
</style>
