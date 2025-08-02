<script setup>
import { ref, onMounted } from 'vue'
import { handleImage } from '@/functions'

const props = defineProps({
  card: {
    type: Array,
    default: () => [],
  },
  styleType: {
    type: String,
    default: 'medium',
  },
})

const emits = defineEmits(['emitEvent'])
function emitEvent(args = {}) {
  emits('emitEvent', args)
}

const cards = ref([])

function handleMouseMove(e, index) {
  const card = cards.value[index]
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  const rotateX = -(y - centerY) / 10
  const rotateY = (x - centerX) / 10

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
}

function handleMouseLeave(index) {
  const card = cards.value[index]
  card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
}
</script>

<template>
  <div
    v-for="(game, index) in props.card"
    :key="game.id"
    class="gameCard"
    :class="styleType"
    @click="emitEvent({ id: game.id })"
    @mousemove="(e) => handleMouseMove(e, index)"
    @mouseleave="() => handleMouseLeave(index)"
    ref="cards"
  >
    <div class="title">
      <p>{{ game.title || 'Exemplo' }}</p>
    </div>
    <div class="banner">
      <img id="banner" alt="Banner do jogo" :src="handleImage(game.banner)" />
    </div>
  </div>
</template>

<style scoped>
.gameCard {
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

.gameCard.reduced {
  height: 200px;
}

.gameCard .banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gameCard .title {
  position: absolute;
  left: 15px;
  color: var(--text);
  font-weight: bold;
  font-size: 20px;
  z-index: 2;
}

.gameCard .title::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  background: var(--bg, #42b883); /* cor base do glow */
  filter: blur(20px);
  opacity: 0.4;
  z-index: -1;
  transition:
    filter 0.3s ease,
    opacity 0.3s ease;
}

.gameCard:hover .title::before {
  filter: blur(70px);
  opacity: 1;
}

.gameCard .banner {
  max-width: 100%;
  height: auto;
}

.gameCard .banner::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right, #121212c9, transparent);
  pointer-events: none;
}

.gameCard:hover {
  transform: scale(1.05);
}
</style>
