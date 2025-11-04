<script setup>
import { ref, nextTick } from 'vue'

const menuContextItems = ref([])
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ top: 50, left: 50 })
const contextMenu = ref(null)
const emit = defineEmits(['emit-event'])

async function openContextMenu(items = [], event = null) {
  console.log('Abrindo menu de contexto com itens:', items, 'e evento:', event)
  menuContextItems.value = items
  contextMenuVisible.value = true

  await nextTick()

  const menuHeight = contextMenu.value?.offsetHeight || 150
  const menuWidth = contextMenu.value?.offsetWidth || 200
  const buttonRect = event?.currentTarget.getBoundingClientRect() || null

  // Se tem clique, usa posição do clique, senão centraliza no botão
  let top =
    event?.clientY !== undefined
      ? event.clientY
      : buttonRect.top + buttonRect.height / 2 - menuHeight / 2

  let left =
    event?.clientX !== undefined
      ? event.clientX
      : buttonRect.left + buttonRect.width / 2 - menuWidth / 2

  // Ajuste para não sair da tela
  if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight
  if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth
  if (top < 0) top = 0
  if (left < 0) left = 0

  contextMenuPos.value = { top, left }
}

function closeContextMenu() {
  console.log('fechando menu: ', menuContextItems)
  contextMenuVisible.value = false
}

function handleMenuItemClick(item) {
  let result
  if (typeof action === 'function') {
    result = item.action?.()
  } else {
    emitEvent(item)
  }
  if (result !== 'keep-open') {
    closeContextMenu()
  }
}

function emitEvent(e) {
  emit('emit-event', e)
}

defineExpose({
  openContextMenu,
})
</script>

<template>
  <Transition name="fastFade" mode="out-in">
    <div
      v-if="contextMenuVisible"
      class="dialog-shadow"
      @click="closeContextMenu"
      @click.right="closeContextMenu"
    >
      <div
        class="context-menu"
        :style="{
          top: contextMenuPos.top + 'px',
          left: contextMenuPos.left + 'px',
          position: 'absolute',
        }"
        @click.stop
        ref="contextMenu"
        :key="contextMenuVisible"
      >
        <template v-for="(subMenu, sIndex) in menuContextItems" :key="sIndex">
          <hr v-if="sIndex > 0" />
          <div class="sub-menu" :style="subMenu?.style">
            <div v-for="(item, iIndex) in subMenu.items" :key="iIndex" class="sub-menu-items">
              <component
                v-bind:is="item?.component"
                v-bind="item?.componentProps"
                v-on="item?.listeners"
                @emit-event="emitEvent"
              />
              <CButton
                :text="item.text"
                :img="item.img"
                :icon="item.icon"
                classes="symbolic no-padding no-scalling"
                @click="handleMenuItemClick(item)"
              />
              <p>{{ item.shortcut }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-shadow {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 7;
}

.context-menu {
  display: inline-flex;
  background: var(--bg2);
  border-radius: 24px;
  width: auto;
  flex-direction: column;
  backdrop-filter: var(--main-blur);
  border: 0.5px solid var(--border);
  max-height: 90vh;
  overflow-y: auto;
}

.sub-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1rem;
}

.sub-menu-items {
  display: flex;
  padding: 0.5rem;
  align-items: center;
  justify-content: space-between;
  border-radius: 24px;
  line-break: auto;
}

.sub-menu-items:hover {
  background: var(--input-bg);
}

hr {
  width: -webkit-fill-available;
  border-style: none;
  border-bottom: 0.5px solid var(--border);
}

ul {
  list-style: none;
}

p {
  margin: 0;
}
</style>
