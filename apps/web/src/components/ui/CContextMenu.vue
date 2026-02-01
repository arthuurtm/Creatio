<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface ContextMenuItem {
  text: string
  value?: any
  icon?: string
  shortcut?: string
  action?: () => void | string
  component?: any
  componentProps?: Record<string, any>
  listeners?: Record<string, Function>
  [key: string]: any
}

interface ContextMenuGroup {
  style?: any
  items: ContextMenuItem[]
}

const props = defineProps({ noFloating: Boolean, isVisible: Boolean })
const emit = defineEmits(['emit-event', 'select', 'update:isVisible'])
const menuContextItems = ref<ContextMenuGroup[]>([])
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ top: 50, left: 50 })
const contextMenu = ref<HTMLElement | null>(null)

async function openContextMenu(items = [], event: MouseEvent) {
  const normItems = normalizeToContextMenu(items)
  menuContextItems.value = normItems
  contextMenuVisible.value = true
  console.log('Abrindo menu de contexto com itens:', normItems, 'e evento:', event)

  await nextTick()

  // calcula tamanho e posição
  const menuHeight = contextMenu.value?.offsetHeight || 150
  const menuWidth = contextMenu.value?.offsetWidth || 200
  const buttonRect = (event?.currentTarget as HTMLElement)?.getBoundingClientRect() || null

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
}

function normalizeToContextMenu(input: any) {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    return [{ items: [{ text: 'Nada a mostrar', icon: 'warning' }] }]
  }
  let inputArray

  if (typeof input === 'object' && !Array.isArray(input) && input !== null) {
    if (Object.prototype.hasOwnProperty.call(input, 'items')) {
      inputArray = [input]
    } else {
      inputArray = Object.values(input)
    }
  } else {
    inputArray = Array.isArray(input) ? input : [input]
  }

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

  return [
    {
      items: inputArray.map(normalizeItem),
    },
  ]
}

function normalizeItem(item: any): ContextMenuItem {
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
}

function handleMenuItemClick(item: ContextMenuItem) {
  emit('select', item)

  let result
  if (item?.action) {
    result = item.action?.()
  } else {
    emitEvent(item)
  }

  if (result !== 'keep-open') {
    closeContextMenu()
  }
}

function emitEvent(e: any) {
  emit('emit-event', e)
}

defineExpose({
  openContextMenu,
})
</script>

<template>
  <v-menu v-model="contextMenuVisible"
    :style="{ position: 'fixed', top: `${contextMenuPos.top}px`, left: `${contextMenuPos.left}px` }"
    :close-on-content-click="false" transition="slide-y-transition" class="custom-context-menu">
    <div class="context-menu" :class="{ noFloating: noFloating }" @click.stop ref="contextMenu" tabindex="0"
      role="menu">
      <template v-for="(subMenu, sIndex) in menuContextItems" :key="sIndex">
        <v-divider v-if="sIndex > 0" class="mx-4" />

        <div class="sub-menu" :style="subMenu?.style">
          <div v-for="(item, iIndex) in subMenu.items" :key="iIndex" class="sub-menu-items" tabindex="0" role="menuitem"
            @click="handleMenuItemClick(item)">
            <component v-if="item?.component" :is="item.component" v-bind="item.componentProps"
              v-on="item.listeners ?? {}" @emit-event="emitEvent" />

            <v-btn v-else
              :prepend-icon="item.icon ? (item.icon.startsWith('mdi-') ? item.icon : 'mdi-' + item.icon) : undefined"
              variant="text" block class="justify-start px-2 text-none" rounded="lg">
              <div class="d-flex justify-space-between w-100 align-center">
                <span>{{ item.text }}</span>
                <span v-if="item.shortcut" class="text-caption text-grey ml-4">
                  {{ item.shortcut }}
                </span>
              </div>
            </v-btn>
          </div>
        </div>
      </template>
    </div>
  </v-menu>
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
  outline: none;
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
