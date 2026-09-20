<script setup lang="ts">
import {
  ContentCopyOutlined,
  DownloadOutlined,
  RefreshOutlined,
} from "@vicons/material";
import {
  NButton, NDrawer, NDrawerContent, NIcon, NSpace, NSpin, NBadge, NCollapse, NCollapseItem,
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
const diagnostics = computed(() => persistence.diagnostics.value);

// Contadores por severidade
const errorCount = computed(() => diagnostics.value.filter(d => d.severity === 'error').length);
const warningCount = computed(() => diagnostics.value.filter(d => d.severity === 'warning').length);
const infoCount = computed(() => diagnostics.value.filter(d => d.severity === 'info').length);
const hasIssues = computed(() => diagnostics.value.length > 0);

// Ícone e cor por severidade
function severityIcon(severity: string) {
  if (severity === 'error') return '🔴';
  if (severity === 'warning') return '🟡';
  return '🔵';
}

function severityClass(severity: string) {
  if (severity === 'error') return 'diag-error';
  if (severity === 'warning') return 'diag-warning';
  return 'diag-info';
}

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
          <div class="flex items-center gap-2">
            <span>Código Javascript</span>
            <NBadge v-if="errorCount > 0" :value="errorCount" type="error" />
            <NBadge v-if="warningCount > 0" :value="warningCount" type="warning" />
            <NBadge v-if="infoCount > 0" :value="infoCount" type="info" />
          </div>
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

        <!-- Painel de Diagnósticos -->
        <div v-if="hasIssues" class="diagnostics-panel">
          <NCollapse :default-expanded-names="['diagnostics']" arrow-placement="left">
            <NCollapseItem name="diagnostics">
              <template #header>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wide opacity-80">Diagnósticos</span>
                  <span class="text-[10px] opacity-60">({{ diagnostics.length }})</span>
                </div>
              </template>
              <div class="diagnostics-list">
                <div
                  v-for="(diag, idx) in diagnostics"
                  :key="idx"
                  class="diag-item"
                  :class="severityClass(diag.severity)"
                >
                  <div class="diag-header">
                    <span class="diag-icon">{{ severityIcon(diag.severity) }}</span>
                    <span class="diag-rule">{{ diag.rule }}</span>
                    <span v-if="diag.nodeLabel" class="diag-label">{{ diag.nodeLabel }}</span>
                  </div>
                  <div class="diag-message">{{ diag.message }}</div>
                </div>
              </div>
            </NCollapseItem>
          </NCollapse>
        </div>

        <!-- Status de aprovação quando não há erros -->
        <div v-else-if="compiledCodeText && !isCompiling" class="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs flex items-center gap-2">
          ✅ Nenhum problema encontrado no seu código!
        </div>

        <div class="flex-1 min-h-0 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-xs overflow-auto leading-relaxed select-text border border-white/10 relative">
          <NSpin v-if="isCompiling" class="absolute inset-0 flex items-center justify-center bg-black/40 z-10" />
          <pre class="m-0 whitespace-pre-wrap word-break-all">{{ compiledCodeText || '// Nenhum nó compilável no canvas' }}</pre>
        </div>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.diagnostics-panel {
  border-radius: 10px;
  overflow: hidden;
}

.diagnostics-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  padding: 2px 0;
}

.diag-item {
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 11px;
  transition: background-color 0.15s ease;
}

.diag-item.diag-error {
  background-color: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.diag-item.diag-warning {
  background-color: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.diag-item.diag-info {
  background-color: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.diag-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.diag-icon {
  font-size: 10px;
  flex-shrink: 0;
}

.diag-rule {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.6;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.diag-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--n-text-color);
  padding: 0 5px;
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.diag-message {
  font-size: 11px;
  line-height: 1.5;
  opacity: 0.85;
}
</style>
