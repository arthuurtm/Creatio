<template>
  <ComponentCreateGamePage>
    <h2>Suas Criações</h2>
    <ComponentLoadSessions
      :url="`getGames?filters=${encodeURIComponent(JSON.stringify({ userId: userStore.getId }))}`"
      @emitEvent="loadEditTool"
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
import { useRouter } from 'vue-router'
import ComponentLoadSessions from '@/components/ComponentLoadSessions.vue'
import ComponentCreateGamePage from '@/layouts/AppGamePage.vue'
import { post } from '@/functions'
import { showToast } from '@/plugins/toast'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const router = useRouter()

function loadEditTool(event) {
  router.push({ name: 'EditGame', params: event })
}

async function criarNovoJogo() {
  let result
  try {
    result = await post({ type: 'database', route: 'setGame' }, { title: 'Novo Jogo' })
  } catch (error) {
    showToast({ type: 'error', message: error.details.message })
  }
  router.push({ name: 'EditGame', params: { id: result.details.game.id } })
}
</script>
