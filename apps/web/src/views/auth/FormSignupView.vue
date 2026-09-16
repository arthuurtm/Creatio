<template>
  <AppFormPage
    title="Crie sua conta"
    :currentStep="currentStep"
    :totalSteps="currentStep === 4 ? 0 : 3"
    :loading="loading"
    @submit="
      currentStep === 1 ? loaderController(handleStep1Submit) :
      currentStep === 2 ? loaderController(handleStep2Submit) :
      loaderController(handleStep3Submit)
    "
  >
    <template #form>
      <!-- Step 1: Dados da conta -->
      <div v-if="currentStep === 1" class="flex flex-col w-full gap-1">
        <div class="text-center mb-2">
          <h3 class="text-base font-semibold m-0 mb-1">Informações básicas</h3>
          <p class="text-[13px] opacity-70 m-0">
            Informe seus dados para criar sua conta.
          </p>
        </div>

        <n-form-item
          label="Como você quer ser chamado?"
          :validation-status="formData.nickname.err ? 'error' : undefined"
          :feedback="formData.nickname.errVal"
          :show-feedback="!!formData.nickname.errVal"
          class="mb-2"
        >
          <n-input
            placeholder="Ex: Joãozinho da Silva"
            v-model:value="formData.nickname.val"
            size="large"
            @input="formData.nickname.err = false; formData.nickname.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><PersonOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item
          label="Nome de usuário"
          :validation-status="formData.username.err ? 'error' : undefined"
          :feedback="formData.username.errVal"
          :show-feedback="!!formData.username.errVal"
          class="mb-2"
        >
          <n-input
            v-model:value="formData.username.val"
            placeholder="Ex: joao_silva"
            size="large"
            @input="formData.username.err = false; formData.username.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><AtOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item
          label="E-mail"
          :validation-status="formData.email.err ? 'error' : undefined"
          :feedback="formData.email.errVal"
          :show-feedback="!!formData.email.errVal"
          class="mb-2"
        >
          <n-input
            type="email"
            placeholder="exemplo@email.com"
            v-model:value="formData.email.val"
            size="large"
            @input="formData.email.err = false; formData.email.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><MailOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <!-- Step 2: Verificação de e-mail (Código) -->
      <div v-if="currentStep === 2" class="flex flex-col gap-4 w-full">
        <div class="text-center">
          <h3 class="text-base font-semibold m-0 mb-1">Verificação de e-mail</h3>
          <p class="text-[13px] opacity-70 m-0">
            Código de verificação enviado para <strong>{{ formData.email.val }}</strong>
          </p>
        </div>

        <div class="w-full max-w-[280px] mx-auto">
          <n-form-item
            :validation-status="formData.verifyCode.err ? 'error' : undefined"
            :feedback="formData.verifyCode.errVal"
            :show-feedback="!!formData.verifyCode.errVal"
            class="mb-3 w-full"
          >
            <n-input-otp
              v-model:value="formData.verifyCode.val"
              size="large"
              class="text-center text-xl tracking-[4px]"
            />
          </n-form-item>
        </div>

        <div class="text-center mb-1">
          <span class="text-[13px] opacity-70">
            Não recebeu o código?
          </span>
          <n-button
            text
            type="primary"
            size="small"
            class="ml-1"
            :disabled="loading"
            @click="loaderController(() => prepareVerifyCode(true))"
          >
            Reenviar código
          </n-button>
        </div>
      </div>

      <!-- Step 3: Definição de senha -->
      <div v-if="currentStep === 3" class="flex flex-col w-full gap-1">
        <div class="text-center mb-2">
          <h3 class="text-base font-semibold m-0 mb-1">Defina sua senha</h3>
          <p class="text-[13px] opacity-70 m-0">
            Crie uma senha segura para proteger seu acesso.
          </p>
        </div>

        <n-form-item
          label="Sua senha"
          :validation-status="formData.passwd1.err ? 'error' : undefined"
          :feedback="formData.passwd1.errVal"
          :show-feedback="!!formData.passwd1.errVal"
          class="mb-2"
        >
          <n-input
            type="password"
            show-password-on="click"
            v-model:value="formData.passwd1.val"
            placeholder="Escolha uma senha..."
            size="large"
            @input="formData.passwd1.err = false; formData.passwd1.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><LockClosedOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item
          label="Confirme sua senha"
          :validation-status="formData.passwd2.err ? 'error' : undefined"
          :feedback="formData.passwd2.errVal"
          :show-feedback="!!formData.passwd2.errVal"
          class="mb-2"
        >
          <n-input
            type="password"
            show-password-on="click"
            v-model:value="formData.passwd2.val"
            placeholder="Confirme sua senha..."
            size="large"
            @input="formData.passwd2.err = false; formData.passwd2.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><LockClosedOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <!-- Step 4: Sucesso -->
      <div
        v-if="currentStep === 4"
        class="flex flex-col items-center justify-center text-center gap-4 w-full py-8"
      >
        <n-avatar
          :size="96"
          :style="{ backgroundColor: 'var(--n-action-color)' }"
        >
          <n-icon
            size="56"
            color="var(--n-primary-color)"
          >
            <CheckmarkCircleOutline />
          </n-icon>
        </n-avatar>

        <div>
          <h2 class="text-xl font-bold m-0 mb-2">
            Conta criada com sucesso!
          </h2>

          <p class="text-sm opacity-70 m-0">
            Sua conta foi criada com sucesso.
            Agora você pode fazer login utilizando seu e-mail e senha.
          </p>
        </div>

        <n-button
          type="primary"
          round
          size="large"
          @click="router.push({ name: 'Login' })"
        >
          Ir para o login
        </n-button>
      </div>
    </template>

    <template #buttons>
      <div v-if="currentStep !== 4" class="flex flex-col gap-3 w-full mt-2">
        <n-button
          type="primary"
          block
          round
          size="large"
          attr-type="submit"
          :loading="loading"
        >
          {{ currentStep === 3 ? 'Criar Conta' : 'Avançar' }}
        </n-button>
        <n-button
          quaternary
          block
          round
          size="large"
          :disabled="loading"
          @click="currentStep === 1 ? router.push({ name: 'Login' }) : prevStep()"
        >
          {{ currentStep === 1 ? 'Cancelar' : 'Voltar' }}
        </n-button>
      </div>
    </template>

    <template #formInfo>
      <span class="text-sm opacity-80">
        Já tem uma conta?
        <a href="#" class="text-[color:var(--n-primary-color)] font-bold ml-1 no-underline" @click.prevent="router.push({ name: 'Login' })">
          Fazer login
        </a>
      </span>
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import {
	AtOutline,
	CheckmarkCircleOutline,
	LockClosedOutline,
	MailOutline,
	PersonOutline,
} from "@vicons/ionicons5";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppFormPage from "@/components/modules/ComponentFormWrapper.vue";
import { type FieldParams, initField, default as stepForm } from "@/utils/form";
import http from "@/utils/http";

interface Params {
	nickname: FieldParams;
	username: FieldParams;
	email: FieldParams;
	passwd1: FieldParams;
	passwd2: FieldParams;
	verifyCode: FieldParams;
	accessUUID: string;
}

const formData = ref<Params>({
	nickname: initField(),
	username: initField(),
	email: initField(),
	passwd1: initField(),
	passwd2: initField(),
	verifyCode: initField(),
	accessUUID: "",
});

const nicknameValue = computed(() => formData.value.nickname.val);
const router = useRouter();

const {
	currentStep,
	prevStep,
	goToStep,
	loading,
	loaderController,
	setFieldError,
} = stepForm({
	totalSteps: 4,
});

const sentCode = ref(false);
let sameMail = "";

watch(nicknameValue, (newNickname) => {
	if (newNickname !== undefined) {
		formData.value.username.val = newNickname
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "") // Remove acentos
			.replace(/[^a-z0-9_.]/g, "")
			.replace(/\s+/g, "");
	}
});

const verifyIfUserExists = async (): Promise<boolean> => {
	try {
		await http.get({
			type: "database",
			route: "getUserBasics",
			querys: { login: formData.value.username.val },
		});
		setFieldError(
			formData.value.username,
			"Este nome de usuário já está sendo utilizado",
		);
		return false;
	} catch (err: any) {
		if (err?.status === 404) {
			try {
				await http.get({
					type: "database",
					route: "getUserBasics",
					querys: { login: formData.value.email.val },
				});
				setFieldError(
					formData.value.email,
					"Este e-mail já está sendo utilizado",
				);
				return false;
			} catch (emailErr: any) {
				if (emailErr?.status === 404) {
					return true;
				} else {
					setFieldError(formData.value.email, emailErr.message);
					return false;
				}
			}
		} else {
			setFieldError(formData.value.username, err.message);
			return false;
		}
	}
};

const prepareVerifyCode = async (resent: boolean = false) => {
	if (resent || (!sentCode.value && formData.value.email.val !== sameMail)) {
		try {
			await http.post(
				{
					type: "database",
					route: "setSignupCode",
				},
				{
					email: formData.value.email.val,
				},
			);
			sameMail = formData.value.email.val;
			sentCode.value = true;
			(window as any).$message?.success(
				"Código de verificação enviado para seu e-mail!",
			);
			goToStep(2);
		} catch (error: any) {
			setFieldError(formData.value.email, error.message);
			(window as any).$message?.error(
				"Falha ao enviar código: " + (error.message || "Erro desconhecido"),
			);
		}
	} else {
		goToStep(2);
	}
};

const handleStep1Submit = async () => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let hasError = false;

	if (!formData.value.nickname.val?.trim()) {
		setFieldError(formData.value.nickname, "Como podemos te chamar?");
		hasError = true;
	}
	if (!formData.value.username.val?.trim()) {
		setFieldError(formData.value.username, "Nome de usuário é obrigatório.");
		hasError = true;
	}
	if (!formData.value.email.val?.trim()) {
		setFieldError(formData.value.email, "E-mail é obrigatório.");
		hasError = true;
	} else if (!emailRegex.test(formData.value.email.val)) {
		setFieldError(formData.value.email, "E-mail inválido.");
		hasError = true;
	}

	if (hasError) return;

	const isValid = await verifyIfUserExists();
	if (isValid) {
		await prepareVerifyCode();
	}
};

const handleStep2Submit = async () => {
	const codeValue = Array.isArray(formData.value.verifyCode.val)
		? formData.value.verifyCode.val.join("")
		: formData.value.verifyCode.val;

	if (!codeValue || codeValue.trim() === "") {
		setFieldError(
			formData.value.verifyCode,
			"Por favor, insira o código de verificação.",
		);
		return;
	}

	try {
		const { accessUUID } = await http.post(
			{
				type: "database",
				route: "validateSecureSession",
			},
			{
				secureToken: codeValue,
				tokenId: formData.value.email.val,
			},
		);
		formData.value.accessUUID = accessUUID;
		(window as any).$message?.success("Código verificado com sucesso!");
		goToStep(3);
	} catch (err: any) {
		setFieldError(formData.value.verifyCode, err.message || "Código inválido");
		(window as any).$message?.error(
			err.message || "Código inválido. Tente novamente.",
		);
	}
};

const handleStep3Submit = async () => {
	let hasError = false;

	if (!formData.value.passwd1.val) {
		setFieldError(formData.value.passwd1, "A senha é obrigatória.");
		hasError = true;
	}
	if (!formData.value.passwd2.val) {
		setFieldError(formData.value.passwd2, "Confirme sua senha.");
		hasError = true;
	} else if (formData.value.passwd1.val !== formData.value.passwd2.val) {
		setFieldError(formData.value.passwd2, "As senhas não coincidem!");
		hasError = true;
	}

	if (hasError) return;

	try {
		await http.post(
			{
				type: "database",
				route: "setUser",
			},
			{
				nickname: formData.value.nickname.val,
				username: formData.value.username.val,
				email: formData.value.email.val,
				password: formData.value.passwd1.val,
				accessUUID: formData.value.accessUUID,
			},
		);

		(window as any).$message?.success("Conta criada com sucesso!");
		goToStep(4);
	} catch (err: any) {
		setFieldError(formData.value.passwd1, err.message || "Erro ao registrar");
		(window as any).$message?.error(
			err.message || "Erro ao registrar. Tente novamente.",
		);
	}
};
</script>
