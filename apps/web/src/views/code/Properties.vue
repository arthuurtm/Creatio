<script setup lang="ts">
import {
	type CategoryKey,
	categories,
	type EditorDefinition,
	getCategory,
	type NodeBlueprint,
	normalizeItems,
} from "@projeto/types";
import { computed, reactive, ref } from "vue";
import type { Blueprint } from "vuetify";
import {
	VBtn,
	VCard,
	VCardActions,
	VCardText,
	VCardTitle,
	VCheckbox,
	VDialog,
	VDivider,
	VFileInput,
	VIcon,
	VList,
	VListItem,
	VMenu,
	VNavigationDrawer,
	VRadioGroup,
	VRow,
	VSelect,
	VSheet,
	VSpacer,
	VSwitch,
	VTextarea,
	VTextField,
	VToolbar,
	VToolbarTitle,
} from "vuetify/components";
import ComponentQuickEditPanel from "@/components/modules/ComponentQuickEditPanel.vue";
import ComplexArrayBuilder from "@/components/ui/ComplexArrayBuilder.vue";
import { useEditorStore } from "@/stores/editor";

type DrawerState = "open" | "rail" | "hidden";

type FormType =
	| "text"
	| "password"
	| "email"
	| "number"
	| "textarea"
	| "select"
	| "checkbox"
	| "switch"
	| "radio"
	| "date"
	| "time"
	| "datetime"
	| "file"
	| "button"
	| "complex-array";

interface FormParam {
	key: string;
	type: FormType;
	model: any;
	label?: string;
	rules?: ((v: any) => boolean | string)[];
	items?: any[];
	icon?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	[key: string]: any;
}

const props = defineProps<{
	state?: DrawerState;
}>();

const emit = defineEmits<{
	"update:state": [value: DrawerState];
}>();

const editorStore = useEditorStore();
const internalState = ref<DrawerState>("open");
const activeCategory = ref<CategoryKey | null>(null);
const allExpanded = ref(false);
const isDialogOpen = ref(false);
const formParams = ref<FormParam[]>([]);
const createItemExecuteFn = ref<
	((params: Record<string, any>) => NodeBlueprint) | null
>(null);

const drawerState = computed({
	get: () => props.state ?? internalState.value,
	set: (v: DrawerState) => {
		internalState.value = v;
		emit("update:state", v);
	},
});

const isRail = computed(() => drawerState.value === "rail");
const isOpen = computed(() => drawerState.value === "open");
const isHidden = computed(() => drawerState.value === "hidden");

const inputParamMap: Record<FormType, any> = {
	text: VTextField,
	email: VTextField,
	password: VTextField,
	number: VTextField,
	textarea: VTextarea,
	select: VSelect,
	checkbox: VCheckbox,
	switch: VSwitch,
	radio: VRadioGroup,
	date: VTextField,
	time: VTextField,
	datetime: VTextField,
	file: VFileInput,
	button: VBtn,
	"complex-array": ComplexArrayBuilder,
};

const sidebarItems = computed(() => {
	const keys = Object.keys(categories) as CategoryKey[];
	return keys.map((key) => {
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
	if (Array.isArray(config)) return null;
	return config;
});

const activeDefinitions = computed(() => {
	if (!activeCategoryConfig.value) return {};
	return activeCategoryConfig.value.definitions;
});

function handleRailCategoryClick(key: CategoryKey) {
	activeCategory.value = key;
	drawerState.value = "open";
}

function handleCategoryClick(key: CategoryKey) {
	activeCategory.value = key;
}

function toggleState() {
	drawerState.value = isOpen.value ? "rail" : "open";
}

function addButtonHandler(item: EditorDefinition) {
	formParams.value = item.params ? JSON.parse(JSON.stringify(item.params)) : [];
	createItemExecuteFn.value = item.execute ?? null;
	if (formParams.value.length > 0) isDialogOpen.value = true;
}

function handleCreate() {
	// pega apenas os valores úteis do formulário dinâmico
	// transforma [{key: 'condition', model: '...'}] em {condition: '...'}
	const payload = formParams.value.reduce((acc, param) => {
		acc[param.key] = param.model;
		return acc;
	}, {});

	if (createItemExecuteFn.value) {
		const newNode = createItemExecuteFn.value(payload) as Blueprint;

		editorStore.addNode(activeCategory.value as CategoryKey, {
			...newNode,
			position: { x: 100, y: 100 },
			category: activeCategory.value,
		});
	}

	isDialogOpen.value = false;
	formParams.value = [];
	createItemExecuteFn.value = null;
}
</script>

<template>
  <v-navigation-drawer
    v-if="!isHidden"
    :rail="isRail"
    permanent
    elevation="0"
    rounded="0"
    width="320"
    :class="isRail ? 'bg-transparent border-0' : 'bg-surface border-e'"
  >
    <template #append>
      <div v-if="isRail" class="pa-2 pb-4">
        <v-btn
          icon="chevron_right"
          variant="tonal"
          rounded="xl"
          size="small"
          class="mx-auto d-flex"
          color="medium-emphasis"
          @click="toggleState"
        />
      </div>
    </template>

    <div v-if="isRail" class="pa-2 pt-4">
      <v-list density="compact" nav class="pa-0 border-0 d-flex flex-column align-center">
        <v-list-item
          v-for="item in sidebarItems"
          :key="item.key"
          :value="item.key"
          :active="activeCategory === item.key"
          :title="item.text"
          active-color="primary"
          variant="tonal"
          rounded="xl"
          class="mb-2"
          @click="handleRailCategoryClick(item.key)"
        >
          <template #prepend>
            <v-icon :icon="item.icon" size="small" />
          </template>
        </v-list-item>
      </v-list>
    </div>

    <div v-else class="h-100 d-flex flex-column">
      <v-toolbar density="compact" flat color="transparent" class="px-2 pt-2">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-medium-emphasis">
          Explorador
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon="chevron_left"
          variant="text"
          color="medium-emphasis"
          size="small"
          rounded="xl"
          title="Minimizar"
          @click="toggleState"
        />
      </v-toolbar>

      <div class="px-4 py-3">
        <v-sheet class="d-flex flex-row flex-wrap ga-2" color="transparent">
          <v-btn
            v-for="item in sidebarItems"
            :key="item.key"
            :prepend-icon="item.icon"
            :variant="activeCategory === item.key ? 'tonal' : 'text'"
            :color="activeCategory === item.key ? 'primary' : 'medium-emphasis'"
            rounded="xl"
            size="small"
            class="text-none font-weight-medium elevation-0"
            @click="handleCategoryClick(item.key)"
          >
            {{ item.text }}
          </v-btn>
        </v-sheet>
      </div>

      <v-divider class="mx-4 opacity-20" />

      <div v-if="activeCategory" class="d-flex flex-column overflow-hidden flex-grow-1 pt-2">
        <v-toolbar density="compact" flat color="transparent" class="px-4">
          <v-toolbar-title class="text-body-2 font-weight-bold text-primary">
            {{ activeCategoryConfig?.text }}
          </v-toolbar-title>
          <v-spacer />

          <v-btn
            icon
            variant="text"
            color="medium-emphasis"
            size="small"
            rounded="xl"
            :title="allExpanded ? 'Recolher tudo' : 'Expandir tudo'"
            @click="allExpanded = !allExpanded"
          >
            <v-icon :icon="allExpanded ? 'unfold_less' : 'unfold_more'" />
          </v-btn>

          <v-menu location="bottom end" transition="scale-transition">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="add"
                variant="flat"
                color="primary"
                size="x-small"
                class="ml-1"
              />
            </template>
            <v-card rounded="xl" elevation="3" class="mt-2 border">
              <v-list density="compact" min-width="220" class="pa-2">
                <v-list-item
                  v-for="(def, key) in activeDefinitions"
                  :key="key"
                  :title="def.text"
                  :prepend-icon="def.icon || 'add'"
                  class="mb-1"
                  color="primary"
                  @click="addButtonHandler(def)"
                />
              </v-list>
            </v-card>
          </v-menu>
        </v-toolbar>

        <div class="flex-grow-1 overflow-y-auto px-4 pb-4">
          <ComponentQuickEditPanel
            v-model:modelValue="editorStore[activeCategory]"
            :start-expanded="allExpanded"
            :label="activeCategoryConfig?.text"
          />
        </div>
      </div>

      <div
        v-else
        class="d-flex flex-column align-center justify-center flex-grow-1 pa-6 text-center"
      >
        <v-icon icon="interests" size="48" color="surface-variant" class="mb-4 opacity-50" />
        <span class="text-body-2 text-medium-emphasis">Selecione uma categoria para começar</span>
      </div>
    </div>
  </v-navigation-drawer>

  <v-dialog v-model="isDialogOpen" max-width="450" transition="dialog-bottom-transition">
    <v-card rounded="xl" elevation="4" class="pa-2">
      <v-card-title class="text-center text-subtitle-1 font-weight-bold pt-4 pb-2">
        Criar Novo Objeto
      </v-card-title>

      <v-card-text class="pt-4 pb-0">
        <v-row v-for="(param, index) in formParams" :key="index" class="mb-1">
          <component
            v-if="inputParamMap[param.type]"
            :is="inputParamMap[param.type]"
            v-model="param.model"
            :items="param.type === 'select' ? normalizeItems(param) : param.items"
            :label="param.label"
            variant="outlined"
            density="comfortable"
            bg-color="surface"
            hide-details="auto"
            class="w-100"
          />
          <div v-else class="text-error text-caption px-2">
            ⚠ Componente não suportado: "{{ param.type }}"
          </div>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4 pt-6">
        <v-spacer />
        <v-btn
          text="Cancelar"
          variant="plain"
          color="medium-emphasis"
          rounded="pill"
          class="text-none px-4"
          @click="isDialogOpen = false"
        />
        <v-btn
          text="Criar"
          variant="flat"
          color="primary"
          rounded="pill"
          class="text-none px-6"
          @click="handleCreate"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
