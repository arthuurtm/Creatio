<template>
  <AppFormPage
    title="Fazer login"
    subTitle="Acesse sua conta Creatio"
    :currentStep="1"
    :totalSteps="1"
    @submit="loaderController(handleLogin)"
  >
    <template #form>
      <div class="flex flex-col w-full gap-2">
        <n-form-item
          label="Usuário ou e-mail"
          :validation-status="formData.login.err ? 'error' : undefined"
          :feedback="formData.login.errVal"
          :show-feedback="!!formData.login.errVal"
          class="mb-3"
        >
          <n-input
            v-model:value="formData.login.val"
            placeholder="Digite seu usuário ou e-mail..."
            size="large"
            @input="formData.login.err = false; formData.login.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><AtOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item
          label="Senha"
          :validation-status="formData.password.err ? 'error' : undefined"
          :feedback="formData.password.errVal"
          :show-feedback="!!formData.password.errVal"
          class="mb-2"
        >
          <n-input
            type="password"
            show-password-on="click"
            v-model:value="formData.password.val"
            placeholder="Digite sua senha..."
            size="large"
            @input="formData.password.err = false; formData.password.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><LockClosedOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-button
          text
          type="primary"
          size="small"
          class="self-end font-medium -mt-1 mb-2"
          @click="$router.push({ name: 'PasswordRescue' })"
        >
          Esqueceu sua senha?
        </n-button>
      </div>
    </template>

    <template #buttons>
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
import { AtOutline, LockClosedOutline } from "@vicons/ionicons5";
import { ref } from "vue";
import { useRoute } from "vue-router";
import AppFormPage from "@/components/modules/ComponentFormWrapper.vue";
import { type FieldParams, initField, default as stepForm } from "@/utils/form";
import http from "@/utils/http";

const {
	pageRedirect,
	setFieldError,
	loading,
	loaderController,
} = stepForm({ totalSteps: 1 });

interface Params {
	login: FieldParams;
	password: FieldParams;
}

// Dados do formulário
const formData = ref<Params>({ login: initField(), password: initField() });
const route = useRoute();
const redirect = route.query.redirect || "";

const handleLogin = async () => {
	let hasError = false;
	if (!formData.value.login.val?.trim()) {
		setFieldError(formData.value.login, "Informe seu usuário ou e-mail.");
		hasError = true;
	}

	if (!formData.value.password.val) {
		setFieldError(formData.value.password, "Informe sua senha.");
		hasError = true;
	}

	if (hasError) return;

	try {
		await http.post(
			{
				type: "database",
				route: "setLogin",
			},
			{
				type: "traditional",
				login: formData.value.login.val,
				password: formData.value.password.val,
			},
		);

		// Popula o Pinia com os dados do usuário ANTES de redirecionar.
		// Sem isso, o guard do router (checkAuth) ainda lê isAuth=false e bloqueia a navegação.
		await http.auth.isAuthenticated();

		const query = redirect ? { path: redirect } : { name: "CodeNew" };
		(window as any).$message?.success("Login efetuado com sucesso!");
		pageRedirect(query);
	} catch (error) {
		setFieldError(formData.value.password, "Usuário ou senha incorretos.");
		(window as any).$message?.error(
			"Falha ao autenticar. Verifique suas credenciais.",
		);
	}
};
</script>
