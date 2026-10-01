import { jsAdapter } from "@projeto/compiler";
import {
	BaseNode,
	deserialize,
	type EditorState,
	type LanguageSnippet,
	type Schemes,
	serialize,
} from "@projeto/types";
import { defineStore } from "pinia";
import type { NodeEditor } from "rete";
import { reactive, ref, shallowRef, computed } from "vue";

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
	const nodesCount = ref(0);

	// Metadados do arquivo/projeto
	const info = reactive<FileInfo>({
		id: null,
		title: "Untitled",
		version: "1.0.0",
		description: null,
		updatedAt: null,
	});

	// Acesso aos nós e conexões do Rete
	const nodes = computed(() => (editor.value ? editor.value.getNodes() : []));
	const connections = computed(() => (editor.value ? editor.value.getConnections() : []));

	// Snippets de código disponíveis para inserção
	const snippets = ref<LanguageSnippet[]>([]);

	// Carrega snippets nativos da linguagem
	async function loadSnippets() {
		snippets.value = await jsAdapter.getSnippets();
	}

	// Registra a instância ativa criada no componente do Canvas
	function setEditorInstance(instance: NodeEditor<Schemes>) {
		editor.value = instance;
		nodesCount.value = instance.getNodes().length;
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
		const state = serialize(editor.value);
		return await jsAdapter.graphToCode(state);
	}

	// Exporta estado serializado
	function getState(): EditorState | null {
		if (!editor.value) return null;
		return {
			...serialize(editor.value),
			info: { ...info },
		};
	}

	// Restaura estado no editor
	async function setState(state: EditorState) {
		if (!editor.value) return;
		await editor.value.clear();
		await deserialize(editor.value, state);
	}

	// Limpa o canvas e o estado
	async function clearState() {
		if (editor.value) {
			await editor.value.clear();
		}
		Object.assign(info, {
			id: null,
			title: "Untitled",
			version: "1.0.0",
			description: null,
			updatedAt: null,
		});
	}

	function setId(id: number) {
		info.id = id;
	}

	return {
		// Referências e estado
		editor,
		nodes,
		connections,
		nodesCount,
		info,
		snippets,

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
