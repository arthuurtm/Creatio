<template>
  <div
    @click="$emit('click')"
    @mousemove="(e) => !no3dEffect && handleMouseMove(e)"
    @mouseleave="() => !no3dEffect && handleMouseLeave(index)"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  no3dEffect: Boolean,
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
