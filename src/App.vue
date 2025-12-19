<script setup>
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import { useSettingsStore } from '@/stores'
const settings = useSettingsStore()
watch(
  () => settings.theme,
  (v) => {
    document.documentElement.setAttribute('data-theme', v)
  },
  { immediate: true },
)
</script>

<template>
  <v-app>
    <RouterView />
    <ComponentGamepad />
  </v-app>
</template>
