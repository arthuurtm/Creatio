<script setup>
import { computed } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

const teste = [
  {
    items: [
      { text: 'Editar', icon: 'edit' },
      { text: 'Copiar', icon: 'content_copy' },
    ],
  },
  {
    items: [
      { text: 'Excluir', icon: 'delete' },
      { text: 'Compartilhar', icon: 'share' },
    ],
  },
]
</script>

<template>
  <div class="context-menu">
    <div v-for="(subMenu, sIndex) in teste" :key="sIndex" class="sub-menu">
      <hr v-if="index > 0" />
      <ul v-for="(item, iIndex) in subMenu.items" :key="iIndex" class="sub-menu-items">
        <li>
          <span v-if="item.icon" class="material-symbols-outlined">{{ item.icon }}</span>
          <p>{{ item.text }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  background: var(--context-menu-bg);
  filter: var(--main-glass-saturate);
}
</style>
