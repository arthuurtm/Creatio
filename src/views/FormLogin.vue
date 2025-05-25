<template>
  <ComponentForm :config="formConfig" :isLoading="isLoading" :formFunctions="functions" />
</template>

<script setup>
import ComponentForm from '@/components/ComponentForm.vue'
import { onMounted, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as gfunctions from '@/functions/functions'
import { showToast } from '@/plugins/toast'

// Stores e router
const store = inject('stores')
const formData = store.form.getInputData
const router = useRouter()
const isLoading = ref(false)

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
          action: {
            name: 'redirect',
            value: 'Signup',
            type: 'local',
          },
        },
        {
          class: 'symbolic no-padding',
          id: 'googleButton',
          action: {
            name: 'handleGoogleLogin',
          },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          id: 'loginButton',
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
      showToast({
        type: 'error',
        message: error.message,
      })
    }
  },

  handleLogin: async () => {
    try {
      isLoading.value = true
      if (formData.identification === '' || formData.identification === undefined) {
        showToast({
          type: 'warning',
          message: 'Digite um nome de usuário ou e-mail!',
          timeout: 2000,
        })
        return
      }

      if (formData.password === '' || formData.password === undefined) {
        showToast({
          type: 'warning',
          message: 'Digite uma senha!',
          timeout: 2000,
        })
        return
      }

      await gfunctions.post(
        {
          type: 'database',
          route: 'setLogin',
        },
        {
          type: 'traditional',
          identification: formData.identification,
          password: formData.password,
        },
      )

      router.push({ name: 'Home' })
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message,
      })
    } finally {
      isLoading.value = false
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
