import type { EditorState } from "@projeto/types";
import { ref } from "vue";
import { http } from "@/utils";
import { useEditor } from "@/composables/useEditor";
export interface Diagnostic {
  severity: "error" | "warning" | "info";
  message: string;
  nodeId?: string;
  rule?: string;
  nodeLabel?: string;
}

export function useEditorPersistence() {
  const editor = useEditor();

  const requestStatus = editor.requestStatus;
  const saveError = editor.saveError;
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
        await editor.setState(remote);
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

  async function requestCompile() {
    isCompiling.value = true;
    compileError.value = "";
    diagnostics.value = [];
    try {
      const code = await editor.compileToCode();
      compiledCode.value = code || "/* Canvas vazio */";
      diagnostics.value = [];
      compileError.value = "";
    } catch (err: any) {
      compileError.value = err.message || "Erro na compilação do Rete";
    } finally {
      isCompiling.value = false;
    }
  }

  return {
    loadProject,
    saveState: editor.syncToCloud,
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
