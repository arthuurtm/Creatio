<template>
  <AppFormPage :title="'Crie sua conta'" :currentStep="currentStep">
    <template #fields>
      <template v-if="currentStep === 1">
        <CreateTextField :fields="[
          {
            type: 'text',
            name: 'nickname',
            model: 'nickname',
            label: 'Nome de Exibição',
            placeholder: 'Um nome criativo',
          },
          {
            type: 'text',
            name: 'username',
            model: 'username',
            label: 'Nome de Usuário',
            placeholder: 'Seu nome de usuário',
            required: true,
          },
        ]" v-model="formData" />
      </template>
      <template v-if="currentStep === 2">
        <CreateTextField :fields="[
          {
            type: 'email',
            model: 'email',
            label: 'Seu e-mail',
            placeholder: 'Seu e-mail',
            required: true,
          },
          {
            type: 'date',
            name: 'birthdate',
            model: 'birthdate',
            label: 'Data de nascimento',
            placeholder: '',
            required: true,
            class: 'date',
          },
        ]" v-model="formData" />
      </template>
      <template v-if="currentStep === 3">
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
      <template v-if="currentStep === 4">
        <CreateTextField :fields="[
          {
            type: 'password',
            name: 'password',
            model: 'passwd1',
            id: 'passwd1',
            label: 'Sua senha',
            placeholder: 'Digite uma senha BEM segura!',
            required: true,
          },
          {
            type: 'password',
            name: 'passwordConfirm',
            model: 'passwd2',
            id: 'passwd2',
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
            class: 'left symbolic critical no-padding no-scalling',
            type: 'button',
            action: () => pageRedirect('Login'),
          },
          {
            text: 'Avançar',
            class: 'confirm',
            type: 'submit',
            action: () => verifyIfUserExists(),
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
            action: () => prepareVerifyCode(),
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
            text: 'Avançar',
            class: 'confirm',
            type: 'submit',
            action: () => verifySecureCode(),
          },
        ]" />
      </template>
      <template v-if="currentStep === 4">
        <CreateButton :buttons="[
          {
            text: 'Voltar',
            class: '',
            type: 'button',
            action: () => prevStep(),
          },
          {
            text: 'Cadastrar',
            class: 'confirm',
            type: 'submit',
            action: () => signupUser(),
          },
        ]" />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup>
import AppFormPage from '@/layouts/AppFormPage.vue'
import { computed, watch, ref } from 'vue'
import { post, get } from '@/functions'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'
import { useMultiStepForm } from '@/functions/form'

const formData = ref({})
const nicknameValue = computed(() => formData.value.nickname)
const router = useRouter()

const { currentStep, nextStep, prevStep, pageRedirect } = useMultiStepForm({ totalSteps: 4 })
const sentCode = ref(false)

watch(nicknameValue, (newNickname) => {
  if (newNickname !== undefined) {
    formData.value.username = newNickname
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, '')
      .replace(/\s+/g, '')
  }
})

const verifyIfUserExists = async () => {
  try {
    await get({
      type: 'database',
      route: 'getUserBasics',
      querys: { identification: formData.value.username }
    })
    showToast({ type: 'error', message: 'O usuário já existe' })
  } catch (err) {
    if (err?.status === 404) {
      nextStep()
    } else {
      showToast({ type: 'error', message: err.message })
    }
  }
}

const prepareVerifyCode = async () => {

  if (!sentCode.value) {
    try {
      await post(
        {
          type: 'database',
          route: 'setSignupCode',
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

const signupUser = async () => {
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
        route: 'setUser',
      },
      {
        nickname: formData.value.nickname,
        username: formData.value.username,
        email: formData.value.email,
        birthdate: formData.value.birthdate,
        password: formData.value.passwd1,
        sessionUUID: formData.value.sessionUUID
      },
    )

    showToast({
      type: 'success',
      message: 'Conta criada com sucesso! Aguarde um momento...',
    })

    await post(
      {
        type: 'database',
        route: 'setLogin',
      },
      {
        type: 'traditional',
        identification: formData.value.username,
        password: formData.value.passwd1,
      },
    )
    router.push({ name: 'Home' })
  } catch (error) {
    showToast({
      type: 'error',
      message: error.message,
    })
  }
}
</script>
