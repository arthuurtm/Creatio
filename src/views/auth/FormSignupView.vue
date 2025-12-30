<template>
  <AppFormPage :title="'Crie sua conta'" :currentStep="currentStep" :loading="loading">

    <template #form>
      <template v-if="currentStep === 1">
        <v-text-field label="Nome de Exibição" placeholder="Um nome criativo" v-model="formData.nickname"
          variant="outlined" />
        <v-text-field label="Nome de Usuário" placeholder="Seu nome de usuário" v-model="formData.username"
          variant="outlined" />
      </template>

      <template v-if="currentStep === 2">
        <v-text-field type="email" label="Seu e-mail" placeholder="Seu e-mail" v-model="formData.email"
          variant="outlined" />
        <v-text-field type="date" label="Data de nascimento" v-model="formData.birthdate" variant="outlined" />
      </template>

      <template v-if="currentStep === 3">
        <v-text-field label="Código de verificação" placeholder="Código recebido no e-mail"
          v-model="formData.verifyCode" variant="outlined" />
      </template>

      <template v-if="currentStep === 4">
        <v-password-field id="passwd1" label="Sua senha" placeholder="Digite uma senha BEM segura!"
          v-model="formData.passwd1" variant="outlined" />
        <v-password-field id="passwd2" type="password" label="Confirme sua senha" placeholder="Re-digite sua senha!"
          v-model="formData.passwd2" variant="outlined" />
      </template>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <v-btn :text="formData.username ? 'Cancelar' : 'Voltar'" :color="formData.username ? 'error' : 'secondary'"
          :variant="formData.username ? 'flat' : 'outlined'" @click="pageRedirect({ name: 'Login' })" />
        <v-btn text="Avançar" color="primary" @click="loaderController(verifyIfUserExists)" />
      </template>

      <template v-if="currentStep === 2">
        <v-btn text="Voltar" variant="outlined" @click="prevStep()" />
        <v-btn text="Avançar" color="primary" @click="loaderController(prepareVerifyCode)" />
      </template>

      <template v-if="currentStep === 3">
        <v-btn text="Voltar" variant="outlined" @click="prevStep()" />
        <v-btn text="Avançar" color="primary" @click="loaderController(verifySecureCode)" />
      </template>

      <template v-if="currentStep === 4">
        <v-btn text="Voltar" variant="outlined" @click="prevStep()" />
        <v-btn text="Cadastrar" color="primary" @click="loaderController(signupUser)" />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { computed, watch, ref } from 'vue'
import { http, form as stepForm } from '@/functions'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'
import CGroup from '#src/components/ui/CGroup.vue'

const formData = ref({
  nickname: '',
  username: '',
  email: '',
  birthdate: '',
  passwd1: '',
  passwd2: '',
  verifyCode: '',
  accessUUID: '',
})
const nicknameValue = computed(() => formData.value.nickname)
const router = useRouter()

const { currentStep, nextStep, prevStep, pageRedirect, loading, loaderController } = stepForm({
  totalSteps: 4,
})
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
    await http.get({
      type: 'database',
      route: 'getUserBasics',
      querys: { identification: formData.value.username },
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
      await http.post(
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

const signupUser = async () => {
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
        route: 'setUser',
      },
      {
        nickname: formData.value.nickname,
        username: formData.value.username,
        email: formData.value.email,
        birthdate: formData.value.birthdate,
        password: formData.value.passwd1,
        accessUUID: formData.value.accessUUID,
      },
    )

    showToast({
      type: 'success',
      message: 'Conta criada com sucesso! Aguarde um momento...',
    })

    await http.post(
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
