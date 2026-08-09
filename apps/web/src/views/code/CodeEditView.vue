<script setup lang="ts">
import type { RequestStatusValues } from "@projeto/types";
import { debounce } from "lodash-es";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ComponentNode from "@/components/modules/ComponentNode.vue";
import Properties from "@/components/modules/Properties.vue";
import type RecentProjectsOverlay from "@/components/modules/RecentProjectsOverlay.vue";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { editorConnection } from "@/composables/useWebsocketConnection.ts";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores";
import { http } from "@/utils";
import { getIconComponent } from "@/utils/icons";

const props = defineProps({ id: String });

const { editorStore } = useEditorExplorer();
const wsConn = editorConnection();
const userStore = useUserStore();
const router = useRouter();
const overlayRef = ref<InstanceType<typeof RecentProjectsOverlay> | null>(null);
const autoCreating = ref(false);

const delayedStatus = ref<RequestStatusValues>(wsConn.requestStatus.value);
const mapStatusIcon: Record<RequestStatusValues, string> = {
	IDLE: "cloud",
	SENDING: "cloud_sync",
	ERROR: "cloud_alert",
	WAITING: "cloud_sync",
	SUCCESS: "cloud_done",
};
const connectionIcon = computed(() => mapStatusIcon[delayedStatus.value]);
const updateDelayed = debounce((status: any) => {
	delayedStatus.value = status;
}, 500);
watch(wsConn.requestStatus, (s) => updateDelayed(s));

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
				// Inicia WS agora que temos o id
				editorStore.setId(Number(result.id));
				await wsConn.start();
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
		await wsConn.start();
		wsConn.send({
			event: "project:lab:get:json",
			payload: {
				info: editorStore.info,
				nodes: editorStore.nodes,
				connections: editorStore.connections,
			} as any,
		});
	}
});

onUnmounted(() => {
	wsConn.stop();
	editorStore.clearState();
});
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden relative">
    <Properties />

    <div class="grow h-full relative">
      <ComponentNode v-model:nodes="flowNodes" v-model:edges="flowEdges">
        <template #header>
          <div class="absolute top-3 right-3 z-[100] pointer-events-none">
            <div class="pointer-events-auto">
              <n-tag
                :type="delayedStatus === 'ERROR' ? 'error' : 'success'"
                round
              >
                <template #icon>
                  <n-icon size="16">
                    <component :is="getIconComponent(connectionIcon)" />
                  </n-icon>
                </template>
                {{ wsConn.error.value?.message || "Conectado" }}
              </n-tag>
            </div>
          </div>
        </template>
      </ComponentNode>
    </div>

    <RecentProjectsOverlay v-if="!id" ref="overlayRef" />
  </div>
</template>
