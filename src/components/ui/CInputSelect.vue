<template>
  <BaseButton v-bind="{ ...$props, ...$attrs }" @click="openMenu">
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </BaseButton>

  <CContextMenu ref="contextMenu" :no-floating="noFloating" @select="$emit('select', $event)" />
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { baseInputEmits, baseInputProps } from '@/components/base/BaseInput.props'
const contextMenu = ref(null)
const props = defineProps({
  ...baseInputProps,
  options: { type: Array, default: () => [] },
  noFloating: Boolean,
})
defineEmits([...baseInputEmits, 'select'])
defineOptions({ inheritAttrs: false })
function openMenu(event) {
  if (!props.options?.length) return
  contextMenu.value?.openContextMenu(props.options, event)
}
</script>
