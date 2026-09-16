<script setup lang="ts">
import {
  ContentCopyOutlined,
  DownloadOutlined,
  RefreshOutlined,
} from "@vicons/material";
import {
  NButton, NDrawer, NDrawerContent, NIcon, NSpace, NSpin, NSwitch,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { useEditorExplorer } from "@/composables/useEditorExplorer.ts";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { showToast } from "@/plugins/toast";

defineProps<{ to?: HTMLElement | null }>();
const show = defineModel<boolean>("show", { required: true });

const { editorStore } = useEditorExplorer();
const persistence = useEditorPersistence();

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
    if (autoCompile.value && show.value) compileNow();
  },
  { deep: true },
);

watch(show, (open) => open && compileNow());

function copyCodeToClipboard() {
  navigator.clipboard.writeText(compiledCodeText.value || "");
  showToast({ type: "success", message: "Código copiado para a área de transferência!" });
}

function downloadCodeFile() {
  if (!compiledCodeText.value) compileNow();
  const title = editorStore.info.title || "algoritmo";
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.js`;
  const blob = new Blob([compiledCodeText.value], { type: "application/javascript;charset=utf-8" });
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
</script>

<template>
  <NDrawer
    v-model:show="show"
    :width="540"
    placement="right"
    resizable
    :show-mask="false"
    :to="to ?? undefined"
  >
    <NDrawerContent closable>
      <template #header>
        <div class="flex items-center justify-between w-full pr-4">
          <span>Código Javascript</span>
        </div>
      </template>

      <div class="flex flex-col h-full gap-3">
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

        <div v-if="compileErrorText" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
          ⚠️ {{ compileErrorText }}
        </div>

        <div class="flex-1 min-h-0 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-xs overflow-auto leading-relaxed select-text border border-white/10 relative">
          <NSpin v-if="isCompiling" class="absolute inset-0 flex items-center justify-center bg-black/40 z-10" />
          <pre class="m-0 whitespace-pre-wrap word-break-all">{{ compiledCodeText || '// Nenhum nó compilável no canvas' }}</pre>
        </div>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>
