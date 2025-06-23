<template>
  <ComponentCreateGamePage>
    <h2>Suas Criações</h2>
    <ComponentLoadSessions
      :url="`getGames?filters=${encodeURIComponent(JSON.stringify({ userId: userStore.getId }))}`"
      @emitEvent="reEmitEvent"
    />
    <CreateButton
      :buttons="[
        {
          text: 'Criar',
          icon: 'add',
          class: 'symbolic no-padding no-scalling',
        },
      ]"
      @emitEvent="criarNovoJogo"
    />
  </ComponentCreateGamePage>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import ComponentLoadSessions from '@/components/ComponentLoadSessions.vue'
import ComponentCreateGamePage from '@/components/ComponentCreateGamePage.vue'

const emits = defineEmits(['emitEvent'])

const store = inject('stores')
const userStore = store.user
const router = useRouter()

function reEmitEvent(event) {
  emits('emitEvent', event)
}

function criarNovoJogo() {
  router.push({ name: 'CreateGame' })
}
</script>
