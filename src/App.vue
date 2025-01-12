<template>
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
  />
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isDarkMode: false,
      typeScreen: 'pc',
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
          this.typeScreen = 'mobile';
      // } else if ((width >= 768 && width <= 1024) || height >= 900) {
      //     this.typeScreen = 'full';
      } else {
          this.typeScreen = 'pc';
      }
    },
  },
  mounted() {
    this.detectInitialTheme();
    this.watchSystemTheme();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeMediaQuery.removeEventListener("change", this._darkModeListener);
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
  .app {
    display: flex;
    flex: 1;
    position: relative;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
  }
</style>
