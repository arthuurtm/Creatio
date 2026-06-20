<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="height: 50vh">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>

  <div v-else>
    <!-- PROFILE HEADER BANNER -->
    <div class="profile-header mb-16">
      <div class="banner-gradient"></div>

      <v-container class="mt-n16 position-relative" style="z-index: 2">
        <div class="d-flex flex-column flex-md-row align-end gap-4 text-center text-md-left">
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
            <div class="d-flex gap-2 justify-center justify-md-start">
              <v-chip size="small" variant="tonal" color="primary" class="font-weight-medium">
                Desenvolvedor
              </v-chip>
            </div>
          </div>

          <div class="pb-4">
            <v-dialog fullscreen v-model="settingsOpen">
              <template #activator="{ props }">
                <v-btn v-bind="props" prepend-icon="settings" variant="tonal" class="rounded-lg">
                  Configurações
                </v-btn>
              </template>
              <v-card rounded="0">
                <v-toolbar title="Configurações" class="rounded-0" density="compact">
                  <v-spacer />
                  <v-btn icon="close" variant="text" @click="settingsOpen = false"></v-btn>
                </v-toolbar>
                <v-card-text class="pa-0">
                  <dialog-settings />
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text="Fechar" @click="settingsOpen = false"></v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </div>
      </v-container>
    </div>

    <!-- PROFILE CONTENT -->
    <v-container>
      <v-row class="mb-8">
        <v-col cols="12" sm="6">
          <v-card class="py-6 px-6 text-center rounded-xl" variant="outlined" flat>
            <v-icon color="primary" size="32" class="mb-2">folder</v-icon>
            <div class="text-h4 font-weight-bold text-high-emphasis">
              {{ myProjects.length }}
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">Projetos de Código</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card class="py-6 px-6 text-center rounded-xl" variant="outlined" flat>
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
          text="Você ainda não criou nenhum projeto de código. Vá para a página Seus Projetos para começar!"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import DialogSettings from "@/views/global/DialogSettings.vue";
import { useUserStore } from "@/stores";
import { http } from "@/functions";
import type { ProjectAttributes } from "@projeto/types";

const userStore = useUserStore();
const router = useRouter();
const loading = ref(true);
const settingsOpen = ref(false);
const myProjects = ref<ProjectAttributes[]>([]);

onMounted(async () => {
  try {
    loading.value = true;
    const res = await http.get({
      type: "database",
      route: "getProjects",
      querys: { userId: userStore.getId },
    });
    myProjects.value = Object.values(res || {});
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
  } finally {
    loading.value = false;
  }
});

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

.banner-gradient {
  height: 200px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  opacity: 0.15;
}

.gap-4 {
  gap: 1.5rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
