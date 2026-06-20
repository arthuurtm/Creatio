import type {
  CategoryKey,
  EditorState,
  ExecuteResult,
  AutoConnectIntent,
  FileInfo,
  NodeConnection,
  SDKNode,
} from "@projeto/types";
import { defineStore } from "pinia";
import { computed, reactive, shallowReactive } from "vue";

export const useEditorStore = defineStore("editor", () => {
  const nodes = shallowReactive<SDKNode[]>([]);
  const connections = shallowReactive<NodeConnection[]>([]);

  const info = reactive<FileInfo>({
    id: null,
    title: "Untitled",
    version: "1.0.0",
    description: null,
    updatedAt: null,
  });

  const variables = computed(() => nodes.filter((n) => n.type === "variables"));
  const functions = computed(() => nodes.filter((n) => n.type === "functions"));
  const logics    = computed(() => nodes.filter((n) => n.type === "logics"));

  async function addNode(result: ExecuteResult, position = { x: 100, y: 100 }): Promise<SDKNode> {
    const id = `${result.type}_${Math.random().toString(36).slice(2, 9)}`;
    const { connectData, connectExecution, ...astData } = result;

    const newNode: SDKNode = {
      id,
      type: result.type,
      position,
      data: { ast: astData },
      ...(astData.parentId ? { parentNode: astData.parentId, expandParent: true } : {}),
    };

    nodes.push(newNode);

    if (connectData) {
      const targets = Array.isArray(connectData) ? connectData : [connectData];
      targets.forEach(targetId => _createAutoEdge(id, { kind: 'data', targetId }));
    }

    if (connectExecution) {
      const targets = Array.isArray(connectExecution) ? connectExecution : [connectExecution];
      targets.forEach(targetId => _createAutoEdge(id, { kind: 'execution', targetId }));
    }

    return newNode;
  }

  function _createAutoEdge(newNodeId: string, intent: AutoConnectIntent) {
  // Temporariamente: cria o edge sem validar
  // (para isolar se o problema é na validação ou no targetId)
  const [source, target] =
    intent.kind === 'data'
      ? [newNodeId, intent.targetId]
      : [intent.targetId, newNodeId];

  console.log('[autoConnect] criando edge', { source, target, nodes: nodes.map(n => n.id) });

  connections.push({
    id: `${source}→${target}`,
    source,
    target,
    data: { type: intent.kind },
  } as NodeConnection);
}

  function setId(id: number) {
    info.id = id;
  }

  function removeNode(id: string) {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx !== -1) nodes.splice(idx, 1);
    // Remove edges órfãos
    const toRemove = connections
      .map((e, i) => (e.source === id || e.target === id ? i : -1))
      .filter((i) => i !== -1)
      .reverse();
    toRemove.forEach((i) => connections.splice(i, 1));
  }

  function removeConnection(id: string) {
    const idx = connections.findIndex((e) => e.id === id);
    if (idx !== -1) connections.splice(idx, 1);
  }

  function setState(newState: Partial<EditorState>) {
    if (newState.info) Object.assign(info, newState.info);

    if (newState.nodes) {
      nodes.splice(0, nodes.length, ...newState.nodes);
    }
    if (newState.connections) {
      connections.splice(0, connections.length, ...newState.connections);
    }
  }

  function clearState() {
    nodes.splice(0, nodes.length);
    connections.splice(0, connections.length);
    Object.assign(info, {
      id: null,
      title: "Untitled",
      version: "1.0.0",
      description: null,
      updatedAt: null,
    });
  }

  return {
    // Estado
    nodes,
    connections,
    info,

    // Getters filtrados (para os models / ctx)
    variables,
    functions,
    logics,

    // Ações
    addNode,
    removeNode,
    removeConnection,
    setId,
    setState,
    clearState,
  };
});
