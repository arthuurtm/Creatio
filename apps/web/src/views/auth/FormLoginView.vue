<template>
  <AppFormPage title="Fazer login" subTitle="Acesse sua conta Creatio" :currentStep="currentStep" :totalSteps="2"
    @submit="currentStep === 1 ? nextStep() : loaderController(handleLogin)">
    <template #form>
      <div v-if="currentStep === 1" class="flex flex-col w-full gap-4">
        <n-form-item
          label="Usuário ou e-mail"
          :validation-status="formData.login.err ? 'error' : undefined"
          :feedback="formData.login.errVal"
          :show-feedback="!!formData.login.errVal"
          class="mb-5"
        >
          <n-input 
            v-model:value="formData.login.val" 
            placeholder="Digite seu usuário ou e-mail..." 
            size="large"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><AtOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </div>
      <div v-else-if="currentStep === 2" class="flex flex-col w-full gap-2">
        <v-password-field 
          label="Senha" 
          v-model="formData.password.val" 
          :error="formData.password.err" 
          :error-messages="formData.password.errVal" 
        />
        <n-button 
          text 
          type="primary" 
          size="small" 
          class="self-end font-medium -mt-2 mb-3" 
          @click="$router.push({ name: 'PasswordRescue' })"
        >
          Esqueceu sua senha?
        </n-button>
      </div>
    </template>

    <template #buttons>
      <template v-if="currentStep === 1">
        <n-button 
          type="primary" 
          block 
          round 
          size="large"
          attr-type="submit" 
          autofocus
        >
          Avançar
        </n-button>
      </template>
      <template v-else-if="currentStep === 2">
        <div class="flex flex-col gap-3 w-full">
          <n-button 
            type="primary" 
            block 
            round 
            size="large"
            attr-type="submit" 
            autofocus 
            :loading="loading"
          >
            Entrar
          </n-button>
          <n-button 
            quaternary 
            block 
            round 
            size="large"
            @click="prevStep()"
          >
            Voltar
          </n-button>
        </div>
      </template>
    </template>

    <template #formInfo>
      <span class="text-sm opacity-80">
        Novo por aqui?
        <a href="#" class="text-[color:var(--n-primary-color)] font-bold ml-1 no-underline" @click.prevent="$router.push({ name: 'Signup' })">
          Criar conta
        </a>
      </span>
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import AppFormPage from '@/components/modules/ComponentFormWrapper.vue'
import { ref } from 'vue'
import { AtOutline } from "@vicons/ionicons5";
import { useRoute } from 'vue-router'
import http from '@/utils/http'
import { default as stepForm, type FieldParams, initField } from "@/utils/form"

const { currentStep, nextStep, prevStep, pageRedirect, setFieldError, loading, loaderController } = stepForm({ totalSteps: 2 })

interface Params {
  login: FieldParams,
  password: FieldParams
}

// Dados do formulário
const formData = ref<Params>({ login: initField(), password: initField() })
const route = useRoute()
const redirect = route.query.redirect || ''

const handleLogin = async () => {
  try {
    if (formData.value.login.val === '') {
      prevStep()
      setFieldError(formData.value.login, "Informe um usuário")
      return
    }

    if (formData.value.password.val === '') {
      setFieldError(formData.value.password, 'Informe uma senha')
      return
    }

    await http.post(
      {
        type: 'database',
        route: 'setLogin',
      },
      {
        type: 'traditional',
        login: formData.value.login.val,
        password: formData.value.password.val,
      },
    )

    // Popula o Pinia com os dados do usuário ANTES de redirecionar.
    // Sem isso, o guard do router (checkAuth) ainda lê isAuth=false e bloqueia a navegação.
    await http.auth.isAuthenticated()

    const query = redirect ? { path: redirect } : { name: 'CodeNew' }
    ;(window as any).$message?.success("Login efetuado com sucesso!")
    pageRedirect(query)
  } catch (error) {
    setFieldError(formData.value.password, "Usuário ou senha incorretos.")
    ;(window as any).$message?.error("Falha ao autenticar. Verifique suas credenciais.")
  }
}
</script>
