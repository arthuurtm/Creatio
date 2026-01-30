// skill.ts
import { computed } from "vue";
import { createDefinitions } from "#types/domain/editor/index.ts";
import { generateId, useEditorStore } from "@/stores/editor.ts";

export const skills = computed(() => {
	const editorStore = useEditorStore();

	function pushDefinition(type: string, params: any) {
		const id = generateId("skill");
		const definition = { id, type, ...params };
		editorStore.skills.push(definition);
		return id;
	}

	const definitions = createDefinitions({
		createActiveSkill: {
			text: "Habilidade Ativa",
			icon: "bolt",
			params: [
				{ key: "name", label: "Nome", type: "text", required: true },
				{
					key: "costType",
					label: "Custo",
					type: "select",
					items: ["Mana", "Energia", "Vida"],
				},
				{
					key: "costAmount",
					label: "Valor do Custo",
					type: "number",
					default: 10,
				},
			],
			execute: (params) => pushDefinition("active", params),
		},
	});

	return {
		text: "Habilidades",
		icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a1/lottie.json",
		definitions,
	};
});
