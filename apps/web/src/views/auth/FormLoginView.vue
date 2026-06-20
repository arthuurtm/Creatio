<template>
  <AppFormPage title="Fazer login" subTitle="Acesse sua conta Creatio" :currentStep="currentStep" :totalSteps="2">
    <template #form>
      <div v-if="currentStep === 1" class="d-flex flex-column w-100 ga-4">
        <v-text-field label="Usuário ou e-mail"
          v-model="formData.login.val" :error="formData.login.err" :error-messages="formData.login.errVal"
          variant="outlined" hide-details="auto" rounded="pill" />
      </div>
      <div v-else-if="currentStep === 2" class="d-flex flex-column w-100 ga-2">
        <v-password-field label="Senha" aria-required="true"
          v-model="formData.password.val" :error="formData.password.err" :error-messages="formData.password.errVal"
          variant="outlined" hide-details="auto" rounded="pill" />
        <v-btn variant="text" text="Esqueceu sua senha?" size="small" class="text-none text-primary px-0 align-self-end font-weight-medium" @click="$router.push({ name: 'PasswordRescue' })" />
      </div>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <v-btn text="Avançar" color="primary" variant="flat" block class="text-none rounded-pill" type="submit" autofocus @click="nextStep()" />
      </template>
      <template v-else-if="currentStep === 2">
        <div class="d-flex flex-column ga-2 w-100">
          <v-btn text="Entrar" color="primary" variant="flat" block class="text-none rounded-pill" type="submit" autofocus @click="loaderController(handleLogin)" :loading="loading" />
          <v-btn variant="text" text="Voltar" class="text-none rounded-pill text-medium-emphasis" block @click="prevStep()" />
        </div>
      </template>
    </template>

    <template #formInfo>
      <span class="text-body-2 text-medium-emphasis">
        Novo por aqui?
        <a href="#" class="text-primary font-weight-bold ml-1 text-decoration-none" @click.prevent="$router.push({ name: 'Signup' })">
          Criar conta
        </a>
      </span>
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/functions/http'
import { default as stepForm, type FieldParams, initField } from "@/functions/form"

const { currentStep, nextStep, prevStep, pageRedirect, setFieldError, loading, loaderController } = stepForm({ totalSteps: 2 })

interface Params {
  login: FieldParams,
  password: FieldParams
}

// Dados do formulário
const formData = ref<Params>({ login: initField(), password: initField() })
const route = useRoute()
const redirect = route.query.redirect || ''

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
</script>
