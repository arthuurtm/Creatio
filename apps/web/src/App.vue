<script setup lang="ts">
import GlobalOverlays from './components/global/GlobalOverlays.vue';
</script>

<template>
  <v-app>
    <router-view />
    <GlobalOverlays />
  </v-app>
</template>
