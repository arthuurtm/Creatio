<template>
  <button class="c-toggle" :class="{ active: modelValue }" @click="$emit('update:modelValue', !modelValue)">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.c-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  width: auto;
  padding: 10px 18px;

  border-radius: 50px;
  cursor: pointer;

  font-size: 15px;
  font-weight: 500;

  color: var(--text);
  background: transparent;

  border: 1px solid var(--border);

  opacity: 1;
  white-space: nowrap;

  transition:
    opacity 0.3s ease,
    margin-left 0.3s ease,
    filter 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

.c-toggle:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.c-toggle.active {
  background: var(--primary, #4a8cff);
  color: var(--background, #fff);
  border-color: var(--primary, #4a8cff);
}
</style>
