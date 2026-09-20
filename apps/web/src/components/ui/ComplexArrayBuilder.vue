<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Close, Add, Search } from "@vicons/ionicons5";
import { CodeOutlined } from "@vicons/material";
import { getIconComponent } from "@/utils/icons";

type InterfaceStyles = {
	text?: string;
	color?: string;
	prependIcon?: string;
};

interface Props {
	modelValue?: any[];
	options?: any[];
	items?: any[];
	styles?: InterfaceStyles;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => [],
	options: () => [],
	items: () => [],
	styles: () => ({
		text: "Adicionar Condição/Expressão",
		color: "primary",
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

// ── Filtro dos grupos e normalização dos itens/opções nativo ─────────────────────────
const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const rawGroups = props.options?.length ? props.options : (props.items || []);
  
  return rawGroups.map((group: any) => {
    const groupLabel = group.label || group.text || group.key || "";
    
    // Converte objeto (ex: ComparisonOperators) em Array se necessário
    const groupList = group.options ?? group.items;
    const rawItems = Array.isArray(groupList)
      ? groupList
      : typeof groupList === "object" && groupList !== null
        ? Object.entries(groupList).map(([k, v]) => ({ text: v, value: v })) // Exibe o valor do operador (===, >, etc)
        : [];
    
    // Normaliza opções/itens de cada grupo
    const options = rawItems.map((item: any) => {
      if (typeof item === "string" || typeof item === "number") {
        return { text: String(item), value: item, disabled: group.disabled };
      }
      const displayText = item.data?.params?.name ?? item.name ?? item.text ?? item.label ?? item.key ?? item.id ?? String(item.value ?? "-");
      const itemVal = item.data?.params?.name ?? item.value ?? item.id ?? item.key ?? item.text ?? item.label ?? null;
      return {
        text: displayText,
        value: itemVal,
        icon: item.icon,
        subtitle: item.subtitle ?? item.description,
        disabled: group.disabled || item.disabled,
        category: groupLabel,
      };
    });

    // Filtra pelo termo de busca
    const matchingItems = query
      ? options.filter((item: any) =>
          item.text.toLowerCase().includes(query) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query))
        )
      : options;

    return {
      label: groupLabel,
      options: matchingItems,
      items: matchingItems,
    };
  }).filter((group: any) => group.options.length > 0);
});

function selectItem(item: any) {
  if (item.disabled) return;
  emit("update:modelValue", [...selectedParams.value, item]);
}
</script>

<template>
  <div class="expression-builder-container">
    <div class="expression-field" tabindex="0">
      <div class="expression-chips">
        <!-- Chips que formam a expressão (Visual de blocos de código) -->
        <div
          v-for="(item, index) in selectedParams"
          :key="index"
          class="expression-block"
          :style="{ borderLeftColor: getChipColor(item.category) }"
        >
          <div class="block-content">
            <span class="block-text">{{ item.text }}</span>
          </div>
          <button class="remove-btn" @click="removeParam(index)" title="Remover item">
            <n-icon size="12"><Close /></n-icon>
          </button>
        </div>
      </div>

      <!-- Botão de adição embutido no campo -->
      <n-popover
        trigger="click"
        placement="bottom-start"
        scrollable
        style="padding: 0; width: 320px; border-radius: 12px;"
      >
        <template #trigger>
          <div class="expression-add-trigger">
            <span v-if="selectedParams.length === 0" class="placeholder-text">Digite ou selecione um valor...</span>
            <n-icon v-else size="16" class="add-icon"><Add /></n-icon>
          </div>
        </template>

        <!-- Menu flutuante de seleção -->
        <n-card
          embedded
          :bordered="false"
          content-style="padding: 0; display: flex; flex-direction: column; max-height: 400px; overflow: hidden;"
        >
          <!-- Campo de busca -->
          <div style="padding: 8px;">
            <n-input
              v-model:value="searchQuery"
              placeholder="Filtrar blocos..."
              clearable
            >
              <template #prefix>
                <n-icon size="18"><Search /></n-icon>
              </template>
            </n-input>
          </div>

          <n-divider style="margin: 0;" />

          <!-- Lista de blocos colapsáveis -->
          <div style="flex-grow: 1; overflow-y: auto; padding: 8px;">
            <template v-if="filteredGroups.length === 0">
              <div style="padding: 16px; text-align: center; color: var(--n-text-color-3);">
                Nenhum item encontrado
              </div>
            </template>

            <template v-else>
              <n-collapse>
                <n-collapse-item
                  v-for="group in filteredGroups"
                  :key="group.label"
                  :title="group.label"
                  :name="group.label"
                >
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div
                      v-for="item in group.options"
                      :key="item.value ?? item.text"
                      @click="selectItem(item)"
                      class="n-list-item-custom"
                      :class="{ 'disabled': item.disabled }"
                    >
                      <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                        <n-icon v-if="item.icon" size="18" color="var(--n-primary-color)">
                          <component :is="getIconComponent(item.icon)" />
                        </n-icon>
                        <div style="display: flex; flex-direction: column;">
                          <span style="font-weight: 500; font-size: 13px;">{{ item.text }}</span>
                          <span v-if="item.subtitle" style="font-size: 11px; opacity: 0.7;">{{ item.subtitle }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </template>
          </div>
        </n-card>
      </n-popover>
    </div>
  </div>
</template>

<style scoped>
.expression-builder-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.expression-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 4px 10px;
  background-color: var(--n-input-color, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.15));
  border-radius: 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: text;
}

.expression-field:hover {
  border-color: var(--n-primary-color-hover, #66b1ff);
}

.expression-field:focus-within {
  border-color: var(--n-primary-color, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  outline: none;
}

.expression-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

/* Blocos da expressão (estilo bloquinhos de código menores) */
.expression-block {
  display: flex;
  align-items: center;
  background: var(--n-color-embedded, rgba(30, 30, 45, 0.6));
  border: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.1));
  border-left-width: 3px;
  border-left-style: solid;
  border-radius: 4px;
  padding: 2px 6px;
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

.expression-add-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  min-height: 24px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--n-text-color-3);
  transition: color 0.2s, background-color 0.2s;
}

.expression-add-trigger:hover {
  background-color: var(--n-color-hover, rgba(255, 255, 255, 0.1));
  color: var(--n-primary-color, #409eff);
}

.placeholder-text {
  font-size: 13px;
  opacity: 0.6;
}

.add-icon {
  opacity: 0.7;
}

.n-list-item-custom {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.n-list-item-custom:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.n-list-item-custom.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-list-item-custom.disabled:hover {
  background-color: transparent;
}
</style>
