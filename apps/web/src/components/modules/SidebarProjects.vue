<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import type { ProjectAttributes as Game } from "@projeto/types";
import { http } from "@/functions";
import { useUserStore } from "@/stores";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { showToast } from "@/plugins/toast";

const router = useRouter();
const userStore = useUserStore();
const { editorStore } = useEditorExplorer();

const allProjects = ref<Game[]>([]);
const loading = ref(true);
const createLoading = ref(false);
const searchQuery = ref("");

async function fetchProjects() {
	if (!userStore.id) {
		loading.value = false;
		return;
	}
	try {
		loading.value = true;
		const response = await http.get({
			type: "database",
			route: "getProjects",
			querys: { userId: userStore.id },
		});
		allProjects.value = Object.values(response || {});
	} catch (error) {
		console.error("Erro ao carregar projetos na barra lateral:", error);
	} finally {
		loading.value = false;
	}
}

// Criar novo projeto rapidamente
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
		// Atualiza lista local
		fetchProjects();
	} catch (error) {
		showToast({
			type: "error",
			message: error instanceof Error ? error.message : String(error),
		});
	} finally {
		createLoading.value = false;
	}
}

// Filtrar e ordenar projetos
const filteredProjects = computed(() => {
	let list = [...allProjects.value];

	// Ordenar por data de atualização (mais recentes primeiro)
	list.sort(
		(a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
	);

	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase();
		list = list.filter(
			(p) =>
				p.title.toLowerCase().includes(query) ||
				(p.description && p.description.toLowerCase().includes(query))
		);
	}

	return list;
});

// Limitar a visualização a no máximo 6 projetos no menu lateral
const recentProjects = computed(() => {
	return filteredProjects.value.slice(0, 6);
});

// Formatar a data
function formatTime(dateVal: string | Date) {
	if (!dateVal) return "";
	const date = new Date(dateVal);
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

watch(
	() => userStore.id,
	(newId) => {
		if (newId) {
			fetchProjects();
		} else {
			allProjects.value = [];
		}
	},
	{ immediate: true }
);
</script>

<template>
	<div class="sidebar-projects-container mt-2">
		<div class="d-flex align-center justify-space-between pr-2">
			<v-list-subheader class="text-overline text-medium-emphasis px-3">
				Projetos Recentes
			</v-list-subheader>
			<v-btn
				icon="add"
				variant="text"
				density="compact"
				color="primary"
				size="small"
				:loading="createLoading"
				@click="criarNovoProjeto"
				class="hover-rotate"
			>
				<v-tooltip activator="parent" location="top">Novo código</v-tooltip>
			</v-btn>
		</div>

		<!-- Input de busca -->
		<v-text-field
			v-model="searchQuery"
			density="compact"
			variant="solo-filled"
			flat
			hide-details
			prepend-inner-icon="search"
			placeholder="Buscar projetos..."
			class="search-bar mb-2 px-3"
			clearable
		/>

		<!-- Loading state -->
		<v-list v-slot:default v-if="loading && allProjects.length === 0" nav class="px-3 bg-transparent py-0">
			<v-list-item v-for="n in 3" :key="n" disabled class="px-4 py-1 mb-1">
				<template #prepend>
					<v-icon color="grey-lighten-1" class="shimmer-pulse">terminal</v-icon>
				</template>
				<div class="shimmer-line rounded w-75 py-2 bg-grey-lighten-2 mb-1"></div>
				<div class="shimmer-line rounded w-50 py-1.5 bg-grey-lighten-3"></div>
			</v-list-item>
		</v-list>

		<!-- Projetos List -->
		<v-list v-else nav class="px-3 bg-transparent py-0">
			<v-empty-state
				v-if="filteredProjects.length === 0"
				density="compact"
				:icon="searchQuery ? 'search_off' : 'terminal'"
				:title="searchQuery ? 'Sem resultados' : 'Sem projetos'"
				class="py-2 text-center"
			>
				<template #actions v-if="!searchQuery">
					<v-btn
						variant="text"
						color="primary"
						size="small"
						class="text-none mt-n2"
						@click="criarNovoProjeto"
					>
						Criar um projeto
					</v-btn>
				</template>
			</v-empty-state>

			<template v-else>
				<v-list-item
					v-for="project in recentProjects"
					:key="project.id"
					prepend-icon="terminal"
					rounded="pill"
					color="primary"
					class="project-item mb-1 px-4 text-none align-center"
					@click="router.push({ name: 'CodeEdit', params: { id: project.id } })"
				>
					<v-list-item-title class="font-weight-medium text-truncate" style="max-width: 150px">
						{{ project.title }}
					</v-list-item-title>
					<template #append>
						<span class="text-caption text-medium-emphasis opacity-60">
							{{ formatTime(project.updatedAt || project.createdAt) }}
						</span>
					</template>
				</v-list-item>
			</template>
		</v-list>
	</div>
</template>

<style scoped>
.search-bar :deep(.v-field) {
	border-radius: 20px !important;
	font-size: 0.85rem !important;
	background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}

.search-bar :deep(.v-field__input) {
	min-height: 32px !important;
	padding-top: 4px !important;
	padding-bottom: 4px !important;
}

.project-item {
	transition: all 0.2s ease;
}

.project-item:hover {
	transform: translateX(4px);
}

.hover-rotate :deep(.v-icon) {
	transition: transform 0.2s ease;
}

.hover-rotate:hover :deep(.v-icon) {
	transform: rotate(90deg);
}

@keyframes shimmer {
	0% { opacity: 0.5; }
	50% { opacity: 1; }
	100% { opacity: 0.5; }
}

.shimmer-pulse {
	animation: shimmer 1.5s infinite ease-in-out;
}

.shimmer-line {
	animation: shimmer 1.5s infinite ease-in-out;
	height: 12px;
}
</style>
