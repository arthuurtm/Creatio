<template>
  <component :is="formLayout" :current-step="currentStep" :total-steps="totalSteps">

    <template #title>{{ title }}</template>
    <template #subTitle>{{ subTitle }}</template>
    <template #formInfo>
      <slot name="formInfo" />
    </template>

    <form class="flex flex-col flex-1" @submit.prevent="$emit('submit')">
      <transition name="slide-left" mode="out-in">
        <div class="flex flex-col justify-center items-stretch py-2" :key="currentStep">
          <slot v-if="hasSlot('buttons') && hasSlot('form')" name="form" />
          <p v-else>
            Não foi possível carregar os dados do formulário.
          </p>
        </div>
      </transition>
      <div class="flex flex-col w-full items-stretch gap-2 pt-4 mt-2">
        <slot v-if="hasSlot('buttons') && hasSlot('form')" name="buttons" />
        <n-button v-else round @click="$router.back()">Voltar</n-button>
      </div>
    </form>
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

