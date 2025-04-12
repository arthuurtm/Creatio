<template>
  <AppDynamicForm
    :config="formConfig"
    :errorMessage="errorMessage"
    :isLoading="isLoading"
    :formFunctions="functions"
  />
</template>

<script setup>
import AppDynamicForm from '@/layouts/AppDynamicForm.vue'
import { useFormStore } from '@/stores/formStore'
import { computed, ref } from 'vue'
import * as globalFunc from '@/functions/functions'

const formStore = useFormStore()
const formData = computed(() => formStore.formData)

const errorMessage = ref('')
const sentCode = ref(false)
const isLoading = ref(false)
let userData = ref({})

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
          text: 'Cadastrar',
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
    errorMessage.value = ''
    if (!sentCode.value) {
      isLoading.value = true

      try {
        const res1 = await globalFunc.get({
          type: 'database',
          route: `getUserBasics?identification=${encodeURIComponent(formData.value.identification)}`,
        })

        if (res1.ok) {
          userData.value = res1

          const res2 = await globalFunc.post(
            {
              type: 'database',
              route: 'setResetPassCode',
            },
            {
              userId: userData.value.id,
            },
          )

          if (res2.ok) {
            sentCode.value = true
            formStore.setCurrentStep(formStore.getCurrentStep() + 1)
          }
        }
      } catch (error) {
        console.error('Erro:', error)
        errorMessage.value = 'Ocorreu um erro interno'
      } finally {
        isLoading.value = false
      }
    }
  },

  resetPassword: async () => {
    errorMessage.value = ''
    isLoading.value = true
    try {
      if (formData.value.passwd1 !== formData.value.passwd2) {
        errorMessage.value = 'As senhas não coincidem.'
        return
      }

      const response = await globalFunc.post(
        {
          type: 'database',
          route: 'setUserPassword',
        },
        {
          userId: userData.value.id,
          resetToken: formData.value.verifyCode,
          newPassword: formData.value.passwd1,
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        errorMessage.value = `${errorData.message}`
      }
    } catch (error) {
      console.error('Erro:', error)
      errorMessage.value = 'Erro ao redefinir senha.'
    } finally {
      isLoading.value = false
    }
  },
}
</script>
