<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from "vue";
import { NodeEditor, type GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { VuePlugin, Presets, type VueArea2D } from "rete-vue-plugin";
import { NDropdown, NIcon } from "naive-ui";
import { DeleteOutlined, AddOutlined } from "@vicons/material";
import { useSettingsStore } from "@/stores/global";
import { useEditorStore } from "@/stores/editor";
import CustomNode from "./CustomNode.vue";

const dataSocket = new ClassicPreset.Socket("Data");
const execSocket = new ClassicPreset.Socket("Execution");

class CreatioBlockNode extends ClassicPreset.Node {
  width = 240;
  height = 180;
  astData: any;
  nodeType: string;

  constructor(id: string, nodeType: string, astData: any) {
    const title = astData?.params?.name || astData?.params?.funcName || astData?.category || "Bloco";
    super(title);
    this.id = id;
    this.nodeType = nodeType;
    this.astData = astData;

    // TODO bloco tem fluxo de execução básico
    this.addInput("execIn", new ClassicPreset.Input(execSocket, "▶ Iniciar"));
    this.addOutput("execOut", new ClassicPreset.Output(execSocket, "Próximo ▶"));

    // Adiciona pinos dinâmicos baseados nos parâmetros do bloco
    const params = astData?.params || {};
    
    // Se for um bloco condicional (IF/ELSE)
    if (["IF_STATEMENT", "ELSEIF_STATEMENT", "WHILE_LOOP"].includes(astData?.category)) {
      this.addInput("cond", new ClassicPreset.Input(dataSocket, "Condição (Verdadeiro/Falso)"));
      this.addOutput("trueBody", new ClassicPreset.Output(execSocket, "Corpo (Faça)"));
    }

    // Cria pinos para argumentos (a, b, etc) em funções matemáticas ou lógicas
    if (astData?.category === "MATHEMATICAL_OPERATION" || astData?.category === "LOGICAL_OPERATION") {
      this.addInput("a", new ClassicPreset.Input(dataSocket, "Lado A"));
      this.addInput("b", new ClassicPreset.Input(dataSocket, "Lado B"));
      this.addOutput("result", new ClassicPreset.Output(dataSocket, "Resultado"));
    }

    // Se for variável, tem pino de valor
    if (astData?.category === "VARIABLE_DECLARATION") {
      this.addInput("val", new ClassicPreset.Input(dataSocket, "Valor Inicial"));
      this.addOutput("ref", new ClassicPreset.Output(dataSocket, "Referência da Variável"));
    }
  }
}

class Connection extends ClassicPreset.Connection<CreatioBlockNode, CreatioBlockNode> {}
type Schemes = GetSchemes<CreatioBlockNode, Connection>;
type AreaExtra = VueArea2D<Schemes>;

const container = ref<HTMLElement | null>(null);
const settingsStore = useSettingsStore();
const editorStore = useEditorStore();
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

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), { accumulating: AreaExtensions.accumulateOnCtrl() });

  render.addPreset(Presets.classic.setup({
    customize: {
      node(context) {
        if (context.payload instanceof ClassicPreset.Node) {
          return CustomNode;
        }
        return Presets.classic.Node;
      }
    }
  }));
  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  AreaExtensions.simpleNodesOrder(area);

  // === VOLTANDO O SUPORTE AOS SEUS BLOCOS DO SIDEBAR ===
  container.value.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  });
  
  container.value.addEventListener("drop", async (e) => {
    e.preventDefault();
    const rawData = e.dataTransfer?.getData("application/rete");
    if (!rawData) return;
    try {
      const { def } = JSON.parse(rawData);
      if (!def || typeof def.execute !== "function") return;
      
      const result = def.execute({}); // Cria o nó no formato do Creatio
      
      const transform = area!.area.transform;
      const x = (e.clientX - transform.x) / transform.k;
      const y = (e.clientY - transform.y) / transform.k;
      
      // Cria e adiciona o nó nativo do Rete mapeando a estrutura do Creatio
      const reteNode = new CreatioBlockNode(result.id, result.type, result);
      await editor!.addNode(reteNode);
      await area!.translate(reteNode.id, { x, y });
    } catch (err) {
      console.error(err);
    }
  });

  area.addPipe((context) => {
    if (context.type === "contextmenu") {
      context.data.event.preventDefault();
      menuX.value = context.data.event.clientX;
      menuY.value = context.data.event.clientY;

      if (context.data.context instanceof ClassicPreset.Node) {
        selectedNodeId.value = context.data.context.id;
        menuOptions.value = [
          { label: "Excluir Nó", key: "delete", icon: renderIcon(DeleteOutlined) },
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
  if (key === "delete" && selectedNodeId.value && editor) {
    await editor.removeNode(selectedNodeId.value);
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
