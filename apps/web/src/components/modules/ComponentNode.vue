<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from "vue";
import { createReteEditor, AreaExtensions, type ReteEditorInstance } from "@projeto/editor";
import { NDropdown, NIcon } from "naive-ui";
import { DeleteOutlined, AddOutlined, ZoomInOutlined, ZoomOutOutlined, FitScreenOutlined, DeleteSweepOutlined, CenterFocusStrongOutlined } from "@vicons/material";
import { useSettingsStore } from "@/stores/global";
import { useEditor } from "@/composables/useEditor";
import { jsAdapter } from "@projeto/compiler";
import {
  type Schemes,
  type LanguageSnippet,
  applyInteraction,
  deserialize,
  serialize,
} from "@projeto/types";
import CustomNode from "./CustomNode.vue";
import CustomControl from "./CustomControl.vue";

const container = ref<HTMLElement | null>(null);
const settingsStore = useSettingsStore();
const editorState = useEditor();
const isDark = computed(() => settingsStore.theme === "dark");

let instance: ReteEditorInstance | null = null;
let editor: ReteEditorInstance["editor"] | null = null;
let area: ReteEditorInstance["area"] | null = null;


const emit = defineEmits<{ openCodePanel: [] }>();

const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedNodeId = ref<string | null>(null);
const menuOptions = ref<any[]>([]);

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// ==========================================
// GERAÇÃO DE CÓDIGO DIRETA PELO RETE STUDIO
// ==========================================
const generateCode = async (): Promise<string> => {
  if (!editor) return "";
  const data = serialize(editor);
  return await jsAdapter.graphToCode(data);
};

defineExpose({ generateCode });

function getSnippetCode(snippet: LanguageSnippet): string {
  if ("code" in snippet) {
    return typeof snippet.code === "function" ? snippet.code() : snippet.code;
  }
  return "";
}

function formatSnippetsToMenu(snippets: LanguageSnippet[]): any[] {
  return snippets.map((s) => {
    if ("subitems" in s && s.subitems) {
      return {
        label: s.label,
        key: `group_${s.label}`,
        type: "group",
        children: s.subitems.map((sub) => ({
          label: sub.label,
          key: `snippet_${getSnippetCode(sub)}`,
          icon: renderIcon(AddOutlined),
        })),
      };
    }
    return {
      label: s.label,
      key: `snippet_${getSnippetCode(s)}`,
      icon: renderIcon(AddOutlined),
    };
  });
}

onMounted(async () => {
  if (!container.value) return;

  instance = await createReteEditor(container.value, {
    customNode: CustomNode,
    customControl: CustomControl,
  });
  editor = instance.editor;
  area = instance.area;

  // Registra a instância ativa na store global
  editorState.setEditorInstance(editor);
  await editorState.loadSnippets();

  // Permite arrastar snippets do catálogo direto para o canvas
  container.value.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  });

  container.value.addEventListener("drop", async (e) => {
    e.preventDefault();
    const snippetCode = e.dataTransfer?.getData("text/plain");
    if (!snippetCode || !editor || !area) return;

    try {
      const transform = area.area.transform;
      const x = (e.clientX - transform.x) / transform.k;
      const y = (e.clientY - transform.y) / transform.k;

      const graphData = await jsAdapter.codeToGraph(snippetCode);
      await deserialize(editor, graphData);
      applyInteraction(editor, (id) => area?.update("node", id));

      if (graphData.nodes?.length > 0) {
        const lastNode = graphData.nodes[graphData.nodes.length - 1];
        if (lastNode) await area.translate(lastNode.id, { x, y });
      }
    } catch (err) {
      console.error("[Rete Studio] Erro ao soltar snippet:", err);
    }
  });

  // ====================================================
  // MENU DE CONTEXTO NATIVO (SNIPPETS DA LINGUAGEM JS)
  // ====================================================
  area.addPipe((context) => {
    if (context.type === "contextmenu") {
      context.data.event.preventDefault();
      menuX.value = context.data.event.clientX;
      menuY.value = context.data.event.clientY;

      const selectedContext = context.data.context;
      if (typeof selectedContext === "object" && "id" in selectedContext) {
        // Clique com botão direito em cima de um nó
        selectedNodeId.value = String(selectedContext.id);
        menuOptions.value = [
          { label: "Excluir nó", key: "delete", icon: renderIcon(DeleteOutlined) },
        ];
        showMenu.value = true;
      } else {
        // Clique com botão direito na lousa vazia
        selectedNodeId.value = null;
        menuOptions.value = [
          {
            label: "Voltar",
            key: "canvas_undo",
            icon: renderIcon(CenterFocusStrongOutlined),
            disabled: true,
          },
          {
            label: "Avançar",
            key: "canvas_redo",
            icon: renderIcon(CenterFocusStrongOutlined),
            disabled: true,
          },
          { type: "divider", key: "d1" },
          {
            label: "Zoom +",
            key: "canvas_zoom_in",
            icon: renderIcon(ZoomInOutlined),
          },
          {
            label: "Zoom −",
            key: "canvas_zoom_out",
            icon: renderIcon(ZoomOutOutlined),
          },
          {
            label: "Ajustar à tela",
            key: "canvas_fit",
            icon: renderIcon(FitScreenOutlined),
          },
          { type: "divider", key: "d2" },
          {
            label: "Limpar lousa",
            key: "canvas_clear",
            icon: renderIcon(DeleteSweepOutlined),
          },
        ];
        showMenu.value = true;
      }
    } else if (context.type === "pointerdown") {
      showMenu.value = false;
    }
    return context;
  });
});

async function handleMenuSelect(key: string) {
  showMenu.value = false;

  // Ação de Excluir Nó
  if (key === "delete" && selectedNodeId.value && editor) {
    await editor.removeNode(selectedNodeId.value);
    return;
  }

  // Ações de Canvas
  if (key === "canvas_zoom_in" && area) {
    const current = area.area.transform.k;
    await area.area.zoom(Math.min(current * 1.3, 5));
    return;
  }
  if (key === "canvas_zoom_out" && area) {
    const current = area.area.transform.k;
    await area.area.zoom(Math.max(current * 0.75, 0.1));
    return;
  }
  if (key === "canvas_fit" && area && editor) {
    await AreaExtensions.zoomAt(area, editor.getNodes());
    return;
  }
  if (key === "canvas_clear" && editor) {
    await editor.clear();
    return;
  }

  // Ação de Adicionar Snippet nativo do Rete Studio
  if (key.startsWith("snippet_") && editor && area) {
    const code = key.replace("snippet_", "");
    const transform = area.area.transform;
    const x = (menuX.value - transform.x) / transform.k;
    const y = (menuY.value - transform.y) / transform.k;

    try {
      const graphData = await jsAdapter.codeToGraph(code);
      await deserialize(editor, graphData);
      applyInteraction(editor, (id) => area?.update("node", id));

      if (graphData.nodes?.length > 0) {
        const lastNode = graphData.nodes[graphData.nodes.length - 1];
        if (lastNode) await area.translate(lastNode.id, { x, y });
      }
    } catch (err) {
      console.error("[Rete Studio] Erro ao instanciar snippet:", err);
    }
  }
}

onBeforeUnmount(() => {
  instance?.destroy();
});

</script>

<template>
  <div class="canvas-wrapper" :class="isDark ? 'canvas-dark' : 'canvas-light'">
    <div class="rete-container" ref="container"></div>
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
      @select="handleMenuSelect"
    />
  </div>
</template>

<style scoped>
.canvas-wrapper { width: 100%; height: 100%; position: relative; }

/* Tema Claro: variáveis dos nós */
.canvas-light {
  --node-bg: #ffffff;
  --node-header-bg: #f1f5f9;
  --node-border: #e2e8f0;
  --node-text: #1f2937;
  --node-text-muted: #6b7280;
  --node-primary: #1778fb;
}

/* Tema Escuro: variáveis dos nós */
.canvas-dark {
  --node-bg: #1e1e24;
  --node-header-bg: #16161a;
  --node-border: rgba(255, 255, 255, 0.10);
  --node-text: #f2f2f2;
  --node-text-muted: #9ca3af;
  --node-primary: #1778fb;
}

.rete-container { width: 100%; height: 100%; background-size: 22px 22px; background-image: radial-gradient(circle, #00000020 1px, transparent 1.5px); }
.canvas-dark .rete-container { background-color: #0f1115; background-image: radial-gradient(circle, #ffffff20 1px, transparent 1.5px); }
.canvas-light .rete-container { background-color: #f8fafc; }
:deep(.rete-connection) path { stroke: #1778fb; stroke-width: 3px; }
</style>
