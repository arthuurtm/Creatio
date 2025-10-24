<template>
  <BaseInput
    v-bind="props"
    :modelValue="props.modelValue"
    :type="effectiveInputType"
    @update:modelValue="updateValue"
    @emitEvent="reEmit"
  >
    <template #trailing>
      <CButton
        :icon="eyeIcon"
        class="symbolic no-padding no-scale"
        @click="toggleVisibility"
        tabindex="-1"
      />
    </template>
  </BaseInput>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { baseInputProps, baseInputEmits } from '@/components/base/BaseInput.props'

const props = defineProps(baseInputProps)
const emits = defineEmits(baseInputEmits)
const isPasswordVisible = ref(false)

const effectiveInputType = computed(() => {
  return isPasswordVisible.value ? 'text' : 'password'
})

const eyeIcon = computed(() => {
  return isPasswordVisible.value ? 'visibility_off' : 'visibility'
})

function toggleVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function updateValue(newValue) {
  emits('update:modelValue', newValue)
}

function reEmit(event) {
  emits('emitEvent', event)
}
</script>
