<script setup>
import { RouterView } from 'vue-router'
import ComponentDialog from '@/layouts/DialogBase.vue'
import ComponentGamepad from '@/components/modules/ComponentGamepad.vue'
import { computed } from 'vue'
import { useAppDynamicDialog } from '@/stores/global'
import { appTheme } from '@/functions'

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
