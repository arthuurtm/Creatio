<script setup lang="ts">
import { ref, watch, computed } from "vue";

type InterfaceItems = {
	text?: string;
	color?: string;
	variant?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
	prependIcon?: string;
};

interface Props {
	modelValue?: any[];
	items?: any[];
	styles?: InterfaceItems;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => [],
	items: () => [],
	styles: () => ({
		text: "Adicionar Condição/Expressão",
		color: "primary",
		variant: "tonal",
		prependIcon: "add_circle_outline",
	}),
});

const emit = defineEmits<{
	"update:modelValue": [value: any[]];
}>();

const selectedParams = ref([...props.modelValue]);
const searchQuery    = ref("");

watch(
	() => props.modelValue,
	(newVal) => {
		selectedParams.value = [...newVal];
	},
	{ deep: true },
);

function removeParam(index: number) {
	selectedParams.value.splice(index, 1);
	emit("update:modelValue", selectedParams.value);
}

// Retorna uma cor diferente para cada tipo de elemento da expressão
function getChipColor(category: string) {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('vari')) return '#00BCD4'; // Variáveis (Ciano)
  if (cat.includes('lógic') || cat.includes('logic')) return '#E91E63'; // Lógicos (Rosa)
  if (cat.includes('compar')) return '#FF9800'; // Comparação (Laranja)
  if (cat.includes('aritm')) return '#4CAF50'; // Aritméticos (Verde)
  return '#9E9E9E'; // Default (Cinza)
}

// ── Filtro dos grupos e normalização dos itens nativo ─────────────────────────
const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  
  return (props.items || []).map((group: any) => {
    const groupLabel = group.label || group.text || group.key || "";
    
    // Converte objeto (ex: ComparisonOperators) em Array se necessário
    const rawItems = Array.isArray(group.items)
      ? group.items
      : typeof group.items === "object" && group.items !== null
        ? Object.entries(group.items).map(([k, v]) => ({ text: v, value: v })) // Exibe o valor do operador (===, >, etc)
        : [];
    
    // Normaliza itens de cada grupo
    const items = rawItems.map((item: any) => {
      if (typeof item === "string" || typeof item === "number") {
        return { text: String(item), value: item, disabled: group.disabled };
      }
      return {
        text: item.text ?? item.label ?? item.key ?? item.id ?? String(item.value ?? "-"),
        value: item.value ?? item.id ?? item.key ?? item.text ?? item.label ?? null,
        icon: item.icon,
        subtitle: item.subtitle ?? item.description,
        disabled: group.disabled || item.disabled,
        category: groupLabel,
      };
    });

    // Filtra pelo termo de busca
    const matchingItems = query
      ? items.filter((item: any) =>
          item.text.toLowerCase().includes(query) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query))
        )
      : items;

    return {
      label: groupLabel,
      items: matchingItems,
    };
  }).filter((group: any) => group.items.length > 0);
});

function selectItem(item: any) {
  if (item.disabled) return;
  emit("update:modelValue", [...selectedParams.value, item]);
}
</script>

<template>
  <div class="expression-builder-container">
    <div class="expression-chips">
      <!-- Chips que formam a expressão (Visual de blocos de código) -->
      <div
        v-for="(item, index) in selectedParams"
        :key="index"
        class="expression-block"
        :style="{ borderLeftColor: getChipColor(item.category) }"
      >
        <div class="block-content">
          <span class="block-category" :style="{ color: getChipColor(item.category) }">{{ item.category }}</span>
          <span class="block-text">{{ item.text }}</span>
        </div>
        <button class="remove-btn" @click="removeParam(index)" title="Remover item">
          <v-icon size="14">close</v-icon>
        </button>
      </div>
    </div>

    <!-- Botão de adição melhorado visualmente -->
    <v-menu
      transition="slide-y-transition"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ props: menuProps }">
        <div
          v-bind="menuProps"
          class="expression-add-btn"
          role="button"
          tabindex="0"
          title="Clique para construir a sua expressão lógica"
        >
          <div class="btn-icon">
            <v-icon size="20">data_object</v-icon>
            <v-icon size="14" class="plus-icon">add</v-icon>
          </div>
          <div class="btn-info">
            <span class="btn-title">{{ styles.text || 'Adicionar bloco à expressão' }}</span>
            <span class="btn-subtitle">Insira variáveis, operadores ou comparações para formar a lógica.</span>
          </div>
        </div>
      </template>

      <!-- Menu flutuante de seleção 100% nativo -->
      <v-card
        rounded="xl"
        flat
        border
        min-width="280"
        max-width="360"
        max-height="420"
        class="mt-2 pa-1 d-flex flex-column overflow-hidden"
      >
        <!-- Campo de busca -->
        <div class="px-2 pt-1 pb-1">
          <v-text-field
            v-model="searchQuery"
            placeholder="Filtrar blocos..."
            density="compact"
            variant="solo-filled"
            bg-color="surface-light"
            flat
            hide-details
            clearable
            prepend-inner-icon="search"
          />
        </div>

        <v-divider />

        <!-- Lista de blocos colapsáveis -->
        <div class="flex-grow-1 overflow-y-auto px-1">
          <v-list density="compact" class="pa-0">
            <template v-if="filteredGroups.length === 0">
              <div class="pa-4 text-center text-caption text-medium-emphasis">
                Nenhum item encontrado
              </div>
            </template>

            <template v-else>
              <v-list-group
                v-for="group in filteredGroups"
                :key="group.label"
                :value="group.label"
              >
                <template #activator="{ props: groupProps }">
                  <v-list-item
                    v-bind="groupProps"
                    :title="group.label"
                    class="font-weight-bold text-caption text-uppercase opacity-70"
                  />
                </template>

                <v-list-item
                  v-for="item in group.items"
                  :key="item.value ?? item.text"
                  :title="item.text"
                  :subtitle="item.subtitle"
                  :prepend-icon="item.icon"
                  :disabled="item.disabled"
                  class="rounded-lg pl-6 mb-1"
                  color="primary"
                  link
                  @click="selectItem(item)"
                />
              </v-list-group>
            </template>
          </v-list>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.expression-builder-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 4px;
  width: 100%;
}

.expression-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Blocos da expressão (estilo bloquinhos de código) */
.expression-block {
  display: flex;
  align-items: center;
  background: rgba(30, 30, 45, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left-width: 4px;
  border-left-style: solid;
  border-radius: 6px;
  padding: 6px 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.1s;
}

.expression-block:hover {
  background: rgba(40, 40, 60, 0.8);
}

.block-content {
  display: flex;
  flex-direction: column;
  margin-right: 12px;
}

.block-category {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.block-text {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  font-family: 'Courier New', Courier, monospace;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  color: #9e9e9e;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

/* Novo botão de adicionar blocos */
.expression-add-btn {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.expression-add-btn:hover {
  border-color: #8ab4f8;
  background: rgba(138, 180, 248, 0.05);
  transform: translateY(-1px);
}

.expression-add-btn:active {
  transform: translateY(1px);
}

.btn-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(138, 180, 248, 0.15);
  color: #8ab4f8;
  margin-right: 14px;
}

.plus-icon {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: #1e1e2d;
  border-radius: 50%;
}

.btn-info {
  display: flex;
  flex-direction: column;
}

.btn-title {
  font-size: 14px;
  font-weight: 600;
  color: #8ab4f8;
  margin-bottom: 2px;
}

.btn-subtitle {
  font-size: 11px;
  color: #888;
}
</style>
