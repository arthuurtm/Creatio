import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'dark' as 'light' | 'dark',
  }),

  getters: {
    themeMode: (state) => state.theme,
  },

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    },
  },
  persist: {
    key: 'settings',
    storage: localStorage,
    pick: ['theme'],
  },
})
