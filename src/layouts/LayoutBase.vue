<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores'
import ComponentNavigator from '@/components/modules/ComponentNavigator.vue'

const props = defineProps({
  showHeader: { type: Boolean, default: false },
  navigatorDefaultHidden: { type: Boolean, default: false },
})

const route = useRoute()
const routeHidden = computed(() => route?.meta?.hiddenNavigator)
const sideBar = computed(() => useSettingsStore().getSideBar)
const navigator = ref(null)

const hiddenNavigator = computed(() => {
  if (routeHidden.value) return true
  return !sideBar.value && props.navigatorDefaultHidden
})

const navElementStatus = ref(() => hiddenNavigator.value)

const navStatus = computed({
  get() {
    return navElementStatus.value ?? hiddenNavigator.value
  },
  set(newStatus) {
    if (!hiddenNavigator.value) return
    navElementStatus.value = newStatus
  },
})

const updateNavStatus = (status) => {
  navStatus.value = status
}

const pageName = computed(() => route?.name)
</script>

<template>
  <div class="app-container">
    <div class="app-content">
      <div class="app-navigator">
        <ComponentNavigator
          :hidden="hiddenNavigator"
          :page="pageName"
          :defaultHideButton="true"
          @navigatorStatus="updateNavStatus"
          ref="navigator"
        />
      </div>

      <div class="app-view">
        <router-view v-slot="{ Component }">
          <transition name="fastFade" mode="out-in">
            <div :key="route.path" style="width: 100%; height: 100%">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  height: 100%;
  width: 100%;
  position: relative;
}

.app-content {
  display: grid;
  flex-direction: column;
  grid-row: 2;
  height: 100%;
  overflow: hidden;
  grid-template-columns: auto 1fr;
}

.app-navigator {
  display: grid;
  position: sticky;
  grid-column: 1;
  z-index: 2;
  background: var(--bg2);
}

.app-view {
  padding: 1rem 0 1rem 1rem;
  overflow-y: auto;
  flex-grow: 1;
  z-index: 1;
  grid-column: 2;
  height: 100%;
}

.app-view.no-rounded {
  border-radius: 0 0 0 0 !important;
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
