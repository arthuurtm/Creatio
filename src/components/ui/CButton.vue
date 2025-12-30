<template>
  <BaseButton v-bind="{ ...$props, ...attrs }" />
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import type { BaseButtonProps } from '../base/BaseButton.props.ts'

const attrs = useAttrs()
defineOptions({ inheritAttrs: false })
defineProps<BaseButtonProps>()
</script>
