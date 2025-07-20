<template>
  <div class="ggrid" :class="gridType">
    <div class="title">
      <b>
        <h3 class="upper">{{ props.title }}</h3>
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

      <div v-if="loading"><CreateLoading /></div>

      <div v-else-if="games && games.length > 0" class="sliding" ref="scrollContainer">
        <CreateCard :card="games" @emitEvent="reEmitEvent" />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/functions'

const games = ref([])
const loading = ref(true)
const scrollContainer = ref(null)
const scrollAmount = 260

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
  },
})

const emits = defineEmits(['emitEvent'])
const router = useRouter()

const gridType = computed(() => {
  switch (props.styleType) {
    case 'grade':
      return 'grade'

    case 'list':
      return 'list'

    default:
      return 'line'
  }
})

async function loadGames() {
  try {
    const data = await get({ type: 'database', route: props.url })
    games.value = Array.isArray(data.details) ? data.details : []
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
@import url('/src/assets/css/components/c-loadSessions.css');
</style>
