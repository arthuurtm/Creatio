<template>
  <template v-for="(button, index) in normalizedButtons" :key="index">
    <template v-if="!button?.rules?.includes('hide')">
      <select
        v-if="button.tag === 'select'"
        :id="button.id || ''"
        :class="['btn', button.class, globalStyle]"
        :style="[button?.style, typeof button?.position === 'object' && button.position]"
        @change="handleClick(button, index, $event.target.value)"
      >
        <option disabled selected>Selecione uma opção...</option>
        <option v-for="(option, i) in button.options" :key="i" :value="option.value || option">
          {{ option.text || option }}
        </option>
      </select>

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

function normalizeButtons(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.values(value)
  return [{}]
}

function handleClick(button, index, e) {
  if (loadingStates.value[index]) {
    e.preventDefault()
    e.stopPropagation()
    return
  }

  if (typeof button.action === 'function') {
    handleAction(button, index, e)
  } else {
    emitEvent(button.action?.name, button.action?.value, button.action?.type)
  }
  emits('click', e)
}
const emitEvent = (action = '', value = '', type = '') => {
  emits('emitEvent', { action, value, type })
}

const handleAction = async (button, index, event, next = null) => {
  try {
    loadingStates.value[index] = true
    await button.action(event)
    emitEvent(null, 'terminated', null)
  } catch (error) {
    console.error('Erro ao executar função: ', error)
    emitEvent(null, 'error', null)
    if (next) next(error)
    else throw error
  } finally {
    loadingStates.value[index] = false
  }
}
</script>
