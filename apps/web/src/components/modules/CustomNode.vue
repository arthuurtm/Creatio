<template>
  <div
    class="rete-node-wrapper"
    :class="{ selected: data.selected }"
    :style="{
      width: (data.width ? data.width + 'px' : 'auto'),
      minWidth: '180px'
    }"
  >
    <!-- Header com design nativo e compacto -->
    <div class="rete-node-header">
      <span class="rete-node-title">{{ data.label }}</span>
      <NTag
        size="tiny"
        :bordered="false"
        round
        :type="data.type === 'statement' ? 'success' : 'warning'"
      >
        {{ data.type === 'statement' ? 'stmt' : 'expr' }}
      </NTag>
    </div>

    <!-- Conteúdo com colunas organizadas (Inputs à esquerda, Outputs à direita) -->
    <div class="rete-node-body">
      <!-- Coluna da Esquerda: Inputs -->
      <div class="rete-column inputs-column">
        <div
          v-for="[key, input] in Object.entries(data.inputs || {})"
          :key="'in-' + key"
          class="socket-row input-row"
        >
          <Ref
            class="socket-circle socket-in"
            :emit="emit"
            :data="{ type: 'socket', side: 'input', key: key, nodeId: data.id, payload: input.socket }"
          />
          <span class="socket-label" v-if="!input.control || !input.showControl">
            {{ input.label }}
          </span>
          <Ref
            v-if="input.control && input.showControl"
            class="inline-control"
            :emit="emit"
            :data="{ type: 'control', payload: input.control }"
          />
        </div>
      </div>

      <!-- Coluna da Direita: Outputs -->
      <div class="rete-column outputs-column">
        <div
          v-for="[key, output] in Object.entries(data.outputs || {})"
          :key="'out-' + key"
          class="socket-row output-row"
        >
          <span class="socket-label">{{ output.label }}</span>
          <Ref
            class="socket-circle socket-out"
            :emit="emit"
            :data="{ type: 'socket', side: 'output', key: key, nodeId: data.id, payload: output.socket }"
          />
        </div>
      </div>
    </div>

    <!-- Controles Centrais embutidos -->
    <div v-if="Object.keys(data.controls || {}).length" class="rete-node-controls">
      <div
        v-for="[key, control] in Object.entries(data.controls || {})"
        :key="'ctrl-' + key"
        class="control-item"
      >
        <Ref :emit="emit" :data="{ type: 'control', payload: control }" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Ref } from "rete-vue-plugin";
import { NTag } from "naive-ui";

interface NodeSocket {
  label?: string;
  socket: unknown;
  control?: unknown;
  showControl?: boolean;
}

interface NodeViewData {
  id: string;
  label: string;
  type: "statement" | "expression" | "unknown";
  width?: number;
  selected?: boolean;
  inputs?: Record<string, NodeSocket>;
  outputs?: Record<string, NodeSocket>;
  controls?: Record<string, unknown>;
}

export default defineComponent({
  components: {
    Ref,
    NTag,
  },
  props: {
    data: {
    type: Object as PropType<NodeViewData>,
    required: true,
  },
  emit: {
    type: Function as PropType<(...args: unknown[]) => unknown>,
    required: true,
  },
  },
});
</script>

<style scoped>
.rete-node-wrapper {
  background: var(--n-card-color, #1e1e24);
  border: 1.5px solid var(--n-border-color, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  font-family: inherit;
  color: var(--n-text-color, #e2e8f0);
  position: relative;
  user-select: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.rete-node-wrapper.selected {
  border-color: var(--n-primary-color, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35);
}

.rete-node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.08));
  border-radius: 11px 11px 0 0;
  gap: 8px;
}

.rete-node-title {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
}

.rete-node-body {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  gap: 12px;
}

.rete-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.inputs-column {
  align-items: flex-start;
}

.outputs-column {
  align-items: flex-end;
}

.socket-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
  width: 100%;
}

.input-row {
  justify-content: flex-start;
}

.output-row {
  justify-content: flex-end;
}

.socket-label {
  font-size: 11px;
  opacity: 0.75;
  white-space: nowrap;
  padding: 0 6px;
}

/* Sockets perfeitamente alinhados na borda do nó */
:deep(.socket-circle) {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--n-primary-color, #3b82f6);
  border: 2px solid var(--n-card-color, #1e1e24);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

:deep(.socket-circle:hover) {
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
}

:deep(.socket-in) {
  margin-left: -7px;
}

:deep(.socket-out) {
  margin-right: -7px;
}

.rete-node-controls {
  padding: 6px 10px 8px;
  border-top: 1px dashed var(--n-border-color, rgba(255, 255, 255, 0.06));
}

.control-item {
  font-size: 12px;
}
</style>
