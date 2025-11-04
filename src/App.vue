<script setup>
import { RouterView } from 'vue-router'
import { util } from '@/functions'
util.appTheme()
</script>

<template>
  <RouterView />
  <ComponentGamepad />
</template>
