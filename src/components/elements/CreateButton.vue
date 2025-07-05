<!-- eslint-disable vue/no-mutating-props -->
<template>
  <template v-for="(button, index) in buttons" :key="index">
    <div
      class="group-button"
      :class="[button.position || '', rules]"
      v-if="button.rules ? !button.rules.includes('hide') : true"
    >
      <component
        :is="button.tag || 'button'"
        :class="[!button.tag && 'btn', button.class]"
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
        <span v-if="button.icon" class="material-symbols-outlined notranslate">
          {{ button.icon }}
        </span>
        <img
          v-if="button.img"
          :src="button.img.src"
          :alt="button.img.alt"
          :class="button.img"
          :style="button.img?.style"
        />
        <p>{{ button.text || '' }}</p>
      </component>
    </div>
  </template>
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
    modelValue: {
      type: String,
    },
    rules: {
      type: Array,
      default: () => [],
    },
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
