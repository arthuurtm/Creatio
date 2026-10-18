<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NSwitch,
  NSlider,
  NColorPicker
} from 'naive-ui';
import { useEditor } from '@/composables/useEditor';
import { detectControlKind } from '@projeto/compiler';

const props = defineProps<{
  data: any;
}>();

const editor = useEditor();

const kind = computed(() => detectControlKind(props.data));

// Valor local reativo para permitir digitação fluida sem perder o foco ou sofrer com lag de classes não-reativas
const localValue = ref<any>(props.data?.value ?? props.data?.options?.initial ?? '');

watch(
  () => [props.data?.value, props.data?.options?.initial],
  ([v, init]) => {
    const val = v ?? init ?? '';
    if (val !== localValue.value) {
      localValue.value = val;
    }
  },
  { immediate: true }
);

function commit(val: unknown) {
  localValue.value = val;
  if (typeof props.data?.setValue === 'function') {
    props.data.setValue(val);
  } else if (typeof props.data?.change === 'function') {
    props.data.change(val);
  }
  // Dispara sincronização em nuvem e notifica store
  editor.syncToCloud();
}

const textValue = computed({
  get: () => String(localValue.value ?? ''),
  set: (val: string) => commit(val)
});

const numberValue = computed<number | null>({
  get: () => {
    const v = localValue.value;
    return v === null || v === undefined || v === '' ? null : Number(v);
  },
  set: (val) => commit(val)
});

const sliderValue = computed<number>({
  get: () => Number(localValue.value ?? props.data?.options?.min ?? 0),
  set: (val) => commit(val)
});

const booleanValue = computed<boolean>({
  get: () => Boolean(localValue.value),
  set: (val) => commit(val)
});

const selectValue = computed({
  get: () => localValue.value,
  set: (val) => commit(val)
});

const selectOptions = computed(() =>
  (Array.isArray(props.data?.options) ? props.data.options : []).map((o: any) => ({
    label: o.label,
    value: o.value
  }))
);

const opts = computed(() => (Array.isArray(props.data?.options) ? {} : props.data?.options ?? {}));

function handleInsert() {
  props.data?.onClick?.(props.data);
}
</script>

<template>
  <!-- Controles não suportados não são exibidos: o nó mostra só o rótulo do campo -->
  <div v-if="kind !== 'unknown'" class="custom-control-wrapper w-full">

    <!-- Text / Identifier -->
    <NInput
      v-if="kind === 'text'"
      v-model:value="textValue"
      :readonly="opts.readonly"
      size="tiny"
      class="text-xs font-mono"
      placeholder="digite aqui"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
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
      class="text-xs font-mono"
      placeholder="0"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
      @keydown.stop
    />

    <!-- Textarea -->
    <NInput
      v-else-if="kind === 'textarea'"
      v-model:value="textValue"
      type="textarea"
      :readonly="opts.readonly"
      :autosize="{ minRows: 1, maxRows: 4 }"
      size="tiny"
      class="text-xs font-mono"
      placeholder="digite aqui"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
      @keydown.stop
      @wheel.stop
    />

    <!-- Boolean / Switch: o texto ao lado deixa claro o estado atual -->
    <div
      v-else-if="kind === 'boolean'"
      class="flex items-center gap-2"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
    >
      <NSwitch
        v-model:value="booleanValue"
        :disabled="opts.readonly"
        size="small"
      />
      <span class="text-[11px] font-mono opacity-80">
        {{ booleanValue ? 'Verdadeiro' : 'Falso' }}
      </span>
    </div>

    <!-- Slider -->
    <div
      v-else-if="kind === 'slider'"
      class="flex items-center gap-2"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
    >
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
      v-model:value="textValue"
      :show-alpha="opts.alpha ?? false"
      :modes="['hex']"
      :disabled="opts.readonly"
      size="small"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
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
      v-model:value="selectValue"
      :options="selectOptions"
      size="tiny"
      class="text-xs"
      @pointerdown.stop
      @mousedown.stop
      @click.stop
    />

    <!-- Insert -->
    <NButton
      v-else-if="kind === 'insert'"
      size="tiny"
      type="primary"
      secondary
      block
      class="text-xs font-bold uppercase tracking-wider"
      @click.stop="handleInsert"
      @pointerdown.stop
      @mousedown.stop
    >
      Adicionar
    </NButton>
  </div>
</template>

<style scoped>
.custom-control-wrapper {
  margin: 2px 0;
  pointer-events: auto;
  user-select: text;
}
:deep(.n-input) {
  user-select: text;
}
:deep(.n-input__input-el),
:deep(.n-input__textarea-el) {
  font-size: 11px !important;
  user-select: text !important;
}
</style>
