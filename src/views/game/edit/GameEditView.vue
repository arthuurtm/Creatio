<script setup>
import { ref, shallowRef, markRaw, onMounted, onUnmounted, computed } from 'vue'
import { useEditorConnection } from '@/composables/useEditorConnection'
import { useEditorStore, addFunctions } from '@/stores/editor'
import TabDataPanelView from './TabDataPanelView.vue'
import ComponentQuickEditPanel from '@/components/modules/ComponentQuickEditPanel.vue'
import { add } from 'lodash-es'

const props = defineProps({ id: String })
const editorStore = useEditorStore()
const contextMenuRef = ref(null)
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

  return {
    icon: map.icon[status] || 'cloud_alert',
    message: map.message[status],
  }
})
const { start: connect, stop: disconnect, send, error, requestStatus } = useEditorConnection()
const tabData = ref({
  isVisible: false,
  fullscreen: true,
  component: null,
  noFocusWindow: true,
  title: 'Editor',
})
const quickPanelData = ref({
  visible: false,
  title: 'Painel Rápido',
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
    {
      icon: `help`,
      action: (e) =>
        openContextMenu(
          {
            text: 'Para começar a adicionar ações no seu jogo basta clicar botão direito que um menu com várias opções irá aparecer.',
          },
          e,
        ),
    },
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
    <!-- HEADER FIXO -->
    <ComponentHeader :nav-links="navLinks" title="EDITOR DO JOGO" />

    <!-- WRAPPER DO CONTEÚDO (tudo abaixo da header) -->
    <div style="position: relative; flex: 1; overflow: hidden">
      <!-- TOOLBAR (só aparece quando o painel geral não está aberto) -->
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

      <!-- ÁREA PRINCIPAL DO EDITOR -->
      <CGroup
        v-if="!tabData.isVisible"
        grow
        direction="row"
        style="position: relative; height: calc(100% - 64px); overflow: hidden"
      >
        <!-- EDITOR DE NODES -->
        <ComponentNode :nodes="editorStore.nodes" style="flex: 1; height: 100%; overflow: auto" />
      </CGroup>

      <!-- PAINEL RÁPIDO -->
      <div
        style="
          position: absolute;
          top: 0;
          right: 0;
          width: 30vw;
          height: 100%;
          pointer-events: none;
        "
      >
        <ComponentDialog
          :title="'Painel Rápido'"
          :component="ComponentQuickEditPanel"
          :component-props="{ panel: quickPanelData }"
          :is-visible="quickPanelData.visible"
          fullscreen
          no-close-button
          no-title-bar
          style="width: 100%; height: 100%; pointer-events: auto"
          ><CButton
            icon="right_panel_close"
            @click="quickPanelData.visible = !quickPanelData.visible"
            style="position: absolute; top: 0; left: 0"
            classes="symbolic"
        /></ComponentDialog>
      </div>

      <!-- PAINEL DE DADOS GERAL (FULLSCREEN ABAIXO DA HEADER) -->
      <ComponentDialog v-bind="tabData" @close="handleCloseEditorTab" />
    </div>

    <!-- CONTEXT MENU -->
    <CContextMenu @contextMenu.stop ref="contextMenuRef" />
  </CGroup>
</template>
