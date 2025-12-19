<script setup>
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import { useSettingsStore } from '@/stores'
const settings = useSettingsStore()
watch(
  () => settings.darkTheme,
  (v) => {
    document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light')
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <ComponentGamepad />
</template>
