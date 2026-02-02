<template>
  <div class="gradient-primary py-16 px-6 px-md-16 mb-8">
    <v-container>
      <v-row align="center">
        <v-col cols="12" md="8">
          <h1 class="text-h3 font-weight-black mb-2">
            Bem-vindo, {{ userStore.name }} =D
          </h1>
          <p class="text-h6 opacity-90 font-weight-regular">
            Você tem 3 saves aguardando sincronização.
          </p>
          <div class="mt-6">
            <v-btn size="large" color="surface" variant="flat" class="text-primary font-weight-bold mr-4">
              Continuar Jogando
            </v-btn>
            <v-btn size="large" variant="outlined" color="white">
              Ver Novidades
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <v-container class="px-md-10">
    <section class="mb-12">
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h5 font-weight-bold d-flex align-center">
          <v-icon start color="primary">history</v-icon>
          Recentes
        </h2>
      </div>

      <ComponentLoadSessions :cardsType="'reduced'" :styleType="'grade'" :items="games" @emitEvent="goToGame" />
    </section>

    <section>
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h5 font-weight-bold d-flex align-center">
          <v-icon start color="primary">grid_view</v-icon>
          Sua Biblioteca
        </h2>

        <v-chip-group selected-class="text-primary" filter>
          <v-chip variant="outlined" value="all">Todos</v-chip>
          <v-chip variant="outlined" value="rpg">RPG</v-chip>
          <v-chip variant="outlined" value="fps">Ação</v-chip>
        </v-chip-group>
      </div>

      <v-row>
        <v-col v-for="game in games" :key="game.id" cols="12" sm="6" md="3" lg="2">
          <v-card class="game-card rounded-lg" elevation="0" border @click="goToGame(game)">
            <v-img :src="game.thumbnails?.cover" aspect-ratio="3/4" cover class="bg-surface-variant">
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
              </template>
            </v-img>

            <v-card-item class="py-3 px-3">
              <div class="text-subtitle-1 font-weight-bold text-truncate">
                {{ game.title }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ game.genre || "Sem gênero" }}
              </div>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { useUserStore } from "@/stores";
import type { GameAttributes as Game } from "@projeto/types";
import { http } from "@/functions";

const userStore = useUserStore();
const router = useRouter();
const games = ref<Game[]>([]);

// Mock temporário para ver o layout
onMounted(async () => {
  games.value = Object.values(
    await http.get({
      type: "database",
      route: "getGames",
    }),
  );
});

function goToGame(game: any) {
  router.push({ name: "GameDetails", params: { id: game.id } });
}
</script>

<style scoped>
.game-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
