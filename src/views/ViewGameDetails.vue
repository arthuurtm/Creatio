<template>
  <div class="main-container">
    <!-- Posição fixada (fixed) -->
    <div class="background">
      <div class="background-banner">
        <img src="" />
      </div>

      <!-- Posição absoluta -->
      <div class="gameOptions">
        <div id="gameTitle"></div>
        <div id="gameRate"></div>
        <div id="gameStart"></div>
      </div>

      <!-- deve funcionar como um footer no futuro-->
      <div class="gameDetails"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { get } from '@/functions'

const route = useRoute()
const gameData = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const id = route.params.id
    const res = await get({
      type: 'database',
      route: `getGames?filters=${encodeURIComponent(JSON.stringify({ id }))}`,
    })
    gameData.value = res
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})
</script>
