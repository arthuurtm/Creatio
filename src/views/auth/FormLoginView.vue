<template>
  <AppFormPage title="Fazer login" subTitle="Acesse sua conta Creatio" :currentStep="currentStep">
    <template #form>
      <v-container v-if="currentStep === 1">
        <v-text-field label="Usuário ou e-mail" placeholder="Digite seu nome de usuário ou e-mail"
          v-model="formData.login.val" :error="formData.login.err" :error-messages="formData.login.errVal"
          variant="outlined" />
        <v-password-field label="Senha" placeholder="Digite sua senha" aria-required="true"
          v-model="formData.password.val" :error="formData.password.err" :error-messages="formData.password.errVal"
          variant="outlined" />
        <v-btn variant="text" text="Esqueceu sua senha?" @click="$router.push({ name: 'PasswordRescue' })" />
      </v-container>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <v-btn variant="text" text="Criar conta" @click="pageRedirect({ name: 'Signup' })" />
        <v-btn text="Entrar" color="primary" variant="flat" type="submit" autofocus @click="() => handleLogin()" />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/functions/http'
import { default as stepForm, type FieldParams, initField } from "@/functions/form"
import { showToast } from '@/plugins/toast'
const { currentStep, nextStep, prevStep, pageRedirect, setFieldError } = stepForm({ totalSteps: 2 })

interface Params {
  login: FieldParams,
  password: FieldParams
}

// Dados do formulário
const formData = ref<Params>({ login: initField(), password: initField() })
const route = useRoute()
const redirect = route.query.redirect || ''

// Funções do formulário
// const handleGoogleLogin = async (response = {}) => {
//   try {
//     await http.post(
//       {
//         type: 'database',
//         route: 'setLogin',
//       },
//       {
//         type: 'google',
//         identification: response.credential,
//       },
//     )

//     const query = redirect ? { path: redirect } : { name: 'Home' }
//     pageRedirect(query)
//   } catch (error) {
//     console.error('Erro: ', error.message)
//     showToast({
//       type: 'error',
//       message: error.message,
//     })
//   }
// }

const handleLogin = async () => {
  try {
    if (formData.value.login.val === '') {
      prevStep()
      setFieldError(formData.value.login, "Informe um usuário")
      return
    }

    if (formData.value.password.val === '') {
      setFieldError(formData.value.password, 'Informe uma senha')
      return
    }

    await http.post(
      {
        type: 'database',
        route: 'setLogin',
      },
      {
        type: 'traditional',
        login: formData.value.login.val,
        password: formData.value.password.val,
      },
    )

    const query = redirect ? { path: redirect } : { name: 'Home' }
    pageRedirect(query)
  } catch (error) {
    setFieldError(formData.value.password, "Usuário ou senha incorretos.")
    console.log(formData.value)
  }
}

// onMounted(async () => {
//   google.accounts.id.initialize({
//     client_id: import.meta.env.VITE_GCLIENT_LOGIN_ID,
//     callback: handleGoogleLogin,
//     context: 'signin',
//     ux_mode: 'popup',
//     auto_prompt: false,
//   })

//   google.accounts.id.renderButton(document.getElementById('googleButton'), {
//     size: 'large',
//     type: 'icon',
//     shape: 'pill',
//     text: 'continue_with',
//     logo_alignment: 'left',
//   })

//   google.accounts.id.prompt()
// })
</script>
