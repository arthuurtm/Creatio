<script setup>
import { RouterView } from 'vue-router'
import ComponentDialog from '@/components/ComponentDialog.vue'
import ComponentGamepad from '@/components/ComponentGamepad.vue'
import { computed } from 'vue'
import { useAppDynamicDialog } from '@/stores/global'
import { appTheme } from '@/functions/functions'

appTheme()
const component = computed(() => useAppDynamicDialog().component)
const title = computed(() => useAppDynamicDialog().title)
</script>

<template>
  <RouterView />
  <ComponentDialog :component="component" :title="title" />
  <ComponentGamepad />
</template>

<style scoped></style>
