<template>
  <AppFormPage :title="'Crie sua conta'" :currentStep="currentStep" :loading="loading" ref="form">
    <template #form>
      <template v-if="currentStep === 1">
        <CInputText
          model="nickname"
          label="Nome de Exibição"
          placeholder="Um nome criativo"
          v-model="formData"
        />
        <CInputText
          model="username"
          label="Nome de Usuário"
          placeholder="Seu nome de usuário"
          aria-required="true"
          v-model="formData"
        />
      </template>

      <template v-if="currentStep === 2">
        <CInputText
          type="email"
          model="email"
          label="Seu e-mail"
          placeholder="Seu e-mail"
          aria-required="true"
          v-model="formData"
        />
        <CInputText
          type="date"
          model="birthdate"
          label="Data de nascimento"
          aria-required="true"
          class="date"
          v-model="formData"
        />
      </template>

      <template v-if="currentStep === 3">
        <CInputText
          model="verifyCode"
          label="Código de verificação"
          placeholder="Código de verificação recebido no seu e-mail"
          aria-required="true"
          v-model="formData"
        />
      </template>

      <template v-if="currentStep === 4">
        <CInputPassword
          model="passwd1"
          id="passwd1"
          label="Sua senha"
          placeholder="Digite uma senha BEM segura!"
          aria-required="true"
          v-model="formData"
        />
        <CInputPassword
          model="passwd2"
          id="passwd2"
          label="Confirme sua senha"
          placeholder="Re-digite sua senha!"
          aria-required="true"
          v-model="formData"
        />
      </template>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <CButton text="Cancelar" @click="() => pageRedirect({ name: 'Login' })" />
        <CButton
          text="Avançar"
          class="confirm"
          @click="() => loaderController(verifyIfUserExists)"
        />
      </template>

      <template v-if="currentStep === 2">
        <CButton text="Voltar" @click="() => prevStep()" />
        <CButton
          text="Avançar"
          class="confirm"
          @click="() => loaderController(prepareVerifyCode)"
        />
      </template>

      <template v-if="currentStep === 3">
        <CButton text="Voltar" @click="() => prevStep()" />
        <CButton text="Avançar" class="confirm" @click="() => loaderController(verifySecureCode)" />
      </template>

      <template v-if="currentStep === 4">
        <CButton text="Voltar" @click="() => prevStep()" />
        <CButton text="Cadastrar" class="confirm" @click="() => loaderController(signupUser)" />
      </template>
    </template>
  </AppFormPage>
</template>

<script setup>
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { computed, watch, ref } from 'vue'
import { http, form as stepForm } from '@/functions'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'

const formData = ref({})
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
    const { sessionUUID } = await http.post(
      {
        type: 'database',
        route: 'validateSecureSession',
      },
      {
        secureToken: formData.value.verifyCode,
        tokenId: formData.value.email,
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
        sessionUUID: formData.value.sessionUUID,
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
