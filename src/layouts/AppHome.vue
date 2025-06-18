<script setup>
import ComponentNavigator from '@/components/ComponentNavigator.vue'
import { computed, ref, inject } from 'vue'
import { useRoute } from 'vue-router'

const store = inject('stores')
const props = defineProps({
  hiddenNavigator: Boolean,
})
const routeHidden = useRoute().meta.hiddenNavigator
const sideBar = computed(() => store.settings.getSideBar)
const navigator = ref(null)

const hiddenNavigator = computed(() => {
  if (routeHidden === true) return true
  return !(props.hiddenNavigator || sideBar.value)
})

const navElementStatus = ref(() => {
  if (hiddenNavigator.value) {
    return true
  } else {
    return false
  }
})

const navStatus = computed({
  get() {
    return navElementStatus.value ?? hiddenNavigator.value
  },

  set(newStatus) {
    if (!hiddenNavigator.value) {
      return
    }
    navElementStatus.value = newStatus
  },
})

const updateNavStatus = (status) => {
  navStatus.value = status
}
const toggleNavigator = () => {
  console.log('toggleNavigator()', navigator.value)
  navigator.value?.updateMenuState(true)
}

const pageName = computed(() => useRoute().name)
</script>

<template>
  <div class="app-container">
    <div class="app-header">
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
                    style: {
                      rounded: true,
                      border: true,
                      minimal: true,
                      // color: 'sameText',
                    },
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
                  action: {
                    name: '--',
                    value: '--',
                    type: '--',
                  },
                },
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="navigator-container">
        <ComponentNavigator
          :hidden="hiddenNavigator"
          :page="pageName"
          @navigatorStatus="updateNavStatus"
          ref="navigator"
        />
      </div>

      <div class="view-app" :class="[!navStatus && 'no-rounded']">
        <router-view v-slot="{ Component }">
          <transition name="fastFade" mode="out-in">
            <component :is="Component" />
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
  background-color: var(--bg);
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
  grid-column: 1;
  z-index: 2;
}

.view-app {
  padding: 15px;
  overflow-y: auto;
  flex-grow: 1;
  z-index: 1;
  grid-column: 2;
  margin: 1px solid var(--border);
  border-radius: 24px;
}

.view-app.no-rounded {
  border-radius: 0;
}

.notifications {
  margin-left: auto;
}
@media (max-width: 600px) {
  .app-container {
    background-color: var(--bg);
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
  }

  .header-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: var(--bg2);
    position: relative;
    border-radius: 20px 20px 0 0;
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
  }

  .main-content {
    grid-row: 1;
    z-index: 1;
  }

  .view-app {
    margin: 0;
    border-radius: 0;
    padding: 5px;
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

:root[data-modifier='glass'] .app-container {
  background: var(--main-gradient);
}

:root[data-modifier='glass'] .header-bar {
  background: var(--main-glass-background);
  /* box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1); */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  /* border-radius: 24px; */
  border: 2px solid rgba(255, 255, 255, 0.24);
  /* margin: 1rem 1rem 0.2rem 1rem; */
}

:root[data-theme='dark'][data-modifier='glass'] .header-bar {
  background: rgba(20, 20, 30, 0.35);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(73, 67, 67, 0.1);
}

:root[data-modifier='glass'] .header-bar #toggleNavigator {
  margin-left: 1rem;
}

@media (max-width: 600px) {
  :root[data-modifier='glass'] .header-bar {
    margin: 0;
    padding: 0.6rem;
  }

  :root[data-modifier='glass'] .header-bar #toggleNavigator {
    margin-left: 0;
  }
}
</style>
