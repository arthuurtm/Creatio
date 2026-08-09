<template>
  <AppFormPage title="Crie sua conta" :currentStep="currentStep" :totalSteps="5" :loading="loading"
    @submit="loaderController(stepActions[currentStep]?.next as any)">
    <template #form>
      <!-- Step 1: Nickname -->
      <div v-if="currentStep === 1" class="flex flex-col gap-3 w-full">
        <div class="text-center mb-2">
          <h3 class="text-lg m-0 mb-1">Como você será chamado?</h3>
          <p class="text-[13px] opacity-70 m-0">
            Não se preocupe, você poderá alterar isso depois.
          </p>
        </div>

        <n-form-item
          :validation-status="formData.nickname.err ? 'error' : undefined"
          :feedback="formData.nickname.errVal"
          :show-feedback="!!formData.nickname.errVal"
          class="mb-5"
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
      </div>

      <!-- Step 2: Username & Email -->
      <div v-if="currentStep === 2" class="flex flex-col gap-3 w-full">
        <div class="text-center mb-2">
          <h3 class="text-lg m-0 mb-1">Informações de acesso</h3>
          <p class="text-[13px] opacity-70 m-0">
            Escolha um nome de usuário e e-mail para sua conta.
          </p>
        </div>

        <n-form-item
          label="Nome de Usuário"
          :validation-status="formData.username.err ? 'error' : undefined"
          :feedback="formData.username.errVal"
          :show-feedback="!!formData.username.errVal"
          class="mb-5"
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
          label="Seu e-mail"
          :validation-status="formData.email.err ? 'error' : undefined"
          :feedback="formData.email.errVal"
          :show-feedback="!!formData.email.errVal"
          class="mb-5"
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

      <!-- Step 3: Verification Code -->
      <div v-if="currentStep === 3" class="flex flex-col gap-4 w-full">
        <div class="text-center">
          <h3 class="text-lg m-0 mb-1">Verificação de e-mail</h3>
          <p class="text-[13px] opacity-70 m-0">
            Código de verificação enviado para <strong>{{ formData.email.val }}</strong>
          </p>
        </div>

        <div class="w-full max-w-[280px] mx-auto">
          <n-form-item
            :validation-status="formData.verifyCode.err ? 'error' : undefined"
            :feedback="formData.verifyCode.errVal"
            :show-feedback="!!formData.verifyCode.errVal"
            class="mb-5 w-full"
          >
            <n-input-otp
              v-model:value="formData.verifyCode.val"
              size="large"
              class="text-center text-xl tracking-[4px]"
            />
          </n-form-item>
        </div>

        <div class="text-center mb-3">
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

      <!-- Step 4: Password -->
      <div v-if="currentStep === 4" class="flex flex-col gap-1 w-full">
        <div class="text-center mb-3">
          <h3 class="text-lg m-0 mb-1">Defina sua senha</h3>
          <p class="text-[13px] opacity-70 m-0">
            Crie uma senha segura para proteger seu acesso.
          </p>
        </div>

        <v-password-field
          label="Sua senha"
          v-model="formData.passwd1.val"
          :error="formData.passwd1.err"
          :error-messages="formData.passwd1.errVal"
        />

        <v-password-field
          label="Confirme sua senha"
          v-model="formData.passwd2.val"
          :error="formData.passwd2.err"
          :error-messages="formData.passwd2.errVal"
        />
      </div>

      <!-- Step 5: Success -->
      <div
        v-if="currentStep === 5"
        class="flex flex-col items-center justify-center text-center gap-4 w-full py-8"
      >
        <n-avatar
          :size="96"
          :style="{ backgroundColor: 'rgba(var(--v-theme-primary), 0.12)' }"
        >
          <n-icon
            size="56"
            color="rgb(var(--v-theme-primary))"
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
            Agora você pode fazer login utilizando seu email e senha.
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
      <div v-if="currentStep !== 5" class="flex flex-col gap-3 w-full mt-4">
        <n-button
          type="primary"
          block
          round
          size="large"
          :loading="loading"
          @click="loaderController(stepActions[currentStep]?.next as any)"
        >
          {{ currentStep === 4 ? 'Criar Conta' : 'Avançar' }}
        </n-button>
        <n-button
          quaternary
          block
          round
          size="large"
          :disabled="loading"
          @click="stepActions[currentStep]?.back()"
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
import { computed, ref, watch } from "vue";
import { AtOutline, MailOutline, PersonOutline, CheckmarkCircleOutline } from "@vicons/ionicons5";
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
interface FormButtonActions {
	next: () => Promise<void>;
	back: () => void;
}
interface StepActions {
	[key: number]: FormButtonActions;
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
	nextStep,
	prevStep,
	loading,
	loaderController,
	setFieldError,
} = stepForm({
	totalSteps: 5,
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

// Modificado para retornar boolean para controle de fluxo seguro
const verifyIfUserExists = async (): Promise<boolean> => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let hasError = false;

	if (!formData.value.username.val) {
		setFieldError(formData.value.username, "Nome de usuário é obrigatório");
		hasError = true;
	}
	if (!formData.value.email.val) {
		setFieldError(formData.value.email, "E-mail é obrigatório");
		hasError = true;
	} else if (!emailRegex.test(formData.value.email.val)) {
		setFieldError(formData.value.email, "E-mail inválido");
		hasError = true;
	}

	if (hasError) return false;

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
					return true; // Ambos usuário e email livres
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
			nextStep();
		} catch (error: any) {
			setFieldError(formData.value.email, error.message);
			(window as any).$message?.error(
				"Falha ao enviar código: " + (error.message || "Erro desconhecido"),
			);
		}
	} else {
		nextStep();
	}
};

const verifySecureCode = async () => {
	if (!formData.value.verifyCode.val) {
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
				secureToken: formData.value.verifyCode.val,
				tokenId: formData.value.email.val,
			},
		);
		formData.value.accessUUID = accessUUID;
		(window as any).$message?.success("Código verificado com sucesso!");
		nextStep();
	} catch (err: any) {
		setFieldError(formData.value.verifyCode, err.message || "Código inválido");
		(window as any).$message?.error("Código inválido. Tente novamente.");
	}
};

const signupUser = async () => {
	if (!formData.value.passwd1.val) {
		setFieldError(formData.value.passwd1, "A senha é obrigatória");
		return;
	}
	if (formData.value.passwd1.val !== formData.value.passwd2.val) {
		setFieldError(formData.value.passwd2, "As senhas não coincidem!");
		return;
	}

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
		nextStep();
	} catch (error: any) {
		setFieldError(formData.value.passwd1, error.message);
		(window as any).$message?.error(
			"Erro ao registrar: " + (error.message || "Erro desconhecido"),
		);
	}
};

const handleStep1Next = async () => {
	if (!formData.value.nickname.val?.trim()) {
		setFieldError(formData.value.nickname, "Como podemos te chamar?");
		return;
	}
	nextStep();
};

const handleStep2Next = async () => {
	const isValid = await verifyIfUserExists();
	if (isValid) {
		await prepareVerifyCode();
	}
};

const stepActions: StepActions = {
	1: {
		next: handleStep1Next,
		back: () => {
			router.push({ name: "Login" });
		},
	},
	2: { next: handleStep2Next, back: prevStep },
	3: { next: verifySecureCode, back: prevStep },
	4: { next: signupUser, back: prevStep },
	5: {
		next: async () => {
			await router.push({ name: "Login" });
		},
		back: prevStep,
	},
};
</script>
