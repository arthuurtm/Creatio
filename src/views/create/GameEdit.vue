<script setup>
import { ref } from 'vue'
import ComponentNode from '@/components/modules/ComponentNode.vue'

const contextMenuRef = ref(null)
const componentNodeRef = ref(null)

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
</script>

<template>
  <div class="page-wrapper" @contextmenu="handleContextMenu">
    <div class="checkerboard"></div>
    <ComponentNode ref="componentNodeRef" />
    <CreateButton
      :buttons="[
        {
          icon: 'help',
          class: 'symbolic no-padding',
          position: {
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
          },
        },
      ]"
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

    <CreateContextMenu ref="contextMenuRef" />
  </div>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

.checkerboard {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 20px 20px;
  z-index: 0;
}
</style>
