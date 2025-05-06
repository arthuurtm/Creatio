<script setup>
import ComponentLoadSessions from '@/components/ComponentLoadSessions.vue'
import { inject } from 'vue'

// Stores
const store = inject('stores')
const userStore = store.user
const dynamicDialog = store.dialog
</script>

<template>
  <div class="main">
    <div class="header">
      <h3>
        <b>
          <h3 v-if="userStore.getIsAuth" class="gradient">Olá, {{ userStore.getName }}!</h3>
          <h3 v-else class="gradient">Olá!</h3>
        </b>
      </h3>
    </div>
    <div class="sessions-show">
      <ComponentLoadSessions />
    </div>
  </div>
</template>

<style scoped></style>
