<script setup lang="ts">
import { computed } from "vue";

interface ContextMenuItem {
	text: string;
	value?: any;
	icon?: string;
	items?: ContextMenuItem[];
	disabled?: boolean;
	category?: string;
}

interface ContextMenuGroup {
	key?: string;
	label?: string;
	items: ContextMenuItem[];
}

const props = defineProps<{
	items?: ContextMenuGroup[] | ContextMenuItem[] | Record<string, any>;
	isVisible?: boolean;
}>();

const emit = defineEmits<{
	select: [ContextMenuItem];
}>();

function normalizeItem(item: any): ContextMenuItem {
	if (item == null) return { text: "Sem dados disponíveis." };

	if (typeof item === "string" || typeof item === "number") {
		return { text: String(item), value: item };
	}

	const { text, label, value, icon, items, id, key, disabled, category } = item;

	return {
		text: text ?? label ?? key ?? id ?? String(value ?? "-"),
		value: value ?? id ?? key ?? text ?? label ?? null,
		icon,
		items,
		disabled,
		category,
	};
}

function normalizeItems(input: any): ContextMenuItem[] {
	if (!input) return [{ text: "Sem dados disponíveis." }];

	// array normal
	if (Array.isArray(input)) {
		return input.map(normalizeItem);
	}

	// objeto tipo enum
	if (typeof input === "object") {
		return Object.entries(input).map(([k, v]) =>
			normalizeItem({
				text: k,
				value: v,
			}),
		);
	}

	return [normalizeItem(input)];
}

function normalizeGroups(input: any): ContextMenuGroup[] {
	if (!input) return [];

	const arr = Array.isArray(input) ? input : [input];

	// Se o objeto tem "items", ele é um grupo real
	if (arr.length && typeof arr[0] === "object" && "items" in arr[0]) {
		return arr.map((g: any) => {
			const groupLabel = g.label ?? g.text ?? g.key;
			return {
				key: g.key ?? g.label,
				label: groupLabel,
				items: normalizeItems(g.items).map((i) => ({
					...i,
					category: groupLabel,
					disabled: g.disabled || i.disabled,
				})),
			};
		});
	}

	return [
		{
			items: normalizeItems(arr),
		},
	];
}
const groups = computed(() => normalizeGroups(props.items));
</script>

<template>
  <v-list v-if="isVisible" density="compact">
    <template v-for="group in groups" :key="group.key ?? group.label">
      <v-list-group v-if="group.label">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :title="group.label" />
        </template>
        <v-list-item
          v-for="item in group.items"
          :key="item.value ?? item.text"
          :title="item.text"
          :disabled="item.disabled"
          @click="emit('select', item)"
          link
        />
      </v-list-group>
      <template v-else>
        <v-list-item
          v-for="item in group.items"
          :key="item.value ?? item.text"
          :title="item.text"
          :disabled="item.disabled"
          @click="emit('select', item)"
          link
        />
      </template>
    </template>
  </v-list>
</template>
