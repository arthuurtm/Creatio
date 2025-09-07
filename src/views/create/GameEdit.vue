<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ComponentNode from '@/components/modules/ComponentNode.vue'
import { ws, http } from '@/functions'

const route = useRoute()
const contextMenuRef = ref(null)
const componentNodeRef = ref(null)
const { data, status, connect, send, disconnect } = ws(http.getApiUrl('ws'))

const gameBasicData = ref({
  gameId: route.params.id,
  version: 1,
})

onMounted(async () => {
  try {
    await connect()

    send({
      event: 'game:lab:get',
      payload: {
        gameId: gameBasicData.value.gameId,
        version: gameBasicData.value.version,
      },
    })
  } catch (error) {
    console.error('Falha ao conectar ao WebSocket:', error)
  }
})

watch(data, (newMessage) => {
  if (newMessage && newMessage.event === 'game:lab:get:success') {
    console.log('Dados iniciais do jogo recebidos!', newMessage.data)
    componentNodeRef.value.setEditorState(newMessage.data)
  }
})

function updateGameData() {
  const state = componentNodeRef.value.getEditorState()
  const dataToSend = { state, ...gameBasicData.value }
  send({ event: 'game:lab:update', payload: dataToSend })
}

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
                        updateGameData()
                      },
                    },
                    {
                      text: 'Ação de configuração',
                      icon: 'settings_applications',
                      action: () => {
                        componentNodeRef.value.createNode(e.pageX, e.pageY, { type: 'config' })
                        updateGameData()
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
