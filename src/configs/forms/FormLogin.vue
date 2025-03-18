<template>
  <AppDynamicForm :config="formConfig" :errorMessage="errorMessage" />
</template>

<script>
import AppDynamicForm from '@/layouts/AppDynamicForm.vue';
import { useFormStore } from '@/stores/formStore';

export default {

  name: 'FormLogin',
  components: { AppDynamicForm },

  computed: {
    executeFunc() {
      return useFormStore().getRequestedFunction();
    }
  },

  data() {
    return {
      errorMessage: '',
      formConfig: {
        title: 'Acesse sua Conta',
        steps: {
          1: {
            fields: [
              {
                type: 'email',
                model: 'email',
                label: 'E-mail',
                placeholder: 'Digite seu e-mail',
                required: true,
              },
            ],
            buttons: [
              {
                position: 'left',
                text: 'Criar conta',
                class: 'symbolic no-padding normal no-scalling',
                id: 'createAnAccountButton',
                type: '',
                action: {
                  name: 'redirect',
                  value: 'Signup',
                  type: 'local',
                },
              },
              {
                text: '',
                class: 'symbolic no-padding',
                id: 'googleButton',
                type: '',
                action: {
                  name: 'handleGoogleLogin'
                }
              },
              {
                text: 'Avançar',
                class: 'confirm',
                id: 'loginButton',
                type: '',
                action: {
                  name: 'forward',
                  type: 'local',
                }
              },
            ],
          },
          2: {
            fields: [
              {
                type: 'password',
                model: 'password',
                label: 'Senha',
                placeholder: 'Digite sua senha',
                required: true,
                anchor: {
                  text: 'Esqueci minha senha',
                  class: 'critical',
                  model: 'forgotPassword',
                  action: {
                    event: 'redirect',
                    value: 'PasswordRescue',
                    type: 'local',
                  },
                }
              },
            ],
            buttons: [
              {
                text: 'Voltar',
                class: '',
                id: '',
                type: 'submit',
                action: {
                  name: 'rewind',
                  type: 'local',
                }
              },
              {
                text: 'Entrar',
                class: 'confirm',
                id: 'loginButton',
                type: 'submit',
                action: {
                  name: 'handleLogin',
                }
              }
            ],
          }
        },
      }
    }
  },

  methods: {
    async handleGoogleLogin(response) {
      try {
        const decodedToken = jwt_decode(response.credential);
        const email = decodedToken.email;
        const res = await fetch(this.$globalFunc.getApiUrl('database', 'getLogin'), {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'google', email }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro desconhecido');
        this.redirect('Home');

      } catch (error) {
        console.error("Erro: ", error.message);
        this.errorMessage = error.message;
      }
    },

    async handleLogin() {
      this.errorMessage = '';
      const formData = useFormStore().formData;
      console.log('handleLogin chamado! data: ', formData);

      try {
        const res = await fetch(this.$globalFunc.getApiUrl('database', 'getLogin'), {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'default',
            email: formData.email,
            password: formData.password,
          }),
        });

        // Verifica se a resposta é JSON antes de tentar parseá-la
        let data = null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          throw new Error("Resposta inválida do servidor.");
        }

        if (!res.ok) throw new Error(data?.message || 'Erro desconhecido');

        this.$router.push('Home');

      } catch (error) {
        console.error("Erro interno: ", error);
        this.errorMessage = error.message || "Erro interno.";
      }
    }
  },

  watch: {
    executeFunc(newFuncName) {
      if (typeof newFuncName === 'string' && typeof this[newFuncName] === 'function' && newFuncName != null) {
        this[newFuncName]();
        useFormStore().clearRequestedFunction();
      } else {
        console.warn(`executeFunc ${newFuncName} não é uma função válida.`);
      }
    }
  },


  mounted() {

    // useFormStore().setCurrentStep(1);

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
}
</script>
