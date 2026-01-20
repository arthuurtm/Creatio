<script setup lang="ts">
import type { GameNode } from '#types/domain/editor/models.ts';
import { computed } from 'vue';

const props = defineProps<{
  node: GameNode
  position: {
    x: number
    y: number
  }
}>();

const emit = defineEmits([
  'emit-event',
  'update:position',
  'dot-connection'
]);

const localPos = reactive({ x: props.position.x, y: props.position.y });

function emitEvent(name: string, data = {}) {
  emit('emit-event', { command: name, data });
}

/* Drag */
function onDragStart(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement;
  el.setPointerCapture(e.pointerId);

  const start = { x: localPos.x, y: localPos.y };
  const mouse = { x: e.clientX, y: e.clientY };

  const onMove = (ev: PointerEvent) => {
    localPos.x = start.x + (ev.clientX - mouse.x);
    localPos.y = start.y + (ev.clientY - mouse.y);
  };

  const onEnd = () => {
    emit('update:position', { x: localPos.x, y: localPos.y });
    el.releasePointerCapture(e.pointerId);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onEnd);
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onEnd);
}

/* Dados reativos */
const content = computed(() => props.node.content || {});
const choices = computed(() => content.value.choices || []);
const actions = computed(() => content.value.actions || []);

const hasMeta = computed(() => {
  return (
    content.value.text ||
    content.value.backgroundImage ||
    content.value.music ||
    content.value.soundEffect
  );
});
</script>

<template>
  <v-card class="node" rounded="xl" :style="{
    left: (localPos.x ?? 0) + 'px',
    top: (localPos.y ?? 0) + 'px',
    position: 'absolute'
  }">

    <!-- HEADER -->
    <v-toolbar density="compact" @pointerdown="onDragStart">

      <!-- PORTAS -->
      <div class="connection-points" @pointerdown.stop>
        <div class="dot dot-top"
          @pointerdown.stop="emit('dot-connection', { nodeId: node.id, socketId: 'in', e: $event })"></div>
        <div class="dot dot-left"
          @pointerdown.stop="emit('dot-connection', { nodeId: node.id, socketId: 'left', e: $event })"></div>
        <div class="dot dot-right"
          @pointerdown.stop="emit('dot-connection', { nodeId: node.id, socketId: 'right', e: $event })"></div>
        <div class="dot dot-bottom"
          @pointerdown.stop="emit('dot-connection', { nodeId: node.id, socketId: 'out', e: $event })"></div>
      </div>

      <v-toolbar-title class="text-caption font-weight-medium">
        {{ node.type }}
      </v-toolbar-title>

      <v-spacer />

      <v-btn icon="add" variant="text" size="small" @click="emitEvent('NODE.OPEN_ADD_DATA_MENU')" />
      <v-btn v-if="choices.length" icon="fork_right" variant="text" size="small"
        :title="`${choices.length} escolhas`" />
      <v-btn v-if="actions.length" icon="bolt" variant="text" size="small" :title="`${actions.length} ações`" />
      <v-btn icon="edit" variant="text" size="small" />
    </v-toolbar>

    <v-divider v-if="choices.length || actions.length || hasMeta" />

    <!-- CHOICES -->
    <v-list v-if="choices.length" density="compact">
      <v-list-subheader>Escolhas</v-list-subheader>
      <v-list-item v-for="choice in choices" :key="choice.id" :title="choice.text || 'Sem texto'"
        prepend-icon="person_pin_circle" :append-icon="choice.targetNodeId ? 'circle' : undefined" />
    </v-list>

    <!-- ACTIONS -->
    <v-list v-if="actions.length" density="compact">
      <v-list-subheader>Ações</v-list-subheader>

      <v-list-item v-for="action in actions" :key="action.id">
        <template #title>
          <strong>{{ action.name || 'Ação sem nome' }}</strong>
        </template>
        <template #subtitle>
          Tipo: {{ action.effect.type }}
          <br v-if="action.effect.url" />
          <code v-if="action.effect.url">{{ action.effect.url }}</code>
        </template>
      </v-list-item>
    </v-list>

    <!-- META -->
    <v-list v-if="hasMeta" density="compact">
      <v-list-subheader>Configurações</v-list-subheader>
      <v-list-item v-if="content.text" title="Texto" :subtitle="content.text" />
      <v-list-item v-if="content.backgroundImage" title="Fundo" :subtitle="content.backgroundImage" />
      <v-list-item v-if="content.music" title="Música" :subtitle="content.music" />
      <v-list-item v-if="content.soundEffect" title="Som" :subtitle="content.soundEffect" />
    </v-list>
  </v-card>
</template>

<style scoped>
.node {
  width: 300px;
  user-select: none;
  /* backdrop-filter: blur(6px); */
  touch-action: none;
  pointer-events: auto;
}

.connection-points {
  position: absolute;
  inset: 0;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  pointer-events: auto;
  cursor: crosshair;
  background: var(--v-theme-primary);
  border: 2px solid white;
  transition: 120ms;
  position: absolute;
}

/* .dot:hover {
  transform: scale(1);
} */

.dot-top {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.dot-bottom {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.dot-left {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
}

.dot-right {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
