<template>
  <div class="user-profile-view py-6 py-md-10 min-h-full p-6">
    <div class="max-w-[1000px] mx-auto">
      
      <!-- SKELETON LOADERS -->
      <div v-if="loading || loadingUser">
        <n-card class="rounded-2xl mb-6 p-3">
          <n-space align="center" :size="24">
            <n-skeleton circle class="h-[100px] w-[100px]" />
            <n-space vertical :size="12">
              <n-skeleton text class="w-50 h-8" />
              <n-skeleton text class="w-30 h-5" />
            </n-space>
          </n-space>
        </n-card>
      </div>

      <!-- MAIN PROFILE BOX -->
      <div v-else-if="profileUser">
        
        <!-- Header Profile Card -->
        <n-card
          class="rounded-2xl mb-6 px-2 py-3"
          :bordered="true"
        >
          <n-grid cols="12" item-responsive x-gap="24" y-gap="24">
            <!-- User Info (left) -->
            <n-gi span="12 m8">
              <n-space align="start" :size="24" class="flex-nowrap">
                <!-- Avatar -->
                <n-avatar
                  :size="110"
                  class="rounded-lg border-[3px] shrink-0"
                  :style="{
                    backgroundColor: 'var(--n-primary-color)',
                    borderColor: isOnline ? 'var(--n-success-color)' : 'var(--n-border-color)'
                  }"
                >
                  <img v-if="profileUser.profilePicture" :src="profileUser.profilePicture" class="object-cover w-full h-full" />
                  <span v-else class="text-3xl text-white">
                    {{ profileUser.name?.charAt(0).toUpperCase() || profileUser.username?.charAt(0).toUpperCase() }}
                  </span>
                </n-avatar>

                <!-- Details -->
                <div class="pt-1">
                  <h1 class="text-3xl font-bold m-0 leading-tight">
                    {{ profileUser.name || profileUser.username }}
                  </h1>
                  <div class="text-[15px] text-[color:var(--n-primary-color)] font-medium mt-1 mb-3">
                    @{{ profileUser.username }}
                  </div>
                  
                  <!-- Status -->
                  <n-space align="center" :size="8">
                    <div 
                      class="w-2.5 h-2.5 rounded-full" 
                      :style="{ backgroundColor: isOnline ? 'var(--n-success-color)' : 'var(--n-border-color)' }"
                    ></div>
                    <span 
                      class="text-[11px] font-bold uppercase"
                      :style="{ color: isOnline ? 'var(--n-success-color)' : 'var(--n-text-color-3)' }"
                    >
                      {{ isOnline ? 'Online / Desenvolvendo' : 'Offline' }}
                    </span>
                  </n-space>
                </div>
              </n-space>
            </n-gi>

            <!-- Level (right) -->
            <n-gi span="12 m4" class="flex items-center justify-center">
              <div 
                class="px-4 py-3 rounded-lg border border-[color:var(--n-border-color)] bg-[color:var(--n-card-color)] w-full max-w-[180px] text-center"
              >
                <div class="text-[11px] opacity-60 font-bold uppercase mb-1.5">Nível</div>
                <n-space align="center" justify="center" :size="8">
                  <n-avatar round size="small" class="text-white font-bold" :style="{ backgroundColor: 'var(--n-primary-color)' }">
                    {{ developerLevel }}
                  </n-avatar>
                  <span class="text-xs font-bold">Desenvolvedor</span>
                </n-space>
              </div>
            </n-gi>
          </n-grid>
        </n-card>

        <!-- Body layout splits -->
        <n-grid cols="12" x-gap="24" y-gap="24" item-responsive>
          <!-- Left Main Area: Featured Project + Project List -->
          <n-gi span="12 m8">
            <div class="flex flex-col gap-6">
              
              <!-- Featured Project Showcase -->
              <n-card v-if="featuredProject" class="rounded-2xl" content-style="padding: 0;">
                <div class="px-6 py-3 border-b border-[color:var(--n-border-color)] bg-[color:var(--n-action-color)] flex items-center justify-between">
                  <h3 class="text-xs font-bold text-[color:var(--n-primary-color)] uppercase tracking-wider m-0">
                    &gt; Destaque de Código
                  </h3>
                  <n-tag type="success" size="small" round>MAIS RECENTE</n-tag>
                </div>

                <div class="p-6">
                  <h2 class="text-xl font-bold m-0 mb-2">
                    {{ featuredProject.title }}
                  </h2>
                  <div class="text-xs opacity-60 mb-4">
                    Última alteração em {{ formatDate(featuredProject.updatedAt || featuredProject.createdAt) }}
                  </div>
                  <p class="text-sm opacity-80 mb-6 leading-relaxed">
                    {{ featuredProject.description || "Este projeto não possui uma descrição cadastrada." }}
                  </p>

                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="text-xs opacity-80">
                      Versão: <strong>v{{ featuredProject.version || '1.0.0' }}</strong>
                    </div>
                    <n-button
                      type="success"
                      size="small"
                      round
                      @click="router.push({ name: 'CodeEdit', params: { id: featuredProject.id } })"
                    >
                      <template #icon>
                        <n-icon><Play /></n-icon>
                      </template>
                      Abrir no Editor
                    </n-button>
                  </div>
                </div>
              </n-card>

              <!-- Other Projects list -->
              <n-card class="rounded-2xl" content-style="padding: 0;">
                <div class="px-6 py-3 border-b border-[color:var(--n-border-color)] bg-[color:var(--n-action-color)]">
                  <h3 class="text-xs font-bold text-[color:var(--n-primary-color)] uppercase tracking-wider m-0">
                    &gt; Todos os códigos ({{ myProjects.length }})
                  </h3>
                </div>
                
                <div class="p-6">
                  <n-empty
                    v-if="myProjects.length === 0"
                    title="Nenhum código encontrado"
                    description="Este usuário ainda não criou nenhum projeto de código."
                  >
                    <template #icon>
                      <n-icon size="48"><CodeOutline /></n-icon>
                    </template>
                  </n-empty>

                  <n-grid v-else cols="2" x-gap="16" y-gap="16" item-responsive>
                    <n-gi
                      v-for="proj in myProjects"
                      :key="proj.id"
                      span="2 s1"
                    >
                      <div
                        @click="router.push({ name: 'CodeEdit', params: { id: proj.id } })"
                        class="project-card-custom"
                      >
                        <div class="flex items-start justify-between mb-2">
                          <div class="text-sm font-bold truncate pr-2 grow">
                            {{ proj.title }}
                          </div>
                          <n-tag size="small" type="primary" round class="shrink-0">
                            v{{ proj.version || '1.0.0' }}
                          </n-tag>
                        </div>
                        <div class="text-xs opacity-70 mb-4 min-h-[18px] line-clamp-2">
                          {{ proj.description || 'Sem descrição' }}
                        </div>
                        <div class="text-[10px] opacity-50 text-right mt-auto">
                          Modificado: {{ formatDateShort(proj.updatedAt || proj.createdAt) }}
                        </div>
                      </div>
                    </n-gi>
                  </n-grid>
                </div>
              </n-card>

            </div>
          </n-gi>

          <!-- Right Sidebar: Statistics -->
          <n-gi span="12 m4">
            <div class="flex flex-col gap-6">
              
              <!-- Statistics Card -->
              <n-card class="rounded-2xl">
                <h3 class="text-xs font-bold text-[color:var(--n-primary-color)] uppercase tracking-wider m-0 mb-4">
                  &gt; Estatísticas
                </h3>
                
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between border-b border-[color:var(--n-border-color)] pb-2">
                    <span class="text-xs opacity-70">Projetos Criados</span>
                    <span class="text-lg font-bold">{{ myProjects.length }}</span>
                  </div>

                  <div class="flex items-center justify-between border-b border-[color:var(--n-border-color)] pb-2">
                    <span class="text-xs opacity-70">Nível Desenvolvedor</span>
                    <span class="text-lg font-bold">{{ developerLevel }}</span>
                  </div>

                  <div class="flex items-center justify-between pb-2">
                    <span class="text-xs opacity-70">Último Acesso</span>
                    <span class="text-xs font-bold">{{ lastUpdatedText }}</span>
                  </div>
                </div>
              </n-card>

              <!-- Main Group Card -->
              <n-card class="rounded-2xl">
                <h3 class="text-xs font-bold text-[color:var(--n-primary-color)] uppercase tracking-wider m-0 mb-4">
                  &gt; Grupo Principal
                </h3>
                <div class="flex items-center gap-3 mt-2">
                  <n-avatar round class="text-white" :style="{ backgroundColor: 'var(--n-primary-color)' }">
                    <n-icon size="20"><HubOutlined /></n-icon>
                  </n-avatar>
                  <div>
                    <div class="text-[13px] font-bold">Creatio Developers</div>
                    <div class="text-[11px] opacity-70">Membros Oficiais</div>
                  </div>
                </div>
              </n-card>

            </div>
          </n-gi>
        </n-grid>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Play, CodeOutline } from "@vicons/ionicons5";
import { HubOutlined } from "@vicons/material";
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
.project-card-custom {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
  background-color: var(--n-card-color);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.project-card-custom:hover {
  transform: translateY(-2px);
  border-color: var(--n-primary-color);
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.15);
}
</style>
