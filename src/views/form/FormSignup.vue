<template>
  <AppFormPage :config="formConfig" :formFunctions="functions" />
</template>

<script setup>
import AppFormPage from '@/layouts/AppFormPage.vue'
import { computed, watch, ref, inject } from 'vue'
import * as globalFunc from '@/functions'
import { useRouter } from 'vue-router'
import { showToast } from '@/plugins/toast'

const store = inject('stores')
const formStore = store.form
const formData = formStore.getInputData
const nicknameValue = computed(() => formData.nickname)
const router = useRouter()

const sentCode = ref(false)

// Watchers
watch(nicknameValue, (newNickname) => {
  if (newNickname !== undefined) {
    formData.username = newNickname
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
    if (!sentCode.value) {
      try {
        await globalFunc.post(
          {
            type: 'database',
            route: 'setSignupCode',
          },
          {
            email: formData.email,
          },
        )

        sentCode.value = true
        formStore.setCurrentStep(formStore.getCurrentStep + 1)
      } catch (error) {
        showToast({
          type: 'error',
          message: error.message,
        })
      }
    } else {
      formStore.setCurrentStep(formStore.getCurrentStep + 1)
    }
  },

  signupUser: async () => {
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
          route: 'setUser',
        },
        {
          nickname: formData.nickname,
          username: formData.username,
          email: formData.email,
          birthdate: formData.birthdate,
          password: formData.passwd1,
          verificationCode: formData.verifyCode,
        },
      )

      showToast({
        type: 'success',
        message: 'Conta criada com sucesso! Aguarde um momento...',
      })

      await globalFunc.post(
        {
          type: 'database',
          route: 'setLogin',
        },
        {
          type: 'traditional',
          identification: formData.username,
          password: formData.passwd1,
        },
      )
      router.push({ name: 'Home' })
    } catch (error) {
      if (error.details?.errCode === 'invalidCode') {
        formStore.setCurrentStep(3)
      } else if (error.details?.errCode === 'invalidBirthdate') {
        formStore.setCurrentStep(2)
      } else if (error.details?.errCode === 'usernameExists') {
        formStore.setCurrentStep(1)
      } else {
        console.error(error)
      }
      showToast({
        type: 'error',
        message: error.message,
      })
    }
  },
}
</script>
