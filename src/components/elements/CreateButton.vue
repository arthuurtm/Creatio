<template>
  <template v-for="(button, index) in props.buttons" :key="index">
    <component
      v-if="!button?.rules?.includes('hide')"
      :is="button.tag || 'button'"
      :class="[
        !button.tag && 'btn',
        button.class,
        typeof button?.position === 'string' && button.position,
        globalStyle,
      ]"
      :id="button.id || ''"
      :type="button.type || 'submit'"
      :style="[button?.style, typeof button?.position === 'object' && button.position]"
      @click="
        (typeof button.action === 'function'
          ? handleAction(button, index, $event)
          : emitEvent(
              button.action?.name || '',
              button.action?.value || '',
              button.action?.type || '',
            ),
        $emit('click', $event))
      "
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
      <p v-if="button.text" :style="[loadingStates[index] && 'opacity: 0']">{{ button.text }}</p>

      <create-loading v-if="loadingStates[index]" :size="'1em'" />
    </component>
  </template>
</template>

<script setup>
import { useSlots, ref } from 'vue'

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
const loadingStates = ref(props.buttons.map(() => false))

const emitEvent = (action = '', value = '', type = '') => {
  emits('emitEvent', { action, value, type })
}

const handleAction = async (button, index, event) => {
  try {
    loadingStates.value[index] = true
    await button.action(event)
    emitEvent(null, 'terminated', null)
  } catch (error) {
    console.error('Erro ao executar função: ', error)
    emitEvent(null, 'error', null)
  } finally {
    loadingStates.value[index] = false
  }
}
</script>
