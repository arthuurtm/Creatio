<template>
  <BaseButton v-bind="$attrs" @click="openOptionsMenu($event)">
    <slot />
  </BaseButton>
  <CContextMenu ref="contextMenu" @select="onMenuSelect" />
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { baseButtonProps } from '../base/BaseButton.props.js'
defineOptions({ inheritAttrs: false })
const props = defineProps({ ...baseButtonProps, options: Array })
const emit = defineEmits(['select'])
const contextMenu = ref(null)
function openOptionsMenu(e) {
  contextMenu.value.openContextMenu(props.options, e)
}
function onMenuSelect(item) {
  emit('select', item)
}
</script>
