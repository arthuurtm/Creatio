<template>
  <v-container class="pa-6" style="max-width: 860px">

    <!-- ══ CABEÇALHO ══════════════════════════════════════════════════════ -->
    <div class="d-flex align-start justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Meus Projetos</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          {{ allCreations.length }} projeto{{ allCreations.length !== 1 ? 's' : '' }}
          <template v-if="!loading && allCreations.length">
            · última atividade {{ lastUpdatedLabel }}
          </template>
        </p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="add"
        class="text-none"
        rounded="xl"
        :loading="createLoading"
        @click="criarNovoProjeto"
      >
        Novo projeto
      </v-btn>
    </div>

    <!-- ══ FILTROS ═════════════════════════════════════════════════════════ -->
    <div class="d-flex align-center ga-2 flex-wrap mb-4">
      <v-text-field
        v-model="searchQuery"
        placeholder="Buscar projetos..."
        prepend-inner-icon="search"
        variant="outlined"
        density="compact"
        rounded="xl"
        hide-details
        clearable
        style="max-width: 280px"
      />

      <v-select
        v-model="sort"
        :items="sortOptions"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="compact"
        rounded="xl"
        hide-details
        style="max-width: 200px"
      />

      <v-chip
        v-for="opt in statusOptions"
        :key="opt.value"
        :color="filterStatus === opt.value ? opt.color : undefined"
        :variant="filterStatus === opt.value ? 'tonal' : 'outlined'"
        size="small"
        @click="filterStatus = filterStatus === opt.value ? null : opt.value"
      >
        {{ opt.label }}
      </v-chip>

      <v-btn
        v-if="searchQuery || filterStatus"
        variant="text"
        size="small"
        class="text-none"
        @click="clearFilters"
      >
        Limpar filtros
      </v-btn>
    </div>

    <!-- ══ ESTADO VAZIO ════════════════════════════════════════════════════ -->
    <div
      v-if="!loading && filteredCreations.length === 0"
      class="d-flex flex-column align-center text-center py-16 ga-3"
    >
      <v-icon size="80" color="primary" opacity="0.35">
        {{ allCreations.length ? 'search_off' : 'terminal' }}
      </v-icon>
      <div>
        <p class="text-h6 font-weight-bold">
          {{ allCreations.length ? 'Nada encontrado' : 'Nenhum projeto ainda' }}
        </p>
        <p class="text-body-2 text-medium-emphasis mt-1">
          {{
            allCreations.length
              ? 'Tente ajustar sua busca ou limpar os filtros.'
              : 'Crie seu primeiro projeto para começar.'
          }}
        </p>
      </div>
      <v-btn
        v-if="!allCreations.length"
        color="primary"
        variant="tonal"
        rounded="pill"
        prepend-icon="add"
        class="text-none mt-2"
        @click="criarNovoProjeto"
      >
        Criar primeiro projeto
      </v-btn>
      <v-btn v-else variant="text" class="text-none" @click="clearFilters">
        Limpar filtros
      </v-btn>
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

    <!-- ══ DIALOG DE EXCLUSÃO ══════════════════════════════════════════════ -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl" class="pa-2">
        <v-card-text class="pt-5 px-5 pb-3">
          <p class="text-h6 font-weight-bold mb-1">Excluir projeto?</p>
          <p class="text-body-2 text-medium-emphasis">
            <strong class="text-high-emphasis">{{ pendingDeleteItem?.title }}</strong>
            será excluído permanentemente. Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-1 justify-end ga-2">
          <v-btn variant="text" class="text-none" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="tonal"
            class="text-none"
            rounded="xl"
            :loading="deleteLoading"
            @click="confirmDelete"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import type { ProjectAttributes as Project } from '@projeto/types';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ComponentLoadSessions from '@/components/modules/ComponentLoadSessions.vue';
import { http } from '@/utils';
import { showToast } from '@/plugins/toast';
import { useUserStore } from '@/stores';
import { useEditorExplorer } from '@/composables/useEditorExplorer.ts';

const userStore      = useUserStore();
const { editorStore } = useEditorExplorer();
const router         = useRouter();

// ── Estado ──────────────────────────────────────────────────────────────────
const allCreations     = ref<Project[]>([]);
const creationsLoading = ref(true);
const loading          = computed(() => userStore.id === 0 || creationsLoading.value);
const createLoading    = ref(false);

const searchQuery  = ref('');
const sort         = ref('recent');
const filterStatus = ref<string | null>(null);

const deleteDialog      = ref(false);
const deleteLoading     = ref(false);
const pendingDeleteItem = ref<Project | null>(null);

// ── Opções ───────────────────────────────────────────────────────────────────
const sortOptions = [
  { label: 'Mais recentes',    value: 'recent'  },
  { label: 'Mais atualizados', value: 'updated' },
  { label: 'Ordem alfabética', value: 'alpha'   },
];

const statusOptions = [
  { label: 'Ativo',     value: 'active',   color: 'success' },
  { label: 'Rascunho',  value: 'draft',    color: 'warning' },
  { label: 'Arquivado', value: 'archived', color: 'default' },
];

// ── Computeds ────────────────────────────────────────────────────────────────
const lastUpdatedLabel = computed(() => {
  if (!allCreations.value.length) return '—';
  const latest = allCreations.value
    .map(p => new Date(p.updatedAt ?? p.createdAt).getTime())
    .sort((a, b) => b - a)[0] as number;
  const diffD = Math.floor((Date.now() - latest) / 86400000);
  if (diffD === 0) return 'hoje';
  if (diffD === 1) return 'ontem';
  if (diffD < 7)  return `há ${diffD} dias`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(latest));
});

const filteredCreations = computed(() => {
  let list = [...allCreations.value] as any[];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  }

  if (filterStatus.value) {
    list = list.filter(c => c.status === filterStatus.value);
  }

  switch (sort.value) {
    case 'recent':  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    case 'updated': list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
    case 'alpha':   list.sort((a, b) => a.title.localeCompare(b.title)); break;
  }

  return list.map(c => ({
    ...c,
    action: () => router.push({ name: 'CodeEdit', params: { id: c.id } }),
  }));
});

// ── Funções ──────────────────────────────────────────────────────────────────
async function fetchMyCreations() {
  if (!userStore.id) { creationsLoading.value = false; return; }
  try {
    creationsLoading.value = true;
    allCreations.value = Object.values(
      await http.get({ type: 'database', route: 'getProjects', querys: { userId: userStore.id } })
    );
  } catch {
    showToast({ type: 'error', message: 'Falha ao carregar seus projetos.' });
  } finally {
    creationsLoading.value = false;
  }
}

async function criarNovoProjeto() {
  if (createLoading.value) return;
  createLoading.value = true;
  try {
    const result = await http.post(
      { type: 'database', route: 'setProject' },
      { state: editorStore.$state }
    );
    Object.assign(editorStore.info, { id: result.id, title: result.title });
    router.push({ name: 'CodeEdit', params: { id: result.id } });
  } catch (error) {
    showToast({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  } finally {
    createLoading.value = false;
  }
}

function openRenameDialog(item: Project) {
  showToast({ type: 'info', message: `Renomear "${item.title}" — em breve!` });
}

async function handleDuplicate(item: Project) {
  showToast({ type: 'info', message: `Duplicar "${item.title}" — em breve!` });
}

function handleDelete(item: Project) {
  pendingDeleteItem.value = item;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!pendingDeleteItem.value) return;
  deleteLoading.value = true;
  try {
    await http.del(
      { type: 'database', route: 'deleteProject' },
      { id: pendingDeleteItem.value.id }
    );
    allCreations.value = allCreations.value.filter(c => c.id !== pendingDeleteItem.value!.id);
    showToast({ type: 'success', message: 'Projeto excluído.' });
    deleteDialog.value = false;
  } catch (error) {
    showToast({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  } finally {
    deleteLoading.value = false;
    pendingDeleteItem.value = null;
  }
}

function clearFilters() {
  searchQuery.value  = '';
  filterStatus.value = null;
}

watch(
  () => userStore.id,
  (id) => { if (id) fetchMyCreations(); },
  { immediate: true }
);
</script>
