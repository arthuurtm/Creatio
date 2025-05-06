<script setup>
import ComponentNavigator from '@/components/ComponentNavigator.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  hiddenNavigator: Boolean,
})

const hiddenNavigator = computed(() => useRoute().meta.hiddenNavigator ?? props.hiddenNavigator)

const pageName = computed(() => useRoute().name)
</script>

<template>
  <div class="app-container">
    <div class="navigator-container">
      <ComponentNavigator :hidden="hiddenNavigator" :page="pageName" />
    </div>

    <div class="main-content">
      <div class="header-bar">
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

      <div class="view-app">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: grid;
  grid-template-columns: auto 1fr; /* Ajusta o Navigator ao tamanho necessário e o conteúdo principal ocupa o restante */
  grid-template-rows: 1fr; /* Uma única linha */
  height: 100%;
  width: 100%;
  position: relative;
  background-color: var(--bg2);
}

.navigator-container {
  display: grid;
  grid-column: 1;
  z-index: 2;
}

.main-content {
  display: flex;
  flex-direction: column;
  grid-column: 2;
  height: 100%;
  overflow: hidden;
}

.header-bar {
  display: flex;
  align-items: center;
  padding: 0.6rem;
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

.view-app {
  padding: 30px;
  background-color: var(--bg);
  border-top-left-radius: 15px;
  overflow-y: auto;
  flex-grow: 1;
  z-index: 1;
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
}
</style>
