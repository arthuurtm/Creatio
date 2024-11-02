<template>
    <div class="page" :class="{ dark: isDarkMode }">
      <!-- Toggle de tema escuro -->
      <div class="toggle-dark">
        <label class="switch">
          <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode" />
          <span class="slider"></span>
        </label>
      </div>
  
      <!-- Formulário de Login -->
      <form @submit.prevent="handleLogin" class="formLogin">
        <img src="/public/img/logoMini.png" alt="Logo do Sysroot" id="logosysroot" />
        <h1 class="roboto-bold">Acesse sua conta</h1>
  
        <label for="email">E-mail</label>
        <input type="email" v-model="email" placeholder="Digite seu e-mail" autofocus />
  
        <label for="password">Senha</label>
        <input type="password" v-model="password" placeholder="Digite sua senha" />
  
        <a href="./fn/reset-password-request.php">Esqueci minha senha</a>
        <button class="btn" type="submit">Entrar</button>
  
        <!-- Separador -->
        <div class="ext-loginOp-sep">
          <p>OU</p>
        </div>
  
        <!-- Botão do Google -->
        <div id="googleButton"></div>
      </form>
  
      <!-- Mensagem de Erro -->
      <div class="uiMiniMsgBox" v-if="errorMessage">
        <p class="noto-color-emoji-regular">⛔️ {{ errorMessage }}</p>
      </div>
    </div>
</template>
  
<script>
  export default {
    data() {
      return {
        email: "",
        password: "",
        errorMessage: "",
        isDarkMode: false,
      };
    },
    mounted() {
      // Carrega o botão de login do Google
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: this.handleGoogleLogin,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large" }
      );
  
      // Carrega o tema salvo no localStorage
      this.isDarkMode = JSON.parse(localStorage.getItem("isDarkMode")) || false;
    },
    methods: {
      toggleDarkMode() {
        // Salva a preferência de tema no localStorage
        localStorage.setItem("isDarkMode", JSON.stringify(this.isDarkMode));
      },
      async handleSubmit() {
        try {
          // Lógica de autenticação (API, por exemplo)
          const response = await fetch("API_ENDPOINT", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: this.email, password: this.password }),
          });
          const data = await response.json();
  
          if (!response.ok) throw new Error(data.message || "Erro desconhecido");
  
          // Redirecionar usuário ou salvar token (exemplo)
          // localStorage.setItem("token", data.token);
          this.$router.push("/dashboard"); // Redireciona para outra página
  
        } catch (error) {
          this.errorMessage = error.message; // Exibe a mensagem de erro
        }
      },
      handleGoogleLogin(response) {
        // Callback para o login via Google
        console.log("Google login response:", response);
        // Implementar lógica para tratar o login com Google
      },
      async handleLogin() {
        try {
                // Exemplo de uma chamada para a API de autenticação
                const response = await fetch('API_ENDPOINT/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.email, password: this.password }),
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.message || 'Erro desconhecido');

                // Armazena o token de autenticação
                localStorage.setItem('authToken', data.token);
                
                // Redireciona para a página inicial
                this.$router.push({ name: 'Home' });
            } catch (error) {
                this.errorMessage = error.message;
            }
        },
    },
  };
</script>
  
<style scoped>
  @import url('/src/assets/css/modules/loginForm.css');
</style>
  