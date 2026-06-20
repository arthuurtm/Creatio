<template>
  <AppFormPage title="Crie sua conta" :currentStep="currentStep" :totalSteps="4" :loading="loading">
    <template #form>
      <div v-if="currentStep === 1" class="d-flex flex-column ga-3 w-100">
        <v-text-field label="Nome de Exibição" v-model="formData.nickname.val"
          :error="formData.nickname.err" :error-messages="formData.nickname.errVal" variant="outlined"
          hide-details="auto" rounded="pill" @input="formData.nickname.err = false; formData.nickname.errVal = ''" />
        <v-text-field label="Nome de Usuário" v-model="formData.username.val"
          :error="formData.username.err" :error-messages="formData.username.errVal" variant="outlined"
          hide-details="auto" rounded="pill" @input="formData.username.err = false; formData.username.errVal = ''" />
      </div>

      <div v-if="currentStep === 2" class="d-flex flex-column ga-3 w-100">
        <v-text-field type="email" label="Seu e-mail" v-model="formData.email.val"
          :error="formData.email.err" :error-messages="formData.email.errVal" variant="outlined"
          hide-details="auto" rounded="pill" @input="formData.email.err = false; formData.email.errVal = ''" />
      </div>

      <div v-if="currentStep === 3" class="d-flex flex-column ga-3 w-100">
        <v-text-field label="Código de verificação"
          v-model="formData.verifyCode.val" :error="formData.verifyCode.err"
          :error-messages="formData.verifyCode.errVal" variant="outlined"
          hide-details="auto" rounded="pill" @input="formData.verifyCode.err = false; formData.verifyCode.errVal = ''" />
      </div>

      <div v-if="currentStep === 4" class="d-flex flex-column ga-3 w-100">
        <v-text-field type="password" label="Sua senha"
          v-model="formData.passwd1.val" :error="formData.passwd1.err" :error-messages="formData.passwd1.errVal"
          variant="outlined" hide-details="auto" rounded="pill" @input="formData.passwd1.err = false; formData.passwd1.errVal = ''" />
        <v-text-field type="password" label="Confirme sua senha"
          v-model="formData.passwd2.val" :error="formData.passwd2.err" :error-messages="formData.passwd2.errVal"
          variant="outlined" hide-details="auto" rounded="pill" @input="formData.passwd2.err = false; formData.passwd2.errVal = ''" />
      </div>
    </template>

    <template #buttons>
      <div class="d-flex flex-column ga-2 w-100">
        <v-btn
          :text="currentStep === 4 ? 'Criar Conta' : 'Avançar'"
          color="primary"
          variant="flat"
          block
          class="text-none rounded-pill"
          :loading="loading"
          @click="loaderController(stepActions[currentStep]?.next as any)"
        />
        <v-btn
          variant="text"
          :text="currentStep === 1 ? 'Cancelar' : 'Voltar'"
          class="text-none rounded-pill text-medium-emphasis"
          block
          @click="stepActions[currentStep]?.back()"
        />
      </div>
    </template>

    <template #formInfo>
      <span class="text-body-2 text-medium-emphasis">
        Já tem uma conta?
        <a href="#" class="text-primary font-weight-bold ml-1 text-decoration-none" @click.prevent="router.push({ name: 'Login' })">
          Fazer login
        </a>
      </span>
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
  } catch (err: any) {
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
    } catch (error: any) {
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
  } catch (err: any) {
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
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.message,
    })
  }
}

const stepActions: StepActions = {
  1: { next: verifyIfUserExists, back: () => router.push({ name: 'Login' }) },
  2: { next: prepareVerifyCode, back: prevStep },
  3: { next: verifySecureCode, back: prevStep },
  4: { next: signupUser, back: prevStep },
}
</script>
