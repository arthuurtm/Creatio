<script setup lang="ts">
import { ChevronBack } from "@vicons/ionicons5";
import { NButton, NButtonGroup, NIcon } from "naive-ui";
import { computed, ref } from "vue";
import { useEditorExplorer } from "@/composables/useEditorExplorer";
import { getIconComponent } from "@/utils/icons.ts";
import BlockCatalog from "./BlockCatalog.vue";
import CreateObjectDialog from "./CreateObjectDialog.vue";
import ExplorerPanel from "./ExplorerPanel.vue";
import ExplorerRail from "./ExplorerRail.vue";

type DrawerState = "open" | "rail" | "hidden";

const props = defineProps<{ state?: DrawerState }>();
const emit = defineEmits<{ "update:state": [value: DrawerState] }>();

const internalState = ref<DrawerState>("open");
const drawerState = computed({
	get: () => props.state ?? internalState.value,
	set: (value: DrawerState) => {
		internalState.value = value;
		emit("update:state", value);
	},
});
const isRail = computed(() => drawerState.value === "rail");
const isHidden = computed(() => drawerState.value === "hidden");

const activeView = ref<"explorer" | "catalog">("explorer");

function toggleState() {
	drawerState.value = isRail.value ? "open" : "rail";
}

const {
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
} = useEditorExplorer();

function handleRailViewClick(view: "explorer" | "catalog") {
	activeView.value = view;
	drawerState.value = "open";
}

// activeNodes é derivado aqui no pai, onde temos acesso à store,
// e passado como prop simples para ExplorerPanel.
// editorStore.variables/functions/logics são computed reativos —
// ao passar como prop, o Vue mantém a reatividade via getter.
const activeNodes = computed(() => {
	if (!activeCategory.value) return [];
	return editorStore[activeCategory.value] ?? [];
});
</script>

<template>
  <div
    v-if="!isHidden"
    :class="[
      'h-full shrink-0 z-10 overflow-hidden border-r border-neutral-100 dark:border-neutral-800/40 bg-[color:var(--n-card-color)] flex flex-col',
      isRail
        ? 'w-16 bg-transparent border-r-0'
        : 'w-[340px]'
    ]"
  >
    <ExplorerRail
      v-if="isRail"
      :active-view="activeView"
      @select-view="handleRailViewClick"
      @expand="toggleState"
    />

    <div v-else class="flex flex-col h-full overflow-hidden">
      <!-- Cabeçalho unificado com alternador de abas e botão de minimizar -->
      <div class="px-4 py-3 shrink-0 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/40">
        <NButtonGroup size="medium" class="w-[230px]">
          <NButton
            :type="activeView === 'explorer' ? 'primary' : 'default'"
            :secondary="activeView === 'explorer'"
            class="flex-1 font-bold"
            style="border-top-left-radius: 9999px; border-bottom-left-radius: 9999px;"
            @click="activeView = 'explorer'"
          >
            <template #icon>
              <NIcon size="16">
                <component :is="getIconComponent('grid_view')" />
              </NIcon>
            </template>
            Estruturas
          </NButton>
          <NButton
            :type="activeView === 'catalog' ? 'primary' : 'default'"
            :secondary="activeView === 'catalog'"
            class="flex-1 font-bold"
            style="border-top-right-radius: 9999px; border-bottom-right-radius: 9999px;"
            @click="activeView = 'catalog'"
          >
            <template #icon>
              <NIcon size="16">
                <component :is="getIconComponent('interests')" />
              </NIcon>
            </template>
            Catálogo
          </NButton>
        </NButtonGroup>

        <NButton
          circle
          quaternary
          size="small"
          title="Minimizar"
          @click="toggleState"
        >
          <template #icon>
            <NIcon size="18"><ChevronBack /></NIcon>
          </template>
        </NButton>
      </div>

      <!-- Conteúdo dinâmico com transição fade suave -->
      <div class="flex-grow overflow-hidden relative">
        <transition name="fastFade" mode="out-in">
          <ExplorerPanel
            v-if="activeView === 'explorer'"
            @add-item="addButtonHandler"
          />
          <BlockCatalog
            v-else
            @add-item="addButtonHandler"
          />
        </transition>
      </div>
    </div>
  </div>

  <CreateObjectDialog
    v-slot:default
    v-model="isDialogOpen"
    :form-params="formParams"
    @create="handleCreate"
  />
</template>
