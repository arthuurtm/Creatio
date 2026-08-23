<script setup lang="ts">
import { getIconComponent } from "@/utils/icons";
import { ChevronForward } from "@vicons/ionicons5";

defineProps<{
	activeView: "explorer" | "catalog";
}>();

const emit = defineEmits<{
	"select-view": [value: "explorer" | "catalog"];
	expand: [];
}>();
</script>

<template>
	<div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; padding: 16px 8px;">
		<!-- Botões de Alternância das Telas -->
		<n-space vertical align="center" :size="16">
			<!-- Botão Estruturas -->
			<n-button
				circle
				:type="activeView === 'explorer' ? 'primary' : 'default'"
				:quaternary="activeView !== 'explorer'"
				size="medium"
				title="Estruturas"
				@click="emit('select-view', 'explorer')"
			>
				<template #icon>
					<n-icon size="18">
						<component :is="getIconComponent('grid_view')" />
					</n-icon>
				</template>
			</n-button>

			<!-- Botão Catálogo -->
			<n-button
				circle
				:type="activeView === 'catalog' ? 'primary' : 'default'"
				:quaternary="activeView !== 'catalog'"
				size="medium"
				title="Catálogo de Blocos"
				@click="emit('select-view', 'catalog')"
			>
				<template #icon>
					<n-icon size="18">
						<component :is="getIconComponent('interests')" />
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
