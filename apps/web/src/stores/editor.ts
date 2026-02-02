import { defineStore } from "pinia";
import type { EditorState } from "@projeto/types";

function models(): EditorState {
	return {
		// Estrutura
		nodes: [],
		connections: [],

		// Dados do Jogo
		info: {
			id: null,
			title: "",
			version: "1.0.0",
			description: "",
			updatedAt: null,
		},
		objects: [],
		avatars: [],
		flags: [],
		statuses: [],
		skills: [],
		companions: [],
		quests: [],
		assets: [],

		// Lógica (Instâncias)
		conditions: [],
		consequences: [],
		events: [],
		actions: [],
	};
}

function generateId(prefix: string) {
	const time = Date.now().toString(36);
	const rand = Math.floor(Math.random() * 1e6).toString(36);
	return `${prefix}_${time}_${rand}`;
}

export const useEditorStore = defineStore("editor", {
	state: () => models(),
	actions: {
		setState(newState: Partial<EditorState>) {
			this.$patch(newState);
		},
		getModel() {
			return models();
		},
		setGameId(id: string | undefined) {
			if (!id) return;
			this.info.id = id;
		},
	},
});

export { generateId };
export {
	categories,
	getSubCategories,
	normalizeItems,
} from "@/lib/editor/index.ts";
