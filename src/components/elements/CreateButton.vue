<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    v-for="(button, index) in buttons"
    :key="index"
    class="group-button"
    :class="button.position || ''"
  >
    <button
      v-if="!button.icon"
      class="btn"
      :class="button.class"
      :id="button.id || ''"
      :type="button.type || 'submit'"
      @click="
        typeof button.action === 'function'
          ? button.action()
          : emitEvent(
              button.action?.name || '',
              button.action?.value || '',
              button.action?.type || '',
            )
      "
    >
      {{ button.text }}
    </button>
    <button
      v-else
      class="btn"
      :class="button.class"
      :id="button.id || ''"
      :type="button.type || 'submit'"
      @click="
        typeof button.action === 'function'
          ? button.action()
          : emitEvent(
              button.action?.name || '',
              button.action?.value || '',
              button.action?.type || '',
            )
      "
    >
      <span class="material-symbols-outlined notranslate">{{ button.icon }}</span>
      <p>{{ button.text || '' }}</p>
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
export default {
  name: 'CreateButton',
  props: {
    buttons: {
      type: Array,
      default: () => [{}],
    },
    modelValue: String,
  },
  emits: ['update:modelValue', 'emitEvent'],
  setup(props, { emit }) {
    const inputValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    return { inputValue }
  },
  methods: {
    emitEvent(action, value, type) {
      this.$emit('emitEvent', { action, value, type })
    },
  },
}
</script>

<style scoped></style>
