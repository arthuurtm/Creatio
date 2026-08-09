<script setup lang="ts">
import { computed, h } from "vue";
import type { EditorDefinition } from "@projeto/types";
import { NIcon } from "naive-ui";
import { Add } from "@vicons/ionicons5";
import { getIconComponent } from "@/utils/icons";

const props = defineProps<{
	definitions: Record<string, EditorDefinition>;
}>();

const emit = defineEmits<{
	select: [EditorDefinition];
}>();

const options = computed(() => {
	return Object.entries(props.definitions).map(([key, def]) => {
		const iconComp = getIconComponent(def.icon || 'add');
		return {
			label: def.text,
			key: key,
			icon: iconComp ? () => h(NIcon, { size: 16 }, { default: () => h(iconComp) }) : undefined
		};
	});
});

function handleSelect(key: string) {
	const def = props.definitions[key];
	if (def) {
		emit('select', def);
	}
}
</script>

<template>
	<n-dropdown
		trigger="click"
		placement="bottom-end"
		:options="options"
		@select="handleSelect"
	>
		<n-button
			circle
			type="primary"
			size="small"
			class="ml-1"
		>
			<template #icon>
				<n-icon><Add /></n-icon>
			</template>
		</n-button>
	</n-dropdown>
</template>
