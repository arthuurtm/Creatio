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
import { useEditor } from "@/composables/useEditor";
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
const editor = useEditor();

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
  if (cat === "FUNCTION_DEFINITION") return "Arraste nós para dentro desta função";
  if (cat === "IF_STATEMENT" || cat === "ELSEIF_STATEMENT") return "Arraste os blocos que devem executar quando a condição for verdadeira";
  if (cat === "FOR_LOOP") return "Arraste os blocos que devem se repetir dentro do laço";
  if (cat === "WHILE_LOOP") return "Arraste os blocos que devem se repetir enquanto a condição for verdadeira";
  if (cat === "SWITCH_STATEMENT") return "Adicione nós \"Caso\" como filhos deste switch";
  if (cat === "CASE_CONDITION" || cat === "CASE_DEFAULT") return "Arraste os blocos a executar neste caso";
  return "Este bloco possui um escopo interno";
});

function handleClone() {
  const type = nodeType.value === "expression" ? "expression" : "statement";
  void editor.addNode(label.value, type, astData.value).then((node) => {
    if (node) showToast({ type: "success", message: "Nó duplicado com sucesso!" });
  });
}

function handleDelete() {
  void editor.removeNode(rawId.value).then(() => {
    showToast({ type: "info", message: "Nó removido com sucesso." });
  });
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
            <NIcon v-if="isCopied" size="11" class="id-chip-check mr-0.5"><CheckOutlined /></NIcon>
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
/* ---------------------------------------------------------------------------
 * Node — Base
 * --------------------------------------------------------------------------- */

.custom-node {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  overflow: hidden;
  user-select: none;

  background: var(--color-surface);
  color: var(--color-text);

  border: none;
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-1);

  font-family: var(--font-sans, inherit);

  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.custom-node:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}

/* Selection — independent from category color */
.custom-node.is-selected {
  box-shadow:
    0 0 0 2px color-mix(
      in srgb,
      var(--color-primary) 65%,
      transparent
    ),
    var(--shadow-2) !important;
}

/* ---------------------------------------------------------------------------
 * Category accent
 * --------------------------------------------------------------------------- */

.node-accent-stripe {
  width: 100%;
  height: 2px;

  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--cat-primary) 65%, transparent),
    color-mix(in srgb, var(--cat-primary) 15%, transparent) 65%,
    transparent 100%
  );
}

/* ---------------------------------------------------------------------------
 * Header
 * --------------------------------------------------------------------------- */

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--space-3);
}

.node-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  min-width: 0;
  flex: 1;
}

.node-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;
  flex-shrink: 0;

  border-radius: var(--radius-sm);

  background: color-mix(
    in srgb,
    var(--cat-primary) 12%,
    var(--color-surface)
  );

  color: var(--cat-primary);
}

.node-title-group {
  display: flex;
  flex-direction: column;

  min-width: 0;
  flex: 1;
}

.node-title {
  overflow: hidden;

  color: var(--color-text);

  font-size: var(--font-size-small, 13px);
  font-weight: 600;
  letter-spacing: -0.2px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.node-subtitle-tag {
  overflow: hidden;

  margin-top: 2px;

  color: var(--cat-primary);

  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.45px;
  text-transform: uppercase;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ---------------------------------------------------------------------------
 * Actions
 * --------------------------------------------------------------------------- */

.node-actions {
  display: flex;
  align-items: center;
  gap: 2px;

  flex-shrink: 0;
  margin-left: var(--space-1);

  opacity: 0;
  pointer-events: none;

  transition: opacity var(--transition-fast);
}

.custom-node:hover .node-actions,
.custom-node:focus-within .node-actions {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.action-btn:hover {
  transform: scale(1.05);
}

/* ---------------------------------------------------------------------------
 * Body / Parameters
 * --------------------------------------------------------------------------- */

.node-body {
  padding: 0 var(--space-3) var(--space-3);
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.param-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  min-width: 0;
  padding: 6px var(--space-2);

  background: var(--color-surface-action);

  border-radius: var(--radius-sm);

  font-size: var(--font-size-tiny, 12px);

  transition: background-color var(--transition-fast);
}

.param-label {
  overflow: hidden;

  color: var(--color-text-3);
  font-weight: 500;

  white-space: nowrap;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.param-value {
  overflow: hidden;
  max-width: 140px;

  color: var(--color-text-2);
  font-weight: 600;

  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.param-value.is-code {
  padding: 2px 6px;

  background: var(--color-surface-code);
  color: var(--cat-primary);

  border-radius: var(--radius-sm);

  font-family: var(--font-mono);
  font-size: 10px;
}

.param-value.is-bool {
  padding: 2px 7px;

  border-radius: var(--radius-full);

  font-size: 10px;
  font-weight: 600;
}

.param-value.bool-true {
  background: color-mix(
    in srgb,
    var(--color-success) 12%,
    var(--color-surface)
  );

  color: var(--color-success);
}

.param-value.bool-false {
  background: color-mix(
    in srgb,
    var(--color-error) 11%,
    var(--color-surface)
  );

  color: var(--color-error);
}

.empty-params {
  padding: var(--space-2) 0;

  color: var(--color-text-3);

  font-size: var(--font-size-small, 13px);
  text-align: center;
  font-style: italic;
}

/* ---------------------------------------------------------------------------
 * Scope zone
 * --------------------------------------------------------------------------- */

.node-scope-zone {
  padding: 0 var(--space-3) var(--space-2);
}

.scope-dashed-border {
  padding: var(--space-2) var(--space-3);

  background: color-mix(
    in srgb,
    var(--cat-primary) 5%,
    var(--color-surface)
  );

  border: none;
  border-radius: var(--radius-sm);

  transition: background-color var(--transition-base);
}

.custom-node:hover .scope-dashed-border {
  background: color-mix(
    in srgb,
    var(--cat-primary) 9%,
    var(--color-surface)
  );
}

.scope-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.scope-hint-icon {
  color: var(--cat-primary);
  font-size: 13px;
  opacity: 0.7;
}

.scope-hint-text {
  color: var(--color-text-3);

  font-size: 10px;
  font-weight: 500;
  text-align: center;
}

.custom-node:hover .scope-hint-text,
.custom-node:hover .scope-hint-icon {
  color: var(--cat-primary);
  opacity: 1;
}

/* ---------------------------------------------------------------------------
 * Footer
 * --------------------------------------------------------------------------- */

.node-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  padding: var(--space-1) var(--space-3) var(--space-3);
}

.node-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.node-category-pill {
  padding: 3px 8px;

  background: color-mix(
    in srgb,
    var(--cat-primary) 11%,
    var(--color-surface)
  );

  color: var(--cat-primary);

  border-radius: var(--radius-full);

  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.node-scope-pill,
.node-async-pill {
  padding: 3px 8px;

  border-radius: var(--radius-full);

  font-size: 9px;
  font-weight: 600;
}

.node-scope-pill {
  background: color-mix(
    in srgb,
    var(--color-info) 11%,
    var(--color-surface)
  );

  color: var(--color-info);
}

.node-async-pill {
  background: color-mix(
    in srgb,
    var(--color-warning) 11%,
    var(--color-surface)
  );

  color: var(--color-warning);
}

/* ---------------------------------------------------------------------------
 * Node ID
 * --------------------------------------------------------------------------- */

.node-id-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  padding: 3px 7px;

  background: var(--color-surface-action);
  color: var(--color-text-3);

  border-radius: var(--radius-sm);

  font-family: var(--font-mono);
  font-size: 10px;

  cursor: pointer;
  user-select: all;

  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.node-id-chip:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 10%,
    var(--color-surface)
  );

  color: var(--color-primary);
}

.id-chip-check {
  color: var(--color-success);
}

/* ---------------------------------------------------------------------------
 * Connection handles
 * --------------------------------------------------------------------------- */

.node-handle {
  position: absolute;
  z-index: 10;
  top: 50%;

  width: 12px;
  height: 12px;

  background: var(--cat-primary);

  /* Keep the socket separation for connection visibility */
  border: 2px solid var(--color-surface);
  border-radius: 50%;

  box-shadow:
    0 0 0 1px color-mix(
      in srgb,
      var(--cat-primary) 55%,
      transparent
    ),
    var(--shadow-1);

  transform: translateY(-50%);

  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.node-handle:hover {
  transform: translateY(-50%) scale(1.3);

  box-shadow:
    0 0 0 3px color-mix(
      in srgb,
      var(--cat-primary) 20%,
      transparent
    ),
    var(--shadow-2);
}

.target-handle {
  left: -6px;
}

.source-handle {
  right: -6px;
}
</style>


