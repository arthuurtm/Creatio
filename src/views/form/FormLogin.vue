<template>
  <AppFormPage :title="'Entre em sua conta'" :currentStep="currentStep">
    <template #fields>
      <template v-if="currentStep === 1">
        <CreateTextField
          :fields="[
            {
              type: 'text',
              name: 'identification',
              model: 'identification',
              label: 'Usuário ou e-mail',
              placeholder: 'Digite seu nome de usuário ou e-mail',
              required: true,
            },
          ]"
          v-model="formData"
        />
      </template>

      <template v-if="currentStep === 2">
        <CreateTextField
          :fields="[
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
                action: () => pageRedirect('PasswordRescue'),
              },
            },
          ]"
          v-model="formData"
        />
      </template>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <CreateButton
          :buttons="[
            {
              position: 'left',
              text: 'Criar conta',
              class: 'symbolic no-padding normal no-scalling',
              id: 'createAnAccountButton',
              action: () => pageRedirect('Signup'),
            },
            {
              class: 'symbolic no-padding',
              id: 'googleButton',
              action: () => handleGoogleLogin(),
            },
            {
              text: 'Avançar',
              class: 'confirm',
              id: 'loginButton',
              action: () => nextStep(),
            },
          ]"
        />
      </template>

      <template v-if="currentStep === 2">
        <CreateButton
          :buttons="[
            {
              text: 'Voltar',
              type: 'submit',
              action: () => prevStep(),
            },
            {
              text: 'Entrar',
              class: 'confirm',
              id: 'loginButton',
              type: 'submit',
              action: () => handleLogin(),
            },
          ]"
        />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup>
import AppFormPage from '@/layouts/AppFormPage.vue'
import { useMultiStepForm } from '@/functions/form'
import { onMounted, ref } from 'vue'
import * as gfunctions from '@/functions'
import { showToast } from '@/plugins/toast'
const { currentStep, nextStep, prevStep, pageRedirect } = useMultiStepForm({ totalSteps: 2 })

// Dados do formulário
const formData = ref({})

// Funções do formulário
const handleGoogleLogin = async (response = {}) => {
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

    pageRedirect('Home')
  } catch (error) {
    console.error('Erro: ', error.message)
    showToast({
      type: 'error',
      message: error.message,
    })
  }
}

const handleLogin = async () => {
  try {
    if (formData.value.identification === '' || formData.value.identification === undefined) {
      showToast({
        type: 'warning',
        message: 'Digite um nome de usuário ou e-mail!',
      })
      return
    }

    if (formData.value.password === '' || formData.value.password === undefined) {
      showToast({
        type: 'warning',
        message: 'Digite uma senha!',
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
        identification: formData.value.identification,
        password: formData.value.password,
      },
    )

    pageRedirect('Home')
  } catch (error) {
    showToast({
      type: 'error',
      message: error.message,
    })
  }
}

onMounted(async () => {
  google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GCLIENT_LOGIN_ID,
    callback: handleGoogleLogin,
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
