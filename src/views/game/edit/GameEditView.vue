<script setup>
import { ref } from 'vue'
import ComponentNode from '@/components/modules/ComponentNode.vue'
import ComponentHeader from '@/components/modules/ComponentHeader.vue'
import ComponentDialog from '@/components/modules/ComponentDialog.vue'
import TabActionEditView from './TabActionEditView.vue'
import TabEventEditView from './TabEventEditView.vue'

const contextMenuRef = ref(null)
const componentNodeRef = ref(null)
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
    { text: 'Ações', action: () => handleGameEditorTab(TabActionEditView, 'Editor de Ações') },
    { text: 'Objetos' },
  ],
})

function openContextMenu(items, event) {
  contextMenuRef.value.openContextMenu(items, event)
}

function handleContextMenu(e) {
  e.preventDefault()
  openContextMenu(
    [
      {
        items: [
          {
            text: 'Voltar',
            icon: 'arrow_back_ios',
            shortcut: 'Ctrl + Z',
            action: () => componentNodeRef.value.undo(),
          },
          {
            text: 'Avançar',
            icon: 'arrow_forward_ios',
            shortcut: 'Ctrl + Y',
            action: () => componentNodeRef.value.redo(),
          },
        ],
      },
      {
        items: [
          {
            text: 'Adicionar bloco de ação',
            icon: 'folder_code',
            action: () => {
              openContextMenu([
                {
                  items: [
                    {
                      text: 'Ação de diálogo',
                      icon: 'code',
                      action: () => {
                        componentNodeRef.value.createNode(e.pageX, e.pageY)
                      },
                    },
                    {
                      text: 'Ação de configuração',
                      icon: 'settings_applications',
                      action: () => {
                        componentNodeRef.value.createNode(e.pageX, e.pageY, { type: 'config' })
                      },
                    },
                  ],
                },
              ])
              return 'keep-open'
            },
          },
          {
            text: 'Criar ligação',
            icon: 'diagonal_line',
          },
        ],
      },
    ],
    e,
  )
}

function handleGameEditorTab(tab, title) {
  tabData.value.component = tab ?? null
  tabData.value.title = title ?? ''
  if (!tabData.value.isVisible) tabData.value.isVisible = true
}

function handleCloseEditorTab() {
  tabData.value.isVisible = false
  tabData.value.component = null
}
</script>

<template>
  <ComponentHeader :nav-links="navLinks" :title="'EDITOR DO JOGO'" />
  <div class="editor-wrapper" @contextmenu="handleContextMenu">
    <div class="editor-canvas">
      <ComponentNode ref="componentNodeRef" />
      <ComponentDialog v-bind="tabData" @contextMenu.stop @close="handleCloseEditorTab" />
    </div>
    <CreateContextMenu ref="contextMenuRef" />
  </div>
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
