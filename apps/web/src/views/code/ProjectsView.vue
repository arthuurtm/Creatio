<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="page-header mb-6">
      <div class="d-flex flex-wrap align-start justify-space-between ga-4 mb-4">
        <div>
          <div class="text-overline text-medium-emphasis mb-1">Seus projetos</div>
          <h1 class="text-h4 text-md-h3 font-weight-bold mb-2">Meus Códigos</h1>
          <p class="text-body-1 text-medium-emphasis mb-0 max-width-720">
            Organize, encontre e continue seus projetos com uma navegação mais direta.
          </p>
        </div>

        <v-btn
          color="primary"
          variant="flat"
          density="comfortable"
          :loading="createLoading"
          @click="criarNovoProjeto"
          prepend-icon="add"
          class="text-none px-5"
          size="large"
        >
          Criar Novo
        </v-btn>
      </div>

      <v-card class="pa-4 pa-md-5" rounded="xl" elevation="0">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <v-text-field
            v-model="searchQuery"
            type="search"
            density="comfortable"
            :clearable="true"
            placeholder="Buscar por nome ou descrição..."
            prepend-inner-icon="search"
            style="min-width: 280px"
            hide-details
            variant="solo-filled"
            flat
          />

          <div class="d-flex flex-wrap align-center ga-4">
            <div class="d-flex align-center ga-2">
              <span class="text-caption text-medium-emphasis font-weight-medium">Ordenar:</span>
              <v-btn-toggle v-model="sort" mandatory divided variant="outlined">
                <v-btn value="recent" class="text-none">Recentes</v-btn>
                <v-btn value="alpha" class="text-none">Nome</v-btn>
                <v-btn value="updated" class="text-none">Atualizados</v-btn>
                <v-btn value="version" class="text-none">Versão</v-btn>
              </v-btn-toggle>
            </div>

            <v-btn-toggle v-model="currentView" mandatory divided variant="outlined">
              <v-btn value="grade" icon="grid_view" />
              <v-btn value="list" icon="view_list" />
              <v-btn value="line" icon="view_stream" />
            </v-btn-toggle>
          </div>
        </div>
      </v-card>
    </div>

    <div class="d-flex align-center justify-space-between mb-4 px-1">
      <span class="text-body-2 text-medium-emphasis">
        {{ filteredCreations.length }} resultado(s)
      </span>
      <v-chip color="primary" variant="tonal" class="font-weight-bold">
        {{ allCreations.length }} projeto(s) na conta
      </v-chip>
    </div>

    <v-empty-state
      v-if="!loading && filteredCreations.length === 0"
      :icon="allCreations.length ? 'search_off' : 'terminal'"
      :title="allCreations.length ? 'Nada encontrado' : 'Nenhum código criado'"
      :text="allCreations.length
        ? `Nenhum item para '${searchQuery}'`
        : 'Clique em Criar Novo para começar seu primeiro projeto!'"
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
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { http } from "@/functions";
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
.page-header {
  max-width: 1200px;
}

.max-width-720 {
  max-width: 720px;
}
</style>
