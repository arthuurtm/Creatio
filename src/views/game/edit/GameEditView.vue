<script setup>
import { ref, shallowRef, markRaw, onMounted, onUnmounted } from 'vue'
import TabDataPanelView from './TabDataPanelView.vue'
import TabEventEditView from './TabEventEditView.vue'
import { useEditorConnection } from '@/composables/useEditorConnection'
import { useEditorStore, addFunctions } from '@/stores/editor'
import { useUndoRedo } from '@/composables/useHistoryRef'

const props = defineProps({ id: String })
const editorStore = useEditorStore()
const contextMenuRef = ref(null)
const { start: connect, stop: disconnect, requestStatus, send } = useEditorConnection()
const { undo, redo } = useUndoRedo(editorStore.$state, editorStore.$properties())
const tabData = ref({
  isVisible: false,
  fullscreen: true,
  component: null,
  noFocusWindow: true,
  title: 'Editor',
})
const navLinks = ref({
  left: [
    { text: 'Eventos', action: () => handleGameEditorTab(TabEventEditView, 'Editor de Eventos') },
    {
      text: 'Painel de dados',
      action: () => handleGameEditorTab(TabDataPanelView, 'Painel de dados'),
    },
  ],
})
const connectionMap = {
  icon: {
    IDLE: 'cloud',
    SENDING: 'cloud_sync',
    ERROR: 'cloud_alert',
    WAITING: 'cloud_sync',
    SUCCESS: 'cloud_done',
  },
  message: {
    IDLE: null,
    SENDING: 'Salvando...',
    ERROR: 'Ocorreu um erro',
    WAITING: null,
    SUCCESS: null,
  },
}

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
  <CGroup grow direction="column">
    <ComponentHeader :nav-links="navLinks" :title="'EDITOR DO JOGO'" />
    <div class="editor-wrapper">
      <CGroup
        direction="row"
        gap="0.5rem"
        padding="0.5rem"
        style="position: absolute; right: 0; z-index: 3"
      >
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
          :icon="connectionMap.icon[requestStatus ?? 'ERROR']"
          :text="connectionMap.message[requestStatus ?? 'ERROR']"
          :classes="['symbolic', 'no-padding', 'no-scalling']"
          :style="{ cursor: requestStatus != 'ERROR' ? 'inherit' : 'pointer' }"
          @click="requestStatus === 'ERROR' && connect()"
        />
      </CGroup>
      <div class="editor-canvas" @contextmenu="handleContextMenu">
        <ComponentNode :nodes="editorStore.nodes" />
      </div>
      <ComponentDialog v-bind="tabData" @close="handleCloseEditorTab" />
      <CContextMenu @contextMenu.stop ref="contextMenuRef" />
    </div>
  </CGroup>
</template>

<style scoped>
.editor-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  display: flex;
}

.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
