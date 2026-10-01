import type { RequestStatusValues } from "@projeto/types";
import { useDebounceFn } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { nextTick, ref, watch, type Ref } from "vue";
import { http } from "@/utils";
import { useEditorStore, type FileInfo } from "@/stores/editor";

interface EditorCloudSync {
	requestStatus: Ref<RequestStatusValues>;
	saveError: Ref<string>;
	syncToCloud: () => Promise<void>;
	setState: (state: Parameters<ReturnType<typeof useEditorStore>["setState"]>[0]) => Promise<void>;
}

const cloudSyncByStore = new WeakMap<object, EditorCloudSync>();

function getCloudSync(store: ReturnType<typeof useEditorStore>): EditorCloudSync {
	const existingSync = cloudSyncByStore.get(store);
	if (existingSync) return existingSync;

	const requestStatus = ref<RequestStatusValues>("IDLE");
	const saveError = ref("");
	let isApplyingRemoteState = false;
	let lastSyncedSnapshot = "";

	function createCloudState() {
		return {
			info: JSON.parse(JSON.stringify(store.info)),
			nodes: JSON.parse(JSON.stringify(store.nodes)),
			connections: JSON.parse(JSON.stringify(store.connections)),
		};
	}

	const syncToCloud = useDebounceFn(async () => {
		if (isApplyingRemoteState || !store.info.id) return;

		const state = createCloudState();
		const snapshot = JSON.stringify(state);
		if (snapshot === lastSyncedSnapshot) return;

		requestStatus.value = "SENDING";
		saveError.value = "";
		try {
			await http.put(
				{ type: "database", route: "saveProjectState" },
				{ id: store.info.id, state },
			);
			lastSyncedSnapshot = snapshot;
			requestStatus.value = "SUCCESS";
		} catch (error) {
			requestStatus.value = "ERROR";
			saveError.value = error instanceof Error ? error.message : "Erro ao sincronizar projeto";
		}
	}, 600);

	watch(
		() => [store.info, store.nodes, store.connections],
		() => {
			if (!isApplyingRemoteState && store.info.id) void syncToCloud();
		},
		{ deep: true, flush: "post" },
	);

	const setState: EditorCloudSync["setState"] = async (state) => {
		isApplyingRemoteState = true;
		syncToCloud.cancel();
		try {
			await store.setState(state);
			await nextTick();
			lastSyncedSnapshot = JSON.stringify(createCloudState());
		} finally {
			isApplyingRemoteState = false;
		}
	};

	const cloudSync = { requestStatus, saveError, syncToCloud, setState };
	cloudSyncByStore.set(store, cloudSync);
	return cloudSync;
}

export function useEditor() {
	const store = useEditorStore();
	const state = storeToRefs(store);
	const cloudSync = getCloudSync(store);

	return {
		...state,
		requestStatus: cloudSync.requestStatus,
		saveError: cloudSync.saveError,
		syncToCloud: cloudSync.syncToCloud,
		setEditorInstance: store.setEditorInstance,
		loadSnippets: store.loadSnippets,
		addNode: store.addNode,
		removeNode: store.removeNode,
		insertSnippet: store.insertSnippet,
		compileToCode: store.compileToCode,
		getState: store.getState,
		setState: cloudSync.setState,
		clearState: store.clearState,
		setId: store.setId,
		getSnapshot: () => store.$state,
		updateInfo: (info: Partial<FileInfo>) => Object.assign(store.info, info),
	};
}
