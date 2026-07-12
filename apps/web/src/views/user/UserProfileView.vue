<template>
  <div class="user-profile-view bg-background py-6 py-md-10 fill-height">
    <v-container class="max-width-1000 mx-auto">
      
      <!-- SKELETON LOADERS -->
      <div v-if="loading || loadingUser">
        <v-card class="pa-6 mb-6 border-sm" color="surface">
          <v-row align="center">
            <v-col cols="auto">
              <v-skeleton-loader type="avatar" size="100" class="rounded-0" />
            </v-col>
            <v-col>
              <v-skeleton-loader type="heading" width="200" />
              <v-skeleton-loader type="subtitle" width="120" class="mt-2" />
            </v-col>
          </v-row>
        </v-card>
      </div>

      <!-- MAIN PROFILE BOX -->
      <div v-else-if="profileUser">
        
        <!-- Header Profile Card -->
        <v-card
          class="pa-6 mb-6 border-sm steam-profile-header position-relative overflow-hidden"
          color="surface"
        >
          <v-row align="center" justify="space-between" class="ga-4">
            <v-col cols="12" md="7" class="d-flex flex-column flex-sm-row align-center align-sm-start ga-6 text-center text-sm-left">
              <!-- Square Steam Avatar with status glow border -->
              <div class="steam-avatar-container">
                <v-avatar
                  size="110"
                  rounded="0"
                  class="steam-avatar border-sm"
                  :class="isOnline ? 'border-success' : 'border-secondary'"
                  style="border-width: 3px !important;"
                >
                  <v-img :src="profileUser.profilePicture || ''" cover>
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-surface-container text-h3 text-primary font-weight-bold">
                        {{ profileUser.name?.charAt(0).toUpperCase() || profileUser.username?.charAt(0).toUpperCase() }}
                      </div>
                    </template>
                  </v-img>
                </v-avatar>
              </div>

              <!-- User Info -->
              <div class="flex-grow-1 pt-1">
                <h1 class="text-h4 font-weight-bold text-high-emphasis tracking-tight mb-1">
                  {{ profileUser.name || profileUser.username }}
                </h1>
                <div class="text-subtitle-1 text-primary font-weight-medium mb-3">
                  @{{ profileUser.username }}
                </div>
                
                <!-- Status text -->
                <div class="d-flex align-center justify-center justify-sm-start ga-2">
                  <div class="status-indicator" :class="isOnline ? 'bg-success' : 'bg-secondary'"></div>
                  <span class="text-caption font-weight-bold text-uppercase" :class="isOnline ? 'text-success' : 'text-medium-emphasis'">
                    {{ isOnline ? 'Online / Desenvolvendo' : 'Offline' }}
                  </span>
                </div>
              </div>
            </v-col>

            <!-- Steam Level circular badge -->
            <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center text-center">
              <div class="steam-level-box pa-3 rounded-sm border-sm bg-background w-100 max-width-180">
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">Nível</div>
                <div class="d-flex align-center justify-center ga-2">
                  <v-avatar size="32" color="primary" class="font-weight-bold text-subtitle-2 rounded-circle">
                    {{ developerLevel }}
                  </v-avatar>
                  <span class="text-body-2 font-weight-bold text-high-emphasis">Desenvolvedor</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- Body layout splits -->
        <v-row>
          <!-- Left Main Area: Featured Project + Project List -->
          <v-col cols="12" md="8" class="d-flex flex-column ga-6">
            
            <!-- Featured Project Showcase -->
            <v-card v-if="featuredProject" class="border-sm" color="surface">
              <div class="px-6 py-4 border-b bg-surface-container d-flex align-center justify-space-between">
                <h3 class="text-subtitle-2 font-weight-bold text-primary text-uppercase tracking-wider">> Destaque de Código</h3>
                <v-chip size="x-small" color="success" variant="flat" rounded="xs" class="font-weight-bold">MAIS RECENTE</v-chip>
              </div>

              <div class="pa-6">
                <h2 class="text-h5 font-weight-bold text-high-emphasis mb-2">
                  {{ featuredProject.title }}
                </h2>
                <div class="text-caption text-medium-emphasis mb-4">
                  Última alteração em {{ formatDate(featuredProject.updatedAt || featuredProject.createdAt) }}
                </div>
                <p class="text-body-2 text-medium-emphasis mb-6">
                  {{ featuredProject.description || "Este projeto não possui uma descrição cadastrada." }}
                </p>

                <div class="d-flex flex-wrap align-center justify-space-between ga-4">
                  <div class="d-flex ga-4 text-caption text-medium-emphasis">
                    <span>Versão: <strong class="text-high-emphasis">v{{ featuredProject.version || '1.0.0' }}</strong></span>
                  </div>
                  <v-btn
                    color="success"
                    size="small"
                    prepend-icon="play_arrow"
                    class="text-none font-weight-bold"
                    @click="router.push({ name: 'CodeEdit', params: { id: featuredProject.id } })"
                  >
                    Abrir no Editor
                  </v-btn>
                </div>
              </div>
            </v-card>

            <!-- Other Projects list -->
            <v-card class="border-sm" color="surface">
              <div class="px-6 py-4 border-b bg-surface-container">
                <h3 class="text-subtitle-2 font-weight-bold text-primary text-uppercase tracking-wider">> Todos os códigos ({{ myProjects.length }})</h3>
              </div>
              
              <div class="pa-6">
                <v-empty-state
                  v-if="myProjects.length === 0"
                  title="Nenhum código encontrado"
                  text="Este usuário ainda não criou nenhum projeto de código."
                  icon="code"
                  density="compact"
                />

                <v-row v-slot:default v-else dense>
                  <v-col
                    v-for="proj in myProjects"
                    :key="proj.id"
                    cols="12"
                    sm="6"
                  >
                    <v-card
                      variant="outlined"
                      class="pa-4 rounded-xs cursor-pointer hover-card d-flex flex-column h-100"
                      color="secondary"
                      @click="router.push({ name: 'CodeEdit', params: { id: proj.id } })"
                    >
                      <div class="d-flex align-start justify-space-between mb-2">
                        <div class="text-body-1 font-weight-bold text-truncate pr-2" style="max-width: 180px;">
                          {{ proj.title }}
                        </div>
                        <v-chip size="x-small" variant="outlined" color="primary" rounded="xs">
                          v{{ proj.version || '1.0.0' }}
                        </v-chip>
                      </div>
                      <div class="text-caption text-medium-emphasis mb-4 text-truncate">
                        {{ proj.description || 'Sem descrição' }}
                      </div>
                      <v-spacer />
                      <div class="text-caption opacity-60 text-right mt-1">
                        Modificado: {{ formatDateShort(proj.updatedAt || proj.createdAt) }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-card>

          </v-col>

          <!-- Right Sidebar: Statistics -->
          <v-col cols="12" md="4" class="d-flex flex-column ga-6">
            
            <v-card class="pa-6 border-sm" color="surface">
              <h3 class="text-subtitle-2 font-weight-bold text-primary text-uppercase tracking-wider mb-4">> Estatísticas</h3>
              
              <div class="d-flex flex-column ga-4">
                <div class="d-flex align-center justify-space-between border-b pb-2">
                  <div class="text-body-2 text-medium-emphasis">Projetos Criados</div>
                  <div class="text-h6 font-weight-bold text-high-emphasis">{{ myProjects.length }}</div>
                </div>

                <div class="d-flex align-center justify-space-between border-b pb-2">
                  <div class="text-body-2 text-medium-emphasis">Nível Desenvolvedor</div>
                  <div class="text-h6 font-weight-bold text-high-emphasis">{{ developerLevel }}</div>
                </div>

                <div class="d-flex align-center justify-space-between pb-2">
                  <div class="text-body-2 text-medium-emphasis">Último Acesso</div>
                  <div class="text-body-2 font-weight-bold text-high-emphasis">{{ lastUpdatedText }}</div>
                </div>
              </div>
            </v-card>

            <!-- Steam Group-like Card -->
            <v-card class="pa-6 border-sm" color="surface">
              <h3 class="text-subtitle-2 font-weight-bold text-primary text-uppercase tracking-wider mb-2">> Grupo Principal</h3>
              <div class="d-flex align-center ga-3 mt-2">
                <v-avatar color="primary" class="rounded-sm" size="44">
                  <v-icon color="white">hub</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold text-high-emphasis">Creatio Developers</div>
                  <div class="text-caption text-medium-emphasis">Membros Oficiais</div>
                </div>
              </div>
            </v-card>

          </v-col>
        </v-row>

      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { http } from "@/utils";
import type { ProjectAttributes } from "@projeto/types";

const props = defineProps<{ username?: string }>();
const userStore = useUserStore();
const router = useRouter();

const profileUser = ref<any>(null);
const loadingUser = ref(true);

const projectsLoading = ref(true);
const loading = computed(() => projectsLoading.value);
const myProjects = ref<ProjectAttributes[]>([]);

// Status online simulado
const isOnline = computed(() => {
  if (!profileUser.value) return false;
  if (profileUser.value.id === userStore.id) return true;
  return myProjects.value.some(p => {
    const elapsed = Date.now() - new Date(p.updatedAt).getTime();
    return elapsed < 24 * 60 * 60 * 1000;
  });
});

const developerLevel = computed(() => {
  return Math.floor(myProjects.value.length * 3) + 1;
});

const featuredProject = computed(() => {
  if (myProjects.value.length === 0) return null;
  return [...myProjects.value].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  )[0];
});

async function loadProfileUser() {
  if (!props.username || props.username === userStore.username) {
    profileUser.value = {
      id: userStore.id,
      username: userStore.username,
      name: userStore.name,
      profilePicture: userStore.profilePicture,
    };
    loadingUser.value = false;
    if (userStore.id) {
      await loadProjects(userStore.id);
    }
    return;
  }

  try {
    loadingUser.value = true;
    const res = await http.get({
      type: "database",
      route: "getUserBasics",
      querys: { login: props.username },
    });
    profileUser.value = res;
    if (res?.id) {
      await loadProjects(res.id);
    }
  } catch (err) {
    console.error("Falha ao carregar dados do perfil:", err);
    profileUser.value = {
      id: userStore.id,
      username: userStore.username,
      name: userStore.name,
      profilePicture: userStore.profilePicture,
    };
    if (userStore.id) {
      await loadProjects(userStore.id);
    }
  } finally {
    loadingUser.value = false;
  }
}

async function loadProjects(userId: number) {
  try {
    projectsLoading.value = true;
    const res = await http.get({
      type: "database",
      route: "getProjects",
      querys: { userId },
    });
    myProjects.value = Object.values(res || {});
  } catch (error) {
    console.error("Erro ao carregar projetos do usuário:", error);
  } finally {
    projectsLoading.value = false;
  }
}

function formatDate(dateVal: any) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
  } catch {
    return String(dateVal);
  }
}

function formatDateShort(dateVal: any) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
  } catch {
    return String(dateVal);
  }
}

const lastUpdatedText = computed(() => {
  if (myProjects.value.length === 0) return "N/A";
  const dates = myProjects.value
    .map((p) => new Date(p.updatedAt).getTime())
    .filter((t) => !isNaN(t));
  if (dates.length === 0) return "N/A";
  const maxDate = new Date(Math.max(...dates));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(maxDate);
});

// Watchers
watch(
  () => props.username,
  () => {
    loadProfileUser();
  },
  { immediate: true }
);

watch(
  () => userStore.id,
  (newId) => {
    if (newId && !props.username) {
      loadProfileUser();
    }
  }
);
</script>

<style scoped>
.max-width-1000 {
  max-width: 1000px;
}
.steam-level-box {
  border-color: rgba(var(--v-theme-primary), 0.2) !important;
}
.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.hover-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.15) !important;
}
</style>
