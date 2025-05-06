<template>
  <div class="main-container">
    <div id="helpButton"></div>
    <div class="header">
      <h3>
        <b>
          <h3 class="gradient">Suas criações recentes.</h3>
        </b>
      </h3>
    </div>

    <div class="steps">
      <div class="step-container" id="sc1"></div>

      <div class="step-container" id="sc2"></div>

      <div class="step-container" id="sc3"></div>
    </div>

    <div class="header-container"></div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const store = inject('stores')
const userStore = store.user

function requestData() {}
</script>

<style scoped>
.steps {
}

.step-container {
}
</style>
