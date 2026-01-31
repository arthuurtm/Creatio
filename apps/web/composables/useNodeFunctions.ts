import type {
	GameConnection,
	GameNode,
	GameNodeType,
} from "#types/domain/editor/models.ts";
import { useEditorStore } from "@/stores/editor";

interface CreateNodeParams {
	type?: GameNodeType;
	content?: any;
	links?: GameConnection;
}

function createNode(x: number, y: number, params: CreateNodeParams) {
	const editorStore = useEditorStore();
	const id = `node${Date.now()}`;
	const node: GameNode = {
		id,
		position: { x, y },
		type: params.type || "dialog",
		data: params.content || {},
	};
	editorStore.nodes.push(node);
	return id;
}

// Função interna para deletar (exemplo simples)
const deleteNode = (nodeId: string) => {
	const editorStore = useEditorStore();
	const index = editorStore.nodes.findIndex((n: GameNode) => n.id === nodeId);
	if (index > -1) {
		editorStore.nodes.splice(index, 1);
		// Nota: Idealmente você também deve remover os links conectados a este node aqui
	}
};

const cloneNode = (node: GameNode) => {
	createNode(node.position.x + 20, node.position.y + 20, {
		type: node.type,
	});
};

function getNodeContextMenuItems(node: GameNode) {
	return [
		{ text: "Duplicar", icon: "content_copy", command: "NODE.CLONE", node },
		{
			text: "Excluir",
			icon: "delete",
			classes: "destructive",
			command: "NODE.DELETE",
			node,
		},
		{
			text: "Propriedades",
			icon: "tune",
			command: "NODE.OPEN_PROPERTIES_SCREEN",
			node,
		},
	];
}

export { createNode, deleteNode, cloneNode, getNodeContextMenuItems };
