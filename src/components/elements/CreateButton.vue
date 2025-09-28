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
        :is="button.tag || 'button'"
        :id="button.id || ''"
        :type="button.type || 'submit'"
        :class="[
          !button.tag && 'btn',
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
  buttons: {
    type: Array,
    default: () => [{}],
  },
  rules: {
    type: Array,
    default: () => [],
  },
  globalStyle: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['emitEvent', 'click'])
const slots = useSlots()
const hasDefaultSlot = !!slots.default
const normalizedButtons = computed(() => normalizeButtons(props.buttons))
const loadingStates = ref(normalizedButtons.value.map(() => false))
/**@type {import('@/components/elements/CreateContextMenu.vue').default} */
const contextMenu = ref({})

function normalizeButtons(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.values(value)
  return [{}]
}

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
