import type {
	NodeConnection,
	SDKNode,
	SDKNodeType,
} from "@projeto/types";
import { useEditorStore } from "@/stores/editor";
import { showToast } from "@/plugins/toast";

interface CreateNodeParams {
	type?: SDKNodeType;
	content?: any;
	links?: NodeConnection;
}

function createNode(x: number, y: number, params: CreateNodeParams) {
	const editorStore = useEditorStore();
	const type = params.type || "logics";
	const id = `${type}_${Math.random().toString(36).slice(2, 9)}`;
	const node: SDKNode = {
		id,
		position: { x, y },
		type,
		data: params.content ? JSON.parse(JSON.stringify(params.content)) : {},
	};
	editorStore.nodes.push(node);
	return id;
}

const deleteNode = (nodeId: string) => {
	const editorStore = useEditorStore();
	editorStore.removeNode(nodeId);
	showToast({ type: "info", message: "Nó removido com sucesso." });
};

const cloneNode = (node: SDKNode) => {
	const editorStore = useEditorStore();
	const newId = `${node.type}_${Math.random().toString(36).slice(2, 9)}`;
	const cloned: SDKNode = {
		id: newId,
		type: node.type,
		position: {
			x: node.position.x + 30,
			y: node.position.y + 30,
		},
		data: node.data ? JSON.parse(JSON.stringify(node.data)) : {},
	};
	editorStore.nodes.push(cloned);
	showToast({ type: "success", message: "Nó duplicado com sucesso!" });
	return cloned;
};

function getNodeContextMenuItems(node: SDKNode) {
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
