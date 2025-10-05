<template>
  <template v-for="(button, index) in normalizedButtons" :key="index">
    <template v-if="!button?.rules?.includes('hide')">
      <div
        v-if="button.tag === 'select'"
        :id="button.id || ''"
        :class="['btn', button.class, globalStyle]"
        :style="[button?.style, typeof button?.position === 'object' && button.position]"
        @click.capture="openContextMenu(button.options)"
      ></div>

      <component
        v-else
        :is="'button'"
        :id="button.id || ''"
        :type="button.type || 'submit'"
        :class="[
          'btn',
          button.class,
          typeof button?.position === 'string' && button.position,
          globalStyle,
        ]"
        :style="[button?.style, typeof button?.position === 'object' && button.position]"
        :disabled="loadingStates[index]"
        @click="handleClick(button, index, $event)"
      >
        <span
          v-if="button.icon"
          class="material-symbols-rounded notranslate"
          style="text-align: center"
        >
          {{ button.icon }}
        </span>

        <img
          v-if="button.img"
          :src="button.img.src"
          :alt="button.img.alt"
          :class="button.img"
          :style="button.img?.style"
        />
        <slot v-if="hasDefaultSlot" />
        <p v-if="button.text" :style="[loadingStates[index] && 'opacity: 0']">
          {{ button.text }}
        </p>

        <create-loading v-if="loadingStates[index]" :size="'1.2em'" style="position: absolute" />
      </component>
    </template>
  </template>
  <create-context-menu ref="contextMenu" @emit-event="emitEvent" />
</template>

<script setup>
import { useSlots, ref, computed } from 'vue'

const props = defineProps({
  buttons: { type: Array, default: () => [{}] },
  globalStyle: { type: String, default: '' },
  text: String,
  icon: String,
  img: Object,
  type: { type: String, default: 'button' },
  class: [String, Array],
  style: [String, Object],
  action: Function,
  rules: { Array, default: () => [] },
  position: [String, Object],
  id: String,
})

const emits = defineEmits(['emitEvent', 'click'])
const slots = useSlots()
const hasDefaultSlot = !!slots.default
/**@type {import('@/components/elements/CreateContextMenu.vue').default} */
const contextMenu = ref({})
const normalizedButtons = computed(() => {
  if (props.buttons && props.buttons.length > 0 && Object.keys(props.buttons[0]).length > 0)
    return props.buttons

  return [
    {
      text: props.text,
      icon: props.icon,
      img: props.img,
      type: props.type,
      class: props.class,
      style: props.style,
      action: props.action,
      rules: props.rules,
      position: props.position,
      id: props.id,
    },
  ]
})
const loadingStates = ref(normalizedButtons.value.map(() => false))

function openContextMenu(items, e) {
  contextMenu.value.openContextMenu(items, e)
}

function handleClick(button, index, e) {
  if (loadingStates.value[index]) {
    e.preventDefault()
    e.stopPropagation()
    return
  }

  if (typeof button?.action === 'function') {
    handleAction(button, index, e)
  }
  emitEvent({ ...e, ...button })
}
const emitEvent = (e = {}) => {
  emits('emitEvent', { ...e })
}

const handleAction = async (button, index, event, next = null) => {
  try {
    loadingStates.value[index] = true
    await button.action(event)
  } catch (error) {
    console.error('Erro ao executar função: ', error)
    if (next) next(error)
    else throw error
  } finally {
    emitEvent(event)
    loadingStates.value[index] = false
  }
}
</script>
