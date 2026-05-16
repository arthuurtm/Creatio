<script setup lang="ts">
import type { CategoryKey } from "@projeto/types";
import { VBtn, VIcon, VList, VListItem } from "vuetify/components";

defineProps<{
	sidebarItems: {
		key: CategoryKey;
		text: string;
		icon: string;
	}[];

	activeCategory: CategoryKey | null;
}>();

const emit = defineEmits<{
	select: [CategoryKey];
	expand: [];
}>();
</script>

<template>
	<div class="pa-2 pt-4">
		<v-list
			density="compact"
			nav
			class="pa-0 border-0 d-flex flex-column align-center"
		>
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
				@click="emit('select', item.key)"
			>
				<template #prepend>
					<v-icon
						:icon="item.icon"
						size="small"
					/>
				</template>
			</v-list-item>
		</v-list>

		<div class="pa-2 pb-4">
			<v-btn
				icon="chevron_right"
				variant="tonal"
				rounded="xl"
				size="small"
				class="mx-auto d-flex"
				color="medium-emphasis"
				@click="emit('expand')"
			/>
		</div>
	</div>
</template>
