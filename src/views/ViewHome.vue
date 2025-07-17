<script setup>
import ComponentLoadSessions from '@/components/ComponentLoadSessions.vue'
import { inject } from 'vue'
import { useRouter } from 'vue-router'

// Stores
const store = inject('stores')
const userStore = store.user
const router = useRouter()

function playGame(args = {}) {
  router.push({
    name: 'GameDetails',
    params: { id: args.id },
  })
}
</script>

<template>
  <div class="main">
    <div class="header">
      <h3>
        <b>
          <h3 v-if="userStore.getIsAuth" class="">{{ userStore.getName }}</h3>
          <h3 v-else class="">Início</h3>
        </b>
      </h3>
      <div class="header-profile">
        <img
          v-if="userStore.getIsAuth"
          :src="userStore.getProfilePicture"
          alt="Foto de perfil"
          class="profile-picture"
        />
      </div>
    </div>
    <div class="sessions-show">
      <ComponentLoadSessions @emitEvent="playGame" />
      <ComponentLoadSessions @emitEvent="playGame" />
      <ComponentLoadSessions @emitEvent="playGame" />
      <ComponentLoadSessions @emitEvent="playGame" />
    </div>
  </div>
</template>

<style scoped>
.main {
  /* padding: 15px; */
}

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
