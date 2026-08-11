import type { EditorState, RequestStatusValues } from "@projeto/types";
import { debounce } from "lodash-es";
import { ref, watch } from "vue";
import { http } from "@/utils";
import { useEditorStore } from "@/stores/editor";

export function useEditorPersistence() {
  const store = useEditorStore();

  const requestStatus = ref<RequestStatusValues>("IDLE");
  const saveError = ref<string>("");
  const compiledCode = ref<string>("");
  const compileError = ref<string>("");
  const isCompiling = ref(false);
  const isLoading = ref(false);

  async function loadProject(id: number) {
    isLoading.value = true;
    requestStatus.value = "WAITING";
    try {
      const remote = (await http.get({
        type: "database",
        route: "getProjectState",
        querys: { id },
      })) as EditorState;

      if (
        remote &&
        (remote.nodes?.length > 0 ||
          remote.connections?.length > 0 ||
          remote.info?.id)
      ) {
        store.setState(remote);
      }
      requestStatus.value = "SUCCESS";
    } catch (err: any) {
      requestStatus.value = "ERROR";
      saveError.value = err.message || "Erro ao carregar projeto";
      console.error("Erro ao carregar projeto:", err);
    } finally {
      isLoading.value = false;
    }
  }

  const slowSave = debounce(async () => {
    if (!store.info.id) return;
    requestStatus.value = "SENDING";
    saveError.value = "";
    try {
      const payload = {
        info: JSON.parse(JSON.stringify(store.info)),
        nodes: JSON.parse(JSON.stringify(store.nodes)),
        connections: JSON.parse(JSON.stringify(store.connections)),
      };
      await http.put(
        { type: "database", route: "saveProjectState" },
        { id: store.info.id, state: payload },
      );
      requestStatus.value = "SUCCESS";
    } catch (err: any) {
      requestStatus.value = "ERROR";
      saveError.value = err.message || "Erro ao salvar projeto";
    }
  }, 600);

  async function requestCompile() {
    isCompiling.value = true;
    compileError.value = "";
    try {
      const payload = {
        info: JSON.parse(JSON.stringify(store.info)),
        nodes: JSON.parse(JSON.stringify(store.nodes)),
        connections: JSON.parse(JSON.stringify(store.connections)),
      };
      const result = await http.post(
        { type: "database", route: "compileProject" },
        { state: payload },
      );
      if (result.success !== false && result.code !== undefined) {
        compiledCode.value = result.code || "";
        compileError.value = "";
      } else {
        compileError.value =
          result.error || result.message || "Erro na compilação";
      }
    } catch (err: any) {
      compileError.value = err.message || "Erro na compilação";
    } finally {
      isCompiling.value = false;
    }
  }

  watch(
    () => [store.nodes, store.connections],
    () => {
      if (store.info.id) {
        slowSave();
      }
    },
    { deep: true, flush: "post" },
  );

  return {
    loadProject,
    saveState: slowSave,
    requestStatus,
    saveError,
    compiledCode,
    compileError,
    isCompiling,
    isLoading,
    requestCompile,
  };
}
