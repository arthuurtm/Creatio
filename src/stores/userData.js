// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    email: '',
    profilePicture: '',
    additionalData: {},
  }),
  actions: {

    setUserData(userData) {
      this.id = userData.id;
      this.name = userData.name;
      this.email = userData.email;
      this.profilePicture = userData.profilePicture;
      this.additionalData = userData.additionalData || {};
    },

    clearUserData() {
      this.id = '';
      this.name = '';
      this.email = '';
      this.profilePicture = '';
      this.additionalData = {};
    },
  },
});
