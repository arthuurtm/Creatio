<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { NButton, NIcon, NTooltip } from "naive-ui";
import { Ref } from "rete-vue-plugin";
import {
  ContentCopyOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@vicons/material";
import { getIconComponent } from "@/utils/icons";
import {
  categoryVisuals,
  defaultVisualConfig,
  translateCategory,
  getNodeIcon,
  translateField,
  formatFieldValue,
} from "@/utils/nodeTranslations";
import { cloneNode, deleteNode } from "@/composables/useNodeFunctions";
import { useSettingsStore } from "@/stores/global";
import { showToast } from "@/plugins/toast";

const props = defineProps({
  data: {
    type: Object as PropType<any>,
    required: true,
  },
  emit: {
    type: Function as PropType<any>,
    required: true,
  },
});

const settingsStore = useSettingsStore();
const isDark = computed(() => settingsStore.theme === "dark");

// Acesso aos dados originais (embutidos no nó do Rete)
const astData = computed(() => props.data.astData || {});
const nodeType = computed(() => props.data.nodeType || "");
const rawId = computed(() => props.data.id || "");

const visualConfig = computed(() => {
  const type = astData.value?.type || nodeType.value || "";
  return categoryVisuals[type] || defaultVisualConfig;
});

const iconName = computed(() => {
  return getNodeIcon(astData.value?.category, astData.value?.type || nodeType.value);
});

const categoryTitle = computed(() => {
  return translateCategory(astData.value?.category);
});

const label = computed(() => {
  const params = astData.value?.params;
  return (
    params?.name ||
    params?.funcName ||
    params?.varId ||
    params?.targetVar ||
    params?.condition ||
    categoryTitle.value ||
    "Nó"
  );
});

const formattedParams = computed(() => {
  const rawParams = astData.value?.params || {};
  const entries = Object.entries(rawParams);

  return entries.map(([key, val]) => {
    const formatted = formatFieldValue(val);
    return {
      key,
      label: translateField(key),
      value: formatted.text,
      isCode: formatted.isCode,
      isBool: formatted.isBool,
      boolValue: formatted.boolValue,
      raw: typeof val === "object" ? JSON.stringify(val) : String(val),
    };
  });
});

const shortId = computed(() => {
  const parts = rawId.value.split("_");
  return parts.length > 1 ? parts[1] : rawId.value;
});

const hasScope = computed(() => Boolean(astData.value?.hasScope));
const isAsync = computed(
  () => Boolean(astData.value?.params?.isAsync || astData.value?.params?.await)
);

const scopeHintText = computed(() => {
  const cat = astData.value?.category;
  if (cat === 'FUNCTION_DEFINITION') return 'Arraste nós para dentro desta função';
  if (cat === 'IF_STATEMENT' || cat === 'ELSEIF_STATEMENT') return 'Arraste os blocos que devem executar quando a condição for verdadeira';
  if (cat === 'FOR_LOOP') return 'Arraste os blocos que devem se repetir dentro do laço';
  if (cat === 'WHILE_LOOP') return 'Arraste os blocos que devem se repetir enquanto a condição for verdadeira';
  if (cat === 'SWITCH_STATEMENT') return 'Adicione nós "Caso" como filhos deste switch';
  if (cat === 'CASE_CONDITION' || cat === 'CASE_DEFAULT') return 'Arraste os blocos a executar neste caso';
  return 'Este bloco possui um escopo interno';
});

function handleClone() {
  cloneNode({
    id: rawId.value,
    type: nodeType.value,
    data: astData.value,
  } as any);
}

function handleDelete() {
  deleteNode(rawId.value);
}

const isCopied = ref(false);
async function copyId() {
  try {
    await navigator.clipboard.writeText(rawId.value);
    isCopied.value = true;
    showToast({ type: "success", message: `ID #${shortId.value} copiado!` });
    setTimeout(() => {
      isCopied.value = false;
    }, 1800);
  } catch {
    showToast({ type: "error", message: "Não foi possível copiar o ID." });
  }
}

const nodeContainerStyle = computed(() => ({
  "--cat-primary": visualConfig.value.primary,
  "--cat-bg": visualConfig.value.bgBadge,
  "--cat-border": visualConfig.value.border,
  "--cat-glow": visualConfig.value.glow,
}));
</script>

<template>
  <div
    class="custom-node"
    :class="[
      `type-${nodeType}`,
      isDark ? 'theme-dark' : 'theme-light',
      { 'is-selected': data.selected },
    ]"
    :style="nodeContainerStyle"
  >
    <!-- Entrada (Target / Esquerda) -->
    <Ref
      v-if="data.inputs?.in"
      class="node-handle target-handle"
      :emit="emit"
      :data="{ type: 'socket', side: 'input', key: 'in', nodeId: data.id, payload: data.inputs.in.socket }"
      title="Entrada"
    />

    <div class="node-accent-stripe" />

    <div class="node-header">
      <div class="node-header-left">
        <div class="node-icon-wrapper">
          <NIcon size="16">
            <component :is="getIconComponent(iconName)" />
          </NIcon>
        </div>

        <div class="node-title-group">
          <div class="node-title" :title="label">
            {{ label }}
          </div>
          <div class="node-subtitle-tag" :title="categoryTitle">
            {{ categoryTitle }}
          </div>
        </div>
      </div>

      <div class="node-actions" @click.stop>
        <NTooltip trigger="hover" placement="top">
          <template #trigger>
            <NButton circle quaternary size="tiny" class="action-btn" @click="handleClone">
              <template #icon>
                <NIcon size="14"><ContentCopyOutlined /></NIcon>
              </template>
            </NButton>
          </template>
          Duplicar nó
        </NTooltip>

        <NTooltip trigger="hover" placement="top">
          <template #trigger>
            <NButton circle quaternary type="error" size="tiny" class="action-btn" @click="handleDelete">
              <template #icon>
                <NIcon size="14"><DeleteOutlined /></NIcon>
              </template>
            </NButton>
          </template>
          Excluir nó
        </NTooltip>
      </div>
    </div>

    <div class="node-body">
      <div v-if="formattedParams.length > 0" class="params-list">
        <div v-for="param in formattedParams" :key="param.key" class="param-row">
          <span class="param-label" :title="param.label">{{ param.label }}:</span>
          <span
            class="param-value"
            :class="{
              'is-code': param.isCode,
              'is-bool': param.isBool,
              'bool-true': param.boolValue === true,
              'bool-false': param.boolValue === false,
            }"
            :title="param.raw"
          >
            {{ param.value }}
          </span>
        </div>
      </div>
      <div v-else class="empty-params">
        Nenhum parâmetro configurado
      </div>
    </div>

    <div v-if="hasScope" class="node-scope-zone">
      <div class="scope-dashed-border">
        <div class="scope-hint">
          <span class="scope-hint-icon">⤵</span>
          <span class="scope-hint-text">{{ scopeHintText }}</span>
        </div>
      </div>
    </div>

    <div class="node-footer">
      <div class="node-badges">
        <span class="node-category-pill">{{ visualConfig.singular }}</span>
        <span v-if="hasScope" class="node-scope-pill" title="Este nó possui bloco de código interno">Escopo</span>
        <span v-if="isAsync" class="node-async-pill" title="Execução assíncrona">Async</span>
      </div>

      <NTooltip trigger="hover" placement="bottom">
        <template #trigger>
          <div class="node-id-chip" @click.stop="copyId">
            <NIcon v-if="isCopied" size="11" class="text-green-500 mr-0.5"><CheckOutlined /></NIcon>
            <span>#{{ shortId }}</span>
          </div>
        </template>
        {{ isCopied ? "Copiado!" : "Copiar ID do nó" }}
      </NTooltip>
    </div>

    <!-- Saída (Source / Direita) -->
    <Ref
      v-if="data.outputs?.out"
      class="node-handle source-handle"
      :emit="emit"
      :data="{ type: 'socket', side: 'output', key: 'out', nodeId: data.id, payload: data.outputs.out.socket }"
      title="Saída"
    />
  </div>
</template>

<style scoped>
.custom-node {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  border-radius: 14px;
  user-select: none;
  overflow: hidden;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
}

.custom-node.theme-light {
  background-color: #ffffff;
  color: #1f2937;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
}

.custom-node.theme-light:hover {
  transform: translateY(-2px);
  border-color: var(--cat-border);
  box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06);
}

.custom-node.theme-light .node-header { border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
.custom-node.theme-light .node-title { color: #0f172a; }
.custom-node.theme-light .param-row { background-color: #f8fafc; border: 1px solid #e2e8f0; }
.custom-node.theme-light .param-label { color: #64748b; }
.custom-node.theme-light .param-value { color: #0f172a; }
.custom-node.theme-light .param-value.is-code { background-color: #f1f5f9; border: 1px solid #cbd5e1; color: var(--cat-primary); }
.custom-node.theme-light .empty-params { color: #94a3b8; }
.custom-node.theme-light .node-footer { border-top: 1px solid rgba(0, 0, 0, 0.06); }
.custom-node.theme-light .node-id-chip { background-color: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
.custom-node.theme-light .node-id-chip:hover { background-color: var(--cat-bg); color: #0f172a; border-color: var(--cat-border); }
.custom-node.theme-light .node-handle { border: 2px solid #ffffff; box-shadow: 0 0 0 2px var(--cat-border), 0 1px 3px rgba(0, 0, 0, 0.12); }

.custom-node.theme-dark {
  background-color: #18181c;
  color: #f2f2f2;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
}

.custom-node.theme-dark:hover {
  transform: translateY(-2px);
  border-color: var(--cat-border);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.55);
}

.custom-node.theme-dark .node-header { border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
.custom-node.theme-dark .node-title { color: #f9fafb; }
.custom-node.theme-dark .param-row { background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); }
.custom-node.theme-dark .param-label { color: #9ca3af; }
.custom-node.theme-dark .param-value { color: #f3f4f6; }
.custom-node.theme-dark .param-value.is-code { background-color: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--cat-primary); }
.custom-node.theme-dark .empty-params { color: #6b7280; }
.custom-node.theme-dark .node-footer { border-top: 1px solid rgba(255, 255, 255, 0.07); }
.custom-node.theme-dark .node-id-chip { background-color: rgba(255, 255, 255, 0.05); color: #9ca3af; border: 1px solid rgba(255, 255, 255, 0.08); }
.custom-node.theme-dark .node-id-chip:hover { background-color: var(--cat-bg); color: #f3f4f6; border-color: var(--cat-border); }
.custom-node.theme-dark .node-handle { border: 2px solid #18181c; box-shadow: 0 0 0 2px var(--cat-border), 0 2px 4px rgba(0, 0, 0, 0.4); }

.custom-node.is-selected {
  border-color: var(--cat-primary) !important;
  box-shadow: 0 0 0 2px var(--cat-primary), 0 12px 30px -4px rgba(0, 0, 0, 0.4) !important;
}

.custom-node:hover .node-actions { opacity: 1; pointer-events: auto; }
.node-accent-stripe { height: 3px; width: 100%; background: linear-gradient(90deg, var(--cat-primary) 0%, rgba(var(--cat-primary), 0.3) 70%, transparent 100%); }
.node-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 8px 12px; }
.node-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
.node-icon-wrapper { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background-color: var(--cat-bg); color: var(--cat-primary); flex-shrink: 0; border: 1px solid var(--cat-border); }
.node-title-group { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.node-title { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.2px; }
.node-subtitle-tag { font-size: 10px; font-weight: 600; color: var(--cat-primary); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.95; margin-top: 1px; }
.node-actions { display: flex; align-items: center; gap: 2px; opacity: 0; pointer-events: none; transition: opacity 0.15s ease; flex-shrink: 0; margin-left: 6px; }
.action-btn { transition: transform 0.1s ease; }
.action-btn:hover { transform: scale(1.1); }
.node-body { padding: 8px 12px; }
.params-list { display: flex; flex-direction: column; gap: 5px; }
.param-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 8px; border-radius: 6px; font-size: 11px; }
.param-label { font-weight: 500; white-space: nowrap; flex-shrink: 0; }
.param-value { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; text-align: right; }
.param-value.is-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; padding: 1px 5px; border-radius: 4px; }
.param-value.is-bool { font-size: 10px; padding: 1px 6px; border-radius: 9999px; font-weight: 700; }
.param-value.bool-true { background-color: rgba(16, 185, 129, 0.15); color: #10b981; }
.param-value.bool-false { background-color: rgba(239, 68, 68, 0.15); color: #ef4444; }
.empty-params { font-size: 11px; font-style: italic; text-align: center; padding: 6px 0; }
.node-footer { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px 9px 12px; gap: 8px; }
.node-badges { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.node-category-pill { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 1px 6px; border-radius: 9999px; background-color: var(--cat-bg); color: var(--cat-primary); border: 1px solid var(--cat-border); }
.node-scope-pill { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.12); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
.node-async-pill { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 9999px; background-color: rgba(245, 158, 11, 0.12); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3); }
.node-id-chip { display: inline-flex; align-items: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; padding: 2px 5px; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; user-select: all; }
.node-handle { position: absolute; top: 50%; width: 12px; height: 12px; border-radius: 50%; background-color: var(--cat-primary); transition: transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.18s ease; z-index: 10; margin-top: -6px; }
.node-handle:hover { transform: scale(1.4); box-shadow: 0 0 0 3px var(--cat-glow), 0 2px 8px rgba(0, 0, 0, 0.35); }
.target-handle { left: -6px; }
.source-handle { right: -6px; }
.node-scope-zone { padding: 4px 12px 8px 12px; }
.scope-dashed-border { border: 1.5px dashed var(--cat-border); border-radius: 8px; padding: 10px 12px; background-color: rgba(var(--cat-primary-rgb, 0, 0, 0), 0.02); transition: border-color 0.2s ease, background-color 0.2s ease; }
.custom-node:hover .scope-dashed-border { border-color: var(--cat-primary); background-color: rgba(var(--cat-primary-rgb, 0, 0, 0), 0.04); }
.scope-hint { display: flex; align-items: center; gap: 6px; justify-content: center; }
.scope-hint-icon { font-size: 13px; opacity: 0.5; color: var(--cat-primary); }
.scope-hint-text { font-size: 10px; font-weight: 500; opacity: 0.5; font-style: italic; text-align: center; color: var(--cat-primary); }
.custom-node:hover .scope-hint-icon, .custom-node:hover .scope-hint-text { opacity: 0.8; }
</style>
