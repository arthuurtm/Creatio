<template>
  <div class="creations-container">
    <header class="creations-header">
      <CGroup gap="1rem">
        <CButton icon="wand_stars" style="cursor: default" classes="symbolic no-padding" />
        <h2 class="page-title">Seus projetos</h2>
      </CGroup>

      <CGroup justify="between" align="center" gap="1rem" wrap>
        <CGroup grow width="400px">
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

          <CButton text="Criar Novo" icon="add" classes="primary" :action="() => criarNovoJogo()" />
        </CGroup>
      </CGroup>
    </header>

    <CGroup direction="column" gap="1rem" class="content-area">
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
  </div>
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
    const userId = userStore.getId
    const url = `getGames?filters=${encodeURIComponent(JSON.stringify({ userId }))}`
    allCreations.value = Object.values(await http.get({ type: 'database', route: url }))
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

<style scoped>
.creations-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 0 auto;
}
.creations-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  max-width: 1400px;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
}
.creations-count {
  font-size: 1rem;
  color: var(--secondary);
}

.controls-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.search-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.view-switcher {
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 4px;
}

:deep(.view-switcher .btn.active) {
  background-color: var(--primary-back);
  color: var(--primary-hover);
}

.content-area {
  padding-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--secondary);
  font-size: 1.1rem;
}
</style>
