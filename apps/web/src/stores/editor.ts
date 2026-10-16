import { jsAdapter } from "@projeto/compiler";
import { safeSerialize, type NodeEditor } from "@projeto/editor";
import {
	BaseNode,
	deserialize,
	applyInteraction,
	type EditorState,
	type LanguageSnippet,
	type Schemes,
} from "@projeto/types";
import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

export interface FileInfo {
	id: number | null;
	title: string;
	version: string;
	description: string | null;
	updatedAt: Date | number | null;
}

export const useEditorStore = defineStore("editor", () => {
	// Instância ativa do editor nativo do Rete
	const editor = shallowRef<NodeEditor<Schemes> | null>(null);
	const revision = ref(0);
  let pipeRegistered = false;


	// Metadados do arquivo/projeto
	const info = shallowRef<FileInfo>({
		id: null,
		title: "Untitled",
		version: "1.0.0",
		description: null,
		updatedAt: null,
	});

	// Acesso aos nós e conexões do Rete
	const nodes = computed(() => {
    revision.value;
    return editor.value ? editor.value.getNodes() : [];
  });

  const connections = computed(() => {
    revision.value;
    return editor.value ? editor.value.getConnections() : [];
  });

	// Snippets de código disponíveis para inserção
	const snippets = ref<LanguageSnippet[]>([]);

	// Carrega snippets nativos da linguagem
	async function loadSnippets() {
		snippets.value = await jsAdapter.getSnippets();
	}

	// contador para fins de reatividade, pois o Rete não é reativo por padrão
  const nodesCount = computed(() => nodes.value.length);

  function setEditorInstance(instance: NodeEditor<Schemes>) {
    editor.value = instance;
    if (!pipeRegistered) {
      instance.addPipe((context) => {
        const t = (context as any).type;
        if (
          t === "nodecreated" ||
          t === "noderemoved" ||
          t === "connectioncreated" ||
          t === "connectionremoved" ||
          t === "cleared"
        ) {
          revision.value++;
        }
        return context;
      });
      pipeRegistered = true;
    }
    revision.value++;
  }

	// Adiciona um nó diretamente via classe nativa BaseNode do Rete Studio
	async function addNode(
		label: string,
		type: "statement" | "expression" = "statement",
		data: Record<string, any> = {},
	) {
		if (!editor.value) return null;
		const node = new BaseNode(label);
		node.type = type;
		node.data = data;
		await editor.value.addNode(node);
		return node;
	}

	// Remove um nó nativamente
	async function removeNode(nodeId: string) {
		if (!editor.value) return;
		await editor.value.removeNode(nodeId);
	}

	// Insere código convertendo em nós do Rete nativamente
	async function insertSnippet(code: string) {
		if (!editor.value) return;
		const graphData = await jsAdapter.codeToGraph(code);
		await deserialize(editor.value, graphData);
	}

	// Transpila os nós visuais atuais de volta para código JavaScript
	async function compileToCode(): Promise<string> {
		if (!editor.value) return "";
		const state = safeSerialize(editor.value);
		return await jsAdapter.graphToCode(state);
	}

	// Exporta estado serializado
	function getState(): EditorState | null {
		if (!editor.value) return null;
		return safeSerialize(editor.value)
	}

	// Restaura estado no editor
	async function setState(state: EditorState) {
		if (!editor.value) return;
		await editor.value.clear();
		await deserialize(editor.value, state);
		applyInteraction(editor.value, () => {});
	}

	// Limpa o canvas e o estado
	async function clearState() {
		if (editor.value) {
			await editor.value.clear();
		}
	}

	function setId(id: number) {
		info.value.id = id;
	}

	return {
		// Referências e estado
		editor,
		nodes,
		connections,
		nodesCount,
		info,
		snippets,
    revision,

		// Inicializadores
		setEditorInstance,
		loadSnippets,

		// Ações nativas Rete
		addNode,
		removeNode,
		insertSnippet,
		compileToCode,
		getState,
		setState,
		clearState,
		setId,
	};
});
