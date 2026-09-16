import { defineStore } from "pinia";
import { syncThemeCssVariables } from "@/plugins/naive";

function getInitialTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme === "light" || parsed.theme === "dark") {
          return parsed.theme;
        }
      }
    } catch {}

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  }
  return "light";
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    theme: getInitialTheme(),
  }),

  getters: {
    themeMode: (state) => state.theme,
    isDark: (state) => state.theme === "dark",
  },

  actions: {
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      syncThemeCssVariables(this.theme);
    },
    setTheme(newTheme: "light" | "dark") {
      this.theme = newTheme;
      syncThemeCssVariables(this.theme);
    },
  },
  persist: {
    key: "settings",
    storage: localStorage,
    pick: ["theme"],
  },
});
