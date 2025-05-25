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
          <h3 v-if="userStore.getIsAuth" class="">{{ userStore.getName }}</h3>
          <h3 v-else class="gradient">Início</h3>
        </b>
      </h3>
      <div class="header-profile">
        <img
          v-if="userStore.getProfilePicture"
          :src="userStore.getProfilePicture"
          alt="Foto de perfil"
          class="profile-picture"
        />
      </div>
    </div>
    <div class="sessions-show">
      <ComponentLoadSessions />
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
