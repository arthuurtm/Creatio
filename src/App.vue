<script setup>
import { RouterView } from 'vue-router'
import ComponentDialog from '@/components/modules/ComponentDialog.vue'
import ComponentGamepad from '@/components/modules/ComponentGamepad.vue'
import { computed } from 'vue'
import { useAppDynamicDialog } from '@/stores/global'
import { util } from '@/functions'

util.appTheme()
const component = computed(() => useAppDynamicDialog().component)
const title = computed(() => useAppDynamicDialog().title)
</script>

<template>
  <RouterView />
  <ComponentDialog :component="component" :title="title" />
  <ComponentGamepad />
</template>

<style scoped></style>
