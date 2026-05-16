<template>
  <AppFormPage title="Crie sua conta" :currentStep="currentStep" :loading="loading">

    <template #form>
      <v-container v-if="currentStep === 1" class="ga-2">
        <v-text-field label="Nome de Exibição" placeholder="Um nome criativo" v-model="formData.nickname.val"
          :error="formData.nickname.err" :error-messages="formData.nickname.errVal" variant="outlined"
          @input="formData.nickname.err = false; formData.nickname.errVal = ''" />
        <v-text-field label="Nome de Usuário" placeholder="Seu nome de usuário" v-model="formData.username.val"
          :error="formData.username.err" :error-messages="formData.username.errVal" variant="outlined"
          @input="formData.username.err = false; formData.username.errVal = ''" />
      </v-container>

      <v-container v-if="currentStep === 2">
        <v-text-field type="email" label="Seu e-mail" placeholder="Seu e-mail" v-model="formData.email.val"
          :error="formData.email.err" :error-messages="formData.email.errVal" variant="outlined"
          @input="formData.email.err = false; formData.email.errVal = ''" />
      </v-container>

      <v-container v-if="currentStep === 3">
        <v-text-field label="Código de verificação" placeholder="Código recebido no e-mail"
          v-model="formData.verifyCode.val" :error="formData.verifyCode.err"
          :error-messages="formData.verifyCode.errVal" variant="outlined"
          @input="formData.verifyCode.err = false; formData.verifyCode.errVal = ''" />
      </v-container>

      <v-container v-if="currentStep === 4">
        <v-text-field type="password" label="Sua senha" placeholder="Digite uma senha BEM segura!"
          v-model="formData.passwd1.val" :error="formData.passwd1.err" :error-messages="formData.passwd1.errVal"
          variant="outlined" @input="formData.passwd1.err = false; formData.passwd1.errVal = ''" />
        <v-text-field type="password" label="Confirme sua senha" placeholder="Re-digite sua senha!"
          v-model="formData.passwd2.val" :error="formData.passwd2.err" :error-messages="formData.passwd2.errVal"
          variant="outlined" @input="formData.passwd2.err = false; formData.passwd2.errVal = ''" />
      </v-container>
    </template>

    <template #buttons>
      <v-btn :text="formData.username.val ? 'Cancelar' : 'Voltar'"
        :color="formData.username.val ? 'error' : 'secondary'" :variant="formData.username.val ? 'flat' : 'outlined'"
        @click="pageRedirect({ name: 'Login' })" />
      <v-btn text="Avançar" variant="elevated" @click="stepActions[currentStep]?.next()" />
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { computed, watch, ref } from 'vue'
import http from '@/functions/http'
import { default as stepForm, type FieldParams, initField } from '@/functions/form'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'

interface Params {
  nickname: FieldParams,
  username: FieldParams,
  email: FieldParams,
  passwd1: FieldParams,
  passwd2: FieldParams,
  verifyCode: FieldParams,
  accessUUID: string,
}
interface FormButtonActions {
  next: () => Promise<void>,
  back: () => void,
}
interface StepActions {
  [key: number]: FormButtonActions,
}

const formData = ref<Params>({
  nickname: initField(),
  username: initField(),
  email: initField(),
  passwd1: initField(),
  passwd2: initField(),
  verifyCode: initField(),
  accessUUID: '',
})

const nicknameValue = computed(() => formData.value.nickname.val)
const router = useRouter()

const { currentStep, nextStep, prevStep, pageRedirect, loading, loaderController, setFieldError } = stepForm({
  totalSteps: 4,
})
const sentCode = ref(false)
let sameMail = ''

watch(nicknameValue, (newNickname) => {
  if (newNickname !== undefined) {
    formData.value.username.val = newNickname
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
      querys: { login: formData.value.username.val },
    })
    setFieldError(formData.value.username, "Este nome de usuário já está sendo utilizado")
  } catch (err) {
    if (err?.status === 404) {
      nextStep()
    } else {
      setFieldError(formData.value.username, err.message)
    }
  }
}

const prepareVerifyCode = async () => {
  if (!sentCode.value && !(formData.value.email.val === sameMail)) {
    try {
      await http.post(
        {
          type: 'database',
          route: 'setSignupCode',
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
    setFieldError(formData.value.verifyCode, err.message)
  }
}

const signupUser = async () => {
  try {
    if (formData.value.passwd1.val !== formData.value.passwd2.val) {
      setFieldError(formData.value.passwd2, 'As senhas não coincidem!')
      return
    }

    await http.post(
      {
        type: 'database',
        route: 'setUser',
      },
      {
        nickname: formData.value.nickname.val,
        username: formData.value.username.val,
        email: formData.value.email.val,
        password: formData.value.passwd1.val,
        accessUUID: formData.value.accessUUID,
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

const stepActions: StepActions = {
  1: { next: verifyIfUserExists, back: () => pageRedirect({ name: 'Login' }) },
  2: { next: prepareVerifyCode, back: prevStep },
  3: { next: verifySecureCode, back: prevStep },
  4: { next: signupUser, back: prevStep },
}
</script>
