<template>
  <component :is="componentValue" v-bind="{ ...$props, ...$attrs }" @click="openMenu">
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
    <template #default>
      <b><span>{{ !onlyIcon ? displayValue : '' }}</span></b>
    </template>
    <template #trailing>
      <CButton icon="arrow_drop_down" classes="symbolic no-padding" @click.stop="openMenu" />
    </template>
  </component>

  <CContextMenu ref="contextMenu" :no-floating="noFloating" @select="selectHandler" />
</template>

<script setup>
import { ref } from 'vue'
import { baseInputEmits, baseInputProps } from '@/components/base/BaseInput.props.js'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'
const contextMenu = ref(null)
const props = defineProps({
  ...baseInputProps,
  options: { type: Array, default: () => [] },
  noFloating: Boolean,
  onlyIcon: Boolean,
})
const componentValue = props.onlyIcon ? BaseButton : BaseInput
const displayValue = ref('')
const emit = defineEmits([...baseInputEmits, 'select'])
defineOptions({ inheritAttrs: false })
function openMenu(event) {
  if (!props.options?.length) return
  contextMenu.value?.openContextMenu(props.options, event)
}
function selectHandler(e) {
  displayValue.value = e.text || e.label || ''
  emit('select', e)
}
</script>
