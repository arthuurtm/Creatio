<template>
  <v-app>
    <v-container v-if="loading" class="fill-height justify-center">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-container>

    <v-container v-else-if="error" class="d-flex fill-height justify-center">
      <v-alert type="error" title="Erro ao carregar" :text="error" class="ma-4" max-width="500"></v-alert>
      <v-btn variant="text" @click="router.back()">Voltar</v-btn>
    </v-container>

    <div v-else class="game-wrapper">
      <v-img :src="game?.thumbnails?.banner || game?.thumbnails?.cover" cover class="background-ambience"></v-img>

      <v-container fluid class="pa-0 content-container">
        <div class="hero-section">
          <v-row no-gutters align="end" class="fill-height pb-10 px-md-10 px-4">
            <v-col cols="12" md="3" lg="2" class="d-flex justify-center justify-md-start mb-4 mb-md-0">
              <v-card elevation="12" rounded="lg" class="game-poster">
                <v-img :src="game?.thumbnails?.cover" aspect-ratio="2/3" cover class="bg-surface-variant">
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
              </v-card>
            </v-col>

            <v-col cols="12" md="9" lg="8" class="text-white pl-md-8">
              <div class="d-flex align-center mb-2">
                <v-chip color="secondary" variant="flat" size="small" class="mr-2 font-weight-bold">
                  {{ game?.genre || "Gênero Desconhecido" }}
                </v-chip>
                <v-chip variant="outlined" size="small" class="mr-2 border-opacity-50 text-white">
                  v{{ game?.version || "1.0" }}
                </v-chip>
              </div>

              <h1 class="text-h3 text-md-h1 font-weight-black text-uppercase game-title-gradient">
                {{ game?.title }}
              </h1>

              <p class="text-subtitle-1 mt-2 mb-6 text-grey-lighten-3 clamp-text">
                {{ game?.description }}
              </p>

              <div class="d-flex flex-wrap gap-4 align-center">
                <v-btn size="x-large" color="primary" prepend-icon="play_arrow" elevation="8"
                  class="text-uppercase font-weight-bold px-8" @click="handlePlay" :loading="btnLoading">
                  {{ hasSession ? "Continuar" : "Jogar Agora" }}
                </v-btn>

                <v-btn variant="tonal" icon="favorite_border" color="pink-lighten-2"></v-btn>
                <v-btn variant="tonal" icon="share" color="white"></v-btn>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-sheet color="transparent" class="glass-panel mt-n4 pt-8 px-md-10 px-4 pb-12">
          <v-row>
            <v-col cols="12" md="4" v-if="hasSession">
              <v-card class="glass-card rounded-xl pa-4" border elevation="0">
                <div class="text-overline mb-2 text-white">Seu Progresso</div>
                <div class="d-flex justify-space-between align-end mb-1">
                  <span class="text-h4 font-weight-bold text-white">{{ computedStats.percent }}%</span>
                  <span class="text-caption text-grey-lighten-1">Nível {{ computedStats.level }}</span>
                </div>
                <v-progress-linear :model-value="computedStats.percent" color="success" height="8" rounded
                  striped></v-progress-linear>

                <v-divider class="my-4 border-opacity-25"></v-divider>

                <div class="d-flex justify-space-between text-body-2 text-grey-lighten-1">
                  <span>Tempo Jogado:</span>
                  <span class="font-weight-bold text-white">{{
                    computedStats.timePlayed
                    }}</span>
                </div>
                <div class="d-flex justify-space-between text-body-2 mt-2 text-grey-lighten-1">
                  <span>Último Local:</span>
                  <span class="font-weight-bold text-primary">{{
                    computedStats.location
                    }}</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" :md="hasSession ? 8 : 12">
              <v-tabs v-model="tab" bg-color="transparent" color="primary">
                <v-tab value="about">Sobre</v-tab>
                <v-tab value="media">Galeria</v-tab>
                <v-tab value="reqs">Requisitos</v-tab>
              </v-tabs>

              <v-window v-model="tab" class="mt-4">
                <v-window-item value="about">
                  <div class="text-body-1 text-grey-lighten-1" style="white-space: pre-line">
                    {{ game?.description }}
                    <br /><br />
                    <strong>Data de Lançamento:</strong>
                    {{ formatDate(game?.createdAt) }}<br />
                    <strong>ID da Versão:</strong> {{ game?.version }}
                  </div>
                </v-window-item>

                <v-window-item value="media">
                  <div class="text-grey-lighten-2 pa-4">
                    Galeria indisponível no momento.
                  </div>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-sheet>
      </v-container>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { http } from "@/functions"; // Sua função http
import type { GameAttributes } from "@projeto/types"; // Ajuste para o path dos seus types

const route = useRoute();
const router = useRouter();

// Estados de UI
const loading = ref(true);
const btnLoading = ref(false);
const error = ref<string | null>(null);
const tab = ref(null);

// Dados Reativos (Tipagem implícita ou explícita recomendada)
const game = ref<GameAttributes | null>(null);
const gameState = ref<any>(null);

// Computado: Verifica se existe sessão válida
// const hasSession = computed(() => !!gameState.value && !!gameState.value.id);

// Computado: Formata os dados crus do banco para a UI
const computedStats = computed(() => {
  if (!gameState.value)
    return { percent: 0, level: 1, timePlayed: "0h", location: "-" };

  const minutes = Math.floor((gameState.value.playTimeSeconds || 0) / 60);
  const hours = Math.floor(minutes / 60);
  const minsRemaining = minutes % 60;

  const timeFormatted =
    hours > 0 ? `${hours}h ${minsRemaining}m` : `${minsRemaining}m`;

  return {
    percent: gameState.value.progressPercentage || 0,
    level: gameState.value.currentLevel || 1,
    timePlayed: timeFormatted,
    location: gameState.value.lastLocationLabel || "Início",
  };
});

onMounted(async () => {
  const gameId = route.params.id as string;
  if (!gameId) {
    error.value = "ID do jogo não fornecido.";
    loading.value = false;
    return;
  }

  try {
    // 1. Buscar Detalhes do Jogo
    const gameRes = await http.get({
      type: "database",
      route: "games",
      querys: { id: gameId }, // Ajuste conforme sua API (pode ser params direto na rota)
    });

    // Tratativa se retornar array ou objeto
    const gameData = Array.isArray(gameRes) ? gameRes[0] : gameRes;

    if (!gameData) throw new Error("Jogo não encontrado");
    game.value = gameData;

    // 2. Buscar GameState (Sessão do Usuário)
    // Normalmente isso retorna 404 ou null se não tiver save. Tratamos com try/catch silencioso ou verificação.
    try {
      const stateRes = await http.get({
        type: "database",
        route: "gamestate",
        querys: { gameId: gameId },
      });
      gameState.value = Array.isArray(stateRes) ? stateRes[0] : stateRes;
    } catch (e) {
      // Se der erro aqui, assumimos que não tem sessão (Novo Jogo)
      console.log("Nenhuma sessão ativa encontrada.");
      gameState.value = null;
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.message || "Falha ao carregar dados do jogo.";
  } finally {
    loading.value = false;
  }
});

function handlePlay() {
  btnLoading.value = true;

  // Aqui você chamaria a lógica para abrir o jogo/engine
  // Exemplo: router.push(`/play/${game.value.id}`)

  console.log(
    `Iniciando jogo ID: ${game.value?.id} | Save: ${gameState.value?.id || "NOVO"}`,
  );

  setTimeout(() => {
    btnLoading.value = false;
  }, 1000);
}

function formatDate(dateString?: string | Date) {
  if (!dateString) return "Desconhecida";
  return new Date(dateString).toLocaleDateString("pt-BR");
}
</script>

<style scoped>
.game-wrapper {
  position: relative;
  min-height: 100vh;
  /* Fallback color + varável de tema para suportar Light/Dark */
  background-color: rgb(var(--v-theme-background));
  overflow-x: hidden;
}

/* Fundo desfocado para dar profundidade */
.background-ambience {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70vh;
  /* Máscara suave para transição */
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  z-index: 0;
  filter: blur(3px) brightness(0.4);
}

.content-container {
  position: relative;
  z-index: 1;
}

.hero-section {
  height: 60vh;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.game-poster {
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.game-poster:hover {
  transform: scale(1.02);
}

.game-title-gradient {
  /* Gradiente mais robusto */
  background: linear-gradient(45deg, #ffffff 30%, #909090 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.5));
}

/* Glassmorphism Panel - Ajustado para ser mais neutro */
.glass-panel {
  background: linear-gradient(to bottom,
      rgba(var(--v-theme-surface), 0.7) 0%,
      rgba(var(--v-theme-background), 1) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 40vh;
}

/* Card interno com visual de vidro */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.clamp-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-4 {
  gap: 1rem;
}
</style>
