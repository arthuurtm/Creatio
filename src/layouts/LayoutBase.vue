<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComponentNavigator from '@/components/modules/ComponentHeader.vue'

const route = useRoute()
const router = useRouter()
const pageMeta = computed(() => route?.meta)
const navLinks = computed(() => {
  return {
    left: [
      { text: 'HOME', action: () => router.push({ name: 'Home' }) },
      { text: 'JOGOS', action: () => router.push({ name: 'GamesView' }) },
      { text: 'PROJETOS', action: () => router.push({ name: 'CreateHome' }) },
      { text: 'SOBRE', action: () => router.push({ name: 'About' }) },
    ],
    right: [],
  }
})
</script>

<template>
  <div class="app-container">
    <ComponentNavigator :hidden="pageMeta.hiddenNavigator" :nav-links="navLinks" />
    <div
      class="app-content"
      :class="[pageMeta.hiddenNavigator && 'overlay-nav', pageMeta.fullscreen && 'full']"
    >
      <router-view v-slot="{ Component }">
        <transition name="fastFade" mode="out-in">
          <CGroup grow :key="Component">
            <component :is="Component" />
          </CGroup>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  flex-direction: column;
}

.app-header {
  height: auto;
}

.app-content {
  display: flex;
  overflow: auto;
  padding: 0.5rem;
  z-index: 1;
  height: 100%;
}

.app-content.full {
  padding: 0;
}

.app-navigator {
  display: grid;
  position: sticky;
  grid-column: 1;
  z-index: 2;
}

/* --- MODO MENU ESCONDIDO (QUANDO hidden é ativo) --- */
.app-content.overlay-nav {
  grid-template-columns: 1fr;
  position: relative;
}

@media (max-width: 600px) {
  .app-container {
    grid-template-rows: 1fr auto;
  }

  .app-header {
    grid-row: 2;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    max-height: 70px;
    padding: 8px 16px;
    border-radius: 24px;
  }

  .app-content {
    grid-row: 1;
    z-index: 1;
  }

  .app-view {
    margin: 0;
    border-radius: 0 !important;
    padding: 5px;
    border-left: none;
  }
}
</style>
