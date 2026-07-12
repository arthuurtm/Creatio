<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";
import { computed } from "vue";

const props = defineProps<NodeProps>();

// Cores base para o cabeçalho
const typeColors: Record<string, string> = {
  variables: "#00BCD4", // Cyan
  logics: "#FF9800",    // Orange
  functions: "#E91E63", // Pink
};

const astType = computed(() => props.data?.type || 'unknown');
const astCategory = computed(() => props.data?.category || 'Unknown Node');
const astParams = computed(() => props.data?.params || {});

const astTypeClass = computed(() => `type-${astType.value}`);

const headerStyles = computed(() => {
  const color = typeColors[astType.value] || "#9E9E9E";
  return {
    backgroundColor: color,
  };
});

// A cor da borda principal do node
const nodeStyles = computed(() => {
  const color = typeColors[astType.value] || "#9E9E9E";
  return {
    borderColor: color,
  };
});

// Um rótulo inteligente para encabeçar o card
const label = computed(() => {
  const params = props.data?.params;
  return (
    params?.name ??
    params?.varId ??
    params?.funcName ??
    params?.targetVar ??
    props.data?.category ??
    props.data?.type ??
    "Node"
  );
});

// Função para formatar o valor dos parâmetros para melhor leitura
const formatValue = (val: any) => {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

// Formatar o ID original removendo a prefixo grande (ex: functions_xxxx -> xxxx)
const shortId = computed(() => {
  const parts = props.id.split('_');
  return parts.length > 1 ? parts[1] : props.id;
});
</script>

<template>
  <div class="custom-node" :class="astTypeClass" :style="nodeStyles">
    <Handle type="target" :position="Position.Left" class="handle target-handle" />

    <!-- Header do Node -->
    <div class="node-header" :style="headerStyles">
      <div class="node-title">{{ label }}</div>
      <div class="node-subtitle">{{ astCategory }}</div>
    </div>

    <!-- Corpo do Node com parâmetros expostos -->
    <div class="node-body">
      <div v-if="astParams && Object.keys(astParams).length > 0" class="params-container">
        <div class="param-row" v-for="(value, key) in astParams" :key="key">
          <span class="param-key">{{ key }}:</span>
          <span class="param-value" :title="formatValue(value)">{{ formatValue(value) }}</span>
        </div>
      </div>
      <div v-else class="no-params">
        Sem parâmetros definidos
      </div>
      
      <!-- Meta informações do rodapé -->
      <div class="node-meta">
        <span class="node-id">#{{ shortId }}</span>
      </div>
    </div>

    <Handle type="source" :position="Position.Right" class="handle source-handle" />
  </div>
</template>

<style scoped>
.custom-node {
  background-color: #1e1e2d;
  border-radius: 12px;
  border: 2px solid #333;
  min-width: 220px;
  max-width: 340px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  font-family: 'Inter', 'Roboto', sans-serif;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #e0e0e0;
}

.custom-node:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
}

/* O Vue flow injeta .selected no container, podemos usar CSS para realçar a seleção */
:global(.vue-flow__node.selected) .custom-node {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9), 0 12px 32px rgba(0, 0, 0, 0.6);
}

.node-header {
  padding: 12px 16px;
  color: #ffffff;
  border-bottom: 1px solid rgba(0,0,0,0.3);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.node-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-subtitle {
  font-size: 10px;
  opacity: 0.9;
  margin-top: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.node-body {
  padding: 14px 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
}

.params-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.25);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.04);
}

.param-key {
  color: #8ab4f8; /* Azul claro / Google style */
  font-weight: 500;
  margin-right: 12px;
  font-family: 'Courier New', Courier, monospace;
}

.param-value {
  color: #81c995; /* Verde claro / Google style */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  font-weight: 600;
}

.no-params {
  font-size: 12px;
  color: #777;
  font-style: italic;
  text-align: center;
  padding: 8px 0;
}

.node-meta {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 10px;
  color: #666;
  display: flex;
  justify-content: flex-end;
}

.node-id {
  font-family: monospace;
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Custom Handles: Bolinhas de conexão */
.handle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #1e1e2d;
  background-color: #b0bec5;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.handle:hover {
  transform: scale(1.4);
  background-color: #ffffff;
}

.target-handle {
  left: -8px;
}

.source-handle {
  right: -8px;
}
</style>
