<script setup lang="ts">
import { computed } from "vue";
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VDialog,
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
  <v-dialog
    v-model="dialog"
    max-width="450"
    transition="dialog-bottom-transition"
  >
    <v-card rounded="xl" elevation="4" class="pa-2">
      <v-card-title
        class="text-center text-subtitle-1 font-weight-bold pt-4 pb-2"
      >
        Criar Novo Objeto
      </v-card-title>

      <v-card-text class="pt-4 pb-0">
        <v-row
          v-for="(param, index) in formParams"
          :key="index"
          class="mb-1"
        >
          <component
            v-if="inputParamMap[param.type]"
            :is="inputParamMap[param.type]"
            v-model="param.model"
            :items="
              param.type === 'select'
                ? normalizeItems(param)
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
      </v-card-text>

      <v-card-actions class="pa-4 pt-6">
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>