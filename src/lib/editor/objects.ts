// object.ts
import { computed } from "vue";
import { generateId, useEditorStore } from "@/stores/editor.ts";
import { createDefinitions } from "@/types/editor-config";

export const objects = computed(() => {
	const editorStore = useEditorStore();

	function pushDefinition(type: string, params: any) {
		const id = generateId("object");
		const definition = { id, type, ...params };
		editorStore.objects.push(definition);
		return id;
	}

	const definitions = createDefinitions({
		createItem: {
			text: "Criar Item",
			icon: "inventory_2",
			params: [
				{ key: "name", label: "Nome", type: "text", required: true },
				{
					key: "inventoryIcon",
					label: "Ícone (Inventário)",
					type: "file",
					assetType: "image",
					options: editorStore.assets,
				},
				{
					key: "stackable",
					label: "Empilhável",
					type: "checkbox",
					default: true,
				},
				{ key: "maxStack", label: "Máx. Pilha", type: "number", default: 99 },
			],
			execute: (params) => pushDefinition("item", params),
		},
	});

	return {
		text: "Objetos",
		icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f48e/lottie.json",
		definitions,
	};
});
