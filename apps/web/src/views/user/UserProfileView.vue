<template>
  <div class="user-profile-view py-8 px-4 sm:px-6 max-w-5xl mx-auto min-h-full">
    <!-- SKELETON LOADERS -->
    <div v-if="loadingUser" class="flex flex-col gap-6">
      <n-card class="card-rounded p-4">
        <div class="flex items-center gap-6">
          <n-skeleton circle class="!h-24 !w-24 shrink-0" />
          <div class="flex flex-col gap-3 grow">
            <n-skeleton text style="width: 40%; height: 28px;" />
            <n-skeleton text style="width: 20%; height: 18px;" />
            <n-skeleton text style="width: 30%; height: 16px;" />
          </div>
        </div>
      </n-card>

      <n-card class="card-rounded p-6">
        <n-skeleton text style="width: 25%; height: 22px; margin-bottom: 24px;" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <n-skeleton height="120px" class="skeleton-rounded" />
          <n-skeleton height="120px" class="skeleton-rounded" />
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
      <n-card class="card-rounded" :bordered="true">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <!-- Avatar -->
            <n-avatar
              :size="88"
              class="profile-avatar shrink-0"
              :style="{ backgroundColor: 'var(--color-primary)' }"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="profileUser.nickname || profileUser.username"
                class="profile-avatar-img w-full h-full"
              />
              <span v-else>
                {{ (profileUser.nickname || profileUser.username)?.charAt(0).toUpperCase() }}
              </span>
            </n-avatar>

            <!-- User Info -->
            <div class="flex flex-col">
              <h1 class="profile-name m-0">
                {{ profileUser.nickname || profileUser.username }}
              </h1>
              <span class="profile-handle mt-1">
                @{{ profileUser.username }}
              </span>

              <!-- Estatísticas reais vindas das rotas -->
              <div class="profile-stats flex items-center gap-4 mt-3">
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
      <n-card class="card-rounded" :bordered="true" content-style="padding: 24px;">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-2">
            <h2 class="section-title m-0">Projetos públicos</h2>
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
                <n-icon size="14" depth="3"><SearchOutline /></n-icon>
              </template>
            </n-input>
          </div>
        </div>

        <!-- Skeletons de carregamento dos projetos -->
        <div v-if="loadingProjects" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <n-skeleton height="130px" class="skeleton-rounded" />
          <n-skeleton height="130px" class="skeleton-rounded" />
        </div>

        <!-- Estado vazio -->
        <n-empty
          v-else-if="filteredProjects.length === 0"
          :title="searchQuery ? 'Nenhum projeto encontrado com este termo' : 'Nenhum projeto publicado'"
          :description="searchQuery ? 'Tente buscar com outro termo.' : 'Este usuário ainda não criou nenhum projeto público.'"
          class="py-12"
        >
          <template #icon>
            <n-icon size="48" depth="3"><FolderOpenOutline /></n-icon>
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
            :class="{ 'is-clickable': isOwner }"
            @click="isOwner ? router.push({ name: 'CodeEdit', params: { id: project.id } }) : undefined"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="project-card-title m-0 grow">
                {{ project.title }}
              </h3>
              <n-tag size="small" round type="primary" :bordered="false" class="project-card-version shrink-0">
                v{{ project.version || '0.1.0' }}
              </n-tag>
            </div>

            <p class="project-card-desc m-0 mb-4 grow">
              {{ project.description || 'Sem descrição informada.' }}
            </p>

            <div class="project-card-footer flex items-center justify-between pt-3 mt-auto">
              <span class="flex items-center gap-1">
                <n-icon size="13"><TimeOutline /></n-icon>
                {{ formatDate(project.updatedAt || project.createdAt) }}
              </span>

              <span v-if="isOwner" class="project-card-action flex items-center gap-1">
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
.card-rounded {
  border-radius: 16px;
}
.skeleton-rounded {
  border-radius: 12px;
}
.profile-avatar {
  border-radius: 16px;
  border: 2px solid var(--color-border);
  color: #fff;
  font-size: 30px;
  font-weight: 700;
}
.profile-avatar-img {
  object-fit: cover;
  border-radius: 16px;
}
.profile-name {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text);
}
@media (min-width: 640px) {
  .profile-name {
    font-size: 30px;
  }
}
.profile-handle {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
}
.profile-stats {
  font-size: 12px;
  color: var(--color-text-3);
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.project-card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-card-version {
  font-family: ui-monospace, monospace;
  font-size: 11px;
}
.project-card-desc {
  font-size: 12px;
  color: var(--color-text-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}
.project-card-footer {
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-3);
}
.project-card-action {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 12px;
}

.project-item-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.project-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.project-item-card.is-clickable {
  cursor: pointer;
}
.project-item-card.is-clickable:hover {
  border-color: var(--color-primary);
}
</style>
