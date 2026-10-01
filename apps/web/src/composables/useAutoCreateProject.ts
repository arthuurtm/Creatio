import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { http } from "@/utils";
import { showToast } from "@/plugins/toast";
import { useEditor } from "@/composables/useEditor";
import type { useEditorPersistence } from "@/composables/useEditorPersistence";

export function useAutoCreateProject(
  persistence: ReturnType<typeof useEditorPersistence>,
) {
  const editor = useEditor();
  const router = useRouter();
  const autoCreating = ref(false);

  watch(
    () => editor.nodes.value.length,
    async (len, prev) => {
      if (len !== 1 || prev !== 0 || editor.info.value.id || autoCreating.value) return;

      autoCreating.value = true;
      try {
        const result = await http.post(
          { type: "database", route: "setProject" },
          { state: editor.getSnapshot() },
        );
          editor.updateInfo({ id: result.id, title: result.title });
        router.replace({ name: "CodeEdit", params: { id: result.id } });
          editor.setId(Number(result.id));
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
