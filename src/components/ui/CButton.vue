<template>
  <BaseButton v-bind="$attrs"><slot /></BaseButton>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
defineOptions({ inheritAttrs: false })
</script>
