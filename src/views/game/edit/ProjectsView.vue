<template>
  <v-container fluid class="pa-4">
    <!-- TOP BAR -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-text-field v-model="searchQuery" type="search" variant="outlined" density="compact" :clearable="true"
          placeholder="Buscar por nome..." prepend-inner-icon="search" style="min-width: 280px" />

        <v-select v-model="sort" :items="sortItems" label="Ordenar por" density="compact" variant="outlined"
          style="min-width: 180px" />
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn-toggle v-model="currentView" divided density="comfortable">
          <v-btn value="grade" icon="grid_view" />
          <v-btn value="list" icon="view_list" />
          <v-btn value="line" icon="view_stream" />
        </v-btn-toggle>

        <v-btn color="primary" density="comfortable" @click="criarNovoJogo" prepend-icon="add" text="Criar novo" />
      </div>
    </div>

    <!-- FILTERS / GENRES -->
    <div v-if="genres.length" class="d-flex align-center justify-space-between mb-2">
      <div class="text-body-2 text-medium-emphasis">
        {{ filteredCreations.length }} resultado(s)
      </div>

      <v-chip-group v-model="selectedGenres" multiple density="comfortable">
        <v-chip v-for="g in genres" :value="g" variant="outlined" class="text-capitalize">
          {{ g }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- DATA -->
    <div>
      <v-progress-circular v-if="loading" indeterminate size="32" class="mt-4" />

      <v-empty-state v-else-if="filteredCreations.length === 0"
        :title="allCreations.length ? 'Nada encontrado' : 'Nenhum jogo criado'" :text="allCreations.length
          ? `Nenhum item para '${searchQuery}'`
          : 'Clique em criar novo para começar!'
          " />

      <!-- VIEW RENDER -->
      <component-load-sessions v-else :items="filteredCreations" :style-type="currentView" :key="currentView" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { http } from "@/functions";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores";
import { useEditorStore } from "@/stores/editor";
import { Game } from "#types/models/index.ts";

interface SortItem {
  title: string;
  value: string;
}

const userStore = useUserStore();
const editorStore = useEditorStore();
const router = useRouter();
const allCreations = ref<Game[]>([]);
const loading = ref(true);
const currentView = ref("grade");
const searchQuery = ref("");
const selectedGenres = ref([]);
const sort = ref("recent");

const sortItems: SortItem[] = [
  { title: "Recentes", value: "recent" },
  { title: "Nome", value: "alpha" },
  { title: "Atualizados", value: "updated" },
  { title: "Versão", value: "version" },
];

const genres = computed(() => {
  return [...new Set(allCreations.value.map((c) => c.genre).filter(Boolean))];
});

const filteredCreations = computed(() => {
  let list = [...allCreations.value];

  // ... filtros de busca e gênero ...

  switch (sort.value) {
    case "recent":
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "updated":
      list.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      break;
    case "alpha":
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "version":
      list.sort((a, b) => Number(b.version || 0) - Number(a.version || 0));
      break;
  }

  return list.map((c) => ({
    ...c,
    action: () => router.push({ name: "GameEdit", params: { id: c.id } }),
  }));
});

async function fetchMyCreations() {
  loading.value = true;
  try {
    allCreations.value = Object.values(
      await http.get({
        type: "database",
        route: "getGames",
        querys: { filters: { userId: userStore.getId } },
      }),
    );
  } catch (error) {
    showToast({ type: "error", message: "Falha ao carregar suas criações." });
  } finally {
    loading.value = false;
  }
}

async function criarNovoJogo() {
  let result;
  try {
    result = await http.post(
      { type: "database", route: "setGame" },
      { state: editorStore.$state },
    );

    Object.assign(editorStore.info, {
      id: result.id,
      title: result.title,
    });

    router.push({ name: "GameEdit", params: { id: result.id } });
  } catch (error) {
    showToast({ type: "error", message: error.message });
  }
}

onMounted(async () => {
  await fetchMyCreations();
});
</script>
