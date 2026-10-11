<script setup lang="ts">
import {
  ContentCopyOutlined,
  DownloadOutlined,
  RefreshOutlined,
  CodeOutlined,
} from "@vicons/material";
import { ChevronForward, ExpandOutline, ContractOutline, CheckmarkOutline } from "@vicons/ionicons5";
import {
  NButton, NIcon, NSpace, NBadge, NCollapse, NCollapseItem,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { useEditor } from "@/composables/useEditor";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { showToast } from "@/plugins/toast";

defineProps<{ to?: HTMLElement | null }>();
const show = defineModel<boolean>("show", { required: true });

const editor = useEditor();
const persistence = useEditorPersistence();

const isFullscreen = ref(false);
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

const editableCode = ref("");

// Ícone e cor por severidade
function severityIcon(severity: string) {
  if (severity === 'error') return 'error';
  if (severity === 'warning') return 'warning';
  return 'info';
}

function severityClass(severity: string) {
  if (severity === 'error') return 'diag-error';
  if (severity === 'warning') return 'diag-warning';
  return 'diag-info';
}

function compileNow() {
  persistence.requestCompile();
}

// Sincroniza editableCode sempre que o código compilado mudar (após o compile terminar)
watch(compiledCodeText, (code) => {
  editableCode.value = code;
});

watch(
  () => [editor.nodes.value, editor.connections.value],
  () => {
    if (autoCompile.value && show.value) {
      compileNow();
    }
  },
  { deep: true },
);

watch(show, (open) => {
  if (open) {
    compileNow();
  }
});

function copyCodeToClipboard() {
  navigator.clipboard.writeText(editableCode.value || "");
  showToast({ type: "success", message: "Código copiado para a área de transferência!" });
}

function downloadCodeFile() {
  if (!editableCode.value) compileNow();
  const title = editor.info.value.title || "algoritmo";
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.js`;
  const blob = new Blob([editableCode.value], { type: "application/javascript;charset=utf-8" });
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

const isApplying = ref(false);
async function applyCodeToCanvas() {
  try {
    isApplying.value = true;
    await editor.clearState();
    if (editableCode.value.trim()) {
      await editor.insertSnippet(editableCode.value);
    }
    showToast({ type: "success", message: "Canvas atualizado a partir do código!" });
  } catch (err: any) {
    showToast({ type: "error", message: "Erro ao gerar blocos: " + err.message });
  } finally {
    isApplying.value = false;
  }
}
</script>

<template>
  <aside
    class="shrink-0 transition-all duration-300 ease-in-out border-l bg-[var(--n-color)] z-[100]"
    :class="{
      'h-full relative': !isFullscreen,
      'inset-0 w-full ': isFullscreen,
      'w-[540px]': show && !isFullscreen,
      'w-0 opacity-0 pointer-events-none border-none': !show,
    }"
  >
    <div v-show="show" class="h-full flex flex-col overflow-hidden" :class="isFullscreen ? 'w-full' : 'min-w-[540px]'">
      <!-- Header -->
      <div class="p-4 border-b flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <NButton circle quaternary size="small" title="Fechar" @click="show = false; isFullscreen = false">
            <template #icon>
              <NIcon size="18"><ChevronForward /></NIcon>
            </template>
          </NButton>
          <NIcon size="20" class="text-[color:var(--n-primary-color)]"><CodeOutlined /></NIcon>
          <span class="font-bold text-[15px]">Código Javascript</span>
          <NBadge v-if="errorCount > 0" :value="errorCount" type="error" />
          <NBadge v-if="warningCount > 0" :value="warningCount" type="warning" />
          <NBadge v-if="infoCount > 0" :value="infoCount" type="info" />
        </div>

        <div class="flex items-center gap-2">
          <NButton size="small" type="primary" ghost round :loading="isApplying" @click="applyCodeToCanvas" title="Aplicar no Canvas">
            <template #icon><NIcon><CheckmarkOutline /></NIcon></template>
          </NButton>
          <NButton size="small" ghost round :loading="isCompiling" @click="compileNow" title="Recompilar">
            <template #icon><NIcon><RefreshOutlined /></NIcon></template>
          </NButton>
          <NButton size="small" ghost round @click="copyCodeToClipboard" title="Copiar">
            <template #icon><NIcon><ContentCopyOutlined /></NIcon></template>
          </NButton>
          <NButton type="primary" size="small" round @click="downloadCodeFile" title="Baixar .js">
            <template #icon><NIcon><DownloadOutlined /></NIcon></template>
          </NButton>

          <NButton circle quaternary size="small" class="ml-2" :title="isFullscreen ? 'Restaurar' : 'Tela Inteira'" @click="isFullscreen = !isFullscreen">
            <template #icon>
              <NIcon size="18">
                <ExpandOutline v-if="!isFullscreen" />
                <ContractOutline v-else />
              </NIcon>
            </template>
          </NButton>
        </div>
      </div>

      <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div v-if="compileErrorText" class="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {{ compileErrorText }}
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
                    <span class="diag-icon-circle"></span>
                    <span class="diag-rule">{{ diag.rule }}</span>
                    <span v-if="diag.nodeLabel" class="diag-label">{{ diag.nodeLabel }}</span>
                  </div>
                  <div class="diag-message">{{ diag.message }}</div>
                </div>
              </div>
            </NCollapseItem>
          </NCollapse>
        </div>

        <div class="flex-1 min-h-0 p-4 font-mono text-xs overflow-hidden relative flex flex-col">
          <textarea
            v-model="editableCode"
            class="w-full h-full bg-transparent text-inherit font-mono outline-none resize-none m-0 whitespace-pre-wrap break-words"
            spellcheck="false"
            placeholder="// Nenhum nó compilável no canvas"
          ></textarea>
        </div>
      </div>
    </div>
  </aside>
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

.diag-icon-circle { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; } .diag-error .diag-icon-circle { background-color: #ef4444; } .diag-warning .diag-icon-circle { background-color: #f59e0b; } .diag-info .diag-icon-circle { background-color: #3b82f6; } .old-diag-icon {
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
