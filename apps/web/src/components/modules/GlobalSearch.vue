<template>
  <n-modal
    v-model:show="isOpen"
    preset="card"
    style="width: 560px; border-radius: 16px; align-self: flex-start; margin-top: 10vh;"
    :bordered="false"
    content-style="padding: 0; display: flex; flex-direction: column; overflow: hidden;"
  >
    <!-- Campo de busca -->
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px;">
      <n-icon size="18" color="rgba(var(--v-theme-on-surface), 0.6)"><Search /></n-icon>
      <n-input
        ref="searchInput"
        v-model:value="query"
        type="text"
        placeholder="Buscar usuários ou projetos..."
        style="flex-grow: 1;"
        :bordered="false"
        @input="onInput"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectCurrentResult"
        @keydown.esc.prevent="isOpen = false"
      />
      <n-spin
        v-if="loadingUsers || loadingProjects"
        size="small"
      />
      <span v-else style="font-size: 11px; opacity: 0.5;">Esc</span>
    </div>

    <n-divider style="margin: 0; opacity: 0.2;" />

    <!-- Resultados -->
    <div style="max-height: 380px; overflow-y: auto; padding: 0;">
      <div v-if="query">
        <div
          v-if="filteredUsers.length === 0 && filteredProjects.length === 0 && !loadingUsers && !loadingProjects"
          style="padding: 32px 16px; text-align: center; opacity: 0.6;"
        >
          <n-icon size="28" style="margin-bottom: 8px;"><SearchOffOutlined /></n-icon>
          <p style="font-size: 13px; margin: 0;">Nenhum resultado encontrado</p>
        </div>

        <n-list v-slot:default hoverable :bordered="false" style="padding: 8px;">
          <!-- Usuários -->
          <template v-if="filteredUsers.length > 0">
            <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.5px;">
              Usuários
            </div>
            <n-list-item
              v-for="(user, index) in filteredUsers"
              :key="'user-'+user.id"
              :class="['result-item', { 'active-item': activeIndex === index }]"
              @click="goToUser(user.username)"
              @mouseenter="activeIndex = index"
              style="cursor: pointer; border-radius: 8px; padding: 8px 12px; margin-bottom: 4px;"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <n-avatar round size="small" style="background-color: var(--n-primary-color); color: white;">
                    <img v-if="user.profilePicture" :src="user.profilePicture" style="object-fit: cover; width: 100%; height: 100%;" />
                    <span v-else>{{ user.username.charAt(0).toUpperCase() }}</span>
                  </n-avatar>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 14px; font-weight: 500;">{{ user.name || user.username }}</span>
                    <span style="font-size: 11px; opacity: 0.6;">@{{ user.username }}</span>
                  </div>
                </div>
              </div>
            </n-list-item>
          </template>

          <n-divider v-if="filteredUsers.length > 0 && filteredProjects.length > 0" style="margin: 8px 0; opacity: 0.2;" />

          <!-- Projetos -->
          <template v-if="filteredProjects.length > 0">
            <div style="padding: 4px 8px; font-size: 10px; font-weight: 700; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.5px;">
              Projetos públicos
            </div>
            <n-list-item
              v-for="(project, pIndex) in filteredProjects"
              :key="'project-'+project.id"
              :class="['result-item', { 'active-item': activeIndex === (pIndex + filteredUsers.length) }]"
              @click="goToProject(project.id)"
              @mouseenter="activeIndex = pIndex + filteredUsers.length"
              style="cursor: pointer; border-radius: 8px; padding: 8px 12px; margin-bottom: 4px;"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex-grow: 1;">
                  <n-avatar round size="small" style="background-color: rgba(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary));">
                    <n-icon size="16"><TerminalOutline /></n-icon>
                  </n-avatar>
                  <div style="display: flex; flex-direction: column; min-width: 0; flex-grow: 1;">
                    <span style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ project.title }}</span>
                    <span style="font-size: 11px; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">
                      {{ project.description || 'Sem descrição' }}
                    </span>
                  </div>
                </div>
              </div>
            </n-list-item>
          </template>
        </n-list>
      </div>

      <div v-else style="padding: 32px 16px; text-align: center; opacity: 0.5;">
        <n-icon size="28" style="margin-bottom: 8px;"><Search /></n-icon>
        <p style="font-size: 13px; margin: 0 0 4px 0;">Digite para buscar</p>
        <p style="font-size: 11px; opacity: 0.7; margin: 0;">Usuários requerem username exato</p>
      </div>
    </div>

    <template #action>
      <div style="display: flex; align-items: center; gap: 16px; opacity: 0.6; padding: 4px 8px;">
        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
          <kbd class="shortcut-key">↑↓</kbd>
          <span>navegar</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
          <kbd class="shortcut-key">↵</kbd>
          <span>abrir</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
          <kbd class="shortcut-key">Esc</kbd>
          <span>fechar</span>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue';
import { Search, TerminalOutline } from "@vicons/ionicons5";
import { SearchOffOutlined } from "@vicons/material";
import { useRouter } from 'vue-router';
import { http } from '@/utils';

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const searchInput = ref<any>(null);

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
      if (searchInput.value) {
        searchInput.value.focus();
      }
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
/* Item de resultado */
.result-item {
  transition: background 0.12s ease;
}

.active-item {
  background: rgba(var(--v-theme-primary), 0.08) !important;
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
