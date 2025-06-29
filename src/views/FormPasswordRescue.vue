<template>
  <ComponentForm
    ref="formRef"
    :config="formConfig"
    :isLoading="isLoading"
    :formFunctions="functions"
  />
</template>

<script setup>
import ComponentForm from '@/components/ComponentFormPage.vue'
import { ref, inject } from 'vue'
import * as globalFunc from '@/functions/functions'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from '@/plugins/toast'

const store = inject('stores')
const formStore = store.form
const formData = formStore.getInputData
const router = useRouter()
const route = useRoute()

const sentCode = ref(false)
const isLoading = ref(false)
let userData = ref({})
const formRef = ref()

// Form configuration
const formConfig = {
  title: 'Alterar senha',
  steps: {
    1: {
      fields: [
        {
          type: 'text',
          name: 'identification',
          model: 'identification',
          label: 'Usuário ou e-mail',
          placeholder: 'Digite seu nome de usuário ou e-mail',
          required: true,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          class: '',
          type: 'button',
          action: { name: 'back', type: 'local' },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          type: 'submit',
          action: { name: 'prepareVerifyCode' },
        },
      ],
    },
    2: {
      fields: [
        {
          type: 'text',
          name: 'verifyCode',
          model: 'verifyCode',
          label: 'Código de verificação',
          placeholder: 'Código de verificação recebido no seu e-mail',
          required: true,
        },
      ],
      buttons: [
        {
          text: 'Voltar',
          class: '',
          type: 'button',
          action: { name: 'rewind', type: 'local' },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          type: 'submit',
          action: { name: 'forward', type: 'local' },
        },
      ],
    },
    3: {
      fields: [
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
      ],
      buttons: [
        {
          text: 'Voltar',
          class: '',
          type: 'button',
          action: { name: 'rewind', type: 'local' },
        },
        {
          text: 'Confirmar',
          class: 'confirm',
          type: 'submit',
          action: { name: 'resetPassword' },
        },
      ],
    },
  },
}

const functions = {
  prepareVerifyCode: async () => {
    if (!sentCode.value) {
      isLoading.value = true

      try {
        const res1 = await globalFunc.get({
          type: 'database',
          route: `getUserBasics?identification=${encodeURIComponent(formData.identification)}`,
        })

        if (res1.okay) {
          userData.value = res1.details

          await globalFunc.post(
            {
              type: 'database',
              route: 'setResetPassCode',
            },
            {
              userId: userData.value.id,
            },
          )

          sentCode.value = true
          formStore.setCurrentStep(formStore.getCurrentStep + 1)
        }
      } catch (error) {
        showToast({
          type: 'error',
          message: error.message,
        })
      } finally {
        isLoading.value = false
      }
    }
  },

  resetPassword: async () => {
    isLoading.value = true
    try {
      if (formData.passwd1 !== formData.passwd2) {
        showToast({
          type: 'error',
          message: 'As senhas não coincidem.',
        })
        return
      }

      await globalFunc.post(
        {
          type: 'database',
          route: 'setUserPassword',
        },
        {
          userId: userData.value.id,
          resetToken: formData.verifyCode,
          newPassword: formData.passwd1,
        },
      )

      showToast({
        type: 'success',
        message: 'Senha redefinida com sucesso!',
        timeout: 5000,
      })
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Erro ao redefinir a senha.',
      })

      if (error.details.errCode === 'invalidCode') {
        formStore.setCurrentStep(2)
      }
    } finally {
      isLoading.value = false
    }
  },
}
</script>
