// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    username: '',
    email: '',
    profilePicture: '',
    additionalData: {},
  }),
  actions: {
    setUserData(userData) {
      this.id = userData.id;
      this.name = userData.name;
      this.username = userData.username;
      this.email = userData.email;
      this.profilePicture = userData.profilePicture;
      this.additionalData = userData.additionalData || {};
    },
    clearUserData() {
      this.id = '';
      this.name = '';
      this.username = '';
      this.email = '';
      this.profilePicture = '';
      this.additionalData = {};
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
});
