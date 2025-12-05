<script setup>
import { ref, shallowRef, markRaw, onMounted, onUnmounted, computed } from 'vue'
import { useEditorConnection } from '@/composables/useEditorConnection'
import { useEditorStore, addFunctions } from '@/stores/editor'
import { getNodeContextMenuItems, cloneNode, deleteNode } from '@/composables/useNodeFunctions'
import TabDataPanelView from './TabDataPanelView.vue'
import ComponentQuickEditPanel from '@/components/modules/ComponentQuickEditPanel.vue'
import { useEditorViewport } from '@/composables/useEditorViewport'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 2.0
const props = defineProps({ id: String })
const editorStore = useEditorStore()
const contextMenuRef = ref(null)
const { start: connect, stop: disconnect, send, error, requestStatus } = useEditorConnection()
const { zoom, gridStyle, editorStyle, handleZoom } = useEditorViewport(MIN_ZOOM, MAX_ZOOM)
const connectionInfo = computed(() => {
  const status = requestStatus.value
  const currentError = error.value
  const map = {
    icon: {
      IDLE: 'cloud',
      SENDING: 'cloud_sync',
      ERROR: 'cloud_alert',
      WAITING: 'cloud_sync',
      SUCCESS: 'cloud_done',
    },
    message: {
      IDLE: null,
      SENDING: 'Sincronizando...',
      ERROR: currentError ?? 'Desconectado',
      WAITING: null,
      SUCCESS: null,
    },
  }
  return { icon: map.icon[status] || 'cloud_alert', message: map.message[status] }
})
const tabData = ref({
  isVisible: false,
  fullscreen: true,
  component: null,
  noFocusWindow: true,
  title: 'Editor',
})
const quickPanelData = ref({
  visible: false,
  data: {},
})
const navLinks = computed(() => ({
  left: [
    {
      text: 'Painel de dados',
      action: () => handleGameEditorTab(TabDataPanelView, 'Painel de dados'),
    },
  ],
  right: [
    {
      icon: connectionInfo.value.icon,
      text: connectionInfo.value.message,
      classes: ['symbolic', 'no-padding', 'no-scalling'],
    },
    { icon: `help`, action: (e) => openContextMenu({ text: 'Ajuda...' }, e) },
  ],
}))

function openContextMenu(items, event) {
  contextMenuRef.value.openContextMenu(items, event)
}

function handleGameEditorTab(tab, title) {
  tabData.value.component = shallowRef(markRaw(tab)) ?? {}
  tabData.value.title = title ?? ''
  if (!tabData.value.isVisible) tabData.value.isVisible = true
}

function handleCloseEditorTab() {
  tabData.value.isVisible = false
  tabData.value.component = null
}

function handleNodeContextMenu({ node, event }) {
  openContextMenu(getNodeContextMenuItems(node), event)
}

function handleContextMenuSelect(item) {
  const node = item.payload.node

  switch (item.command) {
    case 'NODE.CLONE':
      cloneNode(node)
      break
    case 'NODE.DELETE':
      deleteNode(node.id)
      break
    case 'NODE.OPEN_PROPERTIES':
      quickPanelData.value = {
        visible: true,
        data: node,
      }
      break
  }
}

onMounted(async () => {
  await connect()
  send({ event: 'game:lab:get:json', payload: { ...editorStore.info, id: props.id } })
})
onUnmounted(() => {
  disconnect()
  editorStore.$reset()
})
</script>

<template>
  <CGroup grow direction="column" style="height: 100vh; overflow: hidden">
    <ComponentHeader :nav-links="navLinks" title="EDITOR DO JOGO" />

    <CGroup
      grow
      direction="column"
      style="position: relative"
      class="editor-grid"
      :style="gridStyle"
    >
      <CGroup v-if="!tabData.isVisible" direction="row" align="center" margin="1rem" gap="1rem">
        <CButton
          text="Adicionar Nova Linha do Tempo"
          icon="add"
          @click="addFunctions.nodes.value.definitions.createDialogBlock.execute(0, 0)"
        />
        <CButton text="Seleção" icon="arrow_selector_tool" />
        <CButton text="Conexão Direta" icon="linear_scale" />
        <CButton text="Conexão Condicional" icon="alt_route" />
        <CButton text="Comentário" icon="chat" />
        <CButton text="teste" @click="quickPanelData.visible = !quickPanelData.visible" />
      </CGroup>

      <CGroup
        v-if="!tabData.isVisible"
        grow
        direction="row"
        style="position: relative; height: calc(100% - 64px); overflow: hidden"
      >
        <ComponentNode
          :nodes="editorStore.nodes"
          :zoom="zoom"
          @node-context-menu="handleNodeContextMenu"
          :style="editorStyle"
          style="flex: 1; overflow: auto"
        />
      </CGroup>

      <CGroup
        direction="column"
        gap="0.5rem"
        radius="50px"
        align="center"
        style="position: absolute; bottom: 1rem; right: 2rem; z-index: 2"
        background="var(--surface-1)"
      >
        <CButton icon="add" @click="handleZoom('in')" title="Aumentar Zoom" classes="symbolic" />
        <div class="zoom-display" style="font-variant-numeric: tabular-nums">
          {{ Math.round(zoom * 100) }}%
        </div>
        <CButton
          icon="remove"
          @click="handleZoom('out')"
          title="Diminuir Zoom"
          classes="symbolic"
        />
      </CGroup>

      <CGroup
        style="position: absolute; top: 0; right: 0; pointer-events: none"
        min-width="30vw"
        width="auto"
        height="95%"
        margin="1rem"
        overflow="hidden"
        radius="24px"
      >
        <ComponentDialog
          title="Painel Rápido"
          v-model:is-visible="quickPanelData.visible"
          fullscreen
          background="var(--bg2)"
        >
          <ComponentQuickEditPanel v-model="quickPanelData.data" />
        </ComponentDialog>
      </CGroup>

      <ComponentDialog v-bind="tabData" @close="handleCloseEditorTab" />
      <CContextMenu @contextMenu.stop @select="handleContextMenuSelect" ref="contextMenuRef" />
    </CGroup>
  </CGroup>
</template>

<style scoped>
.editor-grid {
  background-image:
    linear-gradient(to right, var(--surface-2) 1px, transparent 1px),
    linear-gradient(to bottom, var(--surface-2) 1px, transparent 1px);
}
</style>
