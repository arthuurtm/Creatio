<template>
  <div class="mform">
    <div class="left">
      <img src="/img/logoMini.png" alt="Logo do Sysroot" id="logo" />
      <h1>Acesse sua conta</h1>
    </div>
    <div class="right">
      <transition name="slide-left">
        <div class="formStep" data-step="1">
          <form class="formContainer" @submit.prevent="handleLogin">
            <div class="sepElements">
              <label for="email">E-mail</label>
              <input
                class="input"
                type="email"
                v-model="email"
                placeholder="Digite seu e-mail"
                autofocus
                required
              />
              <label for="password">Senha</label>
              <div class="joinElements">
                <input
                  class="input"
                  type="password"
                  v-model="password"
                  placeholder="Digite sua senha"
                  required
                />
                <a 
                  href="/password/reset" 
                  class="form-link critical"> 
                  Esqueci minha senha
                </a>
              </div>
              <a 
                href="/signup" 
                class="form-link normal"> 
                Criar conta
              </a>
              <div id="error-message" v-if="errorMessage" class="error-message">
                ⛔ {{ errorMessage }}
              </div>
            </div>
            <div class="sepButtons">
              <div id="googleButton" style="display:flex; justify-content: center; align-items: center;"></div>
              <button class="btn confirm" type="submit">Entrar</button>
            </div>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>



<script>
import { useUserStore } from '@/stores/userData';
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
      client_id: import.meta.env.VITE_GCLIENT_LOGIN_ID,
      callback: this.handleGoogleLogin,
      context: "signin",
      ux_mode: "popup",
      auto_prompt: false
    });

    google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      {
        size: "large",
        type: "icon",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
      }
    );

    google.accounts.id.prompt();

  },
  methods: {
    async handleGoogleLogin(response) {
      try {

        const decodedToken = jwt_decode(response.credential);
        const gEmail = decodedToken.email;
        const res = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type:'google', 
            email: gEmail,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro desconhecido');

        sessionStorage.setItem('authToken', data.sessionId);
        this.handleUserData(gEmail);
        this.$router.push({ name: 'Home' });

      } catch (error) {
        console.error("Erro: ", error.message)
        this.errorMessage = error.message;
      }
    },

    async handleLogin() {
      try {
        const res = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'default',
            email: this.email,
            password: this.password,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro desconhecido');

        sessionStorage.setItem('authToken', data.sessionId);
        this.handleUserData(this.email);
        this.$router.push({ name: 'Home' });

      } catch (error) {
        console.error("Erro: ", error.message)
        this.errorMessage = error.message;
      }
    },

    async handleUserData(email) {
      const res = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'check-user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data) {
        useUserStore().setUserData({ 
          id: data.id,
          name: data.nickname,
          username: data.username,
          email: data.email,
          profilePicture: null 
        });
      }
    },
  },
};
</script>

<style scoped>
@import url('/src/assets/css/modules/mainForm.css');
</style>