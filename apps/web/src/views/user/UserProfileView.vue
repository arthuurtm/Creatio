<template>
  <div class="user-profile-view py-8 px-4 sm:px-6 max-w-5xl mx-auto min-h-full">
    <!-- SKELETON LOADERS -->
    <div v-if="loadingUser" class="flex flex-col gap-6">
      <n-card class="rounded-2xl p-4">
        <div class="flex items-center gap-6">
          <n-skeleton circle class="!h-24 !w-24 shrink-0" />
          <div class="flex flex-col gap-3 grow">
            <n-skeleton text style="width: 40%; height: 28px;" />
            <n-skeleton text style="width: 20%; height: 18px;" />
            <n-skeleton text style="width: 30%; height: 16px;" />
          </div>
        </div>
      </n-card>

      <n-card class="rounded-2xl p-6">
        <n-skeleton text style="width: 25%; height: 22px; margin-bottom: 24px;" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <n-skeleton height="120px" class="rounded-xl" />
          <n-skeleton height="120px" class="rounded-xl" />
        </div>
      </n-card>
    </div>

    <!-- USER NOT FOUND / ERROR -->
    <div v-else-if="userNotFound || !profileUser" class="py-16">
      <n-result
        status="404"
        title="Usuário não encontrado"
        :description="`O perfil @${usernameParam} não existe ou foi removido.`"
      >
        <template #footer>
          <n-button type="primary" round @click="router.push({ name: 'CodeProjects' })">
            Voltar aos projetos
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- MAIN PROFILE VIEW -->
    <div v-else class="flex flex-col gap-6">
      <!-- Profile Header Card -->
      <n-card class="rounded-2xl" :bordered="true">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <!-- Avatar -->
            <n-avatar
              :size="88"
              class="rounded-2xl border-2 border-[color:var(--n-border-color)] shrink-0 text-white text-3xl font-bold"
              :style="{ backgroundColor: 'var(--n-primary-color)' }"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="profileUser.nickname || profileUser.username"
                class="object-cover w-full h-full rounded-2xl"
              />
              <span v-else>
                {{ (profileUser.nickname || profileUser.username)?.charAt(0).toUpperCase() }}
              </span>
            </n-avatar>

            <!-- User Info -->
            <div class="flex flex-col">
              <h1 class="text-2xl sm:text-3xl font-bold m-0 leading-tight text-[color:var(--n-title-text-color)]">
                {{ profileUser.nickname || profileUser.username }}
              </h1>
              <span class="text-sm font-medium text-[color:var(--n-primary-color)] mt-1">
                @{{ profileUser.username }}
              </span>

              <!-- Estatísticas reais vindas das rotas -->
              <div class="flex items-center gap-4 mt-3 text-xs text-[color:var(--n-text-color-3)]">
                <span class="flex items-center gap-1.5">
                  <n-icon size="15"><CodeOutline /></n-icon>
                  <strong>{{ projects.length }}</strong> {{ projects.length === 1 ? 'projeto' : 'projetos' }}
                </span>
                <span v-if="lastActivityDate" class="flex items-center gap-1.5">
                  <n-icon size="15"><TimeOutline /></n-icon>
                  Última alteração: {{ lastActivityDate }}
                </span>
              </div>
            </div>
          </div>

          <!-- Ação para o proprietário da conta -->
          <div v-if="isOwner" class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <n-button
              type="primary"
              round
              size="medium"
              @click="router.push({ name: 'CodeNew' })"
            >
              <template #icon>
                <n-icon><AddOutline /></n-icon>
              </template>
              Novo Projeto
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Projects Section -->
      <n-card class="rounded-2xl" :bordered="true" content-style="padding: 24px;">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold m-0 text-[color:var(--n-title-text-color)]">Projetos públicos</h2>
            <n-tag size="small" round :bordered="false" type="primary">
              {{ filteredProjects.length }}
            </n-tag>
          </div>

          <!-- Filtro de busca se houver projetos -->
          <div v-if="projects.length > 2" class="w-full sm:w-64">
            <n-input
              v-model:value="searchQuery"
              placeholder="Buscar projetos..."
              size="small"
              clearable
              round
            >
              <template #prefix>
                <n-icon size="14" class="opacity-50"><SearchOutline /></n-icon>
              </template>
            </n-input>
          </div>
        </div>

        <!-- Skeletons de carregamento dos projetos -->
        <div v-if="loadingProjects" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <n-skeleton height="130px" class="rounded-xl" />
          <n-skeleton height="130px" class="rounded-xl" />
        </div>

        <!-- Estado vazio -->
        <n-empty
          v-else-if="filteredProjects.length === 0"
          :title="searchQuery ? 'Nenhum projeto encontrado com este termo' : 'Nenhum projeto publicado'"
          :description="searchQuery ? 'Tente buscar com outro termo.' : 'Este usuário ainda não criou nenhum projeto público.'"
          class="py-12"
        >
          <template #icon>
            <n-icon size="48" class="opacity-40"><FolderOpenOutline /></n-icon>
          </template>
          <template #extra v-if="isOwner && !searchQuery">
            <n-button type="primary" round size="small" @click="router.push({ name: 'CodeNew' })">
              Criar meu primeiro projeto
            </n-button>
          </template>
        </n-empty>

        <!-- Grid de Projetos -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-item-card"
            :class="{ 'cursor-pointer hover:border-[color:var(--n-primary-color)]': isOwner }"
            @click="isOwner ? router.push({ name: 'CodeEdit', params: { id: project.id } }) : undefined"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="text-base font-bold m-0 truncate text-[color:var(--n-title-text-color)] grow">
                {{ project.title }}
              </h3>
              <n-tag size="small" round type="primary" :bordered="false" class="shrink-0 font-mono text-[11px]">
                v{{ project.version || '0.1.0' }}
              </n-tag>
            </div>

            <p class="text-xs text-[color:var(--n-text-color-3)] m-0 mb-4 line-clamp-2 leading-relaxed grow">
              {{ project.description || 'Sem descrição informada.' }}
            </p>

            <div class="flex items-center justify-between pt-3 border-t border-[color:var(--n-border-color)] text-[11px] text-[color:var(--n-text-color-3)] mt-auto">
              <span class="flex items-center gap-1">
                <n-icon size="13"><TimeOutline /></n-icon>
                {{ formatDate(project.updatedAt || project.createdAt) }}
              </span>

              <span v-if="isOwner" class="text-[color:var(--n-primary-color)] font-medium text-xs flex items-center gap-1">
                Editar
              </span>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  CodeOutline,
  TimeOutline,
  AddOutline,
  FolderOpenOutline,
  SearchOutline,
} from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { http } from "@/utils";
import type { ProjectAttributes } from "@projeto/types";

interface PublicUserProfile {
  id: number;
  username: string;
  nickname: string | null;
  profilePic?: string | null;
  profilePicture?: string | null;
}

const props = defineProps<{ username?: string }>();
const userStore = useUserStore();
const router = useRouter();

const profileUser = ref<PublicUserProfile | null>(null);
const loadingUser = ref(true);
const userNotFound = ref(false);

const projects = ref<ProjectAttributes[]>([]);
const loadingProjects = ref(false);
const searchQuery = ref("");

const usernameParam = computed(() => props.username || userStore.username);

const avatarUrl = computed(() => {
  return profileUser.value?.profilePic || profileUser.value?.profilePicture || undefined;
});

const isOwner = computed(() => {
  return !!userStore.id && profileUser.value?.id === userStore.id;
});

const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return projects.value;
  return projects.value.filter((p) => {
    const titleMatch = p.title?.toLowerCase().includes(query);
    const descMatch = p.description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });
});

const lastActivityDate = computed(() => {
  if (!projects.value.length) return "";
  const dates = projects.value
    .map((p) => new Date(p.updatedAt || p.createdAt).getTime())
    .filter((t) => !isNaN(t));
  if (!dates.length) return "";
  return formatDate(new Date(Math.max(...dates)));
});

function formatDate(dateVal: any) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

async function loadProfileUser() {
  const targetUsername = props.username;

  // Se nenhum username foi passado ou se for o do usuário logado
  if (!targetUsername || targetUsername === userStore.username) {
    if (userStore.id) {
      profileUser.value = {
        id: userStore.id,
        username: userStore.username,
        nickname: userStore.name,
        profilePic: userStore.profilePicture,
      };
      userNotFound.value = false;
      loadingUser.value = false;
      await loadProjects(userStore.id);
      return;
    }
  }

  try {
    loadingUser.value = true;
    userNotFound.value = false;

    const res = await http.get({
      type: "database",
      route: "getUserBasics",
      querys: { login: targetUsername || userStore.username },
    });

    if (res && res.id) {
      profileUser.value = res;
      await loadProjects(res.id);
    } else {
      userNotFound.value = true;
      profileUser.value = null;
      projects.value = [];
    }
  } catch (err) {
    console.error("Erro ao carregar usuário:", err);
    userNotFound.value = true;
    profileUser.value = null;
    projects.value = [];
  } finally {
    loadingUser.value = false;
  }
}

async function loadProjects(userId: number) {
  try {
    loadingProjects.value = true;
    const res = await http.get({
      type: "database",
      route: "getProjects",
      querys: { userId },
    });
    projects.value = Array.isArray(res) ? res : Object.values(res || {});
  } catch (error) {
    console.error("Erro ao carregar projetos do usuário:", error);
    projects.value = [];
  } finally {
    loadingProjects.value = false;
  }
}

watch(
  () => props.username,
  () => {
    loadProfileUser();
  },
  { immediate: true },
);

watch(
  () => userStore.id,
  (newId) => {
    if (newId && (!props.username || props.username === userStore.username)) {
      loadProfileUser();
    }
  },
);
</script>

<style scoped>
.project-item-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
  background-color: var(--n-card-color);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.project-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
