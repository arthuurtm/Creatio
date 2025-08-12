<template>
  <div class="games-grid" :class="styleType">
    <div class="title">
      <b>
        <h3 class="upper">{{ props.title }}</h3>
      </b>
    </div>

    <div class="content">
      <div class="scroll-button" id="left">
        <CreateButton
          v-if="isEnableScrollButton"
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

      <CreateLoading v-if="loading" />

      <div v-else-if="games && games.length > 0" class="sliding" ref="scrollContainer">
        <CreateCard :card="games" :styleType="cardsType" @emitEvent="reEmitEvent" />
      </div>

      <div v-else>
        <CreateButton
          :buttons="[
            {
              text: '🤔💭 nada por aqui...',
              position: 'center',
              class: 'symbolic no-padding no-scalling no-brightness',
              id: 'noGameFound',
              type: '',
            },
          ]"
        />
      </div>

      <div class="scroll-button" id="right">
        <CreateButton
          v-if="isEnableScrollButton"
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
import { ref, computed, onMounted } from 'vue'
import { get } from '@/functions'

const props = defineProps({
  url: {
    type: String,
    default: 'getGames',
  },
  title: {
    type: String,
    default: 'Jogos',
  },
  styleType: {
    type: String,
    default: 'line',
  },
  cardsType: {
    type: String,
  },
})
const emits = defineEmits(['emitEvent'])
const grids = ref({
  big: ['grade', 'spaced'],
  medium: ['line'],
  small: ['reduced', 'list'],
})
const games = ref([])
const loading = ref(true)
const scrollContainer = ref(null)
const scrollAmount = 260
const isEnableScrollButton = computed(() => {
  if (grids.value.big.includes(props.styleType) || grids.value.small.includes(props.styleType))
    return false
  return true
})

async function loadGames() {
  try {
    games.value = Object.values(await get({ type: 'database', route: props.url }))
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
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

function reEmitEvent(args = {}) {
  emits('emitEvent', args)
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped>
::-webkit-scrollbar {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: transparent;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

.games-grid {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* padding: 15px; */
}

.games-grid .content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  /* overflow-x: auto; */
  scroll-behavior: smooth;
}

.sliding {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  white-space: nowrap;
  box-sizing: border-box;
}

.games-grid.grade .content {
  scroll-behavior: unset;
}
.games-grid.grade .sliding {
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  align-items: flex-start;
}

.btn#left {
  display: grid;
  grid-column: 1;
  grid-row: 1;
}

.btn#right {
  display: grid;
  grid-column: 3;
  grid-row: 1;
}

#play-button {
  background-color: var(--discovery-play-button);
  z-index: 1;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .content .group-button {
    display: none;
  }
  #btn {
    display: none;
  }
  .sliding {
    gap: 0;
  }
}
</style>
