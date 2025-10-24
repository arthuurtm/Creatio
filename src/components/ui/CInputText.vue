<template>
  <BaseInput v-bind="{ ...$props, ...$attrs }">
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </BaseInput>
</template>

<script setup>
import BaseInput from '@/components/base/BaseInput.vue'
import { baseInputProps } from '@/components/base/BaseInput.props'
defineOptions({ inheritAttrs: false })
defineProps(baseInputProps)
</script>
