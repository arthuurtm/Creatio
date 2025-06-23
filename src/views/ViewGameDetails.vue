<template>
  <div class="main-container">
    <!-- Posição fixada (fixed) -->
    <div class="background">
      <div class="background-banner">
        <img src="" />
      </div>

      <!-- Posição absoluta -->
      <div class="gameOptions">
        <div id="gameTitle">...</div>
        <div id="gameRate"></div>
        <div id="gameStart"></div>
      </div>

      <!-- deve funcionar como um footer no futuro-->
      <div class="gameDetails"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const id = ref(route.params.id)

onMounted(() => {})
</script>
