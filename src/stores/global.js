import { defineStore } from 'pinia'
import { markRaw } from 'vue'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sideBar: true,
  }),
  getters: {
    getSideBar: (state) => state.sideBar,
  },
  actions: {
    setSideBar(value = false) {
      this.sideBar = value
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

export const useAppDynamicDialog = defineStore('appDynamicDialog', {
  state: () => ({
    isVisible: false,
    component: null,
    title: 'Diálogo',
    data: {},
    history: [],
  }),
  getters: {
    getIsVisible: (state) => state.isVisible,
    getComponent: (state) => state.component,
    getTitle: (state) => state.title,
    getData: (state) => state.data,
    getIsHistory: (state) => state.history.length > 0,
  },
  actions: {
    show() {
      this.isVisible = true
    },

    close() {
      console.log('close', '; history?', this.history.length)
      if (this.history.length > 0) {
        const lastDialog = this.history.pop()
        this.component = lastDialog.component
        this.data = lastDialog.data
        this.title = lastDialog.data.title || 'Diálogo'
      } else {
        this.isVisible = false
        this.component = ''
        this.data = {}
      }
    },

    setDialog(component, data = {}) {
      console.log('setDialog', component, data)
      const isFirst = !this.component

      if (!isFirst) {
        this.history.push({
          component: this.component,
          data: this.data,
        })
      }

      if (data) {
        this.data = data
        this.title = data.title
      }

      this.component = markRaw(component)

      if (isFirst) {
        this.show()
      }
    },

    setData(data) {
      this.data = data
    },
  },
})
