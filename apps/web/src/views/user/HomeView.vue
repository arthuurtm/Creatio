<template>
  <div class="home-view">
    <v-container class="px-4 px-md-8 py-6 py-md-8">
      <div class="page-shell pa-5 pa-md-8 rounded-xl mb-6 position-relative overflow-hidden">
        <div class="glow-bg"></div>
        <v-row align="center" class="position-relative" style="z-index: 2;">
          <v-col cols="12" md="8">
            <div class="d-flex align-center ga-2 mb-3">
              <v-chip size="small" variant="tonal" color="primary" class="font-weight-medium">Comunidade</v-chip>
              <span class="text-caption text-medium-emphasis">Conteúdos públicos e projetos compartilhados</span>
            </div>
            <h1 class="text-h3 text-md-h2 font-weight-bold tracking-tight mb-3">
              Explorar Códigos Públicos
            </h1>
            <p class="text-body-1 text-md-h6 text-medium-emphasis font-weight-regular max-width-680 mb-0">
              Estude a lógica de blocos, importe códigos de outros desenvolvedores e colabore na comunidade Creatio.
            </p>
          </v-col>

          <v-col cols="12" md="4" class="d-flex justify-md-end mt-4 mt-md-0">
            <v-card class="pa-4 search-card" width="100%" max-width="360" rounded="xl" elevation="0">
              <div class="text-overline text-medium-emphasis mb-2">Buscar na comunidade</div>
              <v-text-field
                v-model="searchQuery"
                type="search"
                placeholder="Nome ou descrição"
                prepend-inner-icon="search"
                hide-details
                density="comfortable"
                variant="solo-filled"
                flat
              />
            </v-card>
          </v-col>
        </v-row>
      </div>

      <v-card class="pa-4 pa-md-5 mb-6" rounded="xl" elevation="0">
        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
          <div>
            <div class="text-overline text-medium-emphasis mb-1">Organização</div>
            <div class="d-flex align-center ga-3 flex-wrap">
              <span class="text-body-1 font-weight-medium">Ordenar por</span>
              <v-btn-toggle v-model="sortBy" mandatory divided variant="outlined" density="comfortable">
                <v-btn value="recent" class="text-none">Recentes</v-btn>
                <v-btn value="name" class="text-none">Nome</v-btn>
              </v-btn-toggle>
            </div>
          </div>

          <v-chip color="primary" variant="tonal" class="font-weight-bold">
            {{ filteredProjects.length }} projeto(s)
          </v-chip>
        </div>
      </v-card>

      <section>
        <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
          <div>
            <h2 class="text-h5 font-weight-bold d-flex align-center ga-2 mb-1">
              <v-icon color="primary">hub</v-icon>
              Feed da Comunidade
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Projetos públicos publicados por outros usuários.
            </p>
          </div>
        </div>

        <v-empty-state
          v-if="!loading && filteredProjects.length === 0"
          icon="search_off"
          :title="searchQuery ? 'Nenhum resultado' : 'Nenhum código publicado ainda'"
          :text="searchQuery ? `Nenhum projeto encontrado para '${searchQuery}'` : 'Seja o primeiro a publicar um código na comunidade!'"
        />

        <ComponentLoadSessions
          v-else
          :items="filteredProjects"
          :loading="loading"
          style-type="grade"
        />
      </section>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import type { ProjectAttributes as Game } from "@projeto/types";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { http } from "@/functions";

const router = useRouter();

const projects = ref<Game[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const sortBy = ref("recent");

onMounted(async () => {
  loading.value = true;
  try {
    const data = await http.get({
      type: "database",
      route: "getProjects",
    });
    projects.value = Object.values(data);
  } catch (error) {
    console.error("Falha ao carregar códigos públicos:", error);
  } finally {
    loading.value = false;
  }
});

const filteredProjects = computed(() => {
  let list = [...projects.value];

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }

  if (sortBy.value === "recent") {
    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy.value === "name") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list.map((p) => ({
    ...p,
    action: () => router.push({ name: "CodeEdit", params: { id: p.id } }),
  }));
});
</script>

<style scoped>
.page-shell {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-surface), 0.96));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.search-card {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.78) !important;
}

.glow-bg {
  position: absolute;
  top: -45%;
  right: -18%;
  width: 60%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  transform: rotate(-15deg);
  pointer-events: none;
  z-index: 1;
}

.tracking-tight {
  letter-spacing: -0.02em !important;
}

.max-width-680 {
  max-width: 680px;
}
</style>
