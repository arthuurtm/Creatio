<script setup lang="ts">
import type { GameNodeType } from "@projeto/types";
import { Handle, Position } from '@vue-flow/core'
import { computed } from "vue";

const props = defineProps<{
  id: string;
  type: GameNodeType;
  data: any;
  selected?: boolean;
}>();
const emit = defineEmits<{
  (e: 'open-panel', nodeId: string): void
  (e: 'delete-node', nodeId: string): void
}>()

// Lógica de Cores baseada no tipo
const nodeStyle = computed(() => {
  const colors: Record<string, string> = {
    dialog: 'lightblue',
    combat: '#ff5252',
    event: '#ffeb3b',
  };

  const color = colors[props.type] || 'grey';

  const border = props.selected ? `3px solid ${color}` : `2px solid ${color}`;

  return {
    border: border,
    transition: 'border 0.2s'
  }
});

const typeIcon = computed(() => {
  if (props.type === 'combat') return 'sword';
  if (props.type === 'event') return 'flag';
  return 'chat';
});
</script>

<template>
  <div class="node-wrapper">
    <Handle type="target" :position="Position.Left" :id="`${id}-in`" style="z-index: 10; background: #555;" />
    <v-card class="node" rounded="xl">

      <Handle type="target" :position="Position.Left" :id="`${data.id}-in`" />

      <Handle type="source" :position="Position.Right" :id="`${data.id}-out`" />

      <v-toolbar density="compact">
        <v-icon start>{{ typeIcon }}</v-icon>
        <v-toolbar-title class="text-caption font-weight-medium">
          {{ type.toUpperCase() }}
        </v-toolbar-title>

        <v-spacer />

        <v-btn icon="add_circle" variant="text" size="small" v-bind="props" @click="emit('open-panel', props.id)" />
        <v-btn icon="edit" variant="text" size="small" />
      </v-toolbar>

    </v-card>
    <Handle type="source" :position="Position.Right" :id="`${id}-out`" style="z-index: 10; background: #555;" />
  </div>
</template>

<style scoped>
.node {
  width: 300px;
  user-select: none;
  touch-action: none;
  pointer-events: auto;
}

:deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--v-theme-primary);
  border: 2px solid white;
  cursor: crosshair;
}

/* O Wrapper define o tamanho e a posição relativa */
.node-wrapper {
  position: relative;
  /* Obrigatório para os Handles se posicionarem */
  width: 300px;
  /* Não coloque overflow: hidden aqui! */
}

/* O v-card é apenas visual agora */
.node-content {
  width: 100%;
  height: 100%;
  /* Aqui o overflow hidden não atrapalha mais os handles */
}

/* Estilo dos Handles */
:deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;

  /* Ajuste fino da posição se necessário (opcional) */
  /* left: -6px; */
  /* right: -6px; */
}
</style>
