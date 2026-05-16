<script setup lang="ts">
import { computed, ref } from "vue";
import { VNavigationDrawer } from "vuetify/components";
import { useEditorExplorer } from "@/composables/useEditorExplorer";
import CreateObjectDialog from "./CreateObjectDialog.vue";
import ExplorerPanel from "./ExplorerPanel.vue";
import ExplorerRail from "./ExplorerRail.vue";

type DrawerState = "open" | "rail" | "hidden";

const props = defineProps<{
	state?: DrawerState;
}>();

const emit = defineEmits<{
	"update:state": [value: DrawerState];
}>();

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

function toggleState() {
	drawerState.value = isRail.value ? "open" : "rail";
}

function handleRailCategoryClick(key: any) {
	activeCategory.value = key;

	drawerState.value = "open";
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
</script>

<template>
  <v-navigation-drawer
    v-if="!isHidden"
    :rail="isRail"
    permanent
    elevation="0"
    rounded="0"
    width="320"
    :class="
      isRail
        ? 'bg-transparent border-0'
        : 'bg-surface border-e'
    "
  >
    <ExplorerRail
      v-if="isRail"
      :sidebar-items="sidebarItems"
      :items="sidebarItems"
      :active-category="
        activeCategory
      "
      @select="
        handleRailCategoryClick
      "
      @expand="
        toggleState
      "
    />

    <ExplorerPanel
      v-else
      :sidebar-items="
        sidebarItems
      "
      :active-category="
        activeCategory
      "
      :active-category-config="
        activeCategoryConfig
      "
      :active-definitions="
        activeDefinitions
      "
      :all-expanded="
        allExpanded
      "
      :editor-store="
        editorStore
      "
      @collapse="
        toggleState
      "
      @select-category="
        activeCategory =
          $event
      "
      @toggle-expanded="
        allExpanded =
          !allExpanded
      "
      @add-item="
        addButtonHandler
      "
    />
  </v-navigation-drawer>

  <CreateObjectDialog
    v-model="isDialogOpen"
    :form-params="formParams"
    @create="handleCreate"
  />
</template>
