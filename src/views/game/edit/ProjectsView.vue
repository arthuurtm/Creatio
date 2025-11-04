<template>
  <CGroup direction="column" grow>
    <CGroup direction="column" max-width="1240px" margin="1rem auto">
      <CGroup justify="between" :align="'center'" gap="1rem">
        <CGroup width="400px">
          <CInputText type="search" placeholder="Buscar por nome..." icon="search" class="fill" />
        </CGroup>

        <CGroup gap="1rem">
          <CGroup gap="0.5rem" background="var(--bg2)" padding="0.5rem" radius="50px" inline>
            <CButton
              v-for="(btn, index) in [
                {
                  icon: 'grid_view',
                  classes: currentView === 'grade' ? 'active' : '',
                  action: () => setView('grade'),
                },
                {
                  icon: 'view_list',
                  classes: currentView === 'list' ? 'active' : '',
                  action: () => setView('list'),
                },
                {
                  icon: 'view_stream',
                  classes: currentView === 'line' ? 'active' : '',
                  action: () => setView('line'),
                },
              ]"
              :key="index"
              :="btn"
              @click="btn.action"
            />
          </CGroup>

          <CButton text="Criar Novo" icon="add" classes="primary" @click="() => criarNovoJogo()" />
        </CGroup>
      </CGroup>
    </CGroup>

    <CGroup direction="column" gap="1rem" class="content-area" grow>
      <CLoading v-if="loading" />
      <div v-else-if="filteredCreations.length === 0" class="empty-state">
        <p v-if="allCreations.length > 0">Nenhum item encontrado para "{{ searchQuery }}"</p>
        <p v-else>Você ainda não tem criações. Que tal começar uma agora?</p>
      </div>
      <ComponentLoadSessions
        v-else
        :key="currentView"
        :items="filteredCreations"
        :style-type="currentView"
      />
    </CGroup>
  </CGroup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ComponentLoadSessions from '@/components/modules/ComponentLoadSessions.vue'
import { http } from '@/functions'
import { showToast } from '@/plugins/toast'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const router = useRouter()
const allCreations = ref([])
const loading = ref(true)
const currentView = ref('grade')
const searchQuery = ref('')

const filteredCreations = computed(() => {
  const list = !searchQuery.value
    ? allCreations.value
    : allCreations.value.filter((creation) =>
        creation.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )

  return list.map((creation) => ({
    ...creation,
    action: () => loadEditTool(creation),
  }))
})

async function fetchMyCreations() {
  loading.value = true
  try {
    allCreations.value = Object.values(
      await http.get({ type: 'database', route: 'getGames', query: { userId: userStore.getId } }),
    )
  } catch (error) {
    showToast({ type: 'error', message: 'Falha ao carregar suas criações.' })
  } finally {
    loading.value = false
  }
}

function setView(view) {
  currentView.value = view
}

function loadEditTool(params) {
  router.push({ name: 'EditGame', params })
}

async function criarNovoJogo() {
  let result
  try {
    result = await http.post({ type: 'database', route: 'setGame' }, { title: 'Novo Jogo' })
  } catch (error) {
    showToast({ type: 'error', message: error.message })
  }
  router.push({ name: 'EditGame', params: { id: result.id } })
}

onMounted(fetchMyCreations)
</script>
