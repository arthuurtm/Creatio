<template>
  <v-container fluid class="pa-4">
    <!-- TOP BAR -->
    <!-- TOP BAR -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-4">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-text-field v-model="searchQuery" type="search" variant="outlined" density="comfortable" :clearable="true"
          placeholder="Buscar por nome ou descrição..." prepend-inner-icon="search" style="min-width: 280px" rounded="lg" hide-details />

        <div class="d-flex align-center ga-2">
          <span class="text-caption text-medium-emphasis font-weight-medium">Ordenar:</span>
          <v-btn-toggle v-model="sort" mandatory variant="outlined" color="primary" rounded="lg" density="comfortable">
            <v-btn value="recent" class="text-none">Recentes</v-btn>
            <v-btn value="alpha" class="text-none">Nome</v-btn>
            <v-btn value="updated" class="text-none">Atualizados</v-btn>
            <v-btn value="version" class="text-none">Versão</v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <div class="d-flex align-center ga-3 flex-wrap">
        <v-btn-toggle v-model="currentView" variant="outlined" color="primary" rounded="lg" density="comfortable">
          <v-btn value="grade" icon="grid_view" />
          <v-btn value="list" icon="view_list" />
          <v-btn value="line" icon="view_stream" />
        </v-btn-toggle>

        <v-btn color="primary" variant="flat" rounded="lg" density="comfortable" @click="criarNovoProjeto" prepend-icon="add" class="text-none px-4">
          Criar Novo
        </v-btn>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-body-2 text-medium-emphasis">
        {{ filteredCreations.length }} resultado(s)
      </div>
    </div>

    <!-- DATA -->
    <div>
      <v-progress-circular v-if="loading" indeterminate size="32" class="mt-4" />

      <v-empty-state v-else-if="filteredCreations.length === 0"
        :title="allCreations.length ? 'Nada encontrado' : 'Nenhum código criado'" :text="allCreations.length
          ? `Nenhum item para '${searchQuery}'`
          : 'Clique em criar novo para começar!'
          " />

      <!-- VIEW RENDER -->
      <component-load-sessions v-else :items="filteredCreations" :style-type="currentView" :key="currentView" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import type { ProjectAttributes as Game } from "@projeto/types";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { http } from "@/functions";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";


interface SortItem {
	title: string;
	value: string;
}

const userStore = useUserStore();
const { editorStore } = useEditorExplorer();
const router = useRouter();
const allCreations = ref<Game[]>([]);
const loading = ref(true);
const currentView = ref("grade");
const searchQuery = ref("");
const sort = ref("recent");

const sortItems: SortItem[] = [
	{ title: "Recentes", value: "recent" },
	{ title: "Nome", value: "alpha" },
	{ title: "Atualizados", value: "updated" },
	{ title: "Versão", value: "version" },
];

const filteredCreations = computed(() => {
	let list = [...allCreations.value];

	// Filtrar por busca textual
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
	loading.value = true;
	try {
		allCreations.value = Object.values(
			await http.get({
				type: "database",
				route: "getProjects",
				querys: { userId: userStore.getId },
			}),
		);
	} catch (error) {
		showToast({ type: "error", message: "Falha ao carregar suas criações." });
	} finally {
		loading.value = false;
	}
}

async function criarNovoProjeto() {
	let result;
	try {
		result = await http.post(
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
	}
}

onMounted(async () => {
	await fetchMyCreations();
});
</script>
