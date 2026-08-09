<template>
  <div class="max-w-[860px] mx-auto p-6">

    <!-- ══ CABEÇALHO ══════════════════════════════════════════════════════ -->
    <n-space justify="space-between" align="start" class="mb-6">
      <div>
        <h1 class="text-xl font-bold m-0">Meus Projetos</h1>
        <p class="text-[13px] opacity-70 mt-1 mb-0">
          {{ allCreations.length }} projeto{{ allCreations.length !== 1 ? 's' : '' }}
          <template v-if="!loading && allCreations.length">
            · última atividade {{ lastUpdatedLabel }}
          </template>
        </p>
      </div>

      <n-button
        type="primary"
        ghost
        round
        :loading="createLoading"
        @click="criarNovoProjeto"
      >
        <template #icon>
          <n-icon><Add /></n-icon>
        </template>
        Novo projeto
      </n-button>
    </n-space>

    <!-- ══ FILTROS ═════════════════════════════════════════════════════════ -->
    <n-space align="center" :size="8" wrap class="mb-4">
      <n-input
        v-model:value="searchQuery"
        placeholder="Buscar projetos..."
        clearable
        round
        class="max-w-[280px]"
      >
        <template #prefix>
          <n-icon size="18"><Search /></n-icon>
        </template>
      </n-input>

      <n-select
        v-model:value="sort"
        :options="sortOptions"
        label-field="label"
        value-field="value"
        round
        class="w-[200px]"
      />

      <n-space :size="6" align="center">
        <n-tag
          v-for="opt in statusOptions"
          :key="opt.value"
          checkable
          :checked="filterStatus === opt.value"
          round
          size="small"
          :type="opt.value === 'active' ? 'success' : opt.value === 'draft' ? 'warning' : 'default'"
          @click="filterStatus = filterStatus === opt.value ? null : opt.value"
        >
          {{ opt.label }}
        </n-tag>
      </n-space>

      <n-button
        v-if="searchQuery || filterStatus"
        text
        size="small"
        @click="clearFilters"
      >
        Limpar filtros
      </n-button>
    </n-space>

    <!-- ══ ESTADO VAZIO ════════════════════════════════════════════════════ -->
    <div
      v-if="!loading && filteredCreations.length === 0"
      class="flex flex-col items-center text-center py-16 gap-3"
    >
      <n-icon size="80" color="rgb(var(--v-theme-primary))" class="opacity-35">
        <SearchOffOutlined v-if="allCreations.length" />
        <TerminalOutlined v-else />
      </n-icon>
      <div>
        <p class="text-lg font-bold m-0">
          {{ allCreations.length ? 'Nada encontrado' : 'Nenhum projeto ainda' }}
        </p>
        <p class="text-[13px] opacity-70 mt-1 mb-0">
          {{
            allCreations.length
              ? 'Tente ajustar sua busca ou limpar os filtros.'
              : 'Crie seu primeiro projeto para começar.'
          }}
        </p>
      </div>
      <n-button
        v-if="!allCreations.length"
        type="primary"
        ghost
        round
        @click="criarNovoProjeto"
      >
        <template #icon>
          <n-icon><Add /></n-icon>
        </template>
        Criar primeiro projeto
      </n-button>
      <n-button v-else text @click="clearFilters">
        Limpar filtros
      </n-button>
    </div>

    <!-- ══ LISTA DE PROJETOS ═══════════════════════════════════════════════ -->
    <component-load-sessions
      v-else
      :items="filteredCreations"
      :loading="loading"
      @rename="openRenameDialog"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
    />



  </div>
</template>

<script setup lang="ts">
import type { ProjectAttributes as Project } from "@projeto/types";
import { computed, ref, watch } from "vue";
import { Add, Search } from "@vicons/ionicons5";
import { SearchOffOutlined, TerminalOutlined } from "@vicons/material";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores";
import { http } from "@/utils";

const userStore = useUserStore();
const { editorStore } = useEditorExplorer();
const router = useRouter();

// ── Estado ──────────────────────────────────────────────────────────────────
const allCreations = ref<Project[]>([]);
const creationsLoading = ref(true);
const loading = computed(() => userStore.id === 0 || creationsLoading.value);
const createLoading = ref(false);

const searchQuery = ref("");
const sort = ref("recent");
const filterStatus = ref<string | null>(null);



// ── Opções ───────────────────────────────────────────────────────────────────
const sortOptions = [
	{ label: "Mais recentes", value: "recent" },
	{ label: "Mais atualizados", value: "updated" },
	{ label: "Ordem alfabética", value: "alpha" },
];

const statusOptions = [
	{ label: "Ativo", value: "active", color: "success" },
	{ label: "Rascunho", value: "draft", color: "warning" },
	{ label: "Arquivado", value: "archived", color: "default" },
];

// ── Computeds ────────────────────────────────────────────────────────────────
const lastUpdatedLabel = computed(() => {
	if (!allCreations.value.length) return "—";
	const latest = allCreations.value
		.map((p) => new Date(p.updatedAt ?? p.createdAt).getTime())
		.sort((a, b) => b - a)[0] as number;
	const diffD = Math.floor((Date.now() - latest) / 86400000);
	if (diffD === 0) return "hoje";
	if (diffD === 1) return "ontem";
	if (diffD < 7) return `há ${diffD} dias`;
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
	}).format(new Date(latest));
});

const filteredCreations = computed(() => {
	let list = [...allCreations.value] as any[];

	if (searchQuery.value.trim()) {
		const q = searchQuery.value.toLowerCase();
		list = list.filter(
			(c) =>
				c.title.toLowerCase().includes(q) ||
				(c.description && c.description.toLowerCase().includes(q)),
		);
	}

	if (filterStatus.value) {
		list = list.filter((c) => c.status === filterStatus.value);
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
	}

	return list.map((c) => ({
		...c,
		action: () => router.push({ name: "CodeEdit", params: { id: c.id } }),
	}));
});

// ── Funções ──────────────────────────────────────────────────────────────────
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
	} catch {
		showToast({ type: "error", message: "Falha ao carregar seus projetos." });
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
		Object.assign(editorStore.info, { id: result.id, title: result.title });
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

function openRenameDialog(item: Project) {
	showToast({ type: "info", message: `Renomear "${item.title}" — em breve!` });
}

async function handleDuplicate(item: Project) {
	showToast({ type: "info", message: `Duplicar "${item.title}" — em breve!` });
}

function handleDelete(item: Project) {
	const d = (window as any).$dialog.warning({
		title: "Excluir projeto?",
		content: `O projeto "${item.title}" será excluído permanentemente. Esta ação não pode ser desfeita.`,
		positiveText: "Excluir",
		negativeText: "Cancelar",
		onPositiveClick: async () => {
			d.loading = true;
			try {
				await http.del(
					{ type: "database", route: "deleteProject" },
					{ id: item.id },
				);
				allCreations.value = allCreations.value.filter(
					(c) => c.id !== item.id,
				);
				showToast({ type: "success", message: "Projeto excluído." });
			} catch (error) {
				showToast({
					type: "error",
					message: error instanceof Error ? error.message : String(error),
				});
			} finally {
				d.loading = false;
			}
		}
	});
}

function clearFilters() {
	searchQuery.value = "";
	filterStatus.value = null;
}

watch(
	() => userStore.id,
	(id) => {
		if (id) fetchMyCreations();
	},
	{ immediate: true },
);
</script>
