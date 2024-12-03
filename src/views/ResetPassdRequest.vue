<template>
  <div class="page">
    <div class="formLogin">
      <img src="/img/logoMini.png" alt="Logo do Sysroot" id="logosysroot" />
      <h2>Redefinição de Senha</h2>
      
      <!-- Etapa 1: Inserir e-mail -->
      <div v-if="currentStep === 1">
        <form @submit.prevent="sendEmail">
            <div class="sepElements">
              <label for="email">E-mail:</label>
              <input type="email" v-model="email" id="email" placeholder="Digite seu e-mail" required />
              <div class="button-container">
                <button class="btn-destructive" href="./login" @click="back">Cancelar</button>
                <button type="submit" class="btn">Próximo</button>
              </div>
            </div>
          </form>
      </div>

      <!-- Etapa 2: Inserir código -->
      <div v-if="currentStep === 2">
        <form @submit.prevent="validateCode">
          <div class="sepElements">
            <label for="code">Código de segurança:</label>
            <input type="text" v-model="code" id="code" placeholder="Digite o código recebido" required />
            <div class="button-container">
              <button class="btn-destructive" href="./login" @click="back">Cancelar</button>
              <button type="submit" class="btn">Validar Código</button>
            </div>  
          </div>
        </form>
      </div>

      <!-- Etapa 3: Redefinir senha -->
      <div v-if="currentStep === 3">
        <form @submit.prevent="resetPassword">
          <div class="sepElements">
            <label for="newPassword">Nova senha:</label>
            <input type="password" v-model="newPassword" id="newPassword" placeholder="Digite sua nova senha" required />
            <label for="confirmPassword">Confirme a nova senha:</label>
            <input type="password" v-model="confirmPassword" id="confirmPassword" placeholder="Confirme sua nova senha" required />
            <div class="button-container">
              <button class="btn-destructive" href="./login" @click="back">Cancelar</button>
              <button type="submit" class="btn">Redefinir Senha</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    };
  },
  methods: {
    async sendEmail() {
      // Simula o envio do e-mail via API
      try {
        // Exemplo de chamada de API
        // await axios.post('/api/send-reset-email', { email: this.email });
        alert("Email enviado com sucesso!");
        this.currentStep = 2;
      } catch (error) {
        alert("Erro ao enviar e-mail!");
      }
    },
    async validateCode() {
      // Simula a validação do código via API
      try {
        // Exemplo de chamada de API
        // const response = await axios.post('/api/validate-code', { email: this.email, code: this.code });
        if (this.code === "123456") { // Código de teste
          alert("Código validado com sucesso!");
          this.currentStep = 3;
        } else {
          alert("Código inválido!");
        }
      } catch (error) {
        alert("Erro ao validar o código!");
      }
    },
    async resetPassword() {
      // Simula a redefinição de senha via API
      if (this.newPassword !== this.confirmPassword) {
        alert("As senhas não coincidem!");
        return;
      }

      try {
        // Exemplo de chamada de API
        // await axios.post('/api/reset-password', { email: this.email, password: this.newPassword });
        alert("Senha redefinida com sucesso!");
        this.currentStep = 1; // Volta à etapa inicial ou redireciona para o login
      } catch (error) {
        alert("Erro ao redefinir a senha!");
      }
    },
    back() {
      this.$globalFunc.hrefTo('/login');
    },
  },
};
</script>

<style scoped>
    @import url('/src/assets/css/modules/loginForm.css');
</style>
  