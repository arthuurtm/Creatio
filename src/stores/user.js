import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    username: '',
    email: '',
    profilePicture: '/src/data/default/profile-3.png',
    additionalData: {},
    isAuth: false,
  }),
  getters: {
    getId: (state) => state.id,
    getName: (state) => state.name,
    getUsername: (state) => state.username,
    getEmail: (state) => state.email,
    getProfilePicture: (state) => state.profilePicture,
    getAdditionalData: (state) => state.additionalData,
    getIsAuth: (state) => state.isAuth,
  },
  actions: {
    setUserData(userData) {
      this.id = userData.id
      this.name = userData.name
      this.username = userData.username
      this.email = userData.email
      this.profilePicture = userData.profilePicture || '/src/data/default/profile-3.png'
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
    checkAuth() {
      return this.isAuth && this.id !== ''
    },
  },
  persist: {
    enabled: true, // Habilita a persistência para este store
    strategies: [
      {
        key: 'user',
        storage: localStorage,
        paths: ['isAuth', 'id'],
      },
    ],
  },
})
