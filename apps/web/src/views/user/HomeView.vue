<template>
  <!-- BANNER PRINCIPAL (GOOGLE-STYLE GLOWING) -->
  <div class="gradient-primary py-12 px-6 px-md-16 mb-8 ma-4 rounded-xl shadow-lg position-relative overflow-hidden">
    <div class="glow-bg"></div>
    <v-container class="position-relative" style="z-index: 2;">
      <v-row align="center">
        <v-col cols="12" md="8">
          <h1 class="text-h3 font-weight-bold tracking-tight mb-3">
            Explorar Códigos Públicos
          </h1>
          <p class="text-h6 opacity-90 font-weight-regular max-width-600">
            Estude a lógica de blocos, importe códigos de outros desenvolvedores e colabore na comunidade Creatio.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- FEED EXPLORADOR -->
  <v-container class="px-md-10 mb-12">
    <!-- CONTROLES DE BUSCA E ORDENAÇÃO -->
    <v-row align="center" class="mb-6 ga-3 flex-wrap">
      <v-col cols="12" sm="5" md="4" class="py-0">
        <v-text-field
          v-model="searchQuery"
          type="search"
          variant="outlined"
          placeholder="Buscar por nome ou descrição..."
          prepend-inner-icon="search"
          hide-details
          density="comfortable"
          rounded="lg"
        />
      </v-col>
      
      <v-col cols="auto" class="py-0">
        <div class="d-flex align-center ga-2">
          <span class="text-caption text-medium-emphasis mr-1 font-weight-medium">Ordenar:</span>
          <v-btn-toggle
            v-model="sortBy"
            mandatory
            variant="outlined"
            color="primary"
            rounded="lg"
            density="comfortable"
          >
            <v-btn value="recent" class="px-4 text-none">Recentes</v-btn>
            <v-btn value="name" class="px-4 text-none">Nome</v-btn>
          </v-btn-toggle>
        </div>
      </v-col>

      <v-spacer />
    </v-row>

    <!-- CONTAINER DE LISTAGEM -->
    <section>
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h5 font-weight-bold d-flex align-center">
          <v-icon start color="primary">hub</v-icon>
          Feed da Comunidade
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-bold">
            {{ filteredProjects.length }} projeto(s)
          </v-chip>
        </h2>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="rounded-lg mb-6" />

      <ComponentLoadSessions
        v-else
        :items="filteredProjects"
        style-type="grade"
      />
    </section>
  </v-container>
</template>

<script setup lang="ts">
import type { ProjectAttributes as Game } from "@projeto/types";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import ComponentLoadSessions from "@/components/modules/ComponentLoadSessions.vue";
import { http } from "@/functions";
import { useUserStore } from "@/stores";

const userStore = useUserStore();
const router = useRouter();

const projects = ref<Game[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const sortBy = ref("recent");

const sortOptions = [
  { title: "Recentes", value: "recent" },
  { title: "Nome", value: "name" },
];

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

  // 1. Filtrar por busca textual
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // 2. Ordenação
  if (sortBy.value === "recent") {
    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy.value === "name") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Mapear ação de click para abrir o código no editor
  return list.map((p) => ({
    ...p,
    action: () => router.push({ name: "CodeEdit", params: { id: p.id } }),
  }));
});
</script>

<style scoped>
.gradient-primary {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  color: white;
}

.glow-bg {
  position: absolute;
  top: -50%;
  right: -20%;
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

.max-width-600 {
  max-width: 600px;
}
</style>
