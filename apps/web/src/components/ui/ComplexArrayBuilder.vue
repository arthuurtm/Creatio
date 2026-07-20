<script setup lang="ts">
import { ref, watch } from "vue";
import ContextMenu from "./ContextMenu.vue";

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

      <!-- Menu flutuante de seleção -->
      <context-menu
        is-visible
        searchable
        search-placeholder="Filtrar blocos..."
        min-width="280"
        variant="flat"
        :items="items"
        @select="$emit('update:modelValue', [...selectedParams, $event])"
      />
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
