import { defineStore } from 'pinia'
export const useAppDynamicDialog = defineStore('appDynamicDialog', {
  state: () => ({
    isVisible: false,
    component: '',
    title: 'Diálogo',
    data: {},
  }),
  getters: {
    getIsVisible: (state) => state.isVisible,
    getComponent: (state) => state.component,
    getTitle: (state) => state.title,
    getData: (state) => state.data,
  },
  actions: {
    show() {
      this.isVisible = true
    },

    close() {
      this.isVisible = false
      this.component = ''
      this.data = {}
    },

    setDialog(component, data = {}) {
      if (data) {
        this.data = data
        this.title = data.title
      }
      this.component = component
      this.show()
    },

    setData(data) {
      this.data = data
    },
  },
})
