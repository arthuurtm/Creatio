import type { EditorState, RequestStatusValues } from "@projeto/types";
import { useDebounceFn } from "@vueuse/core";
import { ref, watch } from "vue";
import { http } from "@/utils";
import { useEditorStore } from "@/stores/editor";
import { ASTTranspiler, DiagnosticsAnalyzer } from "@projeto/compiler";
import type { Diagnostic } from "@projeto/compiler";

export function useEditorPersistence() {
  const store = useEditorStore();

  const requestStatus = ref<RequestStatusValues>("IDLE");
  const saveError = ref<string>("");
  const compiledCode = ref<string>("");
  const compileError = ref<string>("");
  const isCompiling = ref(false);
  const isLoading = ref(false);
  const diagnostics = ref<Diagnostic[]>([]);

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

  const slowSave = useDebounceFn(async () => {
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
    diagnostics.value = [];
    try {
      // Compilação local no navegador usando o compilador interno
      const transpiler = new ASTTranspiler(store.nodes, store.connections);
      const analyzer = new DiagnosticsAnalyzer(store.nodes, store.connections);
      
      compiledCode.value = transpiler.transpile() || "";
      diagnostics.value = analyzer.analyze() || [];
      compileError.value = "";
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
    diagnostics,
  };
}
