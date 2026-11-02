<script setup lang="ts">
import {
  GitBranchOutline,
  CodeSlashOutline,
  CubeOutline,
  FolderOutline,
  FolderOpenOutline,
  LayersOutline,
  OptionsOutline,
  ArrowForwardOutline,
  SearchOutline,
  DocumentTextOutline,
  TerminalOutline,
  FlashOutline,
  HardwareChipOutline,
  ShareSocialOutline,
  EyeOutline,
  CodeOutline,
} from "@vicons/ionicons5";
import {
  NButton,
  NIcon,
  NInput,
  NScrollbar,
  NTree,
  NEmpty,
  NTag,
  NText,
  NRadioGroup,
  NRadioButton,
  type TreeOption,
} from "naive-ui";
import { computed, h, ref } from "vue";
import { useEditor } from "@/composables/useEditor";
import type {
  BaseNode,
  JSONBaseNode,
  JSONConnection,
  JSONEditorData,
  NodeConnection,
  SDKNode,
} from "@projeto/types";

const editor = useEditor();
const search = ref("");
const viewMode = ref<"nodes" | "json">("nodes");
const selectedKeys = ref<Array<string | number>>([]);

/**
 * Converte um JSON genérico e arbitrário em uma estrutura de TreeOption para o NTree.
 * Suporta objetos aninhados, arrays e tipos primitivos.
 */
function jsonToTreeNodes(data: unknown, parentKey = "root"): TreeOption[] {
  if (data === null || data === undefined) {
    return [
      {
        key: `${parentKey}-val`,
        label: `${String(data)}`,
        isLeaf: true,
        itemType: "primitive",
      },
    ];
  }

  if (typeof data !== "object") {
    return [
      {
        key: `${parentKey}-val`,
        label: `${String(data)}`,
        isLeaf: true,
        itemType: "primitive",
      },
    ];
  }

  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const currentKey = `${parentKey}[${index}]`;
      const isObj = item !== null && typeof item === "object";
      return {
        key: currentKey,
        label: isObj ? `[${index}]` : `[${index}]: ${String(item)}`,
        children: isObj ? jsonToTreeNodes(item, currentKey) : undefined,
        isLeaf: !isObj,
        itemType: isObj ? "array-item" : "primitive",
      };
    });
  }

  return Object.entries(data).map(([key, value]) => {
    const currentKey = `${parentKey}.${key}`;
    const isObj = value !== null && typeof value === "object";
    const isEmptyObj = isObj && Object.keys(value as object).length === 0;

    return {
      key: currentKey,
      label: isObj
        ? isEmptyObj
          ? `${key}: {}`
          : key
        : `${key}: ${String(value)}`,
      children: isObj && !isEmptyObj ? jsonToTreeNodes(value, currentKey) : undefined,
      isLeaf: !isObj || isEmptyObj,
      itemType: isObj ? "object-prop" : "primitive",
    };
  });
}

/**
 * Monta a árvore a partir do grafo do editor (tipado com SDKNode, BaseNode e NodeConnection),
 * organizando por hierarquia de escopo (`parent`), inputs, outputs, controles e conexões.
 */
function buildGraphNodesTree(
  nodesList: Array<SDKNode | BaseNode>,
  connectionsList: Array<NodeConnection | JSONConnection>,
): TreeOption[] {
  if (!nodesList || nodesList.length === 0) return [];

  const nodesMap = new Map<string, SDKNode | BaseNode>();
  for (const n of nodesList) {
    nodesMap.set(n.id, n);
  }

  // Agrupa conexões de saída por nó de origem
  const connectionsBySource = new Map<string, Array<NodeConnection | JSONConnection>>();
  for (const c of connectionsList) {
    const list = connectionsBySource.get(c.source) || [];
    list.push(c);
    connectionsBySource.set(c.source, list);
  }

  // Agrupa nós filhos pelo campo `parent`
  const childrenByParent = new Map<string, Array<SDKNode | BaseNode>>();
  const rootNodes: Array<SDKNode | BaseNode> = [];

  for (const node of nodesList) {
    const parentId = (node as any).parent;
    if (parentId && nodesMap.has(parentId)) {
      const list = childrenByParent.get(parentId) || [];
      list.push(node);
      childrenByParent.set(parentId, list);
    } else {
      rootNodes.push(node);
    }
  }

  function formatNode(node: SDKNode | BaseNode): TreeOption {
    const childrenNodes = childrenByParent.get(node.id) || [];
    const nodeChildren: TreeOption[] = [];

    // 1. Filhos de escopo (ex: comandos dentro de if, loop, função)
    for (const child of childrenNodes) {
      nodeChildren.push(formatNode(child));
    }

    // 2. Detalhes de controles do nó (se houver valores inseridos)
    const controls = (node as any).controls || {};
    const controlEntries = Object.entries(controls);
    const detailChildren: TreeOption[] = [];

    for (const [ctrlKey, ctrl] of controlEntries) {
      const val = (ctrl as any)?.value ?? (ctrl as any)?.data?.value;
      if (val !== undefined && val !== null && val !== "") {
        detailChildren.push({
          key: `${node.id}-ctrl-${ctrlKey}`,
          label: `${ctrlKey}: ${String(val)}`,
          itemType: "control",
          isLeaf: true,
        });
      }
    }

    // 3. Conexões saindo deste nó
    const conns = connectionsBySource.get(node.id) || [];
    if (conns.length > 0) {
      const connItems: TreeOption[] = conns.map((c) => {
        const targetNode = nodesMap.get(c.target);
        const targetLabel = targetNode ? (targetNode as any).label || c.target : c.target;
        return {
          key: `${node.id}-conn-${c.id}`,
          label: `→ ${targetLabel} (${String(c.sourceOutput || "out")} → ${String(c.targetInput || "in")})`,
          itemType: "connection",
          isLeaf: true,
        };
      });

      detailChildren.push({
        key: `${node.id}-conns-group`,
        label: `Conexões (${conns.length})`,
        itemType: "connection-group",
        children: connItems,
      });
    }

    const allChildren = [...nodeChildren, ...detailChildren];

    return {
      key: node.id,
      label: (node as any).label || `Bloco (${node.id.slice(0, 6)})`,
      nodeId: node.id,
      nodeType: (node as any).type,
      itemType: "node",
      children: allChildren.length > 0 ? allChildren : undefined,
    };
  }

  return rootNodes.map(formatNode);
}

// Árvore computada no modo de nós / blocos
const graphTreeData = computed<TreeOption[]>(() => {
  editor.revision.value; // Garante reatividade com o editor Rete
  return buildGraphNodesTree(
    editor.nodes.value as Array<SDKNode | BaseNode>,
    editor.connections.value as Array<NodeConnection | JSONConnection>,
  );
});

// Árvore computada no modo JSON variado / raw
const rawJsonTreeData = computed<TreeOption[]>(() => {
  editor.revision.value;
  const rawState: JSONEditorData = {
    nodes: (editor.getState()?.nodes ?? []) as JSONBaseNode[],
    connections: (editor.getState()?.connections ?? []) as JSONConnection[],
  };
  return jsonToTreeNodes(rawState, "editor");
});

// Dados da árvore ativos de acordo com o modo selecionado
const activeTreeData = computed<TreeOption[]>(() => {
  return viewMode.value === "nodes" ? graphTreeData.value : rawJsonTreeData.value;
});

// Contadores de estatísticas
const totalNodesCount = computed(() => editor.nodes.value.length);
const totalConnectionsCount = computed(() => editor.connections.value.length);

/**
 * Ao selecionar um nó da árvore, sincroniza a seleção com o nó correspondente no canvas.
 */
function handleSelectNode(keys: Array<string | number>, [option]: Array<any>) {
  selectedKeys.value = keys;
  if (!option || !option.nodeId) return;

  const targetId = option.nodeId;
  if (editor.editor.value) {
    for (const n of editor.editor.value.getNodes()) {
      (n as any).selected = n.id === targetId;
    }
    editor.revision.value++;
  }
}

/**
 * Renderiza ícones contextuais para cada tipo de item na árvore.
 */
function renderTreeIcon({ option }: { option: TreeOption }) {
  const itemType = (option as any).itemType;

  if (itemType === "node") {
    const hasChildren = option.children && option.children.length > 0;
    const nodeType = (option as any).nodeType;

    if (hasChildren) {
      return h(NIcon, null, { default: () => h(FolderOpenOutline) });
    }
    if (nodeType === "statement") {
      return h(NIcon, null, { default: () => h(TerminalOutline) });
    }
    if (nodeType === "expression") {
      return h(NIcon, null, { default: () => h(FlashOutline) });
    }
    return h(NIcon, null, { default: () => h(CubeOutline) });
  }

  if (itemType === "control") {
    return h(NIcon, null, { default: () => h(OptionsOutline) });
  }

  if (itemType === "connection" || itemType === "connection-group") {
    return h(NIcon, null, { default: () => h(ArrowForwardOutline) });
  }

  if (itemType === "object-prop" || itemType === "array-item") {
    return h(NIcon, null, { default: () => h(FolderOutline) });
  }

  return h(NIcon, null, { default: () => h(DocumentTextOutline) });
}

/**
 * Renderiza tags de sufixo (tipo do nó, badges de quantidade).
 */
function renderTreeSuffix({ option }: { option: TreeOption }) {
  const nodeType = (option as any).nodeType;
  if (!nodeType) return null;

  return h(
    NTag,
    {
      size: "tiny",
      bordered: false,
      round: true,
      type: nodeType === "statement" ? "info" : "warning",
      style: { fontSize: "10px", lineHeight: "1" },
    },
    { default: () => nodeType },
  );
}
</script>

<template>
  <div class="structure-tree flex flex-col h-full min-h-0">
    <!-- Cabeçalho de Controle e Busca -->
    <div class="structure-header p-3 flex flex-col gap-2.5">
      <!-- Alternância entre Visão de Grafo e Visão de JSON Raw -->
      <div class="flex items-center justify-between gap-2">
        <NRadioGroup v-model:value="viewMode" size="small">
          <NRadioButton value="nodes">
            <span class="flex items-center gap-1.5">
              <NIcon :component="LayersOutline" size="14" />
              <span>Hierarquia</span>
            </span>
          </NRadioButton>
          <NRadioButton value="json">
            <span class="flex items-center gap-1.5">
              <NIcon :component="CodeOutline" size="14" />
              <span>JSON Raw</span>
            </span>
          </NRadioButton>
        </NRadioGroup>

        <!-- Resumo / Badges -->
        <div class="flex items-center gap-1 text-xs">
          <NTag size="tiny" round :bordered="false" type="primary">
            {{ totalNodesCount }} nós
          </NTag>
          <NTag size="tiny" round :bordered="false" type="default">
            {{ totalConnectionsCount }} conexões
          </NTag>
        </div>
      </div>

      <!-- Filtro de Busca em Tempo Real -->
      <NInput
        v-model:value="search"
        placeholder="Filtrar nós e propriedades..."
        clearable
        size="small"
      >
        <template #prefix>
          <NIcon :component="SearchOutline" depth="3" />
        </template>
      </NInput>
    </div>

    <!-- Conteúdo da Árvore com Scroll -->
    <NScrollbar class="flex-1 min-h-0 px-2 pb-3">
      <NEmpty
        v-if="activeTreeData.length === 0"
        description="Nenhum bloco encontrado na estrutura"
        class="py-12"
      >
        <template #extra>
          <NText depth="3" class="text-xs">
            Arraste ou insira blocos do catálogo para montar a árvore.
          </NText>
        </template>
      </NEmpty>

      <!-- Componente NTree do Naive UI -->
      <NTree
        v-else
        block-line
        expand-on-click
        show-line
        :data="activeTreeData"
        :pattern="search"
        :selected-keys="selectedKeys"
        :render-prefix="renderTreeIcon"
        :render-suffix="renderTreeSuffix"
        @update:selected-keys="handleSelectNode"
      />
    </NScrollbar>
  </div>
</template>

<style scoped>
.structure-tree {
  background: var(--color-bg);
}

.structure-header {
  border-bottom: 1px solid var(--color-border);
}

:deep(.n-tree-node-content) {
  font-size: 13px;
}

:deep(.n-tree-node-content__text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
