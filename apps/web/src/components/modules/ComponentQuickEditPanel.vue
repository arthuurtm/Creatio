<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronDown, ChevronForward, TrashOutline } from "@vicons/ionicons5";

defineOptions({
	name: "RecursiveEditor",
});

const props = defineProps({
	label: {
		type: String,
		default: "",
	},
	depth: {
		type: Number,
		default: 0,
	},
	startExpanded: {
		type: Boolean,
		default: false,
	},
});

const modelValue = defineModel<any>("modelValue", { required: true });
const isExpanded = ref(props.startExpanded);
const isArray = computed(() => Array.isArray(modelValue.value));
const isObject = computed(
	() =>
		modelValue.value !== null &&
		typeof modelValue.value === "object" &&
		!isArray.value,
);
const isBoolean = computed(() => typeof modelValue.value === "boolean");
const groupedKeys = computed(() => {
	if (!isObject.value) return { primitives: [], complex: [] };

	const primitives: string[] = [];
	const complex: string[] = [];

	const rawObj = modelValue.value as Record<string, any>;

	Object.keys(rawObj).forEach((key) => {
		const val = rawObj[key];
		if (val !== null && typeof val === "object") {
			complex.push(key);
		} else {
			primitives.push(key);
		}
	});

	return { primitives, complex };
});

function updateObjectKey(key: string, newValue: any) {
	const newObj = { ...modelValue.value };
	newObj[key] = newValue;
	modelValue.value = newObj;
}

function updateArrayItem(index: number, newValue: any) {
	const newArr = [...modelValue.value];
	newArr[index] = newValue;
	modelValue.value = newArr;
}

function addArrayItem() {
	const current = modelValue.value as any[];
	const newItem =
		current.length > 0 ? (typeof current[0] === "object" ? {} : "") : "";

	modelValue.value = [...current, newItem];
}

function removeArrayItem(index: number) {
	const newArr = [...modelValue.value];
	newArr.splice(index, 1);
	modelValue.value = newArr;
}

function updatePrimitive(value: string | number) {
	if (typeof modelValue.value === "number") {
		const num = Number(value);
		if (!isNaN(num)) {
			modelValue.value = num;
			return;
		}
	}
	modelValue.value = value;
}

const indentStyle = computed(() => ({
	paddingLeft: `${props.depth * 12}px`,
	backgroundColor: `rgba(var(--v-theme-surface-variant), ${props.depth * 0.02})`,
}));

watch(
	() => props.startExpanded,
	(newVal) => {
		isExpanded.value = newVal;
	},
);
</script>

<template>
  <div class="recursive-editor w-100">

    <div v-if="isObject || isArray" class="complex-container">
      <div 
        style="display: flex; align-items: center; padding: 4px 8px; cursor: pointer;" 
        :style="indentStyle"
        @click.stop="isExpanded = !isExpanded"
        class="hover-bg"
      >
        <n-icon 
          size="18" 
          color="rgba(var(--v-theme-on-surface), 0.6)"
          style="margin-right: 4px;"
        >
          <ChevronDown v-if="isExpanded" />
          <ChevronForward v-else />
        </n-icon>

        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.7;">
          {{ label || (isArray ? 'Lista' : 'Objeto') }}
        </span>
        <div style="flex-grow: 1;"></div>

        <span v-if="!isExpanded" style="font-size: 11px; opacity: 0.5; margin-left: 8px;">
          {{ isArray ? `${modelValue.length} itens` : '{...}' }}
        </span>
      </div>

      <n-collapse-transition :show="isExpanded">
        <div>
          <template v-if="isObject">
            <div v-if="groupedKeys.primitives.length" style="padding: 4px 0;">
              <RecursiveEditor v-for="key in groupedKeys.primitives" :key="key" :label="key"
                :model-value="modelValue[key]" :depth="depth + 1"
                @update:model-value="(v: any) => updateObjectKey(key, v)" />
            </div>

            <n-divider v-if="groupedKeys.primitives.length && groupedKeys.complex.length" style="margin: 4px 0; opacity: 0.2;" />

            <RecursiveEditor v-for="key in groupedKeys.complex" :key="key" :label="key" :model-value="modelValue[key]"
              :depth="depth + 1" @update:model-value="(v: any) => updateObjectKey(key, v)" />
          </template>

          <template v-else-if="isArray">
            <div v-if="modelValue.length === 0" style="font-size: 11px; text-align: center; padding: 8px 0; opacity: 0.5;">
              (Vazio)
            </div>
            <div v-for="(item, index) in modelValue" :key="index" style="display: flex; align-items: flex-start;">
              <div style="flex-grow: 1;">
                <RecursiveEditor :label="String(index)" :model-value="item" :depth="depth + 1"
                  @update:model-value="(v: any) => updateArrayItem(Number(index), v)" />
              </div>

              <n-button 
                quaternary 
                circle 
                type="error" 
                size="tiny" 
                style="margin-top: 4px; opacity: 0.6;"
                @click="removeArrayItem(Number(index))"
              >
                <template #icon>
                  <n-icon size="14"><TrashOutline /></n-icon>
                </template>
              </n-button>
            </div>
          </template>
        </div>
      </n-collapse-transition>
    </div>

    <div v-else style="display: flex; align-items: center; padding: 4px 8px;" :style="indentStyle" class="hover-bg">
      <div style="width: 120px; flex-shrink: 0; font-size: 11px; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 8px;" :title="label">
        {{ label }}
      </div>

      <div style="flex-grow: 1; min-width: 0;">
        <div v-if="isBoolean" style="display: flex; justify-content: flex-end;">
          <n-switch 
            :value="modelValue" 
            size="small"
            @update:value="(val: boolean) => modelValue = val" 
          />
        </div>

        <n-input 
          v-else 
          :value="String(modelValue)" 
          size="small"
          style="width: 100%;"
          @update:value="updatePrimitive" 
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.recursive-editor {
  font-family: 'Roboto', sans-serif;
}

.hover-bg {
  transition: background-color 0.2s ease;
}

.hover-bg:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}
</style>
