<template>
  <div class="input" ref="inputWrapper" :class="[
    classes,
    dynamicClasses,
    { 'has-leading': !!slots.leading, 'has-trailing': !!slots.trailing },
  ]">
    <span v-if="!!slots.leading" class="input-slot-leading">
      <slot name="leading" />
    </span>
    <CButton v-else-if="icon" :icon="icon" classes="symbolic no-scalling no-padding" />

    <component :is="tag" class="input-field" :type="type" :id="id || label" :value="modelValue"
      :placeholder="!label ? placeholder : ' '" :disabled="disabled || loading"
      @input="updateValue($event.target.value)" />

    <label v-if="label" :for="id || label">{{ label }}</label>

    <CLoading v-if="loading" class="input-loading-spinner" />
    <slot />

    <span v-if="!!slots.trailing && !loading" class="input-slot-trailing">
      <slot name="trailing" />
    </span>
  </div>
</template>

<script setup>
import { ref, computed, useSlots } from 'vue'
import { baseInputProps, baseInputEmits } from './BaseInput.props.js'
import CLoading from '../ui/CLoading.vue'
import CButton from '../ui/CButton.vue'

// --- Definições ---
const props = defineProps(baseInputProps)
const emits = defineEmits(baseInputEmits)
const slots = useSlots()
const inputWrapper = ref(null)

// --- Funções (Handlers) ---
function updateValue(value) {
  emits('update:modelValue', value)
}

function reEmitEvent(event) {
  emits('emitEvent', event)
}

// --- Computados ---
const tag = computed(() => {
  return props.type === 'textarea' ? 'textarea' : 'input'
})

const dynamicClasses = computed(() => {
  return {
    'is-loading': props.loading,
    'is-disabled': props.disabled,
  }
})
</script>

<style scoped>
.input-slot-leading,
.input-slot-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
