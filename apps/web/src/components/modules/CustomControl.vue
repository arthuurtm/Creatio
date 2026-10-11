<script setup lang="ts">
import { computed } from 'vue';
import {
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NSwitch,
  NSlider,
  NColorPicker
} from 'naive-ui';

type Kind =
  | 'text' | 'number' | 'textarea' | 'boolean'
  | 'slider' | 'color' | 'label'
  | 'select' | 'insert' | 'unknown';

const props = defineProps<{
  data: any;
}>();

// Identifica o tipo pela forma do objeto (duck typing evita problemas de instanceof entre bundles)
const kind = computed<Kind>(() => {
  const d = props.data;
  if (!d) return 'unknown';

  if (Array.isArray(d.options)) return 'select';

  switch (d.options?.type) {
    case 'text':
    case 'string':
      return 'text';
    case 'number':
      return 'number';
    case 'textarea':
      return 'textarea';
    case 'boolean':
    case 'checkbox':
    case 'switch':
      return 'boolean';
    case 'range':
    case 'slider':
      return 'slider';
    case 'color':
      return 'color';
    case 'label':
      return 'label';
  }

  if (typeof d.onClick === 'function') return 'insert';
  return 'unknown';
});

function commit(val: unknown) {
  if (typeof props.data.setValue === 'function') props.data.setValue(val);
  else if (typeof props.data.change === 'function') props.data.change(val);
}

const value = computed({
  get: () => props.data.value ?? props.data.options?.initial,
  set: (val) => commit(val)
});

const numberValue = computed<number | null>({
  get: () => {
    const v = value.value;
    return v === null || v === undefined || v === '' ? null : Number(v);
  },
  set: (val) => commit(val)
});

const sliderValue = computed<number>({
  get: () => Number(value.value ?? props.data.options?.min ?? 0),
  set: (val) => commit(val)
});

const selectOptions = computed(() =>
  (Array.isArray(props.data.options) ? props.data.options : []).map((o: any) => ({
    label: o.label,
    value: o.value
  }))
);

const opts = computed(() => (Array.isArray(props.data?.options) ? {} : props.data?.options ?? {}));

function handleInsert() {
  props.data.onClick?.(props.data);
}
</script>

<template>
  <div class="custom-control-wrapper w-full max-w-[160px]">

    <!-- Text -->
    <NInput
      v-if="kind === 'text'"
      v-model:value="value"
      :readonly="opts.readonly"
      size="tiny"
      class="text-xs font-mono !rounded-md"
      placeholder="..."
      @pointerdown.stop
      @keydown.stop
    />

    <!-- Number -->
    <NInputNumber
      v-else-if="kind === 'number'"
      v-model:value="numberValue"
      :readonly="opts.readonly"
      :min="opts.min"
      :max="opts.max"
      :step="opts.step ?? 1"
      :show-button="false"
      size="tiny"
      class="text-xs font-mono !rounded-md"
      placeholder="0"
      @pointerdown.stop
      @keydown.stop
    />

    <!-- Textarea -->
    <NInput
      v-else-if="kind === 'textarea'"
      v-model:value="value"
      type="textarea"
      :readonly="opts.readonly"
      :autosize="{ minRows: 1, maxRows: 4 }"
      size="tiny"
      class="text-xs font-mono !rounded-md"
      placeholder="..."
      @pointerdown.stop
      @keydown.stop
      @wheel.stop
    />

    <!-- Boolean / Switch -->
    <NSwitch
      v-else-if="kind === 'boolean'"
      v-model:value="value"
      :disabled="opts.readonly"
      size="small"
      @pointerdown.stop
    />

    <!-- Slider -->
    <div v-else-if="kind === 'slider'" class="flex items-center gap-2" @pointerdown.stop>
      <NSlider
        v-model:value="sliderValue"
        :min="opts.min ?? 0"
        :max="opts.max ?? 100"
        :step="opts.step ?? 1"
        :disabled="opts.readonly"
        :tooltip="false"
      />
      <span class="text-[10px] font-mono opacity-70 min-w-[24px] text-right">
        {{ sliderValue }}
      </span>
    </div>

    <!-- Color -->
    <NColorPicker
      v-else-if="kind === 'color'"
      v-model:value="value"
      :show-alpha="opts.alpha ?? false"
      :modes="['hex']"
      :disabled="opts.readonly"
      size="small"
      @pointerdown.stop
    />

    <!-- Label (somente leitura) -->
    <div
      v-else-if="kind === 'label'"
      class="text-[11px] font-mono opacity-80 truncate"
      :title="String(data.value ?? opts.label ?? '')"
    >
      {{ data.value ?? opts.label }}
    </div>

    <!-- Select -->
    <NSelect
      v-else-if="kind === 'select'"
      v-model:value="value"
      :options="selectOptions"
      size="tiny"
      class="text-xs !rounded-md"
      @pointerdown.stop
    />

    <!-- Insert -->
    <NButton
      v-else-if="kind === 'insert'"
      size="tiny"
      type="primary"
      secondary
      block
      class="text-xs !rounded-md font-bold uppercase tracking-wider"
      @click.stop="handleInsert"
      @pointerdown.stop
    >
      Adicionar
    </NButton>

    <!-- Fallback -->
    <div v-else class="text-[9px] opacity-50 italic">Controle não suportado</div>
  </div>
</template>

<style scoped>
.custom-control-wrapper {
  margin: 2px 0;
  pointer-events: auto;
}
:deep(.n-input__input-el),
:deep(.n-input__textarea-el) {
  font-size: 11px !important;
}
</style>
