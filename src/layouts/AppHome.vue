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
    <div class="header-bar">
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
                  // color: 'sameText',
                },
              },
            ]"
          />
        </div>
      </div>
      <div class="notifications">
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

.header-bar {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  grid-row: 1;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 6px var(--primary-shadow);
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
  background-color: var(--bg);
}

.view-app {
  padding: 30px;
  overflow-y: auto;
  flex-grow: 1;
  z-index: 1;
  grid-column: 2;
}

.view-app.no-rounded {
  border-radius: 0;
}
@media (max-width: 600px) {
  .app-container {
    background-color: var(--bg);
  }

  .view-app {
    margin: 0;
    border-radius: 0;
    padding: 5px;
  }

  .header-bar {
    border-radius: 0 0 20px 20px;
    background-color: var(--bg2);
  }

  .header-bar #toggleNavigator {
    margin-left: 0;
  }
}
</style>
