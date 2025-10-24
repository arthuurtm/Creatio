<template>
  <BaseLoading v-bind="$attrs"></BaseLoading>
</template>

<script setup>
import BaseLoading from '@/components/base/BaseLoading.vue'
defineOptions({ inheritAttrs: false })
defineProps({ full: Boolean, size: String })
</script>
