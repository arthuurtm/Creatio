import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { http } from "@/utils";
import { showToast } from "@/plugins/toast";
import type { useEditorStore } from "@/stores/editor";
import type { useEditorPersistence } from "@/composables/useEditorPersistence";

export function useAutoCreateProject(
  editorStore: ReturnType<typeof useEditorStore>,
  persistence: ReturnType<typeof useEditorPersistence>,
) {
  const router = useRouter();
  const autoCreating = ref(false);

  watch(
    () => editorStore.nodes.length,
    async (len, prev) => {
      if (len !== 1 || prev !== 0 || editorStore.info.id || autoCreating.value) return;

      autoCreating.value = true;
      try {
        const result = await http.post(
          { type: "database", route: "setProject" },
          { state: editorStore.$state },
        );
        Object.assign(editorStore.info, { id: result.id, title: result.title });
        router.replace({ name: "CodeEdit", params: { id: result.id } });
        editorStore.setId(Number(result.id));
        await persistence.loadProject(Number(result.id));
      } catch {
        showToast({ type: "error", message: "Não foi possível criar o projeto automaticamente." });
      } finally {
        autoCreating.value = false;
      }
    },
  );

  return { autoCreating };
}
