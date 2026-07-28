<script setup lang="ts">
import { ref, computed } from 'vue'
import { VTextField } from 'vuetify/components'

defineOptions({
  extends: VTextField
})

const isPasswordVisible = ref(false)

const effectiveInputType = computed(() =>
  isPasswordVisible.value ? 'text' : 'password'
)

const eyeIcon = computed(() =>
  isPasswordVisible.value ? 'visibility_off' : 'visibility'
)

function toggleVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <VTextField
    v-bind="$props"
    :type="effectiveInputType"
    :append-inner-icon="eyeIcon"
    @click:append-inner="toggleVisibility"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>
