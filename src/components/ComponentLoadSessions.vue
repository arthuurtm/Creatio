<template>
  <div class="ggrid">
    <div class="title">
      <b>
        <h3 class="upper">Jogos disponíveis</h3>
      </b>
    </div>

    <div class="content">
      <div id="btn">
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
      </div>

      <div v-if="loading"><CreateLoading :class="loadCont" /></div>

      <div class="sliding" v-else-if="games && games.length > 0" ref="scrollContainer">
        <CreateCard :card="games" @emitEvent="playGame" />
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

      <div id="btn">
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
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/functions/functions'

const games = ref([])
const loading = ref(true)
const scrollContainer = ref(null)
const scrollAmount = 260
const store = inject('stores')

const router = useRouter()

async function loadGames() {
  try {
    const data = await get({ type: 'database', route: 'getGames' })
    console.log('Dados recebidos:', data)
    // store.dialog.setDialog('DialogMessage', {
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

function playGame(args = {}) {
  router.push({
    name: 'GameDetails',
    params: { id: args.id },
  })
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped>
@import url('/src/assets/css/components/c-loadSessions.css');
</style>
