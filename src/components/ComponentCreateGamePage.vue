<template>
  <div class="main-container">
    <Transition name="moveToBottom">
      <CreateStepProgress :steps="steps" :currentStep="actualPage - 1" v-if="actualPage != 0" />
    </Transition>

    <div class="steps">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const steps = ['Configurações básicas', 'Jogo', 'Créditos', 'Revisão']
const actualPage = ref(0)

function criarNovoJogo() {
  actualPage.value = 1
}
</script>

<style scoped>
@import url('/src/assets/css/components/c-createPage.css');
</style>
