import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    settings: {
      sideBar: false,
    },
    inputData: {},
  }),
  getters: {
    getSideBar: (state) => {
      return state.settings.sideBar
    },
    getInputData: (state) => {
      console.log('getInputData', state.inputData)
      return state.inputData
    },
  },
  actions: {
    setSideBar(value = false) {
      this.settings.sideBar = value
    },
    updateInputData(field, value) {
      this.inputData[field] = value
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'settings',
        storage: localStorage,
        paths: ['settings'],
      },
    ],
  },
})
