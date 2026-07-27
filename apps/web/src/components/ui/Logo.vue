<script setup lang="ts">
import LogoSVG from '@/assets/logo.svg'

defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
})
</script>

<template>
  <LogoSVG class="logo" :width="width" :height="height"/>
</template>


<style scoped>
.logo {
  display: block;
  max-height: 100%;
  width: auto;
}
</style>
