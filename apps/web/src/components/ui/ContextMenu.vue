<script setup lang="ts">
import { ref, computed } from "vue";

export interface ContextMenuItem {
	text: string;
	value?: any;
	icon?: string;
	subtitle?: string;
	description?: string;
	items?: ContextMenuItem[];
	disabled?: boolean;
	category?: string;
	color?: string;
	variant?: string;
}

export interface ContextMenuGroup {
	key?: string;
	label?: string;
	items: ContextMenuItem[];
}

const props = withDefaults(
	defineProps<{
		items?: ContextMenuGroup[] | ContextMenuItem[] | Record<string, any>;
		isVisible?: boolean;
		searchable?: boolean;
		searchPlaceholder?: string;
		minWidth?: string | number;
		maxWidth?: string | number;
		maxHeight?: string | number;
		variant?: "flat" | "elevated" | "tonal" | "outlined";
		elevation?: string | number;
		collapsibleGroups?: boolean;
		cardClass?: string;
	}>(),
	{
		isVisible: true,
		searchable: false,
		searchPlaceholder: "Buscar...",
		minWidth: undefined,
		maxWidth: 360,
		maxHeight: 420,
		variant: "flat",
		elevation: 12,
		collapsibleGroups: false,
		cardClass: "",
	},
);

const emit = defineEmits<{
	select: [ContextMenuItem];
}>();

const searchQuery = ref("");

function normalizeItem(item: any): ContextMenuItem {
	if (item == null) return { text: "Sem dados disponíveis." };

	if (typeof item === "string" || typeof item === "number") {
		return { text: String(item), value: item };
	}

	const { text, label, value, icon, subtitle, description, items, id, key, disabled, category, color } = item;

	return {
		text: text ?? label ?? key ?? id ?? String(value ?? "-"),
		value: value ?? id ?? key ?? text ?? label ?? null,
		icon,
		subtitle: subtitle ?? description,
		items,
		disabled,
		category,
		color,
	};
}

function normalizeItems(input: any): ContextMenuItem[] {
	if (!input) return [];

	if (Array.isArray(input)) {
		return input.map(normalizeItem);
	}

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

const allGroups = computed(() => normalizeGroups(props.items));

const filteredGroups = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();
	if (!query) return allGroups.value;

	return allGroups.value
		.map((group) => {
			const matchingItems = group.items.filter(
				(item) =>
					item.text.toLowerCase().includes(query) ||
					(item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
					(item.category && item.category.toLowerCase().includes(query)),
			);
			return {
				...group,
				items: matchingItems,
			};
		})
		.filter((group) => group.items.length > 0);
});

function handleSelect(item: ContextMenuItem) {
	if (item.disabled) return;
	emit("select", item);
}
</script>

<template>
  <v-card
    v-if="isVisible !== false"
    :min-width="minWidth"
    :max-width="maxWidth"
    :max-height="maxHeight"
    :elevation="elevation"
    :variant="variant"
    border
    rounded="xl"
    color="surface"
    :class="['pa-1 d-flex flex-column overflow-hidden', cardClass]"
  >
    <!-- Slot de cabeçalho opcional -->
    <slot name="header" />

    <!-- Campo de Busca Opcional (Vuetify Native) -->
    <div v-if="searchable" class="px-2 pt-1 pb-1">
      <v-text-field
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        density="compact"
        variant="solo-filled"
        bg-color="surface-light"
        flat
        hide-details
        clearable
        prepend-inner-icon="search"
      />
    </div>

    <!-- Lista Principal (Vuetify Native) -->
    <div class="flex-grow-1 overflow-y-auto px-1">
      <slot>
        <template v-if="filteredGroups.length === 0">
          <div class="pa-4 text-center text-caption text-medium-emphasis">
            Nenhum item encontrado
          </div>
        </template>

        <template v-else v-for="group in filteredGroups" :key="group.key ?? group.label">
          <!-- Modo Grupos Colapsáveis -->
          <v-list-group v-if="group.label && collapsibleGroups">
            <template #activator="{ props: groupProps }">
              <v-list-item v-bind="groupProps" :title="group.label"/>
            </template>
            <template v-for="item in group.items" :key="item.value ?? item.text">
              <slot name="item" :item="item" :select="() => handleSelect(item)">
                <v-list-item
                  :title="item.text"
                  :subtitle="item.subtitle"
                  :prepend-icon="item.icon"
                  :disabled="item.disabled"
                  :color="item.color || 'primary'"
                  class="my-1"
                  link
                  @click="handleSelect(item)"
                >
                  <template v-if="item.category && !group.label" #append>
                    <v-chip size="x-small" variant="tonal" rounded="sm">{{ item.category }}</v-chip>
                  </template>
                </v-list-item>
              </slot>
            </template>
          </v-list-group>

          <!-- Modo Grupos com Subheaders Visuais -->
          <template v-else>
            <v-list-subheader
              v-if="group.label"
              class="text-uppercase text-caption font-weight-bold opacity-70 px-3 pt-2 pb-1"
            >
              {{ group.label }}
            </v-list-subheader>

            <template v-for="item in group.items" :key="item.value ?? item.text">
              <slot name="item" :item="item" :select="() => handleSelect(item)">
                <v-list-item
                  :title="item.text"
                  :subtitle="item.subtitle"
                  :prepend-icon="item.icon"
                  :disabled="item.disabled"
                  :color="item.color || 'primary'"
                  class="my-1"
                  link
                  @click="handleSelect(item)"
                >
                  <template v-if="item.category && !group.label" #append>
                    <v-chip size="x-small" variant="tonal" rounded="sm">{{ item.category }}</v-chip>
                  </template>
                </v-list-item>
              </slot>
            </template>
          </template>
        </template>
      </slot>
    </div>

    <!-- Slot de rodapé opcional -->
    <slot name="footer" />
  </v-card>
</template>
