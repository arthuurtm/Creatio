<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from "vue";
import { NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { VuePlugin, Presets, type VueArea2D } from "rete-vue-plugin";
import { NDropdown, NIcon } from "naive-ui";
import { DeleteOutlined, AddOutlined } from "@vicons/material";
import { useSettingsStore } from "@/stores/global";
import { useEditor } from "@/composables/useEditor";
import { jsAdapter } from "@projeto/compiler";
import {
  type Schemes,
  BaseNode,
  type LanguageSnippet,
  applyInteraction,
  deserialize,
  serialize,
} from "@projeto/types";
import CustomNode from "./CustomNode.vue";

type AreaExtra = VueArea2D<Schemes>;

const container = ref<HTMLElement | null>(null);
const settingsStore = useSettingsStore();
const editorState = useEditor();
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
          return CustomNode as any;
        },
      },
    }) as any
  );
  connection.addPreset(ConnectionPresets.classic.setup() as any);

  editor.use(area);
  area.use(connection);
  area.use(render);
  AreaExtensions.simpleNodesOrder(area);

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
        selectedNodeId.value = String(selectedContext.id);
        menuOptions.value = [
          { label: "Excluir Nó", key: "delete", icon: renderIcon(DeleteOutlined) },
        ];
        showMenu.value = true;
      } else {
        selectedNodeId.value = null;
        menuOptions.value = formatSnippetsToMenu(editorState.snippets.value);
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
  if (area) area.destroy();
});
</script>

<template>
  <div class="canvas-wrapper" :class="isDark ? 'canvas-dark' : 'canvas-light'">
    <slot name="header" />
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
.canvas-wrapper { width: 100%; height: 100%; position: relative; }
.rete-container { width: 100%; height: 100%; background-size: 22px 22px; background-image: radial-gradient(circle, #00000020 1px, transparent 1.5px); }
.canvas-dark .rete-container { background-color: #0f1115; background-image: radial-gradient(circle, #ffffff20 1px, transparent 1.5px); }
.canvas-light .rete-container { background-color: #f8fafc; }
:deep(.rete-connection) path { stroke: rgb(var(--v-theme-primary, 11, 87, 208)); stroke-width: 3px; }
</style>
