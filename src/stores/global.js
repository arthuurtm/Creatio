import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkTheme: false,
  }),
  getters: {
    getDarkTheme: (state) => state.darkTheme,
  },
  actions: {
    setDarkTheme(value = false) {
      this.darkTheme = value
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'settings',
        storage: localStorage,
        paths: ['darkTheme'],
      },
    ],
  },
})
