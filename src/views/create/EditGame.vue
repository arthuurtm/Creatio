<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ComponentCreateGamePage from '@/layouts/AppGamePage.vue'
import CreateContextMenu from '@/components/elements/CreateContextMenu.vue'

const contextMenuRef = ref(null)
const pageContainer = ref({})

const openContextMenu = (items, event) => {
  contextMenuRef.value.openContextMenu(items, event)
}

const gameFunction = {
  addGameEvent: function (e) {},
}

function handleContextMenu(e) {
  e.preventDefault()
  openContextMenu(
    [
      {
        items: [
          { text: 'Ação', icon: 'folder_code' },
          { text: 'Ligar', icon: 'diagonal_line' },
        ],
      },
    ],
    e,
  )
}

onMounted(() => {
  pageContainer.value = document.querySelector('.page-wrapper') || window
  pageContainer.value.addEventListener('contextmenu', handleContextMenu)
})

onUnmounted(() => {
  pageContainer.value.removeEventListener('contextmenu', handleContextMenu)
})
</script>

<template>
  <ComponentCreateGamePage>
    <div class="page-wrapper">
      <div class="checkerboard"></div>

      <div style="position: absolute; bottom: 1rem; right: 1rem">
        <CreateButton
          :buttons="[{ icon: 'help', class: 'symbolic no-padding' }]"
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
      </div>

      <CreateContextMenu ref="contextMenuRef" />
    </div>
  </ComponentCreateGamePage>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  width: 100%;
  height: 100%; /* Garante altura da tela */
  overflow: hidden;
  background: var(--bg);
}

/* Fundo tipo caderno */
.checkerboard {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px); */
  background-size: 20px 20px;
  z-index: 0;
}

/* Botões visíveis */
.main-floating-options {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 0.5rem;
  border-radius: 8px;
}
</style>
