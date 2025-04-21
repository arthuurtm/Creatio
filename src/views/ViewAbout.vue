<template>
  PÁGINA DE APRESENTAÇÃO DO SOFTWARE (EM BREVE)
  <a @click="this.$router.push({ name: 'Home' })">Página Inicial</a>
</template>

<script>
export default {
  name: 'ViewAbout',
}
</script>

<style scoped>
a {
  color: blue;
  cursor: pointer;
}
</style>
