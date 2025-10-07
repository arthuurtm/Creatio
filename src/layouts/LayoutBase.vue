<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import ComponentNavigator from '@/components/modules/ComponentHeader.vue'

const route = useRoute()
const pageMeta = computed(() => route?.meta)
const navigator = ref(null)
const pageName = computed(() => route?.name)
</script>

<template>
  <div class="app-container">
    <ComponentNavigator
      :hidden="pageMeta.hiddenNavigator"
      :page="pageName"
      :defaultHideButton="true"
      @navigatorStatus="updateNavStatus"
      ref="navigator"
    />
    <div
      class="app-content"
      :class="[pageMeta.hiddenNavigator && 'overlay-nav', pageMeta.fullscreen && 'full']"
    >
      <router-view v-slot="{ Component }">
        <transition name="fastFade" mode="out-in">
          <div :key="route.path" style="width: 100%; height: 100%">
            <component :is="Component" />
          </div>
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
  overflow: hidden;
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
