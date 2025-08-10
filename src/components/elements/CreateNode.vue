<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// Computed para garantir que node e suas propriedades existem
const safeNode = computed(() => props.node || {})
const safeContent = computed(() => safeNode.value.content || {})
</script>

<template>
  <div
    :key="safeNode.id || 'node'"
    class="node"
    :style="{
      left: (safeNode.x ?? 0) + 'px',
      top: (safeNode.y ?? 0) + 'px',
      background: 'var(--secondary)',
      color: 'var(--text)',
    }"
    draggable="true"
    @mousedown="safeNode.id ? startDrag($event, safeNode.id) : null"
  >
    <!-- Submenu de escolhas -->
    <div
      v-if="Array.isArray(safeContent.choices) && safeContent.choices.length"
      class="node-choices"
    >
      <strong>Escolhas:</strong>
      <ul>
        <li
          v-for="choice in safeContent.choices"
          :key="choice.id || choice.text"
          class="choice-item"
        >
          {{ choice.text || 'Sem texto' }}
          <span v-if="choice.targetNodeId" class="connection-dot"></span>
        </li>
      </ul>
    </div>
    <hr />

    <!-- Submenu de configurações -->
    <div class="node-meta">
      <p v-if="safeContent.text"><strong>Texto:</strong> {{ safeContent.text }}</p>
      <p v-if="safeContent.backgroundImage">
        <strong>Imagem de fundo:</strong> {{ safeContent.backgroundImage }}
      </p>
      <p v-if="safeContent.music"><strong>Música:</strong> {{ safeContent.music }}</p>
      <p v-if="safeContent.soundEffect">
        <strong>Efeito Sonoro:</strong> {{ safeContent.soundEffect }}
      </p>
      <div v-if="Array.isArray(safeContent.actions) && safeContent.actions.length">
        <strong>Ações:</strong>
        <ul>
          <li v-for="action in safeContent.actions" :key="action.id || action.name">
            {{ action.name || 'Sem nome' }} ({{ action.effect || 'Sem efeito' }})
            <span v-if="action.targetNodeId" class="connection-dot"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
hr {
  margin: 8px 0;
  border: none;
  border-top: 2px solid var(--border);
}

.node-choices ul,
.node-meta ul {
  padding-left: 18px;
  margin: 4px 0;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.connection-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #4caf50;
  border-radius: 50%;
  margin-left: 4px;
  border: 2px solid #333;
}
</style>
