<template>
  <v-dialog
    v-model="isOpen"
    max-width="520"
    :persistent="false"
    scrollable
  >
    <v-card rounded="xl" flat border>

      <!-- Cabeçalho -->
      <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
        <span class="text-h6 font-weight-bold">Projetos recentes</span>
        <v-btn icon="close" variant="text" density="comfortable" @click="isOpen = false" />
      </v-card-title>

      <v-divider />

      <!-- Loading -->
      <div v-if="loading" class="d-flex flex-column ga-2 pa-4">
        <v-skeleton-loader
          v-for="n in 4"
          :key="n"
          type="list-item-avatar-two-line"
          rounded="xl"
        />
      </div>

      <!-- Lista de projetos -->
      <v-list v-else-if="projects.length" nav class="pa-3">
        <v-list-item
          v-for="project in projects"
          :key="project.id"
          :title="project.title"
          :subtitle="formatDate(project.updatedAt || project.createdAt)"
          rounded="xl"
          lines="two"
          @click="openProject(project)"
        >
          <template #prepend>
            <v-avatar color="primary" variant="tonal" rounded="lg" size="38" class="mr-1">
              <v-icon size="18">terminal</v-icon>
            </v-avatar>
          </template>
          <template #append>
            <v-icon size="16" class="text-disabled">chevron_right</v-icon>
          </template>
        </v-list-item>
      </v-list>

      <!-- Estado vazio -->
      <div v-else class="d-flex flex-column align-center text-center py-10 px-6 ga-3">
        <v-icon size="48" color="primary" opacity="0.3">terminal</v-icon>
        <div>
          <p class="text-subtitle-1 font-weight-bold">Nenhum projeto ainda</p>
          <p class="text-body-2 text-medium-emphasis mt-1">
            Comece a adicionar elementos no canvas para criar seu primeiro projeto.
          </p>
        </div>
      </div>

      <v-divider />

      <!-- Rodapé -->
      <v-card-actions class="pa-4 pt-3 ga-2">
        <v-btn
          variant="text"
          class="text-none"
          prepend-icon="grid_view"
          @click="goToProjects"
        >
          Ver todos
        </v-btn>
        <v-spacer />
        <v-btn
          variant="tonal"
          color="primary"
          class="text-none"
          rounded="xl"
          @click="isOpen = false"
        >
          Começar em branco
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/utils';
import { useUserStore } from '@/stores';

const router    = useRouter();
const userStore = useUserStore();

const isOpen   = ref(false);
const loading  = ref(false);
const projects = ref<any[]>([]);

// Abre o overlay e busca os projetos
async function open() {
  isOpen.value = true;
  if (projects.value.length) return; // já carregou
  await fetchRecent();
}

async function fetchRecent() {
  if (!userStore.id) return;
  try {
    loading.value = true;
    const res = await http.get({
      type: 'database',
      route: 'getProjects',
      querys: { userId: userStore.id },
    });
    const list: any[] = Object.values(res || {});
    // ordena por mais recente e limita em 8
    list.sort((a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
    );
    projects.value = list.slice(0, 8);
  } finally {
    loading.value = false;
  }
}

function openProject(project: any) {
  isOpen.value = false;
  router.push({ name: 'CodeEdit', params: { id: project.id } });
}

function goToProjects() {
  isOpen.value = false;
  router.push({ name: 'CodeProjects' });
}

function formatDate(date: any): string {
  if (!date) return '';
  const d    = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  const h    = Math.floor(diff / 3600000);
  const min  = Math.floor(diff / 60000);
  if (min  < 1)  return 'agora mesmo';
  if (min  < 60) return `há ${min} min`;
  if (h    < 24) return `há ${h}h`;
  if (days < 7)  return `há ${days} dia${days !== 1 ? 's' : ''}`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
}

// Abre automaticamente quando o userStore tiver id (login já resolvido)
watch(
  () => userStore.id,
  (id) => { if (id) open(); },
  { immediate: true }
);

defineExpose({ open });
</script>
