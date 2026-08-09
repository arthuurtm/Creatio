<script setup lang="ts">
import { computed } from "vue";
import ComplexArrayBuilder from "@/components/ui/ComplexArrayBuilder.vue";
import ExpressionBuilder from "@/components/ui/ExpressionBuilder.vue";
import { normalizeItems } from "@projeto/types";

type FormType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "radio"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "button"
  | "complex-array"
  | "expression";

interface FormParam {
  key: string;
  type: FormType;
  model: any;
  label?: string;
  items?: any[];
  [key: string]: any;
}

const props = defineProps<{
  modelValue: boolean;
  formParams: FormParam[];
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
  create: [];
}>();

const dialog = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

function handleCreate() {
  emit("create");
}
</script>

<template>
  <n-modal
    v-model:show="dialog"
    preset="card"
    style="width: 450px; border-radius: 16px;"
    title="Criar novo objeto"
    :bordered="false"
  >
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 4px 0;">
      <n-form-item
        v-for="(param, index) in formParams"
        :key="index"
        :label="param.type === 'checkbox' ? undefined : param.label"
        style="margin-bottom: 8px;"
      >
        <template v-if="param.type === 'text' || param.type === 'email'">
          <n-input v-model:value="param.model" placeholder="Digite..." />
        </template>
        <template v-else-if="param.type === 'password'">
          <n-input v-model:value="param.model" type="password" show-password-on="click" placeholder="Digite a senha..." />
        </template>
        <template v-else-if="param.type === 'number'">
          <n-input-number v-model:value="param.model" style="width: 100%;" placeholder="Digite o número..." />
        </template>
        <template v-else-if="param.type === 'textarea'">
          <n-input v-model:value="param.model" type="textarea" placeholder="Digite..." />
        </template>
        <template v-else-if="param.type === 'select'">
          <n-select
            v-model:value="param.model"
            :options="normalizeItems(param as any)"
            label-field="title"
            value-field="value"
            placeholder="Selecione..."
          />
        </template>
        <template v-else-if="param.type === 'checkbox'">
          <n-checkbox v-model:checked="param.model">
            {{ param.label }}
          </n-checkbox>
        </template>
        <template v-else-if="param.type === 'switch'">
          <n-switch v-model:value="param.model" />
        </template>
        <template v-else-if="param.type === 'complex-array'">
          <ComplexArrayBuilder v-model="param.model" :items="param.items" />
        </template>
        <template v-else-if="param.type === 'expression'">
          <ExpressionBuilder v-model="param.model" :items="param.items" />
        </template>
        <template v-else>
          <div style="color: var(--n-error-color); font-size: 12px;">
            ⚠ Componente não suportado: "{{ param.type }}"
          </div>
        </template>
      </n-form-item>
    </div>

    <template #action>
      <n-space justify="end" :size="12">
        <n-button @click="dialog = false" tertiary round>
          Cancelar
        </n-button>
        <n-button @click="handleCreate" type="primary" round>
          Criar
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
