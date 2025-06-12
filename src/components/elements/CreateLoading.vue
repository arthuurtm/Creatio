<template>
  <div class="loading-overlay" :class="[isFull && 'full']">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  full: {
    type: Boolean,
    default: false,
  },
})

const isFull = computed(() => props.full)
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
}

.loading-overlay.full {
  background: rgba(0, 0, 0, 0.5);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 6px solid var(--input-bg);
  border-top: 6px solid var(--input-text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
</style>
