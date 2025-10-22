<template>
  <BaseCard :size="styleType" v-bind="$attrs">
    <div class="title">
      <p>{{ title || 'Exemplo' }}</p>
    </div>
    <div class="banner">
      <img id="banner" alt="Banner do jogo" :src="bannerSrc" />
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/base/BaseCard.vue'
defineOptions({ inheritAttrs: false })
defineProps({
  title: String,
  bannerSrc: String,
  styleType: String,
})
</script>

<style scoped>
.title {
  position: absolute;
  left: 15px;
  color: var(--text);
  font-weight: bold;
  font-size: 20px;
  z-index: 2;
}
.banner {
  max-width: 100%;
  height: auto;
}
.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title::before {
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
.banner::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right, #121212c9, transparent);
  pointer-events: none;
}
</style>
