<script setup lang="ts">
import type { CategoryKey, EditorDefinition } from "@projeto/types";

import {
	VBtn,
	VDivider,
	VIcon,
	VSheet,
	VSpacer,
	VToolbar,
	VToolbarTitle,
} from "vuetify/components";

import ComponentQuickEditPanel from "@/components/modules/ComponentQuickEditPanel.vue";
import CreateNodeMenu from "./CreateNodeMenu.vue";

defineProps<{
	sidebarItems: any[];
	activeCategory: CategoryKey | null;
	activeCategoryConfig: any;
	activeDefinitions: Record<string, EditorDefinition>;

	allExpanded: boolean;
	editorStore: any;
}>();

const emit = defineEmits<{
	collapse: [];
	selectCategory: [CategoryKey];
	toggleExpanded: [];
	addItem: [EditorDefinition];
}>();
</script>

<template>
	<div class="h-100 d-flex flex-column">
		<v-toolbar
			density="compact"
			flat
			color="transparent"
			class="px-2 pt-2"
		>
			<v-toolbar-title
				class="text-subtitle-1 font-weight-bold text-medium-emphasis"
			>
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
				@click="
					emit('collapse')
				"
			/>
		</v-toolbar>

		<div class="px-4 py-3">
			<v-sheet
				class="d-flex flex-row flex-wrap ga-2"
				color="transparent"
			>
				<v-btn
					v-for="item in sidebarItems"
					:key="item.key"
					:prepend-icon="
						item.icon
					"
					:variant="
						activeCategory ===
						item.key
							? 'tonal'
							: 'text'
					"
					:color="
						activeCategory ===
						item.key
							? 'primary'
							: 'medium-emphasis'
					"
					rounded="xl"
					size="small"
					class="text-none font-weight-medium elevation-0"
					@click="
						emit(
							'selectCategory',
							item.key
						)
					"
				>
					{{ item.text }}
				</v-btn>
			</v-sheet>
		</div>

		<v-divider class="mx-4 opacity-20" />

		<div
			v-if="activeCategory"
			class="d-flex flex-column overflow-hidden flex-grow-1 pt-2"
		>
			<v-toolbar
				density="compact"
				flat
				color="transparent"
				class="px-4"
			>
				<v-toolbar-title
					class="text-body-2 font-weight-bold text-primary"
				>
					{{ activeCategoryConfig?.text }}
				</v-toolbar-title>

				<v-spacer />

				<v-btn
					icon
					variant="text"
					color="medium-emphasis"
					size="small"
					rounded="xl"
					:title="
						allExpanded
							? 'Recolher tudo'
							: 'Expandir tudo'
					"
					@click="
						emit(
							'toggleExpanded'
						)
					"
				>
					<v-icon
						:icon="
							allExpanded
								? 'unfold_less'
								: 'unfold_more'
						"
					/>
				</v-btn>

				<CreateNodeMenu
					:definitions="
						activeDefinitions
					"
					@select="
						emit(
							'addItem',
							$event
						)
					"
				/>
			</v-toolbar>

			<div
				class="flex-grow-1 overflow-y-auto px-4 pb-4"
			>
				<ComponentQuickEditPanel
					v-model:modelValue="
						editorStore[
							activeCategory
						]
					"
					:start-expanded="
						allExpanded
					"
					:label="
						activeCategoryConfig?.text
					"
				/>
			</div>
		</div>

		<div
			v-else
			class="d-flex flex-column align-center justify-center flex-grow-1 pa-6 text-center"
		>
			<v-icon
				icon="interests"
				size="48"
				color="surface-variant"
				class="mb-4 opacity-50"
			/>

			<span
				class="text-body-2 text-medium-emphasis"
			>
				Selecione uma categoria
				para começar
			</span>
		</div>
	</div>
</template>
