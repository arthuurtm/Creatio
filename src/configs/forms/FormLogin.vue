<template>
  <AppDynamicForm :config="formConfig" :errorMessage="errorMessage" :formFunctions="functions" />
</template>

<script setup>
import AppDynamicForm from '@/layouts/AppDynamicForm.vue'
import { useFormStore } from '@/stores/formStore'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as gfunctions from '@/functions/functions'

const formStore = useFormStore()
const formData = computed(() => formStore.formData)
const errorMessage = ref('')
const router = useRouter()

// Configurações do formulário
const formConfig = {
  title: 'Acesse sua Conta',
  steps: {
    1: {
      fields: [
        {
          type: 'text',
          name: 'identification',
          model: 'identification',
          label: 'Usuário ou e-mail',
          placeholder: 'Digite seu nome de usuário ou e-mail',
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
            name: 'handleGoogleLogin',
          },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          id: 'loginButton',
          type: '',
          action: {
            name: 'forward',
            type: 'local',
          },
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
          },
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
          },
        },
        {
          text: 'Entrar',
          class: 'confirm',
          id: 'loginButton',
          type: 'submit',
          action: {
            name: 'handleLogin',
          },
        },
      ],
    },
  },
}

// Funções do formulário
const functions = {
  handleGoogleLogin: async (response) => {
    try {
      await gfunctions.post(
        {
          type: 'database',
          route: 'setLogin',
        },
        {
          type: 'google',
          identification: response.credential,
        },
      )

      router.push({ name: 'Home' })
    } catch (error) {
      console.error('Erro: ', error.message)
      errorMessage.value = error.message
    }
  },

  handleLogin: async () => {
    errorMessage.value = ''

    try {
      await gfunctions.post(
        {
          type: 'database',
          route: 'setLogin',
        },
        {
          type: 'default',
          identification: formData.value.identification,
          password: formData.value.password,
        },
      )

      router.push({ name: 'Home' })
    } catch (error) {
      console.error('Erro interno: ', error)
      errorMessage.value = error.message
    }
  },
}

onMounted(() => {
  google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GCLIENT_LOGIN_ID,
    callback: functions.handleGoogleLogin,
    context: 'signin',
    ux_mode: 'popup',
    auto_prompt: false,
  })

  google.accounts.id.renderButton(document.getElementById('googleButton'), {
    size: 'large',
    type: 'icon',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'left',
  })

  google.accounts.id.prompt()
})
</script>
