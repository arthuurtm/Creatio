<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// Computeds para simplificar o template e garantir reatividade
const content = computed(() => props.node.content || {})
const choices = computed(() => content.value.choices || [])
const actions = computed(() => content.value.actions || [])

// Computed para verificar se há alguma meta informação para exibir a seção
const hasMeta = computed(() => {
  return (
    content.value.text ||
    content.value.backgroundImage ||
    content.value.music ||
    content.value.soundEffect
  )
})
</script>

<template>
  <div
    :key="node.id || 'node'"
    class="node"
    :style="{
      left: (node.x ?? 0) + 'px',
      top: (node.y ?? 0) + 'px',
    }"
  >
    <header class="node-header">
      <span class="node-type">{{ node.type || 'default' }}</span>
      <span class="node-id">#{{ node.id }}</span>
    </header>

    <div v-if="choices.length" class="node-section">
      <h3 class="section-title"><span> seçim </span> Escolhas</h3>
      <ul class="item-list">
        <li v-for="choice in choices" :key="choice.id" class="choice-item">
          <span>{{ choice.text || 'Sem texto' }}</span>
          <span v-if="choice.targetNodeId" class="connection-dot" title="Conectado"></span>
        </li>
      </ul>
    </div>

    <div v-if="actions.length" class="node-section">
      <h3 class="section-title"><span>⚡️</span> Ações</h3>
      <ul class="item-list">
        <li v-for="action in actions" :key="action.id" class="action-item">
          <strong>{{ action.name || 'Ação sem nome' }}</strong>
          <div class="action-effect">
            <span class="effect-prop"
              >Tipo: <strong>{{ action.effect.type }}</strong></span
            >
            <span v-if="action.effect.url" class="effect-prop"
              >URL: <code class="code-value">{{ action.effect.url }}</code></span
            >
          </div>
        </li>
      </ul>
    </div>

    <div v-if="hasMeta" class="node-section">
      <h3 class="section-title"><span>⚙️</span> Configurações</h3>
      <div class="meta-list">
        <p v-if="content.text"><strong>Texto:</strong> {{ content.text }}</p>
        <p v-if="content.backgroundImage">
          🖼️ <strong>Fundo:</strong> {{ content.backgroundImage }}
        </p>
        <p v-if="content.music">🎵 <strong>Música:</strong> {{ content.music }}</p>
        <p v-if="content.soundEffect">🔊 <strong>Som:</strong> {{ content.soundEffect }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Base do Nó --- */
.node {
  background: var(--secondary, #2c2c2c);
  color: var(--text, #f0f0f0);
  border: 1px solid var(--border, #444);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  width: 280px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
}

/* --- Cabeçalho --- */
.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--border, #444);
}
.node-type {
  font-weight: bold;
  text-transform: capitalize;
  background-color: var(--primary, #007acc);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.node-id {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  opacity: 0.6;
}

/* --- Seções --- */
.node-section {
  padding: 12px;
}
.node-section + .node-section {
  border-top: 1px solid var(--border, #444);
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-accent, #a2a2a2);
}
.section-title span {
  font-size: 18px;
}

/* --- Listas e Itens --- */
.item-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.choice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 10px;
  border-radius: 4px;
}

/* --- Ações --- */
.action-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 10px;
  border-radius: 4px;
  border-left: 3px solid var(--primary, #007acc);
}
.action-effect {
  font-size: 12px;
  opacity: 0.8;
  padding-left: 4px;
  display: flex;
  flex-direction: column;
}
.effect-prop {
  color: #bbb;
}
.code-value {
  background-color: #1e1e1e;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  word-break: break-all;
}

/* --- Configurações --- */
.meta-list p {
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.meta-list p:last-child {
  margin-bottom: 0;
}

/* --- Elementos Utilitários --- */
.connection-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  background: #4caf50;
  border-radius: 50%;
  border: 2px solid #f0f0f0;
  box-shadow: 0 0 5px #4caf50;
}
</style>
