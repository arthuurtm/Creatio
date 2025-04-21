<script setup>
import ComponentLoadSessions from '@/components/ComponentLoadSessions.vue'
import { useAppDynamicDialog, useUserStore } from '@/stores/dialog'

// Stores
const userStore = useUserStore()
const dynamicDialog = useAppDynamicDialog()
</script>

<template>
  <div class="main">
    <div class="header">
      <h3>
        <b>
          <h3 class="gradient">Olá, {{ userStore.name }}!</h3>
        </b>
      </h3>
    </div>
    <div class="sessions-show">
      <ComponentLoadSessions />
    </div>
  </div>
</template>

<style scoped></style>
