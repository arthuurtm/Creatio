<template>
  <AppFormPage title="Crie sua conta" :currentStep="currentStep" :totalSteps="5" :loading="loading"
    @submit="loaderController(stepActions[currentStep]?.next as any)">
    <template #form>
      <div v-if="currentStep === 1" class="d-flex flex-column ga-3 w-100">
        <div class="text-center mb-2">
          <h3 class="text-h6 mb-1">Como você será chamado?</h3>
          <p class="text-body-2 text-medium-emphasis">
            Não se preocupe, você poderá alterar isso depois.
          </p>
        </div>

        <v-text-field
          placeholder="Ex: Joãozinho da Silva"
          v-model="formData.nickname.val"
          :error="formData.nickname.err"
          :error-messages="formData.nickname.errVal"
          variant="outlined"
          persistent-placeholder
          @input="formData.nickname.err = false; formData.nickname.errVal = ''"
        />
      </div>

      <div v-if="currentStep === 2" class="d-flex flex-column ga-3 w-100">
        <div class="text-center mb-2">
          <h3 class="text-h6 mb-1">Informações de acesso</h3>
          <p class="text-body-2 text-medium-emphasis">
            Escolha um nome de usuário e e-mail para sua conta.
          </p>
        </div>

        <v-text-field
          label="Nome de Usuário"
          v-model="formData.username.val"
          :error="formData.username.err"
          :error-messages="formData.username.errVal"
          variant="outlined"
          @input="formData.username.err = false; formData.username.errVal = ''"
        />

        <v-text-field
          type="email"
          label="Seu e-mail"
          placeholder="exemplo@email.com"
          v-model="formData.email.val"
          :error="formData.email.err"
          :error-messages="formData.email.errVal"
          variant="outlined"
          @input="formData.email.err = false; formData.email.errVal = ''"
        />
      </div>

      <div v-if="currentStep === 3" class="d-flex flex-column ga-3 w-100">
        <div class="text-center mb-2">
          <h3 class="text-h6 mb-1">Verificação de e-mail</h3>
          <p class="text-body-2 text-medium-emphasis">
            Código de verificação enviado para <strong>{{ formData.email.val }}</strong>
          </p>
        </div>

        <v-container class="py-0">
          <v-otp-input
            v-model="formData.verifyCode.val"
            aria-required="true"
            :error="formData.verifyCode.err"
          />

          <div v-if="formData.verifyCode.err" class="text-center mt-2">
            <span class="text-body-2 text-error">
              {{ formData.verifyCode.errVal }}
            </span>
          </div>
        </v-container>

        <div class="text-center mt-2">
          <span class="text-body-2 text-medium-emphasis">
            Não recebeu o código?
          </span>
          <v-btn
            color="primary"
            variant="text"
            size="small"
            @click="loaderController(() => prepareVerifyCode(true))"
            :disabled="loading"
            class="ml-1 text-none font-weight-bold"
          >
            Reenviar código
          </v-btn>
        </div>
      </div>

      <div v-if="currentStep === 4" class="d-flex flex-column ga-3 w-100">
        <div class="text-center mb-2">
          <h3 class="text-h6 mb-1">Defina sua senha</h3>
          <p class="text-body-2 text-medium-emphasis">
            Crie uma senha segura para proteger seu acesso.
          </p>
        </div>

        <v-text-field
          :type="showPassword ? 'text' : 'password'"
          label="Sua senha"
          v-model="formData.passwd1.val"
          :error="formData.passwd1.err"
          :error-messages="formData.passwd1.errVal"
          variant="outlined"
          class="rounded-pill"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          @input="formData.passwd1.err = false; formData.passwd1.errVal = ''"
        />

        <v-text-field
          :type="showPassword ? 'text' : 'password'"
          label="Confirme sua senha"
          v-model="formData.passwd2.val"
          :error="formData.passwd2.err"
          :error-messages="formData.passwd2.errVal"
          variant="outlined"
          class="rounded-pill"
          @input="formData.passwd2.err = false; formData.passwd2.errVal = ''"
        />
      </div>

      <div
        v-if="currentStep === 5"
        class="d-flex flex-column align-center justify-center text-center ga-4 w-100 py-8"
      >
        <v-avatar
          size="96"
          color="success"
          variant="tonal"
        >
          <v-icon
            icon="check_circle"
            size="56"
          />
        </v-avatar>

        <div>
          <h2 class="text-h5 font-weight-bold mb-2">
            Conta criada com sucesso!
          </h2>

          <p class="text-body-1 text-medium-emphasis">
            Sua conta foi criada com sucesso.
            Agora você pode fazer login utilizando seu email e senha.
          </p>
        </div>

        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          @click="router.push({ name: 'Login' })"
        >
          Ir para o login
        </v-btn>
      </div>
    </template>

    <template #buttons>
      <div class="d-flex flex-column ga-2 w-100 mt-4">
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
          :disabled="loading"
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
const showPassword = ref(false)

const { currentStep, nextStep, prevStep, loading, loaderController, setFieldError } = stepForm({
  totalSteps: 5,
})
const sentCode = ref(false)
let sameMail = ''

watch(nicknameValue, (newNickname) => {
  if (newNickname !== undefined) {
    formData.value.username.val = newNickname
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9_.]/g, '')
      .replace(/\s+/g, '')
  }
})

// Modificado para retornar boolean para controle de fluxo seguro
const verifyIfUserExists = async (): Promise<boolean> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  let hasError = false

  if (!formData.value.username.val) {
    setFieldError(formData.value.username, "Nome de usuário é obrigatório")
    hasError = true
  }
  if (!formData.value.email.val) {
    setFieldError(formData.value.email, "E-mail é obrigatório")
    hasError = true
  } else if (!emailRegex.test(formData.value.email.val)) {
    setFieldError(formData.value.email, "E-mail inválido")
    hasError = true
  }

  if (hasError) return false

  try {
    await http.get({
      type: 'database',
      route: 'getUserBasics',
      querys: { login: formData.value.username.val },
    })
    setFieldError(formData.value.username, "Este nome de usuário já está sendo utilizado")
    return false
  } catch (err: any) {
    if (err?.status === 404) {
      try {
        await http.get({
          type: 'database',
          route: 'getUserBasics',
          querys: { login: formData.value.email.val },
        })
        setFieldError(formData.value.email, "Este e-mail já está sendo utilizado")
        return false
      } catch (emailErr: any) {
        if (emailErr?.status === 404) {
          return true // Ambos usuário e email livres
        } else {
          setFieldError(formData.value.email, emailErr.message)
          return false
        }
      }
    } else {
      setFieldError(formData.value.username, err.message)
      return false
    }
  }
}

const prepareVerifyCode = async (resent: boolean = false) => {
  if (resent || (!sentCode.value && formData.value.email.val !== sameMail)) {
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
  if (!formData.value.verifyCode.val) {
    setFieldError(formData.value.verifyCode, "Por favor, insira o código de verificação.")
    return
  }
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
    setFieldError(formData.value.verifyCode, err.message || "Código inválido")
  }
}

const signupUser = async () => {
  if (!formData.value.passwd1.val) {
    setFieldError(formData.value.passwd1, 'A senha é obrigatória')
    return
  }
  if (formData.value.passwd1.val !== formData.value.passwd2.val) {
    setFieldError(formData.value.passwd2, 'As senhas não coincidem!')
    return
  }

  try {
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
    nextStep()
  } catch (error: any) {
    setFieldError(formData.value.passwd1, error.message)
  }
}

const handleStep1Next = async () => {
  if (!formData.value.nickname.val?.trim()) {
    setFieldError(formData.value.nickname, "Como podemos te chamar?")
    return
  }
  nextStep()
}

const handleStep2Next = async () => {
  const isValid = await verifyIfUserExists()
  if (isValid) {
    await prepareVerifyCode()
  }
}

const stepActions: StepActions = {
  1: { next: handleStep1Next, back: () => { router.push({ name: 'Login' }) } },
  2: { next: handleStep2Next, back: prevStep },
  3: { next: verifySecureCode, back: prevStep },
  4: { next: signupUser, back: prevStep },
  5: { next: async () => { await router.push({ name: 'Login' }) }, back: prevStep },
}
</script>
