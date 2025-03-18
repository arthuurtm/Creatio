// src/stores/store.js
import { defineStore } from 'pinia'

export const useAppDynamicDialog = defineStore('appDynamicDialog', {
  state: () => ({
    isVisible: false,
    component: '',
    title: 'Diálogo',
    data: {},
  }),
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
      console.log(
        `store.js() > useAppDynamic() > setDialog(component: ${component}, data: ${data})`,
      )
      if (data) {
        this.data = data
        this.title = data.title
      }
      this.component = component
      this.show()
    },
  },
})

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    username: '',
    email: '',
    profilePicture: '/src/data/default/profile-pic.png',
    additionalData: {},
    isAuth: false,
  }),
  actions: {
    setUserData(userData) {
      this.id = userData.id
      this.name = userData.name
      this.username = userData.username
      this.email = userData.email
      this.profilePicture = userData.profilePicture || '/src/data/default/profile-pic.png'
      this.additionalData = userData.additionalData || {}
      this.isAuth = true
    },
    clearUserData() {
      this.id = ''
      this.name = ''
      this.username = ''
      this.email = ''
      this.profilePicture = ''
      this.additionalData = {}
      this.isAuth = false
    },
    isAuth() {
      return this.id !== ''
    },
  },
  persist: {
    enabled: true, // Habilita a persistência para este store
    strategies: [
      {
        key: 'user', // Nome da chave no storage
        storage: localStorage, // Armazena no localStorage
      },
    ],
  },
})
