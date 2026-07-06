<template>
  <AppFormPage title="Alterar senha" :currentStep="currentStep" :totalSteps="3" :loading="loading"
    @submit="
      currentStep === 1 ? loaderController(prepareVerifyCode) :
      currentStep === 2 ? loaderController(verifySecureCode) :
      loaderController(resetPassword)
    ">
    <template #form>
      <div v-if="currentStep === 1" class="d-flex flex-column ga-3 w-100">
        <v-text-field label="E-mail" aria-required="true" v-model="formData.email.val"
          :error="formData.email.err" :error-messages="formData.email.errVal" variant="outlined" hide-details="auto" rounded="pill" />
      </div>

      <div
        v-if="currentStep === 2"
        class="d-flex flex-column align-center ga-4 w-100"
      >
        <div class="text-center">
          <h3 class="text-h6 mb-1">Verificação de e-mail</h3>
          <p class="text-body-2 text-medium-emphasis">
            Código de verificação enviado para seu e-mail.
          </p>
        </div>

        <v-container>
          <v-otp-input
            v-model="formData.verifyCode.val"
            aria-required="true"
            :error="formData.verifyCode.err"
          />

          <div v-if="formData.verifyCode.err" class="text-center">
            <span class="text-body-2 text-error">
              {{ formData.verifyCode.errVal }}
            </span>
          </div>
        </v-container>

        <div class="text-center">
          <span class="text-body-2 text-medium-emphasis">
            Não recebeu o código?
          </span>
          <v-btn
            text
            color="primary"
            variant="text"
            size="small"
            @click="prepareVerifyCode(true)"
            :loading="loading"
            class="ml-1 text-none"
          >
            Reenviar código
          </v-btn>
        </div>
      </div>

      <div v-if="currentStep === 3" class="d-flex flex-column ga-3 w-100">
        <v-text-field id="psswd1" label="Sua senha" type="password"
          aria-required="true" v-model="formData.passwd1.val" :error="formData.passwd1.err"
          :error-messages="formData.passwd1.errVal" variant="outlined" hide-details="auto" rounded="pill" />
        <v-text-field id="psswd2" label="Confirme sua senha" type="password"
          aria-required="true" v-model="formData.passwd2.val" :error="formData.passwd2.err"
          :error-messages="formData.passwd2.errVal" variant="outlined" hide-details="auto" rounded="pill" />
      </div>

      <div
        v-if="currentStep === 4"
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
            Senha redefinida!
          </h2>

          <p class="text-body-1 text-medium-emphasis">
            Sua senha foi alterada com sucesso.
            Agora você pode fazer login utilizando sua nova senha.
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
      <div
        v-if="currentStep !== 4"
        class="d-flex flex-column ga-2 w-100"
      >
        <v-btn
          :text="currentStep === 3 ? 'Confirmar' : 'Avançar'"
          color="primary"
          variant="flat"
          block
          class="text-none rounded-pill"
          :loading="loading"
          @click="
            currentStep === 1 ? loaderController(prepareVerifyCode) :
            currentStep === 2 ? loaderController(verifySecureCode) :
            loaderController(resetPassword)
          "
        />

        <v-btn
          variant="text"
          :text="currentStep === 1 ? 'Cancelar' : 'Voltar'"
          class="text-none rounded-pill text-medium-emphasis"
          block
          @click="currentStep === 1 ? router.back() : prevStep()"
        />
      </div>
    </template>

    <!-- <template #formInfo>
      <span class="text-body-2 text-medium-emphasis">
        Lembrou sua senha?
        <a href="#" class="text-primary font-weight-bold ml-1 text-decoration-none" @click.prevent="router.push({ name: 'Login' })">
          Fazer login
        </a>
      </span>
    </template> -->
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
const { currentStep, prevStep, loading, loaderController, setFieldError, goToStep } = stepForm({
  totalSteps: 4,
})
const sentCode = ref(false)
let sameMail = ''

const prepareVerifyCode = async (resent: Boolean = false) => {
  if (resent || !sentCode.value && !(formData.value.email.val === sameMail)) {
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
      goToStep(2)
    } catch (error: any) {
      setFieldError(formData.value.email, error.message)
    }
  } else {
    goToStep(2)
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
    goToStep(3)
  } catch (err: any) {
    setFieldError(formData.value.verifyCode, err.message)
  }
}

const resetPassword = async () => {
  try {
    if (formData.value.passwd1.val !== formData.value.passwd2.val) {
      setFieldError(formData.value.passwd2, "As senhas não coincidem!")
      return
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
    goToStep(4)
  } catch (error: any) {
    setFieldError(formData.value.passwd1, error?.message ?? "Erro ao redefinir senha")
  }
}
</script>
