<template>
  <div
    class="card"
    :class="size"
    @click="$emit('click', e)"
    @mousemove="(e) => handleMouseMove(e)"
    @mouseleave="() => handleMouseLeave(index)"
    ref="card"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  /** @type {reduced} */
  size: String,
})
defineEmits(['click'])
const card = ref()
function handleMouseMove(e) {
  const rect = card.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = -(y - centerY) / 10
  const rotateY = (x - centerX) / 10
  card.value.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
}

function handleMouseLeave() {
  card.value.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
}
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  margin: 20px;
  background-color: var(--overlay-bg);
  border-radius: 15px;
  width: 200px;
  min-width: 200px;
  height: 340px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition:
    transform 0.1s ease,
    scale 0.1s ease;
  perspective: 1000px;
}

.card.reduced {
  height: 200px;
}
</style>
