<template>
  <div 
    id="app"
    class="app"
    :class="[this.typeScreen]" 
  >
    <Overlay 
      ref="overlayRef" 
    />
    <div class="toggle-dark">
      <label class="switch">
        <input
          type="checkbox"
          id="toggle-dark"
          v-model="isDarkMode"
          @change="toggleTheme"
        />
        <span class="slider"></span>
      </label>
    </div>
    <router-view 
      @openOverlayModal="handleOverlayModal"
    />
  </div>
</template>

<script>
import Overlay from "@/components/ActionOverlay.vue";

export default {
  name: "App",

  data() {
    return {
      isDarkMode: false,
    };
  },

  methods: {
    toggleTheme() {
      // Aplica o tema com base no estado reativo
      const theme = this.isDarkMode ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("data-theme", theme);
      document.cookie = `data-theme=${theme}; path=/`;
    },

    handleOverlayModal(modalData) {
      console.log(`App.vue > handleOverlayModal() > ${modalData}`);
      this.$refs.overlayRef.openModal(modalData);
    },

    detectInitialTheme() {
      const savedTheme = localStorage.getItem("data-theme");
      if (savedTheme) {
        this.isDarkMode = savedTheme === "dark";
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        this.isDarkMode = prefersDark;
        localStorage.setItem("data-theme", prefersDark ? "dark" : "light");
      }
      this.toggleTheme();
    },

    watchSystemTheme() {

      const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        this.isDarkMode = e.matches;
        this.toggleTheme();
      };

      darkModeMediaQuery.addEventListener("change", handleChange);
      this._darkModeListener = handleChange;
    },

    handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (width < 768) {
          this.typeScreen = 'mobile'; // Interface para dispositivos móveis
      } else if ((width >= 768 && width <= 1024) || height >= 900) {
          this.typeScreen = 'full'; // Interface unificada para tablet e TV
      } else {
          this.typeScreen = 'pc'; // Interface para desktop
      }
    },
  },

  mounted() {
    this.detectInitialTheme();
    this.watchSystemTheme();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeMediaQuery.removeEventListener("change", this._darkModeListener);
  },

  components: {
    Overlay,
  },
};
</script>

<style>
  @import url('/src/assets/css/core/variables.css');
  @import url('/src/assets/css/core/elements.css');
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
