<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="height: 50vh">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>

  <div v-else>
    <div class="profile-header mb-16">
      <v-img :src="userStore.coverPicture || ''" height="250" cover class="align-end bg-grey-darken-4">
        <template v-if="!userStore.coverPicture" v-slot:default>
          <div class="fill-height w-100 bg-gradient-primary"></div>
        </template>

        <div class="fill-height gradient-overlay"></div>
      </v-img>

      <v-container class="mt-n16 position-relative" style="z-index: 2">
        <div class="d-flex flex-column flex-md-row align-end align-md-end gap-4">
          <v-avatar size="120" class="profile-avatar bg-surface elevation-4">
            <v-img :src="userStore.profilePicture" :lazy-src="'/assets/default-avatar.png'" cover>
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height bg-grey">
                  <span class="text-h4 font-weight-bold text-white">
                    {{ userStore.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </template>
            </v-img>
          </v-avatar>

          <div class="pb-2 text-center text-md-left flex-grow-1">
            <h1 class="text-h4 font-weight-black">
              {{ userStore.name || userStore.username }}
            </h1>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              @{{ userStore.username }}
            </div>

            <div class="d-flex gap-2 justify-center justify-md-start">
              <v-chip size="small" variant="outlined" color="primary">
                Nível {{ calculatedLevel }}
              </v-chip>
            </div>
          </div>

          <div class="pb-4">
            <v-btn prepend-icon="edit" variant="tonal" class="mr-2">Editar</v-btn>
            <v-btn icon="settings" variant="text"></v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <v-container>
      <v-row class="mb-8">
        <v-col cols="12" sm="4">
          <v-card class="py-4 px-6 text-center bg-surface-variant rounded-xl border-opacity-50" flat border>
            <div class="text-h4 font-weight-bold text-primary">
              {{ totalGamesCount }}
            </div>
            <div class="text-caption text-uppercase">Jogos na Biblioteca</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="py-4 px-6 text-center bg-surface-variant rounded-xl border-opacity-50" flat border>
            <div class="text-h4 font-weight-bold text-secondary">
              {{ formattedPlayTime }}
            </div>
            <div class="text-caption text-uppercase">Tempo Total</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="py-4 px-6 text-center bg-surface-variant rounded-xl border-opacity-50" flat border>
            <div class="text-h4 font-weight-bold text-success">
              {{ totalSessionsCount }}
            </div>
            <div class="text-caption text-uppercase">Sessões Iniciadas</div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="mb-8"></v-divider>

      <div class="mb-6" v-if="recentGames.length > 0">
        <h3 class="text-h5 font-weight-bold mb-4">
          <v-icon start color="primary">history</v-icon>
          Jogado Recentemente
        </h3>
        <component-load-sessions :items="recentGames" styleType="line" cardsType="normal"
          @emitEvent="handleGameClick" />
      </div>

      <div v-if="allGames.length > 0">
        <h3 class="text-h5 font-weight-bold mb-4">
          <v-icon start color="secondary">library_books</v-icon>
          Minha Biblioteca
        </h3>
        <component-load-sessions :items="allGames" styleType="grade" @emitEvent="handleGameClick" />
      </div>

      <div v-else class="text-center py-10 opacity-50">
        <v-icon size="64" class="mb-4">sports_esports</v-icon>
        <p>Você ainda não possui jogos na biblioteca.</p>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { useUserStore } from "@/stores";
import { http } from "@/functions";

const userStore = useUserStore();
const router = useRouter();
const loading = ref(true);

// Estados reativos para dados
const recentGames = ref<any[]>([]);
const allGames = ref<any[]>([]);
const stats = ref({
  totalMinutesPlayed: 0,
  totalSessions: 0,
});

// Busca de dados reais
onMounted(async () => {
  try {
    loading.value = true;

    const libraryRes = await http.get({
      type: "database",
      route: "getGames",
      querys: { filters: { userId: userStore.getId } },
    });

    // 2. Buscar Histórico Recente
    const historyRes = await http.get({
      route: "sessions/recent",
      limit: 10,
    });

    // 3. Buscar Estatísticas Agregadas (ou calcular no front se o back não entregar)
    // Se o backend tiver uma rota 'users/stats', use ela.
    // Caso contrário, somamos aqui:
    const statsRes = await http.get({ route: "users/stats" });

    allGames.value = libraryRes?.data || [];
    recentGames.value = historyRes?.data || [];

    if (statsRes) {
      stats.value.totalMinutesPlayed = statsRes.totalMinutes || 0;
      stats.value.totalSessions = statsRes.totalSessions || 0;
    }
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
  } finally {
    loading.value = false;
  }
});

// --- Computeds (Lógica de exibição) ---

// Contagem simples do array
const totalGamesCount = computed(() => allGames.value.length);
const totalSessionsCount = computed(() => stats.value.totalSessions);

// Formatação de Horas (ex: 9500min -> "158h 20m")
const formattedPlayTime = computed(() => {
  const minutes = stats.value.totalMinutesPlayed;
  if (!minutes) return "0h";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) return `${hours}h ${mins > 0 ? mins + "m" : ""}`;
  return `${mins}m`;
});

// Cálculo de "Nível" baseado no tempo de jogo (Gamification simples)
// Exemplo: Nível 1 base + 1 nível a cada 10 horas jogadas
const calculatedLevel = computed(() => {
  const hours = Math.floor(stats.value.totalMinutesPlayed / 60);
  return 1 + Math.floor(hours / 10);
});

function handleGameClick(payload: any) {
  const id = payload.id || payload; // Garante que pega o ID mesmo se passar objeto
  router.push(`/game/${id}`);
}
</script>

<style scoped>
.profile-avatar {
  border: 4px solid rgb(var(--v-theme-background));
}

.gradient-overlay {
  background: linear-gradient(to bottom,
      transparent 0%,
      rgb(var(--v-theme-background)) 100%);
}

/* Fallback gradient se não tiver capa */
.bg-gradient-primary {
  background: linear-gradient(135deg,
      rgb(var(--v-theme-primary)) 0%,
      rgb(var(--v-theme-secondary)) 100%);
  opacity: 0.3;
}

.gap-4 {
  gap: 1.5rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
