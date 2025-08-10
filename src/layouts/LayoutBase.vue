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

const toggleNavigator = () => {
  navigator.value?.updateMenuState(true)
}

const pageName = computed(() => route?.name)
</script>

<template>
  <div class="app-container">
    <header v-if="showHeader" class="app-header">
      <slot name="header">
        <div class="header-bar">
          <div class="util">
            <div id="toggleNavigator">
              <CreateButton
                @emitEvent="toggleNavigator"
                :buttons="[
                  {
                    icon: 'menu',
                    class: 'symbolic no-padding no-scalling',
                    id: 'toggleNavigatorButton',
                    type: '',
                  },
                ]"
              />
            </div>
            <div class="search">
              <div class="wrapper">
                <CreateTextField
                  :fields="[
                    {
                      type: 'text',
                      name: 'globalSearch',
                      model: 'globalSearch',
                      placeholder: 'Pesquisar por...',
                      icon: 'search',
                      style: ['minimal', 'border', 'background'],
                    },
                  ]"
                />
              </div>
            </div>
          </div>
          <div class="notifications">
            <div class="notification-wrapper">
              <CreateButton
                :buttons="[
                  {
                    position: 'right',
                    icon: 'notifications',
                    class: 'symbolic no-padding no-scalling no-brightness',
                    id: 'notificationsButton',
                    type: '',
                  },
                ]"
              />
            </div>
          </div>
        </div>
      </slot>
    </header>

    <div class="main-content">
      <div class="navigator-container">
        <ComponentNavigator
          :hidden="hiddenNavigator"
          :page="pageName"
          :defaultHideButton="!showHeader"
          @navigatorStatus="updateNavStatus"
          ref="navigator"
        />
      </div>

      <div class="view-app">
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
  background: var(--bg2);
}

.app-header {
  grid-row: 1;
}

.header-bar {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 6px var(--primary-shadow);
  position: relative;
  border-bottom: 2px solid var(--border);
}

.util {
  display: flex;
  justify-content: space-between;
}

.header-bar .search {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  right: 50%;
  top: 0.3rem;
}

.header-bar .search .wrapper {
  display: flex;
  width: min-content;
}

.header-bar #toggleNavigator {
  margin-left: 1rem;
}

.main-content {
  display: grid;
  flex-direction: column;
  grid-row: 2;
  height: 100%;
  overflow: hidden;
  grid-template-columns: auto 1fr;
}

.navigator-container {
  display: grid;
  position: sticky;
  grid-column: 1;
  z-index: 2;
}

.view-app {
  /* padding: 15px; */
  /* padding: 1rem; */
  padding: 1rem 0 1rem 1rem;
  overflow-y: auto;
  flex-grow: 1;
  z-index: 1;
  grid-column: 2;
  /* border-radius: 24px; */
  background: var(--bg);
}

.view-app.no-rounded {
  border-radius: 0 0 0 0 !important;
  /* border-top-left-radius: 0 !important; */
}

.notifications {
  margin-left: auto;
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

  .header-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    border-radius: 24px;
    background: var(--secondary);
    backdrop-filter: var(--main-blur) var(--main-saturate);
    -webkit-backdrop-filter: var(--main-blur) var(--main-saturate);
    border: 2px solid var(--border);
  }

  .header-bar .util {
    display: flex;
    flex-direction: row-reverse;
  }

  .header-bar .notifications .notification-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .search {
    margin-right: auto;
    flex-grow: 0 !important;
    z-index: 2;
    position: static !important;
  }

  .main-content {
    grid-row: 1;
    z-index: 1;
  }

  .view-app {
    margin: 0;
    border-radius: 0 !important;
    padding: 5px;
    border-left: none;
  }

  .header-bar #toggleNavigator {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    margin: 0;
  }
}
</style>
