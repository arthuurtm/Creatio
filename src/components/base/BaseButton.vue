<template>
  <button
    :type="type"
    :class="['btn', { 'is-loading': loading }, classes]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span class="btn-content" :class="{ 'is-loading-content': loading }">
      <span v-if="icon" class="material-symbols-rounded notranslate" aria-hidden="true">
        {{ icon }}
      </span>

      <img
        v-if="img"
        :src="img.src"
        :alt="img.alt || ''"
        :class="img.class"
        :style="img.style"
        aria-hidden="true"
      />

      <p v-if="text && !hasDefaultSlot" class="btn-text">
        {{ text || label }}
      </p>
      <slot v-else />
    </span>

    <BaseLoading
      v-if="loading"
      size="1.2em"
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
    />
  </button>
</template>

<script setup>
import { useSlots, computed } from 'vue'
import BaseLoading from './BaseLoading.vue'
import { baseButtonProps, baseButtonEmits } from './BaseButton.props'

defineProps(baseButtonProps)
const emits = defineEmits(baseButtonEmits)
const slots = useSlots()
const hasDefaultSlot = computed(() => !!slots.default)

function handleClick(event) {
  emits('click', event)
}
</script>

<style scoped>
.btn-content {
  display: inline-flex;
  align-items: center;
  gap: inherit;
  transition: opacity 0.2s ease-in-out;
}

.btn-content.is-loading-content {
  opacity: 0;
}
</style>
