<script setup>
import ComponentCreateGamePage from '@/components/ComponentCreateGamePage.vue'
</script>

<template>
  <ComponentCreateGamePage>
    <div class="main-container">
      <div class="container"></div>
      <div class="main-floating-options"></div>
    </div>
  </ComponentCreateGamePage>
</template>

<style scoped>
.main-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-floating-options {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid #000;
}
</style>
