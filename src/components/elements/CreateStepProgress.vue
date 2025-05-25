<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
  currentStep: {
    type: Number,
    default: 0,
  },
})

const progressWidth = computed(() => {
  const total = props.steps.length - 1
  const offset = 100 / (2 * props.steps.length)
  const percentage = (props.currentStep / total) * 100
  return `${Math.min(100, percentage + offset)}%`
})
</script>

<template>
  <div
    class="step-progress-bar"
    :style="{ '--progress-width': progressWidth }"
    v-if="actualPage !== 0"
  >
    <div v-for="(step, index) in props.steps" :key="index" class="step-wrapper">
      <div class="step" :class="{ active: props.currentStep >= index }">
        <div class="dot"></div>
      </div>
      <p class="step-label">{{ step }}</p>
    </div>
  </div>
</template>

<style scoped>
.step-progress-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem 0.5rem;
  box-sizing: border-box;
}

/* Linhas: base + progresso */
.step-progress-bar::before,
.step-progress-bar::after {
  content: '';
  position: absolute;
  top: 2.5rem;
  left: 1.5rem;
  right: 1.5rem;
  height: 3px;
  border-radius: 2px;
  z-index: 1;
}

.step-progress-bar::before {
  background-color: var(--border);
}

.step-progress-bar::after {
  background-color: var(--primary);
  width: var(--progress-width);
  transition: width 0.4s ease;
}

/* Cada bolinha */
.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  z-index: 2;
}

.step {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 1rem;
  height: 1rem;
  background-color: var(--border);
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.step.active .dot {
  background-color: var(--primary);
}

.step-label {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text);
  text-align: center;
  white-space: nowrap;
}
</style>
