<script setup lang="ts">
import { computed } from "vue";
import {
  VBtn,
  VCheckbox,
  VFileInput,
  VRadioGroup,
  VRow,
  VSelect,
  VSpacer,
  VSwitch,
  VTextarea,
  VTextField,
} from "vuetify/components";

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

const inputParamMap: Record<FormType, any> = {
  text: VTextField,
  email: VTextField,
  password: VTextField,
  number: VTextField,
  textarea: VTextarea,
  select: VSelect,
  checkbox: VCheckbox,
  switch: VSwitch,
  radio: VRadioGroup,
  date: VTextField,
  time: VTextField,
  datetime: VTextField,
  file: VFileInput,
  button: VBtn,
  "complex-array": ComplexArrayBuilder,
  expression: ExpressionBuilder,
};

function handleCreate() {
  emit("create");
}
</script>

<template>
  <COverlay
    v-model="dialog"
    :max-width="450"
    title="Criar novo objeto"
    :divider="false"
  >
    <v-row
      v-for="(param, index) in formParams"
      :key="index"
      class="mb-1"
    >
      <component
        v-slot:default
        v-if="inputParamMap[param.type]"
        :is="inputParamMap[param.type]"
        v-model="param.model"
        :items="
          param.type === 'select'
            ? normalizeItems(param as any)
            : param.items
        "
        :label="param.label"
        variant="outlined"
        density="comfortable"
        bg-color="surface"
        hide-details="auto"
        class="w-100"
      />

      <div v-else class="text-error text-caption px-2">
        ⚠ Componente não suportado: "{{ param.type }}"
      </div>
    </v-row>

    <template #actions>
      <v-spacer />

      <v-btn
        text="Cancelar"
        variant="plain"
        color="medium-emphasis"
        rounded="pill"
        class="text-none px-4"
        @click="dialog = false"
      />

      <v-btn
        text="Criar"
        variant="flat"
        color="primary"
        rounded="pill"
        class="text-none px-6"
        @click="handleCreate"
      />
    </template>
  </COverlay>
</template>