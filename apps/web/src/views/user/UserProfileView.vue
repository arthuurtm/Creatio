<template>
  <div class="user-profile-view">
    <!-- SKELETON DO PERFIL -->
    <div v-if="loading">
      <div class="profile-header mb-16">
        <div class="banner-gradient"></div>
        <v-container class="mt-n16 position-relative" style="z-index: 2">
          <div class="d-flex flex-column flex-md-row align-end ga-4 text-center text-md-left">
            <v-skeleton-loader type="avatar" width="120" height="120" class="rounded-circle" />
            <div class="pb-2 flex-grow-1">
              <v-skeleton-loader type="heading" width="200" class="mb-2" />
              <v-skeleton-loader type="text" width="120" />
            </div>
          </div>
        </v-container>
      </div>
      <v-container>
        <v-row class="mb-8">
          <v-col cols="12" sm="6">
            <v-skeleton-loader type="card" height="120" class="rounded-xl" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-skeleton-loader type="card" height="120" class="rounded-xl" />
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader type="card" height="180" class="rounded-xl" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- CONTEÚDO REAL DO PERFIL -->
    <div v-else>
      <!-- PROFILE HEADER BANNER -->
      <div class="profile-header mb-16">
        <div class="banner-gradient"></div>

        <v-container class="mt-n16 position-relative" style="z-index: 2">
          <div class="d-flex flex-column flex-md-row align-end ga-4 text-center text-md-left">
            <v-avatar size="120" class="profile-avatar bg-surface elevation-4">
              <v-img :src="userStore.profilePicture" cover>
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                    <span class="text-h4 font-weight-bold text-primary">
                      {{ userStore.name?.charAt(0).toUpperCase() || userStore.username?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </template>
              </v-img>
            </v-avatar>

            <div class="pb-2 flex-grow-1">
              <h1 class="text-h4 font-weight-bold tracking-tight">
                {{ userStore.name || userStore.username }}
              </h1>
              <div class="text-subtitle-1 text-medium-emphasis mb-2">
                @{{ userStore.username }}
              </div>
              <div class="d-flex ga-2 justify-center justify-md-start">
                <v-chip size="small" variant="tonal" color="primary" class="font-weight-medium">
                  Desenvolvedor
                </v-chip>
              </div>
            </div>
          </div>
        </v-container>
      </div>

      <!-- PROFILE CONTENT -->
      <v-container>
        <v-row class="mb-8">
          <v-col cols="12" sm="6">
            <v-card class="py-6 px-6 text-center" variant="outlined" flat>
              <v-icon color="primary" size="32" class="mb-2">folder</v-icon>
              <div class="text-h4 font-weight-bold text-high-emphasis">
                {{ myProjects.length }}
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">Projetos de Código</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card class="py-6 px-6 text-center" variant="outlined" flat>
              <v-icon color="secondary" size="32" class="mb-2">event</v-icon>
              <div class="text-h4 font-weight-bold text-high-emphasis">
                {{ lastUpdatedText }}
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">Última Atualização</div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="mb-8"></v-divider>

        <div>
          <h3 class="text-h5 font-weight-bold mb-6 d-flex align-center">
            <v-icon start color="primary">terminal</v-icon>
            Meus Códigos
            <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-bold">
              {{ myProjects.length }}
            </v-chip>
          </h3>

          <v-empty-state
            v-if="myProjects.length === 0"
            title="Nenhum código encontrado"
            text="Você ainda não criou nenhum projeto. Vá para Seus Projetos para começar!"
            icon="code"
          />

          <component-load-sessions
            v-else
            :items="myProjects"
            styleType="grade"
          />
        </div>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { useUserStore } from "@/stores";
import { http } from "@/functions";
import type { ProjectAttributes } from "@projeto/types";

const userStore = useUserStore();
const projectsLoading = ref(true);
const loading = computed(() => userStore.id === 0 || projectsLoading.value);
const myProjects = ref<ProjectAttributes[]>([]);

async function loadProjects(userId: number) {
  if (!userId) {
    projectsLoading.value = false;
    return;
  }
  try {
    projectsLoading.value = true;
    const res = await http.get({
      type: "database",
      route: "getProjects",
      querys: { userId },
    });
    myProjects.value = Object.values(res || {});
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
  } finally {
    projectsLoading.value = false;
  }
}

// Reage se o store for populado (primeira carga com fetch em andamento)
watch(
  () => userStore.id,
  (newId) => {
    if (newId) {
      loadProjects(newId);
    }
  },
  { immediate: true }
);

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
  }).format(maxDate);
});
</script>

<style scoped>
.profile-avatar {
  border: 4px solid rgb(var(--v-theme-surface));
}

/* Banner visível com gradiente rico */
.banner-gradient {
  height: 200px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  opacity: 0.35;
}

.tracking-tight {
  letter-spacing: -0.02em !important;
}
</style>
