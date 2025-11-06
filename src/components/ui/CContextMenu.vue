<script setup>
import { ref, nextTick } from 'vue'

const menuContextItems = ref([])
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ top: 50, left: 50 })
const contextMenu = ref(null)
const emit = defineEmits(['emit-event', 'select'])
defineProps({ noFloating: Boolean })
const flatItemCount = ref(0)
const focusedIndex = ref(-1)

async function openContextMenu(items = [], event = null) {
  const normItems = normalizeToContextMenu(items)
  menuContextItems.value = normItems
  contextMenuVisible.value = true
  console.log('Abrindo menu de contexto com itens:', normItems, 'e evento:', event)

  await nextTick()

  // calcula tamanho e posição
  const menuHeight = contextMenu.value?.offsetHeight || 150
  const menuWidth = contextMenu.value?.offsetWidth || 200
  const buttonRect = event?.currentTarget?.getBoundingClientRect() || null

  let top =
    event?.clientY !== undefined
      ? event.clientY
      : buttonRect
        ? buttonRect.top + buttonRect.height / 2 - menuHeight / 2
        : 50

  let left =
    event?.clientX !== undefined
      ? event.clientX
      : buttonRect
        ? buttonRect.left + buttonRect.width / 2 - menuWidth / 2
        : 50

  // ajuste para não sair da tela
  if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight
  if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth
  if (top < 0) top = 0
  if (left < 0) left = 0

  contextMenuPos.value = { top, left }

  // configura navegação por teclado: conta os items e foca o primeiro
  await nextTick()
  const nodes = getMenuItemNodes()
  flatItemCount.value = nodes.length
  if (nodes.length > 0) {
    focusedIndex.value = 0
    nodes[0].focus()
  } else {
    focusedIndex.value = -1
  }
}

function normalizeToContextMenu(input) {
  if (!input) return []
  let inputArray

  if (typeof input === 'object' && !Array.isArray(input) && input !== null) {
    // um objeto de GRUPO ÚNICO
    if (Object.prototype.hasOwnProperty.call(input, 'items')) {
      inputArray = [input]
    }
    // um OBJETO DE DEFINIÇÕES
    else {
      // Use os VALORES do objeto como a lista de itens
      inputArray = Object.values(input)
    }
  } else {
    inputArray = Array.isArray(input) ? input : [input]
  }

  // VERIFICA SE A ENTRADA JÁ ESTÁ NO FORMATO DE GRUPO
  const isAlreadyGrouped =
    inputArray.length > 0 &&
    inputArray[0] != null &&
    typeof inputArray[0] === 'object' &&
    Object.prototype.hasOwnProperty.call(inputArray[0], 'items')

  if (isAlreadyGrouped) {
    return inputArray.map((group) => ({
      ...group,
      items: Array.isArray(group.items)
        ? group.items.map(normalizeItem)
        : [normalizeItem(group.items)],
    }))
  }

  // trate a 'input' inteira como UMA lista de *itens*
  // que precisam ser colocados em UM ÚNICO grupo.
  return [
    {
      items: inputArray.map(normalizeItem),
    },
  ]
}

function normalizeItem(item) {
  if (item == null) return { text: '' }

  if (typeof item === 'string' || typeof item === 'number') {
    return { text: String(item), value: item }
  }

  if (typeof item === 'object') {
    const { text, label, value, icon, ...rest } = item
    return {
      text: text ?? label ?? String(value ?? ''),
      value: value ?? text ?? label ?? null,
      icon,
      ...rest,
    }
  }

  return { text: String(item) }
}

function closeContextMenu() {
  contextMenuVisible.value = false
  focusedIndex.value = -1
}

// retorna NodeList de elementos `.sub-menu-items` visíveis (em ordem)
function getMenuItemNodes() {
  // query no contexto do menu para evitar pegar outros menus
  if (!contextMenu.value) return []
  return Array.from(contextMenu.value.querySelectorAll('.sub-menu-items')) || []
}

function focusItemByIndex(idx) {
  const nodes = getMenuItemNodes()
  if (!nodes.length) return
  const clamped = ((idx % nodes.length) + nodes.length) % nodes.length
  focusedIndex.value = clamped
  nodes[clamped].focus()
}

function handleMenuItemClick(item) {
  // evento de seleção sempre dispara (independe de action/emit-event)
  emit('select', item)

  let result
  if (item?.action) {
    // se action retornar 'keep-open', manter aberto
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

// teclado global do menu (setas, enter, esc)
function onKeydown(e) {
  if (!contextMenuVisible.value) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      focusItemByIndex(focusedIndex.value + 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusItemByIndex(focusedIndex.value - 1)
      break
    case 'Home':
      e.preventDefault()
      focusItemByIndex(0)
      break
    case 'End':
      e.preventDefault()
      focusItemByIndex(flatItemCount.value - 1)
      break
    case 'Enter':
    case ' ': {
      e.preventDefault()
      // dispara click no item focado
      const nodes = getMenuItemNodes()
      if (nodes[focusedIndex.value]) {
        nodes[focusedIndex.value].click()
      }
      break
    }
    case 'Escape':
      e.preventDefault()
      closeContextMenu()
      break
    default:
      break
  }
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
        :class="{ noFloating: noFloating }"
        :style="
          noFloating
            ? {}
            : {
                top: contextMenuPos.top + 'px',
                left: contextMenuPos.left + 'px',
                position: 'absolute',
              }
        "
        @click.stop
        ref="contextMenu"
        :key="contextMenuVisible"
        tabindex="0"
        role="menu"
        @keydown="onKeydown"
      >
        <template v-for="(subMenu, sIndex) in menuContextItems" :key="sIndex">
          <hr v-if="sIndex > 0" />
          <div class="sub-menu" :style="subMenu?.style">
            <div
              v-for="(item, iIndex) in subMenu.items"
              :key="iIndex"
              class="sub-menu-items"
              tabindex="0"
              role="menuitem"
              @click="handleMenuItemClick(item)"
            >
              <component
                v-bind:is="item?.component"
                v-bind="item?.componentProps"
                v-on="item?.listeners ?? {}"
                @emit-event="emitEvent"
              />
              <CButton
                :text="item.text"
                :img="item.img"
                :icon="item.icon"
                classes="symbolic no-padding no-scalling"
                @click.stop="handleMenuItemClick(item)"
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
  outline: none; /* remoção do outline default quando focado no container */
}

.context-menu.noFloating {
  position: static;
  display: block;
  width: 100%;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
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
  cursor: pointer;
  outline: none;
}

.sub-menu-items:hover,
.sub-menu-items:focus {
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
