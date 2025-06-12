<script setup>
import { EventEmitter } from 'ws'

const props = defineProps({
  games: {
    type: Array,
    default: () => [],
  },
})

const emits = defineEmits(['emitEvent'])

function emitEvent(args = {}) {
  emits('emitEvent', args)
}
</script>

<template>
  <div
    v-for="game in props.games"
    :key="game.id"
    class="gameCard"
    @click="emitEvent({ id: game.id })"
  >
    <div class="title">
      <p>{{ game.title || 'Exemplo' }}</p>
    </div>
    <div class="banner">
      <img id="banner" alt="Banner do jogo" :src="game.img || ''" />
    </div>
  </div>
</template>

<style scoped>
.gameCard {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  max-width: 250px;
  margin: 20px;
  background-color: var(--overlay-bg);
  border-radius: 15px;
  width: 200px;
  min-width: 200px;
  height: 340px;
  cursor: pointer;
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
