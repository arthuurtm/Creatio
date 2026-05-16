<script setup lang="ts">
import type { EditorDefinition } from "@projeto/types";

import { VBtn, VCard, VList, VListItem, VMenu } from "vuetify/components";

defineProps<{
	definitions: Record<string, EditorDefinition>;
}>();

const emit = defineEmits<{
	select: [EditorDefinition];
}>();
</script>

<template>
	<v-menu
		location="bottom end"
		transition="scale-transition"
	>
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

		<v-card
			rounded="xl"
			elevation="3"
			class="mt-2 border"
		>
			<v-list
				density="compact"
				min-width="220"
				class="pa-2"
			>
				<v-list-item
					v-for="(def, key) in definitions"
					:key="key"
					:title="def.text"
					:prepend-icon="
						def.icon || 'add'
					"
					class="mb-1"
					color="primary"
					@click="
						emit(
							'select',
							def
						)
					"
				/>
			</v-list>
		</v-card>
	</v-menu>
</template>
