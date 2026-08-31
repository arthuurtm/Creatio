<script setup lang="ts">
import { ref, computed } from "vue";
import {
  NInput,
  NButton,
  NIcon,
  NCollapse,
  NCollapseItem,
} from "naive-ui";
import { Search } from "@vicons/ionicons5";
import {
  UnfoldLessOutlined,
  UnfoldMoreOutlined,
} from "@vicons/material";

import { useEditorStore } from "@/stores/editor";
import {
  getCategory,
  type EditorDefinition,
  type SDKNode,
  type SDKNodeType,
} from "@projeto/types";

import ComponentQuickEditPanel from "@/components/modules/ComponentQuickEditPanel.vue";
import CreateNodeMenu from "./CreateNodeMenu.vue";
import { getIconComponent } from "@/utils/icons";

const emit = defineEmits<{
  "add-item": [EditorDefinition];
}>();

const editorStore = useEditorStore();

const searchQuery = ref("");
const expandedNames = ref<SDKNodeType[]>([
  "variables",
  "logics",
  "functions",
]);

const categories = [
  {
    key: "variables",
    colorClass: "text-cyan-500",
    label: "Variáveis Ativas",
    getName: (node: SDKNode) =>
      node.data?.params?.name ||
      node.data?.params?.varId ||
      "",
  },
  {
    key: "logics",
    colorClass: "text-violet-500",
    label: "Lógicas Ativas",
    getName: (node: SDKNode) =>
      node.data?.category ||
      node.data?.params?.condition ||
      "",
  },
  {
    key: "functions",
    colorClass: "text-amber-500",
    label: "Funções Ativas",
    getName: (node: SDKNode) =>
      node.data?.params?.name ||
      node.data?.params?.funcName ||
      "",
  },
] satisfies Array<{
  key: SDKNodeType;
  colorClass: string;
  label: string;
  getName: (node: SDKNode) => string;
}>;

/**
 * Configuração fornecida pelo SDK para cada categoria.
 */
const categoryConfigs = computed(() =>
  Object.fromEntries(
    categories.map(({ key }) => [
      key,
      getCategory(key, editorStore as any),
    ])
  ) as Record<SDKNodeType, ReturnType<typeof getCategory>>
);

/**
 * Lista de nós filtrada por categoria + busca.
 */
function getCategoryNodes(
  category: (typeof categories)[number]
) {
  const list = editorStore.nodes.filter(
    node => node.type === category.key
  );

  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return list;
  }

  return list.filter(node => {
    const name = category.getName(node).toLowerCase();

    return (
      name.includes(query) ||
      node.id.toLowerCase().includes(query)
    );
  });
}

const categoryLists = Object.fromEntries(
  categories.map(category => [
    category.key,
    computed({
      get: () => getCategoryNodes(category),

      set: (newValue: SDKNode[]) => {
        const otherNodes = editorStore.nodes.filter(
          node => node.type !== category.key
        );

        editorStore.setState({
          nodes: [...otherNodes, ...newValue],
        });
      },
    }),
  ])
) as Record<
  SDKNodeType,
  ReturnType<typeof computed<SDKNode[]>>
>;

const allExpanded = computed(
  () => expandedNames.value.length === categories.length
);

function toggleAllExpanded() {
  expandedNames.value = allExpanded.value
    ? []
    : categories.map(category => category.key);
}
</script>

<template>
  <div
    class="flex flex-col h-full w-full overflow-hidden select-none
           bg-[color:var(--n-card-color)]
           text-[color:var(--n-text-color)]"
  >
    <div class="px-4 py-3 shrink-0 flex items-center gap-2">
      <NInput
        v-model:value="searchQuery"
        placeholder="Filtrar estruturas..."
        clearable
        class="flex-1"
      >
        <template #prefix>
          <NIcon :component="Search" class="opacity-60 mr-1" />
        </template>
      </NInput>

      <NButton
        circle
        quaternary
        :title="
          allExpanded
            ? 'Recolher todas as pastas'
            : 'Expandir todas as pastas'
        "
        @click="toggleAllExpanded"
      >
        <template #icon>
          <NIcon size="18">
            <UnfoldLessOutlined v-if="allExpanded" />
            <UnfoldMoreOutlined v-else />
          </NIcon>
        </template>
      </NButton>
    </div>

    <!-- Árvore de estruturas -->
    <div class="flex-grow overflow-y-auto px-4 pb-6 pt-1">
      <NCollapse
        v-model:expanded-names="expandedNames"
        arrow-placement="left"
      >
        <NCollapseItem
          v-for="category in categories"
          :key="category.key"
          :name="category.key"
        >
          <template #header>
            <div
              class="flex items-center justify-between
                     w-full pr-1"
            >
              <div class="flex items-center gap-2">
                <NIcon
                  size="16"
                  :class="category.colorClass"
                >
                  <component
                    :is="
                      getIconComponent(
                        categoryConfigs[category.key]?.icon
                      )
                    "
                  />
                </NIcon>

                <span
                  class="font-bold text-xs uppercase
                         tracking-wider"
                >
                  {{ categoryConfigs[category.key]?.text }}
                </span>

                <span
                  class="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                >
                  {{ categoryLists[category.key].value.length }}
                </span>
              </div>

              <div
                @click.stop
                class="pointer-events-auto shrink-0"
              >
                <CreateNodeMenu
                  :definitions="
                    categoryConfigs[category.key]?.definitions ?? {}
                  "
                  @select="emit('add-item', $event)"
                />
              </div>
            </div>
          </template>

          <div class="pl-2 pt-1 pb-2">
            <ComponentQuickEditPanel
              v-model:modelValue="categoryLists[category.key].value"
              :start-expanded="allExpanded"
              :label="category.label"
            />
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </div>
</template>
