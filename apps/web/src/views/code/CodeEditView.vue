<script setup lang="ts">
import type { RequestStatusValues } from "@projeto/types";
import {
	CodeOutlined,
	ContentCopyOutlined,
	DownloadOutlined,
	RefreshOutlined,
} from "@vicons/material";
import { debounce } from "lodash-es";
import {
	NButton,
	NDrawer,
	NDrawerContent,
	NIcon,
	NSpace,
	NSpin,
	NSwitch,
	NTag,
} from "naive-ui";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ComponentNode from "@/components/modules/ComponentNode.vue";
import Properties from "@/components/modules/Properties.vue";
import type RecentProjectsOverlay from "@/components/modules/RecentProjectsOverlay.vue";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores";
import { http } from "@/utils";
import { getIconComponent } from "@/utils/icons";

const props = defineProps({ id: String });

const { editorStore } = useEditorExplorer();
const persistence = useEditorPersistence();
const userStore = useUserStore();
const router = useRouter();
const autoCreating = ref(false);

// ── Code Panel State (Server-side compilation via REST) ─────────────────────────
const showCodeDrawer = ref(false);
const autoCompile = ref(true);

const compiledCodeText = computed(() => persistence.compiledCode.value);
const compileErrorText = computed(() => persistence.compileError.value);
const isCompiling = computed(() => persistence.isCompiling.value);

function compileNow() {
	persistence.requestCompile();
}

watch(
	() => [editorStore.nodes, editorStore.connections],
	() => {
		if (autoCompile.value && showCodeDrawer.value) {
			compileNow();
		}
	},
	{ deep: true },
);

watch(showCodeDrawer, (open) => {
	if (open) compileNow();
});

function copyCodeToClipboard() {
	navigator.clipboard.writeText(compiledCodeText.value || "");
	showToast({
		type: "success",
		message: "Código copiado para a área de transferência!",
	});
}

function downloadCodeFile() {
	if (!compiledCodeText.value) compileNow();
	const title = editorStore.info.title || "algoritmo";
	const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.js`;

	const blob = new Blob([compiledCodeText.value], {
		type: "application/javascript;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
	showToast({ type: "success", message: `Arquivo "${fileName}" baixado!` });
}

const delayedStatus = ref<RequestStatusValues>(persistence.requestStatus.value);
const mapStatusIcon: Record<RequestStatusValues, string> = {
	IDLE: "cloud",
	SENDING: "cloud_sync",
	ERROR: "cloud_alert",
	WAITING: "cloud_sync",
	SUCCESS: "cloud_done",
};
const mapStatusText: Record<RequestStatusValues, string> = {
	IDLE: "Salvo",
	SENDING: "Salvando...",
	ERROR: "Erro ao salvar",
	WAITING: "Carregando...",
	SUCCESS: "Salvo",
};
const connectionIcon = computed(() => mapStatusIcon[delayedStatus.value]);
const connectionStatusText = computed(() => mapStatusText[delayedStatus.value]);

const updateDelayed = debounce((status: any) => {
	delayedStatus.value = status;
}, 500);
watch(persistence.requestStatus, (s) => updateDelayed(s));

const flowNodes = computed<any>({
	get: () => editorStore.nodes,
	set: (val) => editorStore.setState({ nodes: val }),
});

const flowEdges = computed<any>({
	get: () => editorStore.connections,
	set: (val) => editorStore.setState({ connections: val }),
});

watch(
	() => editorStore.nodes.length,
	async (len, prev) => {
		if (
			len === 1 &&
			prev === 0 &&
			!editorStore.info.id &&
			!autoCreating.value
		) {
			autoCreating.value = true;
			try {
				const result = await http.post(
					{ type: "database", route: "setProject" },
					{ state: editorStore.$state },
				);
				Object.assign(editorStore.info, { id: result.id, title: result.title });
				// Atualiza a URL sem recarregar o componente
				router.replace({ name: "CodeEdit", params: { id: result.id } });
				editorStore.setId(Number(result.id));
				await persistence.loadProject(Number(result.id));
			} catch (err) {
				showToast({
					type: "error",
					message: "Não foi possível criar o projeto automaticamente.",
				});
			} finally {
				autoCreating.value = false;
			}
		}
	},
);

onMounted(async () => {
	if (props.id) {
		editorStore.setId(Number(props.id));
		await persistence.loadProject(Number(props.id));
	}
});

onUnmounted(() => {
	editorStore.clearState();
});
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden relative">
    <Properties />

    <div class="grow h-full relative">
      <ComponentNode
        v-model:nodes="flowNodes"
        v-model:edges="flowEdges"
        @open-code-panel="showCodeDrawer = true"
      >
        <template #header>
          <div class="absolute top-3 right-3 z-[100] pointer-events-none flex gap-2">
            <div class="pointer-events-auto flex items-center gap-2">
              <NButton
                size="small"
                secondary
                round
                type="primary"
                @click="showCodeDrawer = true"
              >
                <template #icon>
                  <NIcon><CodeOutlined /></NIcon>
                </template>
                Código JS
              </NButton>

              <NTag
                :type="delayedStatus === 'ERROR' ? 'error' : 'success'"
                round
              >
                <template #icon>
                  <NIcon size="16">
                    <component :is="getIconComponent(connectionIcon)" />
                  </NIcon>
                </template>
                {{ persistence.saveError.value || connectionStatusText }}
              </NTag>
            </div>
          </div>
        </template>
      </ComponentNode>
    </div>

    <!-- ══ GAVETA / MODAL DE CÓDIGO ══════════════════════════════════════════ -->
    <NDrawer
      v-model:show="showCodeDrawer"
      :width="540"
      placement="right"
      resizable
    >
      <NDrawerContent closable>
        <template #header>
          <div class="flex items-center justify-between w-full pr-4">
            <span>Código JavaScript Compilado</span>
            <NSpace align="center" :size="8">
              <span class="text-xs opacity-60">Auto-compilar</span>
              <NSwitch v-model:value="autoCompile" size="small" />
            </NSpace>
          </div>
        </template>

        <div class="flex flex-col h-full gap-3">
          <!-- Toolbar de Ações de Código -->
          <div class="flex justify-between items-center bg-[var(--n-color-embedded)] p-2 rounded-lg">
            <NSpace :size="6">
              <NButton size="small" ghost round :loading="isCompiling" @click="compileNow">
                <template #icon><NIcon><RefreshOutlined /></NIcon></template>
                Recompilar
              </NButton>
              <NButton size="small" ghost round @click="copyCodeToClipboard">
                <template #icon><NIcon><ContentCopyOutlined /></NIcon></template>
                Copiar
              </NButton>
            </NSpace>

            <NButton type="primary" size="small" round @click="downloadCodeFile">
              <template #icon><NIcon><DownloadOutlined /></NIcon></template>
              Baixar .js
            </NButton>
          </div>

          <!-- Erro de compilação se houver -->
          <div v-if="compileErrorText" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
            ⚠️ {{ compileErrorText }}
          </div>

          <!-- Código gerado -->
          <div class="flex-1 min-h-0 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-xs overflow-auto leading-relaxed select-text border border-white/10 relative">
            <NSpin v-if="isCompiling" class="absolute inset-0 flex items-center justify-center bg-black/40 z-10" />
            <pre class="m-0 whitespace-pre-wrap word-break-all">{{ compiledCodeText || '// Nenhum nó compilável no canvas' }}</pre>
          </div>
        </div>
      </NDrawerContent>
    </NDrawer>

    <RecentProjectsOverlay v-if="!id" ref="overlayRef" />
  </div>
</template>
