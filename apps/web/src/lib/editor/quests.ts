// quest.ts
import { computed } from "vue";
import { createDefinitions } from "@projeto/types";
import { generateId, useEditorStore } from "@/stores/editor.ts";

export const quests = computed(() => {
	const editorStore = useEditorStore();

	function pushDefinition(type: string, params: any) {
		const id = generateId("quest");
		const definition = { id, type, ...params };
		editorStore.quests.push(definition);
		return id;
	}

	const definitions = createDefinitions({
		createMainQuest: {
			text: "Missão Principal",
			icon: "flag_checkered",
			params: [
				{ key: "title", label: "Título", type: "text", required: true },
				{ key: "description", label: "Descrição", type: "textarea" },
				{
					key: "startEvent",
					label: "Evento de Início",
					type: "select",
					items: editorStore.events,
				},
			],
			execute: (params) => pushDefinition("main_quest", params),
		},
		createSideQuest: {
			text: "Missão Secundária",
			icon: "explore",
			params: [
				{ key: "title", label: "Título", type: "text", required: true },
				{
					key: "requiredLevel",
					label: "Nível Mínimo",
					type: "number",
					default: 1,
				},
			],
			execute: (params) => pushDefinition("side_quest", params),
		},
	});

	return {
		text: "Missões",
		icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f6f8/lottie.json",
		definitions,
	};
});
