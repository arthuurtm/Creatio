<template>
  <n-modal
    v-model:show="isOpen"
    preset="card"
    class="w-[520px]!"
    title="Projetos recentes"
    :bordered="false"
  >
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-2 py-2">
      <n-card v-for="n in 4" :key="n" class="rounded-xl p-3">
        <n-space align="center" :size="12">
          <n-skeleton circle class="h-[38px] w-[38px]" />
          <n-space vertical :size="6">
            <n-skeleton text class="w-[150px] h-4" />
            <n-skeleton text class="w-[100px] h-3" />
          </n-space>
        </n-space>
      </n-card>
    </div>

    <!-- Lista de projetos -->
    <n-list v-else-if="projects.length" hoverable :bordered="false" class="py-1">
      <n-list-item
        v-for="project in projects"
        :key="project.id"
        @click="openProject(project)"
        class="cursor-pointer p-3 rounded-xl"
      >
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <n-avatar round :style="{ backgroundColor: 'var(--n-primary-color)', color: 'white' }">
              <n-icon size="18"><TerminalOutline /></n-icon>
            </n-avatar>
            <div class="flex flex-col">
              <span class="text-sm font-bold">{{ project.title }}</span>
              <span class="text-xs opacity-60">{{ formatDate(project.updatedAt || project.createdAt) }}</span>
            </div>
          </div>
          <n-icon size="16"><ChevronForward /></n-icon>
        </div>
      </n-list-item>
    </n-list>

    <!-- Estado vazio -->
    <div v-else class="flex flex-col items-center text-center py-8 px-4 gap-3">
      <n-icon size="48" class="opacity-30"><TerminalOutline /></n-icon>
      <div>
        <p class="text-base font-bold m-0">Nenhum projeto ainda</p>
        <p class="text-[13px] opacity-70 mt-1 mb-0">
          Comece a adicionar elementos no canvas para criar seu primeiro projeto.
        </p>
      </div>
    </div>

    <template #action>
      <n-space justify="space-between" align="center" class="w-full">
        <n-button text @click="goToProjects">
          <template #icon>
            <n-icon><GridOutline /></n-icon>
          </template>
          Ver todos
        </n-button>
        <n-button
          type="primary"
          round
          @click="isOpen = false"
        >
          Começar em branco
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { TerminalOutline, ChevronForward, GridOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { http } from "@/utils";

const router = useRouter();
const userStore = useUserStore();

const isOpen = ref(false);
const loading = ref(false);
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
			type: "database",
			route: "getProjects",
			querys: { userId: userStore.id },
		});
		const list: any[] = Object.values(res || {});
		// ordena por mais recente e limita em 8
		list.sort(
			(a, b) =>
				new Date(b.updatedAt || b.createdAt).getTime() -
				new Date(a.updatedAt || a.createdAt).getTime(),
		);
		projects.value = list.slice(0, 8);
	} finally {
		loading.value = false;
	}
}

function openProject(project: any) {
	isOpen.value = false;
	router.push({ name: "CodeEdit", params: { id: project.id } });
}

function goToProjects() {
	isOpen.value = false;
	router.push({ name: "CodeProjects" });
}

function formatDate(date: any): string {
	if (!date) return "";
	const d = new Date(date);
	const diff = Date.now() - d.getTime();
	const days = Math.floor(diff / 86400000);
	const h = Math.floor(diff / 3600000);
	const min = Math.floor(diff / 60000);
	if (min < 1) return "agora mesmo";
	if (min < 60) return `há ${min} min`;
	if (h < 24) return `há ${h}h`;
	if (days < 7) return `há ${days} dia${days !== 1 ? "s" : ""}`;
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
	}).format(d);
}

// Abre automaticamente quando o userStore tiver id (login já resolvido)
watch(
	() => userStore.id,
	(id) => {
		if (id) open();
	},
	{ immediate: true },
);

defineExpose({ open });
</script>
