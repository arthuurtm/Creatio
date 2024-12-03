<template>
    <div class="page">
      <div class="toggle-dark">
        <label class="switch">
          <input type="checkbox" v-model="darkMode" @change="toggleTheme" />
          <span class="slider"></span>
        </label>
      </div>
  
      <div class="form-box" v-if="!isSuccess">
        <form @submit.prevent="handlePasswordReset">
          <img src="../content/img/logo_mini.png" alt="Logo do Sysroot" id="logosysroot" />
          <span class="title">Redefinir sua senha</span>
          <div class="form-container">
            <input v-model="newPassword" type="password" class="input" placeholder="Digite sua nova senha" required />
            <input v-model="confirmPassword" type="password" class="input" placeholder="Digite novamente a nova senha" required />
          </div>
          <div class="button-container">
            <button class="btn" type="button" @click="cancelReset">Cancelar</button>
            <button class="btn-destructive" type="submit" :disabled="loading">Redefinir</button>
          </div>
        </form>
      </div>
  
      <div v-if="isSuccess" class="form-box">
        <span class="title">Sucesso!</span>
        <span class="subtitle">Guarde seu novo código de segurança!</span>
        <h1 class="roboto-bold">{{ extraId }}</h1>
        <button class="btn" @click="logout">Sair</button>
      </div>
  
      <div v-if="errorMessage" class="uiMiniMsgBox">
        <p class="noto-color-emoji-regular">⛔️ {{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
        return {
            newPassword: '',
            confirmPassword: '',
            loading: false,
            errorMessage: null,
            isSuccess: false,
            extraId: '',
            darkMode: false,
            tokenValid: false,  // Adiciona uma flag para verificar se o token é válido
        };
    },

    created() {
        this.validateToken();
    },

    methods: {
    async validateToken() {
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
        this.errorMessage = 'Token de redefinição de senha inválido ou ausente.';
        return;
        }
        
        try {
        const response = await fetch(`http://localhost:3000/validate-reset-token?token=${token}`, {
            method: 'GET',
        });

        const data = await response.json();

        if (response.ok) {
            this.tokenValid = true;  // Se o token for válido, permita o processo de redefinição
        } else {
            this.errorMessage = data.message || 'O token de redefinição de senha não é válido ou expirou.';
        }
        } catch (error) {
        this.errorMessage = 'Erro ao validar o token. Tente novamente mais tarde.';
        }
    },

    async handlePasswordReset() {
        if (!this.tokenValid) {
        this.errorMessage = 'Token de redefinição inválido.';
        return;
        }

        this.loading = true;
        this.errorMessage = null;

        if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'As senhas não coincidem. Tente novamente.';
        this.loading = false;
        return;
        }

        try {
        const response = await fetch('http://localhost:3000/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            new_password: this.newPassword,
            confirm_password: this.confirmPassword,
            }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Erro desconhecido');

        this.isSuccess = true;
        this.extraId = data.extraId; // Recebe o novo código de segurança
        } catch (error) {
        this.errorMessage = error.message;
        } finally {
        this.loading = false;
        }
    },

        cancelReset() {
            this.$router.push({ name: 'Login' });
        },

        logout() {
            this.$router.push({ name: 'Logout' });
        },

        toggleTheme() {
            this.darkMode = !this.darkMode;
            // Aqui você pode salvar a preferência do tema no localStorage, se necessário.
        },
    },

  };
  </script>
  
<style scoped>
  @import url('/src/assets/css/modules/loginForm.css');
</style>
  