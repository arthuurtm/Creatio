<template>
  <AppFormPage title="Fazer login" subTitle="Acesse sua conta Creatio" :currentStep="currentStep">
    <template #form>
      <template v-if="currentStep === 1">
        <CInputText
          model="identification"
          label="Usuário ou e-mail"
          placeholder="Digite seu nome de usuário ou e-mail"
          aria-required="true"
          v-model="formData"
        />
      </template>

      <template v-if="currentStep === 2">
        <CAgroup :direction="'column'" :gap="'0.5rem'">
          <CInputPassword
            model="password"
            label="Senha"
            placeholder="Digite sua senha"
            aria-required="true"
            v-model="formData"
          />
          <CLink text="Esqueci minha senha" @click="$router.push({ name: 'PasswordRescue' })" />
        </CAgroup>
      </template>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <CButton
          style="margin-right: auto"
          text="Criar conta"
          classes="symbolic normal no-scalling"
          id="createAnAccountButton"
          @click="pageRedirect({ name: 'Signup' })"
        />
        <!-- <CButton id="googleButton" classes="symbolic no-padding" /> -->
        <CButton text="Avançar" classes="confirm" id="loginButton" autofocus @click="nextStep()" />
      </template>

      <template v-if="currentStep === 2">
        <CButton text="Voltar" @click="prevStep()" />
        <CButton
          text="Entrar"
          class="confirm"
          id="loginButton"
          type="submit"
          autofocus
          @click="() => handleLogin()"
        />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup>
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { http, form as stepForm } from '@/functions'
import { showToast } from '@/plugins/toast'
const { currentStep, nextStep, prevStep, pageRedirect } = stepForm({ totalSteps: 2 })

// Dados do formulário
const formData = ref({})
const route = useRoute()
const redirect = route.query.redirect || false

// Funções do formulário
const handleGoogleLogin = async (response = {}) => {
  try {
    await http.post(
      {
        type: 'database',
        route: 'setLogin',
      },
      {
        type: 'google',
        identification: response.credential,
      },
    )

    const query = redirect ? { path: redirect } : { name: 'Home' }
    pageRedirect(query)
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

    await http.post(
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

    const query = redirect ? { path: redirect } : { name: 'Home' }
    pageRedirect(query)
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
