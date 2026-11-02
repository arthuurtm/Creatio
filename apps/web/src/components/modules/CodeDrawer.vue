<script setup lang="ts">
import {
  ContentCopyOutlined,
  DownloadOutlined,
  RefreshOutlined,
  CodeOutlined,
} from "@vicons/material";
import {
  ChevronForward,
  ChevronBack,
  ExpandOutline,
  ContractOutline,
  CheckmarkOutline,
} from "@vicons/ionicons5";
import {
  NButton,
  NIcon,
  NBadge,
  NCollapse,
  NCollapseItem,
  NTooltip,
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
const errorCount = computed(() => diagnostics.value.filter(d => d.severity === "error").length);
const warningCount = computed(() => diagnostics.value.filter(d => d.severity === "warning").length);
const infoCount = computed(() => diagnostics.value.filter(d => d.severity === "info").length);
const hasIssues = computed(() => diagnostics.value.length > 0);

const editableCode = ref("");

// Contagem de linhas
const lineCount = computed(() => {
  if (!editableCode.value) return 0;
  return editableCode.value.split("\n").length;
});

function severityClass(severity: string) {
  if (severity === "error") return "diag-error";
  if (severity === "warning") return "diag-warning";
  return "diag-info";
}

function compileNow() {
  persistence.requestCompile();
}

// Sincroniza editableCode sempre que o código compilado mudar
watch(compiledCodeText, (code) => {
  editableCode.value = code;
}, { immediate: true });

// Mantém o código e os diagnósticos sempre sincronizados mesmo com o drawer minimizado
watch(
  () => [editor.nodes.value, editor.connections.value],
  () => {
    if (autoCompile.value) {
      compileNow();
    }
  },
  { deep: true, immediate: true }
);

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
    class="code-drawer shrink-0 z-[100]"
    :class="{
      'h-full relative': !isFullscreen,
      'fixed inset-0 w-full h-full': isFullscreen,
      'is-open w-[540px]': show && !isFullscreen,
      'is-rail w-[44px]': !show && !isFullscreen,
    }"
  >
    <!-- ══ MODO MINIMIZADO (RAIL LATERAL COMPACTO) ══════════════════════════ -->
    <div v-if="!show && !isFullscreen" class="code-rail h-full flex flex-col items-center justify-between py-3 px-1">
      <!-- Topo: Expandir e Maximizar -->
      <div class="flex flex-col items-center gap-2">
        <NTooltip trigger="hover" placement="left">
          <template #trigger>
            <NButton
              circle
              quaternary
              size="small"
              class="rail-btn"
              @click="show = true"
            >
              <template #icon>
                <NIcon size="16"><ChevronBack /></NIcon>
              </template>
            </NButton>
          </template>
          Expandir código
        </NTooltip>

        <NTooltip trigger="hover" placement="left">
          <template #trigger>
            <NButton
              circle
              quaternary
              size="small"
              class="rail-btn"
              @click="show = true; isFullscreen = true"
            >
              <template #icon>
                <NIcon size="15"><ExpandOutline /></NIcon>
              </template>
            </NButton>
          </template>
          Tela inteira
        </NTooltip>
      </div>

      <!-- Centro: Indicador de Linhas -->
      <div class="flex flex-col items-center my-auto">
        <NTooltip trigger="hover" placement="left">
          <template #trigger>
            <div class="rail-lines-chip cursor-pointer" @click="show = true">
              <span class="rail-lines-count">{{ lineCount }}</span>
              <span class="rail-lines-label">L</span>
            </div>
          </template>
          {{ lineCount }} linha{{ lineCount !== 1 ? 's' : '' }} de código gerado
        </NTooltip>
      </div>

      <!-- Base: Indicador de Erros / Alertas / Sucesso -->
      <div class="flex flex-col items-center">
        <NTooltip trigger="hover" placement="left">
          <template #trigger>
            <div class="rail-status-chip cursor-pointer" @click="show = true">
              <NBadge v-if="errorCount > 0" :value="errorCount" type="error" />
              <NBadge v-else-if="warningCount > 0" :value="warningCount" type="warning" />
              <span v-else class="rail-status-dot rail-status-dot--ok" />
            </div>
          </template>
          {{
            errorCount > 0
              ? `${errorCount} erro(s) no código`
              : warningCount > 0
                ? `${warningCount} aviso(s) no código`
                : 'Código compilado sem erros'
          }}
        </NTooltip>
      </div>
    </div>

    <!-- ══ MODO EXPANDIDO / TELA CHEIA ══════════════════════════════════════ -->
    <div
      v-else
      class="h-full flex flex-col overflow-hidden"
      :class="isFullscreen ? 'w-full' : 'min-w-[540px]'"
    >
      <!-- Header -->
      <div class="drawer-header p-4 flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <NTooltip trigger="hover" placement="bottom">
            <template #trigger>
              <NButton
                circle
                quaternary
                size="small"
                @click="show = false; isFullscreen = false"
              >
                <template #icon>
                  <NIcon size="18"><ChevronForward /></NIcon>
                </template>
              </NButton>
            </template>
            Minimizar
          </NTooltip>

          <NIcon size="20" color="var(--color-primary)"><CodeOutlined /></NIcon>
          <span class="drawer-title">Código Javascript</span>
          <NBadge v-if="errorCount > 0" :value="errorCount" type="error" />
          <NBadge v-if="warningCount > 0" :value="warningCount" type="warning" />
          <NBadge v-if="infoCount > 0" :value="infoCount" type="info" />
        </div>

        <div class="flex items-center gap-2">
          <NButton
            size="small"
            type="primary"
            ghost
            round
            :loading="isApplying"
            title="Aplicar no Canvas"
            @click="applyCodeToCanvas"
          >
            <template #icon><NIcon><CheckmarkOutline /></NIcon></template>
          </NButton>

          <NButton
            size="small"
            ghost
            round
            :loading="isCompiling"
            title="Recompilar"
            @click="compileNow"
          >
            <template #icon><NIcon><RefreshOutlined /></NIcon></template>
          </NButton>

          <NButton
            size="small"
            ghost
            round
            title="Copiar código"
            @click="copyCodeToClipboard"
          >
            <template #icon><NIcon><ContentCopyOutlined /></NIcon></template>
          </NButton>

          <NButton
            type="primary"
            size="small"
            round
            title="Baixar arquivo .js"
            @click="downloadCodeFile"
          >
            <template #icon><NIcon><DownloadOutlined /></NIcon></template>
          </NButton>

          <NButton
            circle
            quaternary
            size="small"
            class="ml-2"
            :title="isFullscreen ? 'Restaurar tamanho' : 'Tela inteira'"
            @click="isFullscreen = !isFullscreen"
          >
            <template #icon>
              <NIcon size="18">
                <ExpandOutline v-if="!isFullscreen" />
                <ContractOutline v-else />
              </NIcon>
            </template>
          </NButton>
        </div>
      </div>

      <!-- Conteúdo: Erros, Diagnósticos e Textarea -->
      <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div v-if="compileErrorText" class="compile-error p-3">
          {{ compileErrorText }}
        </div>

        <!-- Painel de Diagnósticos -->
        <div v-if="hasIssues" class="diagnostics-panel">
          <NCollapse :default-expanded-names="['diagnostics']" arrow-placement="left">
            <NCollapseItem name="diagnostics">
              <template #header>
                <div class="flex items-center gap-2">
                  <span class="diagnostics-title">Diagnósticos</span>
                  <span class="diagnostics-count">({{ diagnostics.length }})</span>
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
                    <span class="diag-icon-circle" />
                    <span class="diag-rule">{{ diag.rule }}</span>
                    <span v-if="diag.nodeLabel" class="diag-label">{{ diag.nodeLabel }}</span>
                  </div>
                  <div class="diag-message">{{ diag.message }}</div>
                </div>
              </div>
            </NCollapseItem>
          </NCollapse>
        </div>

        <!-- Editor de Código -->
        <div class="editor-pane flex-1 min-h-0 p-4 overflow-hidden relative flex flex-col">
          <textarea
            v-model="editableCode"
            class="code-textarea w-full h-full m-0"
            spellcheck="false"
            placeholder="// Nenhum nó compilável no canvas"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.code-drawer {
  background: var(--color-bg);
  border-left: 1px solid var(--color-border);
  transition: width var(--transition-layout), box-shadow var(--transition-base);
  overflow: hidden;
}

.code-drawer.is-rail {
  user-select: none;
}

/* ── Rail Lateral (Minimizado) ────────────────────────────────────────────── */
.code-rail {
  width: 44px;
}

.rail-btn {
  transition: transform var(--transition-fast);
}
.rail-btn:hover {
  transform: scale(1.1);
}

.rail-lines-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
  line-height: 1.1;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}
.rail-lines-chip:hover {
  border-color: var(--color-primary);
  transform: scale(1.05);
}
.rail-lines-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text);
}
.rail-lines-label {
  font-size: 9px;
  opacity: 0.6;
  color: var(--color-text-3);
}

.rail-status-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  transition: transform var(--transition-fast);
}
.rail-status-chip:hover {
  transform: scale(1.1);
}

.rail-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.rail-status-dot--ok {
  background-color: var(--color-success);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-success) 20%, transparent);
}

/* ── Modo Expandido ──────────────────────────────────────────────────────── */
.drawer-header {
  border-bottom: 1px solid var(--color-border);
}
.drawer-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text);
}

.compile-error {
  background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
  color: var(--color-error);
  font-size: 12px;
  font-family: var(--font-mono);
}

.diagnostics-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}
.diagnostics-count {
  font-size: 10px;
  opacity: 0.6;
}

.editor-pane {
  font-family: var(--font-mono);
  font-size: 12px;
}
.code-textarea {
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  outline: none;
  resize: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.diagnostics-panel {
  border-radius: var(--radius-sm);
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
  border-radius: var(--radius-sm);
  font-size: 11px;
  transition: background-color var(--transition-fast);
}

.diag-item.diag-error {
  background-color: color-mix(in srgb, var(--color-error) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
}

.diag-item.diag-warning {
  background-color: color-mix(in srgb, var(--color-warning) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 20%, transparent);
}

.diag-item.diag-info {
  background-color: color-mix(in srgb, var(--color-info) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-info) 20%, transparent);
}

.diag-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.diag-icon-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}
.diag-error .diag-icon-circle   { background-color: var(--color-error); }
.diag-warning .diag-icon-circle { background-color: var(--color-warning); }
.diag-info .diag-icon-circle    { background-color: var(--color-info); }

.diag-rule {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.6;
  font-family: var(--font-mono);
}

.diag-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text);
  padding: 0 5px;
  background-color: color-mix(in srgb, var(--color-text) 6%, transparent);
  border-radius: var(--radius-sm);
}

.diag-message {
  font-size: 11px;
  line-height: 1.5;
  opacity: 0.85;
  color: var(--color-text-2);
}
</style>
