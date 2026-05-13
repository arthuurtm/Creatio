import type {
	CategoryKey,
	EditorState,
	FileInfo,
	NodeConnection,
	SDKNode,
} from "@projeto/types";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const useEditorStore = defineStore("editor", () => {
	const variables = reactive<SDKNode[]>([]);
	const functions = reactive<SDKNode[]>([]);
	const logics = reactive<SDKNode[]>([]);
	const connections = reactive<NodeConnection[]>([]);

	const info = reactive<FileInfo>({
		id: null,
		title: "Untitled",
		version: "1.0.0",
		description: null,
		updatedAt: null,
	});

	const categoryMap: Record<CategoryKey, SDKNode[]> = {
		variables,
		functions,
		logics,
	};

	const nodes = computed({
		get: () => [...variables, ...functions, ...logics],
		set: (newNodesArray) => {
			const newVars = newNodesArray.filter((n) => n.category === "variables");
			const newFuncs = newNodesArray.filter((n) => n.category === "functions");
			const newLogics = newNodesArray.filter((n) => n.category === "logics");

			variables.splice(0, variables.length, ...newVars);
			functions.splice(0, functions.length, ...newFuncs);
			logics.splice(0, logics.length, ...newLogics);
		},
	});

	function addNode(category: CategoryKey, nodeData: SDKNode) {
		const id = `${category}_${Math.random().toString(36)}`;
		const newNode = { ...nodeData, id, category };
		categoryMap[category].push(newNode);
	}

	function setId(id: number) {
		info.id = id;
	}

	function setState(newState: Partial<EditorState>) {
		if (newState.info) Object.assign(info, newState.info);

		if (newState.variables)
			variables.splice(0, variables.length, ...newState.variables);
		if (newState.functions)
			functions.splice(0, functions.length, ...newState.functions);
		if (newState.logics) logics.splice(0, logics.length, ...newState.logics);

		if (newState.connections) {
			connections.splice(0, connections.length, ...newState.connections);
		}
	}

	return {
		variables,
		functions,
		logics,
		connections,
		info,

		nodes,

		addNode,
		setId,
		setState,
	};
});
