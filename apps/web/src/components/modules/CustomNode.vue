<template>
  <div class="custom-node" :class="{ selected: data.selected }" :style="{ width: data.width + 'px' }">
    <div class="node-header">
      {{ data.label }}
    </div>

    <!-- Outputs -->
    <div class="sockets-container outputs">
      <div class="socket-row" v-for="[key, output] in Object.entries(data.outputs)" :key="'out-'+key">
        <div class="socket-title">{{ output.label }}</div>
        <Ref class="socket" :emit="emit" :data="{ type: 'socket', side: 'output', key: key, nodeId: data.id, payload: output.socket }" />
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-container">
      <Ref class="control" v-for="[key, control] in Object.entries(data.controls)" :key="'ctrl-'+key" :emit="emit" :data="{ type: 'control', payload: control }" />
    </div>

    <!-- Inputs -->
    <div class="sockets-container inputs">
      <div class="socket-row" v-for="[key, input] in Object.entries(data.inputs)" :key="'in-'+key">
        <Ref class="socket" :emit="emit" :data="{ type: 'socket', side: 'input', key: key, nodeId: data.id, payload: input.socket }" />
        <div class="socket-title" v-show="!input.control || !input.showControl">{{ input.label }}</div>
        <Ref class="input-control" v-show="input.control && input.showControl" :emit="emit" :data="{ type: 'control', payload: input.control }" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Ref } from 'rete-vue-plugin'

export default defineComponent({
  components: {
    Ref
  },
  props: {
    data: Object,
    emit: Function
  }
})
</script>

<style scoped>
.custom-node {
  background-color: var(--n-card-color, #1a1b1e);
  border: 1px solid var(--n-border-color, #33353b);
  border-radius: 12px;
  color: var(--n-text-color-base, #e4e5e7);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  min-width: 180px;
}
.custom-node.selected {
  border-color: var(--n-primary-color, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2);
}
.node-header {
  background-color: var(--n-color-embedded, #23252a);
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--n-border-color, #33353b);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sockets-container {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.socket-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  position: relative;
}
.outputs .socket-row {
  justify-content: flex-end;
}
.inputs .socket-row {
  justify-content: flex-start;
}
.socket-title {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
}
:deep(.socket) {
  display: inline-block;
  cursor: pointer;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--n-primary-color, #3b82f6);
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
:deep(.socket:hover) {
  transform: scale(1.1);
  transition: transform 0.1s;
}
.inputs :deep(.socket) {
  margin-left: -24px;
}
.outputs :deep(.socket) {
  margin-right: -24px;
}
</style>
