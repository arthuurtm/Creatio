<template>
  <AppFormPage title="Alterar senha" :currentStep="currentStep" :loading="loading">

    <template #form>
      <v-container v-if="currentStep === 1">
        <v-text-field label="E-mail" placeholder="Digite seu e-mail" aria-required="true" v-model="formData.email.val"
          :error="formData.email.err" :error-messages="formData.email.errVal" variant="outlined" />
      </v-container>

      <v-container v-if="currentStep === 2">
        <v-text-field label="Código de verificação" placeholder="Código de verificação recebido no seu e-mail"
          aria-required="true" v-model="formData.verifyCode.val" :error="formData.verifyCode.err"
          :error-messages="formData.verifyCode.errVal" variant="outlined" />
      </v-container>

      <v-container v-if="currentStep === 3">
        <v-text-field id="psswd1" label="Sua senha" placeholder="Digite uma senha BEM segura!" type="password"
          aria-required="true" v-model="formData.passwd1.val" :error="formData.passwd1.err"
          :error-messages="formData.passwd1.errVal" variant="outlined" />
        <v-text-field id="psswd2" label="Confirme sua senha" placeholder="Re-digite sua senha!" type="password"
          aria-required="true" v-model="formData.passwd2.val" :error="formData.passwd2.err"
          :error-messages="formData.passwd2.errVal" variant="outlined" />
      </v-container>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <v-btn text="Cancelar" variant="outlined" @click="() => router.back()" />
        <v-btn text="Avançar" color="primary" @click="() => loaderController(prepareVerifyCode)" />
      </template>

      <template v-if="currentStep === 2">
        <v-btn text="Voltar" variant="outlined" @click="() => prevStep()" />
        <v-btn text="Avançar" color="primary" @click="() => loaderController(verifySecureCode)" />
      </template>

      <template v-if="currentStep === 3">
        <v-btn text="Voltar" variant="outlined" @click="() => prevStep()" />
        <v-btn text="Confirmar" color="primary" @click="() => loaderController(resetPassword)" />
      </template>
    </template>

  </AppFormPage>
</template>

<script setup lang="ts">
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { ref } from 'vue'
import http from '@/functions/http'
import { default as stepForm, type FieldParams, initField } from '@/functions/form'
import { useRouter } from 'vue-router'

interface Params {
  email: FieldParams,
  verifyCode: FieldParams,
  passwd1: FieldParams,
  passwd2: FieldParams,
  accessUUID: string,
}

const formData = ref<Params>({
  email: initField(),
  verifyCode: initField(),
  passwd1: initField(),
  passwd2: initField(),
  accessUUID: '',
})
const router = useRouter()
const { currentStep, nextStep, prevStep, loading, loaderController, setFieldError } = stepForm({
  totalSteps: 3,
})
const sentCode = ref(false)
let sameMail = ''

const prepareVerifyCode = async () => {
  if (!sentCode.value && !(formData.value.email.val === sameMail)) {
    try {
      await http.get({
        type: 'database',
        route: 'getUserBasics',
        querys: { login: formData.value.email.val },
      })
      await http.post(
        {
          type: 'database',
          route: 'setResetPassCode',
        },
        {
          email: formData.value.email.val,
        },
      )

      sameMail = formData.value.email.val
      sentCode.value = true
      nextStep()
    } catch (error) {
      setFieldError(formData.value.email, error.message)
    }
  } else {
    nextStep()
  }
}

const verifySecureCode = async () => {
  try {
    const { accessUUID } = await http.post(
      {
        type: 'database',
        route: 'validateSecureSession',
      },
      {
        secureToken: formData.value.verifyCode.val,
        tokenId: formData.value.email.val,
      },
    )
    formData.value.accessUUID = accessUUID
    nextStep()
  } catch (err) {
    setFieldError(formData.value.verifyCode, error.message)
  }
}

const resetPassword = async () => {
  try {
    if (formData.value.passwd1.val !== formData.value.passwd2.val) {
      setFieldError(formData.value.passwd2, "As senhas não coincidem!")
    }

    await http.post(
      {
        type: 'database',
        route: 'setUserPassword',
      },
      {
        newPassword: formData.value.passwd2.val,
        accessUUID: formData.value.accessUUID,
      },
    )
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 2000)
  } catch (error) {
    setFieldError(formData.value.passwd1, String(error) ?? "Erro ao redefinir senha")
  }
}
</script>
