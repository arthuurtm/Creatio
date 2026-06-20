import {
  type CategoryKey,
  categories,
  type EditorDefinition,
  getCategory,
} from "@projeto/types";

import { computed, ref } from "vue";
import { useEditorStore } from "@/stores/editor";

export function useEditorExplorer() {
  const editorStore = useEditorStore();

  const activeCategory = ref<CategoryKey | undefined>();
  const allExpanded = ref(false);

  const isDialogOpen = ref(false);
  const formParams = ref<any[]>([]);
  const createItemExecuteFn = ref<EditorDefinition["execute"] | null>(null);

  const sidebarItems = computed(() =>
    (Object.keys(categories) as CategoryKey[]).map((key) => {
      const config = getCategory(key, editorStore);
      return {
        key,
        text: config.text,
        icon: config.icon,
      };
    }),
  );

  const activeCategoryConfig = computed(() => {
    if (!activeCategory.value) return null;
    return getCategory(activeCategory.value, editorStore);
  });

  const activeDefinitions = computed(
    () => activeCategoryConfig.value?.definitions ?? {},
  );

  async function addButtonHandler(item: EditorDefinition) {
    formParams.value = item.params
      ? JSON.parse(JSON.stringify(item.params))
      : [];
    createItemExecuteFn.value = item.execute ?? null;

    if (formParams.value.length) {
      isDialogOpen.value = true;
    } else {
      await _submitCreate();
    }
  }

  async function handleCreate() {
   await _submitCreate();
  }

  async function _submitCreate() {
    if (!createItemExecuteFn.value || !activeCategory.value) return;

    // Coleta valores preenchidos no formulário
    const payload = formParams.value.reduce(
      (acc, param: any) => {
        acc[param.key] = param.model;
        return acc;
      },
      {} as Record<string, any>,
    );

    const result = createItemExecuteFn.value(payload);
    await editorStore.addNode(result);

    _reset();
  }

  function _reset() {
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
