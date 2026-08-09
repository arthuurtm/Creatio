<script setup lang="ts">
import type { CategoryKey } from "@projeto/types";
import { getIconComponent } from "@/utils/icons";
import { ChevronForward } from "@vicons/ionicons5";

defineProps<{
	sidebarItems: {
		key: CategoryKey;
		text: string;
		icon: string;
	}[];

	activeCategory: CategoryKey | undefined;
}>();

const emit = defineEmits<{
	select: [CategoryKey];
	expand: [];
}>();
</script>

<template>
	<div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; padding: 16px 8px;">
		<!-- Categories list -->
		<n-space vertical align="center" :size="12">
			<n-button
				v-for="item in sidebarItems"
				:key="item.key"
				circle
				:type="activeCategory === item.key ? 'primary' : 'default'"
				:quaternary="activeCategory !== item.key"
				size="medium"
				:title="item.text"
				@click="emit('select', item.key)"
			>
				<template #icon>
					<n-icon size="18">
						<component :is="getIconComponent(item.icon)" />
					</n-icon>
				</template>
			</n-button>
		</n-space>

		<!-- Expand button -->
		<div style="padding-top: 16px;">
			<n-button
				circle
				tertiary
				size="small"
				title="Expandir painel"
				@click="emit('expand')"
			>
				<template #icon>
					<n-icon size="16"><ChevronForward /></n-icon>
				</template>
			</n-button>
		</div>
	</div>
</template>
