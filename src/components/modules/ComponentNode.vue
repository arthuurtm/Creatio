<script setup>
import { ref } from 'vue'
import CNode from '@/components/ui/CNode.vue'
import { useConnections } from '@/composables/editor/useDotConnection'
import { nodeOps, createNode } from '@/composables/editor/useNodeFunctions'
import { useEditorStore } from '@/stores/editor'
import { useUndoRedo } from '@/composables/useHistoryRef'

const editorStore = useEditorStore()
const contextMenu = ref({})
const nodeUtils = nodeOps()
const { handleStartConnection, paths } = useConnections(editorStore)
const { undo, redo } = useUndoRedo(editorStore, editorStore.$properties())

function openContextMenu(items, event) {
  contextMenu.value.openContextMenu(items, event)
}

function handleNodeRightClick(node, e) {
  const selectedNode = editorStore.$state.nodes.find((n) => n.id === node.id)
  nodeUtils.ui({ openContextMenu }).mainNodeMenu(selectedNode, e)
}

function emitEventHandler(e) {
  switch (e.name) {
    case 'start-connection': {
      handleStartConnection(e.data)
      break
    }
  }
}

// const connectionMap = {
//   icon: {
//     IDLE: 'cloud',
//     SENDING: 'cloud_sync',
//     ERROR: 'cloud_alert',
//     WAITING: 'cloud_sync',
//     SUCCESS: 'cloud_done',
//   },
//   message: {
//     IDLE: null,
//     SENDING: 'Salvando...',
//     ERROR: 'Ocorreu um erro.',
//     WAITING: null,
//     SUCCESS: null,
//   },
// }

defineExpose({
  createNode,
  undo,
  redo,
})
</script>

<template>
  <!--<CGroup direction="row" gap="0.5rem" grow justify="end" style="padding: 0.5rem">
    <CButton
      :icon="'developer_mode_tv'"
      :classes="['symbolic', 'no-padding']"
      @click="(e) => openContextMenu([{ items: [{ text: editorStore }] }], e)"
    />
    <CButton
      icon="help"
      :classes="['symbolic', 'no-padding']"
      @click="
        (e) =>
          openContextMenu(
            [
              {
                items: [
                  {
                    text: 'Para começar a adicionar ações no seu jogo basta clicar botão direito que um menu com várias opções irá aparecer.',
                  },
                ],
              },
            ],
            e,
          )
      "
    />
    <CButton
      :icon="connectionMap.icon[requestStatus]"
      :text="connectionMap.message[requestStatus]"
      :classes="['symbolic', 'no-padding', 'no-scalling']"
      :style="{ cursor: requestStatus != 'ERROR' ? 'inherit' : 'pointer' }"
      @click="requestStatus === 'ERROR' && connect()"
    />
  </CGroup>-->

  <svg class="connections-layer">
    <path v-for="p in paths" :key="p?.id" :d="p?.d" :stroke-dasharray="p?.isLoop ? '6,3' : '0'" />
  </svg>

  <!-- Camada de nodes -->
  <div class="nodes-layer">
    <ComponentDialog
      v-for="node in editorStore.nodes"
      :key="node.id"
      v-on:contextmenu.stop="handleNodeRightClick(node, $event)"
      v-on:contextmenu.prevent
      :title="node.id"
      :component="CNode"
      :component-props="{ node }"
      :is-visible="true"
      :no-close-button="true"
      :no-focus-window="true"
      :is-draggable="true"
      :no-interpolate-size="true"
      v-model:x="node.x"
      v-model:y="node.y"
      @emit-event="emitEventHandler"
    />
  </div>

  <CContextMenu ref="contextMenu" />
</template>

<style scoped>
/* Conexões ficam atrás */
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Nodes ficam na frente */
.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

path {
  pointer-events: stroke;
  fill: none;
  stroke: var(--text);
  stroke-width: 2;
}

path:hover {
  stroke: aqua;
  stroke-width: 4 !important;
}
</style>
