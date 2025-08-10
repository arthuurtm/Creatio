<script setup>
import { ref, nextTick, Transition } from 'vue'

const menuContextItems = ref([])
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ top: 50, left: 50 })
const contextMenu = ref(null)

async function openContextMenu(items = [], event = null) {
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
  contextMenuVisible.value = false
}

function handleMenuItemClick(action) {
  const result = action?.()
  if (result !== 'keep-open') {
    closeContextMenu()
  }
}

defineExpose({
  openContextMenu,
})
</script>

<template>
  <Transition name="fastFade" mode="out-in">
    <div v-if="contextMenuVisible" class="dialog-shadow" @click="closeContextMenu">
      <div
        class="context-menu"
        :style="{
          top: contextMenuPos.top + 'px',
          left: contextMenuPos.left + 'px',
          position: 'absolute',
        }"
        @click.stop
        ref="contextMenu"
      >
        <div v-for="(subMenu, sIndex) in menuContextItems" :key="sIndex" class="sub-menu">
          <hr v-if="sIndex > 0" />
          <ul v-for="(item, iIndex) in subMenu.items" :key="iIndex" class="sub-menu-items">
            <CreateButton
              :buttons="[
                {
                  icon: item.icon,
                  text: item.text,
                  class: 'symbolic no-padding no-scalling',
                  action: () => handleMenuItemClick(item.action),
                },
              ]"
            />
          </ul>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-shadow {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: auto;
}

.context-menu {
  display: inline-flex;
  /* Override transparency by using an opaque color */
  background: rgb(40, 40, 60);
  border-radius: 24px;
  width: auto;
  padding: 0 1rem;
}
/* Remove transparency from --bg2 without changing its value */
.context-menu {
  background: linear-gradient(rgba(40, 40, 60, 1), rgba(40, 40, 60, 1)), var(--bg2);
}
.sub-menu-items {
  padding: 2px;
}

ul {
  list-style: none;
}
</style>
