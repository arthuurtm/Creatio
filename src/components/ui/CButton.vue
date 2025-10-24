<template>
  <BaseButton v-bind="{ ...$props, ...$attrs }" />
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { baseButtonProps } from '../base/BaseButton.props'

defineOptions({ inheritAttrs: false })
defineProps(baseButtonProps)
</script>
