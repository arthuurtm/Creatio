<template>
  <AppFormPage :title="'Alterar senha'" :currentStep="currentStep" ref="form">
    <template #fields>
      <template v-if="currentStep === 1">
        <CreateTextField :fields="[
          {
            type: 'text',
            name: 'email',
            model: 'email',
            label: 'E-mail',
            placeholder: 'Digite seu e-mail',
            required: true,
          },
        ]" v-model="formData" />
      </template>
      <template v-if="currentStep === 2">
        <CreateTextField :fields="[
          {
            type: 'text',
            name: 'verifyCode',
            model: 'verifyCode',
            label: 'Código de verificação',
            placeholder: 'Código de verificação recebido no seu e-mail',
            required: true,
          },
        ]" v-model="formData" />
      </template>
      <template v-if="currentStep === 3">
        <CreateTextField :fields="[
          {
            type: 'password',
            name: 'password',
            model: 'passwd1',
            id: 'psswd1',
            label: 'Sua senha',
            placeholder: 'Digite uma senha BEM segura!',
            required: true,
          },
          {
            type: 'password',
            name: 'passwordConfirm',
            model: 'passwd2',
            id: 'psswd2',
            label: 'Confirme sua senha',
            placeholder: 'Re-digite sua senha!',
            required: true,
          },
        ]" v-model="formData" />
      </template>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <CreateButton :buttons="[
          {
            text: 'Cancelar',
            class: '',
            type: 'button',
            action: () => pageRedirect('Login'),
          },
          {
            text: 'Avançar',
            class: 'confirm',
            type: 'submit',
            action: () => prepareVerifyCode(),
          },
        ]" />
      </template>
      <template v-if="currentStep === 2">
        <CreateButton :buttons="[
          {
            text: 'Voltar',
            class: '',
            type: 'button',
            action: () => prevStep(),
          },
          {
            text: 'Avançar',
            class: 'confirm',
            type: 'submit',
            action: () => verifySecureCode(),
          },
        ]" />
      </template>
      <template v-if="currentStep === 3">
        <CreateButton :buttons="[
          {
            text: 'Voltar',
            class: '',
            type: 'button',
            action: () => prevStep(),
          },
          {
            text: 'Confirmar',
            class: 'confirm',
            type: 'submit',
            action: () => resetPassword(),
          },
        ]" />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup>
import AppFormPage from '@/layouts/AppFormPage.vue'
import { ref } from 'vue'
import { post, get } from '@/functions'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'
import { useMultiStepForm } from '@/functions/form'

const formData = ref({})
const router = useRouter()
const form = ref({})
const { currentStep, nextStep, prevStep, pageRedirect } = useMultiStepForm({ totalSteps: 3 })
const sentCode = ref(false)


const prepareVerifyCode = async () => {
  if (!sentCode.value) {
    try {
      await get(
        {
          type: 'database', route: 'getUserBasics', querys: { identification: formData.value.email }
        }
      )
      await post(
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
    const { sessionUUID } = await post(
      {
        type: 'database',
        route: 'validateSecureSession',
      },
      {
        secureToken: formData.value.verifyCode,
        tokenId: formData.value.email
      },
    )
    formData.value.sessionUUID = sessionUUID
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

    await post(
      {
        type: 'database',
        route: 'setUserPassword',
      },
      {
        newPassword: formData.value.passwd1,
        sessionUUID: formData.value.sessionUUID
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
