<template>
  <COverlay
    v-model="isOpen"
    type="search"
    :show-close="false"
    :divider="false"
    glass
  >
    <!-- Campo de busca -->
    <div class="search-header px-4 py-3 d-flex align-center ga-3">
      <v-icon size="18" color="medium-emphasis">search</v-icon>
      <v-text-field
        ref="searchInput"
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Buscar usuários ou projetos..."
        variant="plain"
        hide-details
        density="compact"
        @input="onInput"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectCurrentResult"
        @keydown.esc.prevent="isOpen = false"
      />
      <v-progress-circular
        v-if="loadingUsers || loadingProjects"
        indeterminate
        size="16"
        width="2"
        color="primary"
      />
      <v-icon v-else size="16" color="medium-emphasis" style="opacity: 0.4;">keyboard_esc</v-icon>
    </div>

    <v-divider class="opacity-20" />

    <!-- Resultados -->
    <div class="search-results px-2 py-2" v-if="query">
      <div
        v-if="filteredUsers.length === 0 && filteredProjects.length === 0 && !loadingUsers && !loadingProjects"
        class="px-4 py-8 text-center text-medium-emphasis"
      >
        <v-icon size="28" class="mb-2 opacity-30">search_off</v-icon>
        <p class="text-body-2 mb-0">Nenhum resultado encontrado</p>
      </div>

      <v-list bg-color="transparent" class="py-0">
        <!-- Usuários -->
        <template v-if="filteredUsers.length > 0">
          <div class="result-group-label px-3 pt-1 pb-2">Usuários</div>
          <v-list-item
            v-for="(user, index) in filteredUsers"
            :key="'user-'+user.id"
            :class="['result-item', { 'active-item': activeIndex === index }]"
            rounded="lg"
            @click="goToUser(user.username)"
            @mouseenter="activeIndex = index"
          >
            <template v-slot:prepend>
              <v-avatar size="30" color="primary" rounded="lg" class="mr-3">
                <v-img v-if="user.profilePicture" :src="user.profilePicture" />
                <span v-else class="text-caption font-weight-bold">{{ user.username.charAt(0).toUpperCase() }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium text-body-2">{{ user.name || user.username }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption opacity-50">@{{ user.username }}</v-list-item-subtitle>
          </v-list-item>
        </template>

        <v-divider v-if="filteredUsers.length > 0 && filteredProjects.length > 0" class="my-2 opacity-20" />

        <!-- Projetos -->
        <template v-if="filteredProjects.length > 0">
          <div class="result-group-label px-3 pt-1 pb-2">Projetos públicos</div>
          <v-list-item
            v-for="(project, pIndex) in filteredProjects"
            :key="'project-'+project.id"
            :class="['result-item', { 'active-item': activeIndex === (pIndex + filteredUsers.length) }]"
            rounded="lg"
            @click="goToProject(project.id)"
            @mouseenter="activeIndex = pIndex + filteredUsers.length"
          >
            <template v-slot:prepend>
              <div class="project-icon mr-3">
                <v-icon size="16" color="primary">terminal</v-icon>
              </div>
            </template>
            <v-list-item-title class="font-weight-medium text-body-2">{{ project.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption opacity-50 text-truncate" style="max-width: 400px;">
              {{ project.description || 'Sem descrição' }}
            </v-list-item-subtitle>
          </v-list-item>
        </template>
      </v-list>
    </div>

    <div v-else class="px-4 py-8 text-center">
      <v-icon size="28" class="mb-2 opacity-20">search</v-icon>
      <p class="text-body-2 text-medium-emphasis mb-1">Digite para buscar</p>
      <p class="text-caption opacity-40">Usuários requerem username exato</p>
    </div>

    <v-divider class="opacity-20" />

    <!-- Rodapé de atalhos -->
    <div class="search-footer px-4 py-2 d-flex align-center ga-3">
      <div class="d-flex align-center ga-1 text-caption opacity-40">
        <kbd class="shortcut-key">↑↓</kbd>
        <span>navegar</span>
      </div>
      <div class="d-flex align-center ga-1 text-caption opacity-40">
        <kbd class="shortcut-key">↵</kbd>
        <span>abrir</span>
      </div>
      <div class="d-flex align-center ga-1 text-caption opacity-40">
        <kbd class="shortcut-key">Esc</kbd>
        <span>fechar</span>
      </div>
    </div>
  </COverlay>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/functions';

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const loadingProjects = ref(false);
const loadingUsers = ref(false);

const allPublicProjects = ref<any[]>([]);
const foundUsers = ref<any[]>([]);

const activeIndex = ref(0);
let userSearchTimeout: any = null;

const totalResults = computed(() => filteredUsers.value.length + filteredProjects.value.length);

const filteredProjects = computed(() => {
  if (!query.value.trim()) return [];
  const q = query.value.toLowerCase();
  return allPublicProjects.value
    .filter(p => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
    .slice(0, 10);
});

const filteredUsers = computed(() => foundUsers.value);

function open() {
  isOpen.value = true;
  query.value = '';
  foundUsers.value = [];
  activeIndex.value = 0;

  if (allPublicProjects.value.length === 0) {
    loadProjects();
  }
}

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

watch(query, () => {
  activeIndex.value = 0;
});

async function loadProjects() {
  try {
    loadingProjects.value = true;
    const res = await http.get({ type: "database", route: "getProjects" });
    allPublicProjects.value = Object.values(res || {});
  } catch (err) {
    console.error("Falha ao carregar projetos globais", err);
  } finally {
    loadingProjects.value = false;
  }
}

function onInput() {
  clearTimeout(userSearchTimeout);
  if (!query.value.trim()) {
    foundUsers.value = [];
    return;
  }

  userSearchTimeout = setTimeout(async () => {
    try {
      loadingUsers.value = true;
      const res = await http.get({
        type: "database",
        route: "getUserBasics",
        querys: { login: query.value.trim() }
      });
      foundUsers.value = [res];
    } catch (err: any) {
      foundUsers.value = [];
    } finally {
      loadingUsers.value = false;
    }
  }, 400);
}

function navigateResults(direction: number) {
  if (totalResults.value === 0) return;
  activeIndex.value = (activeIndex.value + direction + totalResults.value) % totalResults.value;
}

function selectCurrentResult() {
  if (totalResults.value === 0) return;

  if (activeIndex.value < filteredUsers.value.length) {
    goToUser(filteredUsers.value[activeIndex.value].username);
  } else {
    const projectIndex = activeIndex.value - filteredUsers.value.length;
    goToProject(filteredProjects.value[projectIndex].id);
  }
}

function goToUser(username: string) {
  isOpen.value = false;
  router.push({ name: "UserProfile", params: { username } });
}

function goToProject(projectId: number) {
  isOpen.value = false;
  router.push({ name: "CodeEdit", params: { id: projectId } });
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    open();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

defineExpose({ open });
</script>

<style scoped>
.search-input :deep(.v-field__input) {
  padding: 0 !important;
  min-height: 0 !important;
  line-height: 1.4 !important;
}

.search-input :deep(.v-field--variant-plain) {
  opacity: 1 !important;
}

/* Label de grupo de resultados */
.result-group-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.35);
}

/* Ícone do projeto */
.project-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Item de resultado */
.result-item {
  transition: background 0.12s ease;
}

.active-item {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

/* Rodapé */
.search-footer {
  border-top: none;
}

/* Teclas de atalho */
.shortcut-key {
  font-size: 0.6rem;
  font-family: inherit;
  font-style: normal;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.4);
}
</style>
