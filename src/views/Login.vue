<template>
  <transition name="errAnim">
    <div v-if="errorMessage" id="error-message" class="error-message" :class="errorMessage && 'show'">
      ✖ {{ errorMessage }}
    </div>
  </transition>
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
                  @click="redirect('Password_Reset')"
                  class="form-link critical"
                > 
                  Esqueci minha senha
                </a>
              </div>
              <a 
              @click="redirect('Signup')" 
                class="form-link normal"> 
                Criar conta
              </a>
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
export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      redirectUrl: "About",
    };
  },
  mounted() {

    if (this.$route.query && this.$route.query.redirect) {
      this.redirectUrl = this.$route.query.redirect;
    } else {
      console.log('Parâmetro redirect não encontrado na query string.');
    }

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
        const gToken = decodedToken.sub;
        const res = await fetch(this.$globalFunc.getApiUrl('database', 'login'), {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type:'google', 
            gToken: gToken,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro desconhecido');
        this.redirect(this.redirectUrl);

      } catch (error) {
        console.error("Erro: ", error.message)
        this.errorMessage = error.message;
      }
    },

    async handleLogin() {
      try {
        const res = await fetch(this.$globalFunc.getApiUrl('database', 'login'), {
          credentials: 'include',
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
        this.redirect(this.redirectUrl);

      } catch (error) {
        console.error("Erro: ", error.message)
        this.errorMessage = error.message;
      }
    },

    redirect(link, params = {}) {
      if (params) {
        this.$router.push({name: link, params: params});
      } else {
        this.$router.push({name: link});
      }
    },
  },
};
</script>

<style scoped>
@import url('/src/assets/css/modules/mainForm.css');
</style>