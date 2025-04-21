<template>
  <div class="ggrid">
    <div class="title">
      <b>
        <h3 class="upper">Jogos disponíveis</h3>
      </b>
    </div>

    <div class="content">
      <CreateButton
        @emitEvent="scrollLeft"
        :buttons="[
          {
            icon: 'arrow_back_ios',
            class: 'symbolic no-padding no-scalling',
            id: 'left',
            type: '',
          },
        ]"
      />

      <div v-if="loading"><CreateLoading :class="loadCont" /></div>

      <div class="sliding" v-else-if="games && games.length > 0" ref="scrollContainer">
        <div v-for="game in games" :key="game.id" class="container gameCard">
          <div class="title">
            <p>{{ game.title }}</p>
          </div>
          <div class="banner">
            <img id="banner" alt="Banner do jogo" />
          </div>

          <div class="uiOptions">
            <div id="play">
              <form @submit.prevent="playGame(game.version)">
                <button id="play-button" class="btn symbolic" type="submit">
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <CreateButton
          :buttons="[
            {
              text: '🤔💭',
              position: 'center',
              class: 'symbolic no-padding no-scalling no-brightness',
              id: 'noGameFound',
              type: '',
            },
          ]"
        />
      </div>

      <CreateButton
        @emitEvent="scrollRight"
        :buttons="[
          {
            position: 'left',
            icon: 'arrow_forward_ios',
            class: 'symbolic no-padding no-scalling',
            id: 'right',
            type: '',
          },
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get } from '@/functions/functions'
import { useAppDynamicDialog, useUserStore } from '@/stores/dialog'

const games = ref([])
const dynamicDialog = useAppDynamicDialog()
const loading = ref(true)
const scrollContainer = ref(null)
const scrollAmount = 260

async function loadGames() {
  try {
    const data = await get({ type: 'database', route: 'getGames' })
    console.log('Dados recebidos:', data)
    // dynamicDialog.setDialog('DialogMessage', {
    //   title: 'Log',
    //   message: data,
    // })
    games.value = Array.isArray(data.details) ? data.details : []
  } catch (error) {
    console.error('Erro ao carregar jogos:', error)
  } finally {
    loading.value = false
  }
}

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= scrollAmount
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += scrollAmount
  }
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped>
@import url('/src/assets/css/components/c-loadSessions.css');
</style>
