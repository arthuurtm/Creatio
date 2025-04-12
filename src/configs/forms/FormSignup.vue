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
import { computed, watch, ref } from 'vue'
import * as globalFunc from '@/functions/functions'

const formStore = useFormStore()
const formData = computed(() => formStore.formData)
const nicknameValue = computed(() => formData.value.nickname)

const errorMessage = ref('')
const sentCode = ref(false)
const isLoading = ref(false)

// Watchers
watch(nicknameValue, (newNickname) => {
  if (newNickname !== undefined) {
    formStore.formData.username = newNickname
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, '')
      .replace(/\s+/g, '')
  }
})

// Form configuration
const formConfig = ref({
  title: 'Crie sua conta',
  steps: {
    1: {
      fields: [
        {
          type: 'text',
          name: 'nickname',
          model: 'nickname',
          label: 'Nome de Exibição',
          placeholder: 'Um nome criativo',
          required: false,
        },
        {
          type: 'text',
          name: 'username',
          model: 'username',
          label: 'Nome de Usuário',
          placeholder: 'Seu nome de usuário',
          required: true,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          class: 'destructive',
          type: 'button',
          action: { name: 'back', type: 'local' },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          type: 'submit',
          action: { name: 'forward', type: 'local' },
        },
      ],
    },
    2: {
      fields: [
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
          action: { name: 'prepareVerifyCode' },
        },
      ],
    },
    3: {
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
    4: {
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
          action: { name: 'signupUser' },
        },
      ],
    },
  },
})

const functions = {
  prepareVerifyCode: async () => {
    errorMessage.value = ''
    if (!sentCode.value) {
      isLoading.value = true

      try {
        const res = await globalFunc.post(
          {
            type: 'database',
            route: 'setSignupCode',
          },
          {
            email: formData.value.email,
          },
        )

        if (res.ok) {
          sentCode.value = true
          formStore.setCurrentStep(formStore.getCurrentStep() + 1)
        } else {
          const errorData = await res.json()
          errorMessage.value = `${errorData.message}`
        }
      } catch (error) {
        console.error('Erro:', error)
        errorMessage.value = 'Erro interno. Tente novamente mais tarde.'
      } finally {
        isLoading.value = false
      }
    } else {
      formStore.setCurrentStep(formStore.getCurrentStep() + 1)
    }
  },

  signupUser: async () => {
    errorMessage.value = ''
    try {
      if (formData.value.passwd1 !== formData.value.passwd2) {
        errorMessage.value = 'As senhas não coincidem.'
        return
      }

      isLoading.value = true
      const response = await globalFunc.post(
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
          verificationCode: formData.value.verifyCode,
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errCode === 'invalidCode') {
          formStore.setCurrentStep(3)
        } else if (errorData.errCode === 'invalidBirthdate') {
          formStore.setCurrentStep(2)
        } else if (errorData.errCode === 'usernameExists') {
          formStore.setCurrentStep(1)
        }
        errorMessage.value = `${errorData.message}`
      }
    } catch (error) {
      console.error('Erro:', error)
      errorMessage.value = 'Erro interno. Tente novamente mais tarde.'
    } finally {
      isLoading.value = false
    }
  },
}
</script>
