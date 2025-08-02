<script setup>
import { computed, ref } from 'vue'

const menuContextItems = ref([])
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ top: 0, left: 0 })

function openContextMenu(items = [], event = []) {
  console.log(items, event)
  const targetElement = event?.target || event?.srcElement
  const targetRect = targetElement?.getBoundingClientRect() || contextMenuPos
  menuContextItems.value = items

  const menuHeight = 150 // altura aproximada ou use refs para calcular
  let top = targetRect.top - menuHeight

  if (top < 0) {
    top = targetRect.bottom // se não cabe acima, abre abaixo
  }

  contextMenuPos.value = {
    top,
    left: targetRect.left,
  }

  contextMenuVisible.value = true
}

defineExpose({
  openContextMenu,
})
</script>

<template>
  <div class="dialog-shadow">
    <div class="context-menu">
      <div v-for="(subMenu, sIndex) in menuContextItems" :key="sIndex" class="sub-menu">
        <hr v-if="sIndex > 0" />
        <ul v-for="(item, iIndex) in subMenu.items" :key="iIndex" class="sub-menu-items">
          <CreateButton
            :buttons="[
              {
                icon: item.icon,
                text: item.text,
                class: 'symbolic no-padding no-scalling',
              },
            ]"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  display: inline-flex;
  background: var(--main-glass-background);
  filter: var(--main-glass-saturate);
  border-radius: 24px;
  width: auto;
  padding: 0 1rem;
}

.sub-menu-items {
  padding: 2px;
}

ul {
  list-style: none;
}
</style>
