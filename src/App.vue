<template>
  <div id="app">
    <Overlay 
      ref="openOverlayModal"
    />
    <div class="toggle-dark">
      <label class="switch">
        <input type="checkbox" id="toggle-dark" v-model="darkMode" @change="toggleTheme" />
        <span class="slider"></span>
      </label>
    </div>
    <router-view />
  </div>
</template>

<script>
import Overlay from '@/components/Overlay.vue';

export default {
  name: 'app',
  
  methods: {
    toggleTheme() {
      const theme = this.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    },
    openOverlayModal(modalData) {
      this.$refs.openOverlayModal.openModal(modalData);
    },
  },
  components: {
    Overlay
  }
};
</script>

<style>
  @import url('/src/assets/css/core/variables.css');
  @import url('/src/assets/css/core/buttons.css');
  @import url('/src/assets/css/modules/overlay.css');
  @import url('/src/assets/css/modules/toggleTheme.css');
  body {
    margin: 0;
    padding: 0;
    color: var(--text);
    background-color: var(--bg);
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    background-color: var(--bg);
    color: var(--text);
    justify-content: center;
    align-items: center;
  }
  #app {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
  }
</style>
