<template>
  <div class="page">
    <div class="formLogin">
      <form @submit.prevent="handleLogin">
        <img src="/img/logoMini.png" alt="Logo do Sysroot" id="logosysroot" />
        <h1 class="roboto-bold">Acesse sua conta</h1>
        <div class="sepElements">
          <label for="email">E-mail</label>
          <input type="email" v-model="email" placeholder="Digite seu e-mail" autofocus />
          <label for="password">Senha</label>
          <div class="sepElements">
            <input type="password" v-model="password" placeholder="Digite sua senha" style="margin-bottom: 10px;" />
            <a href="/password/request-reset">Esqueci minha senha</a>
          </div>
          <div id="error-message" v-if="errorMessage" style="margin-bottom: 15px;">⛔ {{ errorMessage }}</div>
        </div>
        <button class="btn" type="submit">Entrar</button>
        <div class="ext-loginOp-sep">
          <p>OU</p>
        </div>
        <div id="googleButton">LOGIN COM O GOOGLE</div>
      </form>
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
    this.isDarkMode = JSON.parse(localStorage.getItem("isDarkMode")) || false;

    google.accounts.id.initialize({
      client_id: "786835480114-ls0nhgeddkc9p6dcvnp41osj8iesif3j.apps.googleusercontent.com",
      callback: this.handleGoogleLogin,
      context: "signin",
      ux_mode: "popup",
      auto_prompt: false
    });

    google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      {
        size: "large",
        type: "standard",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
      }
    );
  },
  methods: {
    async handleGoogleLogin(response) {
      try {
        // Decodificar o token JWT para obter o email do usuário
        const decodedToken = jwt_decode(response.credential);
        const email = decodedToken.email;

        // Verificar se o email existe no banco de dados
        const res = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'check-user'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Erro desconhecido');

        if (data.exists) {
          // Email existe - salvar token e redirecionar
          localStorage.setItem('authToken', response.credential);
          this.$router.push({ name: 'Games' });
        } else {
          // Email não existe
          this.errorMessage = "Conta Google não vinculada a nenhum usuário.";
        }
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    async handleLogin() {
      try {
        const response = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            deviceInfo: navigator.userAgent,
            ipAddress: '127.0.0.1',
          }),
        });
        
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Erro desconhecido');

        // Armazena o token e sessionId
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('sessionId', data.sessionId);

        // Redireciona para a página inicial
        this.$router.push({ name: 'Games' });
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    toggleDarkMode() {
      localStorage.setItem("isDarkMode", JSON.stringify(this.isDarkMode));
    },
  },
};
</script>

<style scoped>
@import url('/src/assets/css/modules/loginForm.css');
</style>
