<template>
  <v-container fluid class="pa-4 pa-md-6 max-width-1200 mx-auto">
    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-4 mb-6">
      <div>
        <div class="text-overline text-primary font-weight-bold mb-1">Seus projetos</div>
        <h1 class="text-h4 font-weight-bold mb-2">Meus códigos</h1>
        <p class="text-body-1 text-medium-emphasis mb-0 max-width-720">
          Organize, encontre e continue seus projetos com uma navegação mais direta.
        </p>
      </div>

      <v-btn
        color="primary"
        variant="flat"
        :loading="createLoading"
        @click="criarNovoProjeto"
        prepend-icon="add"
        class="text-none px-6"
        size="large"
        elevation="1"
      >
        Criar novo
      </v-btn>
    </div>

    <v-card variant="outlined" class="mb-6 bg-surface-light border-opacity-100" style="border-color: rgba(var(--v-theme-on-surface), 0.08);">
      <v-card-text class="pa-3 pa-md-4">
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              type="search"
              density="comfortable"
              clearable
              placeholder="Buscar por nome ou descrição..."
              prepend-inner-icon="search"
              hide-details
              variant="outlined"
              bg-color="surface"
            />
          </v-col>

          <v-col cols="12" md="6" class="d-flex flex-wrap flex-sm-nowrap align-center justify-md-end ga-3 mt-2 mt-md-0">
            <v-select
              v-model="sort"
              :items="sortOptions"
              item-title="label"
              item-value="value"
              density="comfortable"
              variant="outlined"
              hide-details
              prepend-inner-icon="sort"
              bg-color="surface"
              class="flex-grow-1 flex-md-grow-0"
              style="min-width: 180px; max-width: 250px;"
            />

            <v-btn-toggle
              v-model="currentView"
              mandatory
              divided
              variant="outlined"
              density="comfortable"
              class="bg-surface ml-auto ml-sm-0"
            >
              <v-btn value="grade" icon="grid_view" aria-label="Visualização em grade" />
              <v-btn value="list" icon="view_list" aria-label="Visualização em lista" />
              <v-btn value="line" icon="view_stream" aria-label="Visualização expandida" />
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-4 px-1">
      <span class="text-body-2 text-medium-emphasis">
        Exibindo <strong class="text-high-emphasis">{{ filteredCreations.length }}</strong> resultado(s)
      </span>
      <v-chip color="primary" variant="tonal" size="small" class="font-weight-medium">
        {{ allCreations.length }} projeto(s) na conta
      </v-chip>
    </div>

    <v-empty-state
      v-if="!loading && filteredCreations.length === 0"
      :icon="allCreations.length ? 'search_off' : 'terminal'"
      :title="allCreations.length ? 'Nada encontrado' : 'Nenhum código criado'"
      :text="allCreations.length
        ? `Não encontramos nenhum item para '${searchQuery}'.`
        : 'Clique em Criar novo para começar seu primeiro projeto!'"
      class="mt-8"
    />

    <component-load-sessions
      v-else
      :items="filteredCreations"
      :loading="loading"
      :style-type="currentView"
      :key="currentView"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { ProjectAttributes as Game } from "@projeto/types";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { http } from "@/utils";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";

const userStore = useUserStore();
const { editorStore } = useEditorExplorer();
const router = useRouter();

const allCreations = ref<Game[]>([]);
const creationsLoading = ref(true);
const loading = computed(() => userStore.id === 0 || creationsLoading.value);
const createLoading = ref(false);

const currentView = ref("grade");
const searchQuery = ref("");
const sort = ref("recent");

// Opções para o menu de ordenação
const sortOptions = [
  { label: 'Mais recentes', value: 'recent' },
  { label: 'Mais atualizados', value: 'updated' },
  { label: 'Ordem alfabética', value: 'alpha' },
  { label: 'Por versão', value: 'version' }
];

const filteredCreations = computed(() => {
  let list = [...allCreations.value];

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query)),
    );
  }

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
    action: () => router.push({ name: "CodeEdit", params: { id: c.id } }),
  }));
});

async function fetchMyCreations() {
  if (!userStore.id) {
    creationsLoading.value = false;
    return;
  }
  try {
    creationsLoading.value = true;
    allCreations.value = Object.values(
      await http.get({
        type: "database",
        route: "getProjects",
        querys: { userId: userStore.id },
      }),
    );
  } catch (error) {
    showToast({ type: "error", message: "Falha ao carregar suas criações." });
  } finally {
    creationsLoading.value = false;
  }
}

async function criarNovoProjeto() {
  if (createLoading.value) return;
  createLoading.value = true;
  try {
    const result = await http.post(
      { type: "database", route: "setProject" },
      { state: editorStore.$state },
    );

    Object.assign(editorStore.info, {
      id: result.id,
      title: result.title,
    });

    router.push({ name: "CodeEdit", params: { id: result.id } });
  } catch (error) {
    showToast({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    createLoading.value = false;
  }
}

watch(
  () => userStore.id,
  (newId) => {
    if (newId) {
      fetchMyCreations();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.max-width-1200 {
  max-width: 1200px;
}

.max-width-720 {
  max-width: 720px;
}

/* Fundo sutil para destacar a área de filtros do resto da página */
.bg-surface-light {
  background-color: rgba(var(--v-theme-surface), 0.5) !important;
}
</style>
