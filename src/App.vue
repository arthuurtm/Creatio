<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Navigator from "./components/MainNavigator.vue";

export default {
  name: 'app',
  components: {
    Navigator
  },
  data() {
    return {
      userProfilePicture: "caminho_da_imagem_perfil",
      userName: "Nome do Usuário",
      userEmail: "email@exemplo.com"
    };
  },
  methods: {
    handleNavigation(section) {components
      // Lógica para navegação
      this.$router.push({ name: section });
    },
    handleLogout() {
      // Lógica para logout
      console.log("Logout solicitado");
    }
  }
};
</script>

<style>
    @import url('/src/assets/css/core/variables.css');
    @import url('/src/assets/css/core/buttons.css');
    @import url('/src/assets/css/modules/overlay.css');
</style>
