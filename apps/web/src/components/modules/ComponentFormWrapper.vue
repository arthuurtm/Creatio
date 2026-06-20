<template>
  <component :is="formLayout" :current-step="currentStep" :total-steps="totalSteps">

    <template #title>{{ title }}</template>
    <template #subTitle>{{ subTitle }}</template>
    <template #formInfo>
      <slot name="formInfo" />
    </template>

    <v-form class="form-wrapper" @submit.prevent="$emit('submit')">
      <transition name="slide-left" mode="out-in">
        <div class="form-content py-2" :key="currentStep">
          <slot v-if="hasSlot('buttons') && hasSlot('form')" name="form" />
          <p v-else>
            Não foi possível carregar os dados do formulário.
          </p>
        </div>
      </transition>
      <div class="form-actions pt-4 mt-2">
        <slot v-if="hasSlot('buttons') && hasSlot('form')" name="buttons" />
        <v-btn v-else text="Voltar" @click="$router.back()" />
      </div>
    </v-form>
  </component>
</template>

<script setup lang="ts">
import { useSlots, ref, shallowRef } from 'vue'
import LayoutPageForm from '@/layouts/LayoutPageForm.vue'

const props = defineProps({
  title: String,
  subTitle: String,
  currentStep: Number,
  totalSteps: Number,
  loading: Boolean,
  layoutComponent: Object,
})
defineEmits(['submit'])
const slots = useSlots()
const formLayout = ref(shallowRef(props.layoutComponent ?? LayoutPageForm))

function hasSlot(name: string) {
  return !!slots[name]
}
</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
}

.form-actions {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
</style>
