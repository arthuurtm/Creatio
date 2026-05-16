import {
	type CategoryKey,
	categories,
	type EditorDefinition,
	getCategory,
	type NodeBlueprint,
} from "@projeto/types";

import { computed, ref } from "vue";
import type { Blueprint } from "vuetify";
import { useEditorStore } from "@/stores/editor";

export function useEditorExplorer() {
	const editorStore = useEditorStore();

	const activeCategory = ref<CategoryKey | null>(null);
	const allExpanded = ref(false);

	const isDialogOpen = ref(false);
	const formParams = ref([]);
	const createItemExecuteFn = ref<
		((params: Record<string, any>) => NodeBlueprint) | null
	>(null);

	const sidebarItems = computed(() => {
		return (Object.keys(categories) as CategoryKey[]).map((key) => {
			const config = getCategory(key, editorStore);
			const isArray = Array.isArray(config);

			return {
				key,
				text: isArray ? key : config.text,
				icon: isArray ? "folder" : config.icon,
			};
		});
	});

	const activeCategoryConfig = computed(() => {
		if (!activeCategory.value) return null;

		const config = getCategory(activeCategory.value, editorStore);

		return Array.isArray(config) ? null : config;
	});

	const activeDefinitions = computed(
		() => activeCategoryConfig.value?.definitions ?? {},
	);

	function addButtonHandler(item: EditorDefinition) {
		formParams.value = item.params
			? JSON.parse(JSON.stringify(item.params))
			: [];

		createItemExecuteFn.value = item.execute ?? null;

		if (formParams.value.length) isDialogOpen.value = true;
	}

	function handleCreate() {
		const payload = formParams.value.reduce((acc, param: any) => {
			acc[param.key] = param.model;
			return acc;
		}, {});

		if (createItemExecuteFn.value) {
			const newNode = createItemExecuteFn.value(payload) as Blueprint;

			editorStore.addNode(activeCategory.value!, {
				...newNode,
				position: { x: 100, y: 100 },
				category: activeCategory.value,
			});
		}

		isDialogOpen.value = false;
		formParams.value = [];
		createItemExecuteFn.value = null;
	}

	return {
		editorStore,

		activeCategory,
		activeCategoryConfig,
		activeDefinitions,
		sidebarItems,

		allExpanded,

		isDialogOpen,
		formParams,

		addButtonHandler,
		handleCreate,
	};
}
