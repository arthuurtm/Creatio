<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { ProjectAttributes as Game } from "@projeto/types";
import { http } from "@/utils";
import { useUserStore } from "@/stores";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { showToast } from "@/plugins/toast";

const props = withDefaults(
  defineProps<{
    rail?: boolean;
  }>(),
  {
    rail: false,
  }
);

const emit = defineEmits<{
  (e: "expand"): void;
}>();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { editorStore } = useEditorExplorer();

const allProjects = ref<Game[]>([]);
const loading = ref(true);
const createLoading = ref(false);
const searchQuery = ref("");

function isProjectActive(projectId: string | number) {
  return route.name === "CodeEdit" && String(route.params.id) === String(projectId);
}

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

const filteredProjects = computed(() => {
  let list = [...allProjects.value];

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

const recentProjects = computed(() => {
  return filteredProjects.value.slice(0, 6);
});

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
  <v-container :class="!rail ? 'px-3' : 'px-0'">
    <div v-if="!rail">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="solo-filled"
        flat
        hide-details
        rounded="pill"
        prepend-inner-icon="search"
        placeholder="Buscar projetos..."
        clearable
      />
    </div>

    <v-list v-if="loading && allProjects.length === 0" nav>
      <v-skeleton-loader
        v-for="n in 3"
        :key="n"
        :type="rail ? 'avatar' : 'list-item'"
        class="mb-2 bg-transparent"
      />
    </v-list>

    <v-list v-else nav>
      <v-empty-state
        v-if="filteredProjects.length === 0 && !rail"
        density="compact"
        :icon="searchQuery ? 'search_off' : 'terminal'"
        :title="searchQuery ? 'Sem resultados' : 'Sem projetos'"
        class="py-2"
      >
        <template #actions v-if="!searchQuery">
          <v-btn variant="text" color="primary" @click="criarNovoProjeto">
            Criar um projeto
          </v-btn>
        </template>
      </v-empty-state>

      <template v-else>
        <v-list-item
          v-for="project in recentProjects"
          :key="project.id"
          :active="isProjectActive(project.id)"
          prepend-icon="terminal"
          rounded="pill"
          color="primary"
          @click="router.push({ name: 'CodeEdit', params: { id: project.id } })"
        >
          <v-list-item-title v-if="!rail" class="font-weight-medium text-truncate">
            {{ project.title }}
          </v-list-item-title>

          <template #append v-if="!rail">
            <span class="text-caption text-medium-emphasis">
              {{ formatTime(project.updatedAt || project.createdAt) }}
            </span>
          </template>

          <v-tooltip v-if="rail" activator="parent" location="right" class="rounded-xl">
            {{ project.title }}
          </v-tooltip>
        </v-list-item>
      </template>
    </v-list>
  </v-container>
</template>
