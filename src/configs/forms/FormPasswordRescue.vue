<template>
  <AppDynamicForm :config="formConfig" :errorMessage="errorMessage" :isLoading="isLoading" />
</template>

<script setup>
import AppDynamicForm from '@/layouts/AppDynamicForm.vue';
import { useFormStore } from '@/stores/formStore';
import { computed, watch, ref } from 'vue';
import * as globalFunc from '@/functions/functions'

const formStore = useFormStore();
const formData = computed(() => formStore.formData);
const executeFunc = computed(() => formStore.getRequestedFunction());

const errorMessage = ref("");
const sentCode = ref(false);
const isLoading = ref(false);
let userData = ref({});

// Watchers
watch(executeFunc, (newFuncName) => {
  if (typeof newFuncName === 'string' && typeof window[newFuncName] === 'function') {
    window[newFuncName]();
    formStore.clearRequestedFunction();
  } else {
    console.warn(`executeFunc "${newFuncName}" não é uma função válida.`);
  }
});

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
};

// Methods
window.prepareVerifyCode = async () => {
  errorMessage.value = '';
  if (!sentCode.value) {
    isLoading.value = true;

    try {
      const response1 = await fetch(globalFunc.getApiUrl('database', 'getUserBasics'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.value.identification }),
      });

      if (response1.ok) {
        userData.value = await response1.json();

        const response2 = await fetch(globalFunc.getApiUrl('database', 'setResetPassCode'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.value.id }),
        });

        if (!response2.ok) {
          const errorData = await response2.json();
          errorMessage.value = `${errorData.message}`;
        } else {
          sentCode.value = true;
          formStore.setCurrentStep(formStore.getCurrentStep() + 1);
        }
      } else {
        const errorData = await response1.json();
        errorMessage.value = `${errorData.message}`;
      }
    } catch (error) {
      console.error("Erro:", error);
      errorMessage.value = "Ocorreu um erro interno";
    } finally {
      isLoading.value = false;
    }
  }
}

window.resetPassword = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    if (formData.value.passwd1 !== formData.value.passwd2) {
      errorMessage.value = "As senhas não coincidem.";
      return;
    }

    const response = await fetch(globalFunc.getApiUrl('database', 'setUserPassword'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userData.value.id,
        resetToken: formData.value.verifyCode,
        newPassword: formData.value.passwd1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      errorMessage.value = `${errorData.message}`;
    }
  } catch (error) {
    console.error("Erro:", error);
    errorMessage.value = "Erro ao redefinir senha.";
  } finally {
    isLoading.value = false;
  }
}
</script>
