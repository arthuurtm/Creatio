<template>
  <AppFormPage :title="'Alterar senha'" :currentStep="currentStep" :loading="loading" ref="form">
    <template #form>
      <template v-if="currentStep === 1">
        <CInputText label="E-mail" placeholder="Digite seu e-mail" aria-required="true" v-model="formData.email" />
      </template>
      <template v-if="currentStep === 2">
        <CInputText label="Código de verificação" placeholder="Código de verificação recebido no seu e-mail"
          aria-required="true" v-model="formData.verifyCode" />
      </template>
      <template v-if="currentStep === 3">
        <CInputPassword id="psswd1" label="Sua senha" placeholder="Digite uma senha BEM segura!" aria-required="true"
          v-model="formData.passwd1" />
        <CInputPassword id="psswd2" label="Confirme sua senha" placeholder="Re-digite sua senha!" aria-required="true"
          v-model="formData.passwd2" />
      </template>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <CButton text="Cancelar" @click="() => router.back()" />
        <CButton text="Avançar" class="confirm" @click="() => loaderController(prepareVerifyCode)" />
      </template>
      <template v-if="currentStep === 2">
        <CButton text="Voltar" @click="() => prevStep()" />
        <CButton text="Avançar" class="confirm" @click="() => loaderController(verifySecureCode)" />
      </template>
      <template v-if="currentStep === 3">
        <CButton text="Voltar" @click="() => prevStep()" />
        <CButton text="Confirmar" class="confirm" @click="() => loaderController(resetPassword)" />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup>
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { ref } from 'vue'
import { http, form as stepForm } from '@/functions'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'

const formData = ref({
  email: null,
  verifyCode: null,
  passwd1: null,
  passwd2: null,
  accessUUID: null,
})
const router = useRouter()
const form = ref({})
const { currentStep, nextStep, prevStep, loading, loaderController } = stepForm({
  totalSteps: 3,
})
const sentCode = ref(false)

const prepareVerifyCode = async () => {
  if (!sentCode.value) {
    try {
      await http.get({
        type: 'database',
        route: 'getUserBasics',
        querys: { identification: formData.value.email },
      })
      await http.post(
        {
          type: 'database',
          route: 'setResetPassCode',
        },
        {
          email: formData.value.email,
        },
      )

      sentCode.value = true
      nextStep()
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message,
      })
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
        secureToken: formData.value.verifyCode,
        tokenId: formData.value.email,
      },
    )
    formData.value.accessUUID = accessUUID
    nextStep()
  } catch (err) {
    showToast({ type: 'error', message: err.message })
  }
}

const resetPassword = async () => {
  try {
    if (formData.value.passwd1 !== formData.value.passwd2) {
      showToast({
        type: 'error',
        message: 'As senhas não coincidem.',
      })
      return
    }

    await http.post(
      {
        type: 'database',
        route: 'setUserPassword',
      },
      {
        newPassword: formData.value.passwd1,
        accessUUID: formData.value.accessUUID,
      },
    )

    showToast({
      type: 'success',
      message: 'Senha redefinida com sucesso!',
    })
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 2000)
  } catch (error) {
    showToast({
      type: 'error',
      message: error.message || 'Erro ao redefinir a senha.',
    })
  }
}
</script>
