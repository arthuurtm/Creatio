<script setup>
import { RouterView } from 'vue-router'
import AppDynamicDialog from '@/layouts/AppDynamicDialog.vue'
import { computed } from 'vue'
import { useAppDynamicDialog } from '@/stores/store'
import { appTheme } from '@/functions/functions'

appTheme()
const isVisible = computed(() => useAppDynamicDialog().isVisible);
const component = computed(() => useAppDynamicDialog().component);
const title = computed(() => useAppDynamicDialog().title);
</script>

<template>
  <RouterView />
  <AppDynamicDialog v-if="isVisible" :component="component" :title="title" />
</template>

<style scoped></style>
