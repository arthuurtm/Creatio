<script setup lang="ts">
import { ref, computed } from "vue";
import ComplexArrayBuilder from "./ComplexArrayBuilder.vue";

interface InterfaceStyles {
	text?: string;
	color?: string;
	prependIcon?: string;
}

interface Props {
	modelValue?: any[];
	options?: any[];
	items?: any[];
	styles?: InterfaceStyles;
	enforceRules?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => [],
	options: () => [],
	items: () => [],
	enforceRules: true,
	styles: () => ({
		text: "Adicionar Condição/Expressão",
		color: "primary",
		prependIcon: "add_circle_outline",
	}),
});

const emit = defineEmits<{
	"update:modelValue": [value: any[]];
}>();

const selectedParams = computed({
	get: () => props.modelValue,
	set: (val) => emit("update:modelValue", val),
});

const isAssistantActive = ref(props.enforceRules);

// Lógica inteligente de regras sintáticas JS
const smartOptions = computed(() => {
	const rawOptions = props.options?.length ? props.options : (props.items || []);
	if (!isAssistantActive.value || !rawOptions) return rawOptions;

	const isExpressionEmpty = selectedParams.value.length === 0;
	const lastItem = isExpressionEmpty ? null : selectedParams.value[selectedParams.value.length - 1];

	// Identifica se uma categoria é do tipo Operador
	const isOperatorCategory = (cat: string) => {
		const str = cat?.toLowerCase() || '';
		return str.includes('operador') || str.includes('aritm') || str.includes('lógic') || str.includes('logic') || str.includes('compar');
	};

	const lastWasOperator = lastItem ? isOperatorCategory(lastItem.category) : false;

	return rawOptions.map((group: any) => {
		const isGroupOperator = isOperatorCategory(group.label || group.key || group.text);
		
		let shouldBeDisabled = false;

		// Regra semântica: Alternância (Valor <-> Operador)
		if (isExpressionEmpty || lastWasOperator) {
			// Precisa de um valor/variável. Desativa operadores.
			if (isGroupOperator) shouldBeDisabled = true;
		} else {
			// Último foi valor. Precisa de um operador. Desativa variáveis.
			if (!isGroupOperator) shouldBeDisabled = true;
		}

		return {
			...group,
			disabled: shouldBeDisabled
		};
	});
});

const smartItems = smartOptions;
</script>

<template>
  <div class="expression-wrapper w-full">
    <!-- Switch Assistente -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 4px; width: 100%; padding-right: 8px;">
      <n-space align="center" :size="8">
        <span style="font-size: 12px; opacity: 0.8;">🛡️ Assistente Sintático</span>
        <n-switch v-model:value="isAssistantActive" size="small" />
      </n-space>
    </div>
 
    <ComplexArrayBuilder 
      v-model="selectedParams" 
      :options="smartOptions" 
      :styles="styles" 
    />
  </div>
</template>

<style scoped>
.expression-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
