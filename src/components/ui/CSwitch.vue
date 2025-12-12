<template>
  <label class="c-switch" :class="{ checked: modelValue }">
    <input
      type="checkbox"
      class="c-switch-input"
      :checked="modelValue"
      @input="$emit('update:modelValue', $event.target.checked)"
    />

    <span class="c-switch-track">
      <span class="c-switch-handle" />
    </span>

    <span class="c-switch-label">
      <slot />
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.c-switch {
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
  text-align: center;
  white-space: nowrap;
  transition:
    opacity 0.3s ease,
    margin-left 0.3s ease,
    filter 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;

  position: relative;
  user-select: none;
}

.c-switch-input {
  display: none;
}

.c-switch-track {
  width: 44px;
  height: 22px;
  border-radius: 50px;
  background: var(--border);
  position: relative;
  transition: background 0.3s ease;
}

.c-switch-handle {
  width: 18px;
  height: 18px;
  background: var(--text);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition:
    left 0.3s ease,
    background 0.3s ease;
}

.c-switch.checked .c-switch-track {
  background: var(--primary, #4a8cff);
}

.c-switch.checked .c-switch-handle {
  left: 24px;
  background: #fff;
}
</style>
