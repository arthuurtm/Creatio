<script setup>
const props = defineProps({
  style: {
    type: [Object, String],
    default: () => ({}),
  },
})
</script>

<template>
  <!-- <img src="/src/assets/img/min-logo.png" :style="props.style" /> -->
  <div class="gradient logo-text" :style="style">Creatio</div>
</template>

<style scoped>
@font-face {
  font-family: 'Poseidon';
  src: url('/src/assets/fonts/poseidon/PoseiAOE.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.logo-text {
  font-family: 'Poseidon', sans-serif;
  font-size: 4rem;
  font-weight: bold;
  cursor: default;
  line-height: normal;
}
</style>
