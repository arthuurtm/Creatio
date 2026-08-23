<template>
  <AppFormPage title="Alterar senha" :currentStep="currentStep" :totalSteps="3" :loading="loading"
    @submit="
      currentStep === 1 ? loaderController(prepareVerifyCode) :
      currentStep === 2 ? loaderController(verifySecureCode) :
      loaderController(resetPassword)
    ">
    <template #form>
      <!-- Step 1: Email -->
      <div v-if="currentStep === 1" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <n-form-item
          label="E-mail"
          :validation-status="formData.email.err ? 'error' : undefined"
          :feedback="formData.email.errVal"
          :show-feedback="!!formData.email.errVal"
          style="margin-bottom: 20px;"
        >
          <n-input
            v-model:value="formData.email.val"
            placeholder="Digite seu e-mail..."
            size="large"
            @input="formData.email.err = false; formData.email.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" style="opacity: 0.5; margin-right: 6px;"><AtOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <!-- Step 2: Verification Code -->
      <div
        v-if="currentStep === 2"
        style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;"
      >
        <div style="text-align: center;">
          <h3 style="font-size: 18px; margin: 0 0 4px 0;">Verificação de e-mail</h3>
          <p style="font-size: 13px; opacity: 0.7; margin: 0;">
            Código de verificação enviado para seu e-mail.
          </p>
        </div>

        <div style="width: 100%; max-width: 280px; display: flex; flex-direction: column; align-items: center;">
          <n-form-item
            :validation-status="formData.verifyCode.err ? 'error' : undefined"
            :feedback="formData.verifyCode.errVal"
            :show-feedback="!!formData.verifyCode.errVal"
            style="width: 100%; margin-bottom: 20px;"
          >
            <n-input-otp
              v-model:value="formData.verifyCode.val"
              size="large"
              style="text-align: center; font-size: 20px; letter-spacing: 4px;"
            />
          </n-form-item>
        </div>

        <div style="text-align: center; margin-bottom: 12px;">
          <span style="font-size: 13px; opacity: 0.7;">
            Não recebeu o código?
          </span>
          <n-button
            text
            type="primary"
            size="small"
            style="margin-left: 4px;"
            :loading="loading"
            @click="prepareVerifyCode(true)"
          >
            Reenviar código
          </n-button>
        </div>
      </div>

      <!-- Step 3: New Password -->
      <div v-if="currentStep === 3" style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
        <n-form-item
          label="Sua senha"
          :validation-status="formData.passwd1.err ? 'error' : undefined"
          :feedback="formData.passwd1.errVal"
          :show-feedback="!!formData.passwd1.errVal"
          class="mb-3"
        >
          <n-input
            type="password"
            show-password-on="click"
            v-model:value="formData.passwd1.val"
            placeholder="Digite a nova senha..."
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
          class="mb-3"
        >
          <n-input
            type="password"
            show-password-on="click"
            v-model:value="formData.passwd2.val"
            placeholder="Confirme a nova senha..."
            size="large"
            @input="formData.passwd2.err = false; formData.passwd2.errVal = ''"
          >
            <template #prefix>
              <n-icon size="18" class="opacity-50 mr-1.5"><LockClosedOutline /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <!-- Step 4: Success -->
      <div
        v-if="currentStep === 4"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 16px; width: 100%; padding: 32px 0;"
      >
        <n-avatar
          :size="96"
          style="background-color: rgba(var(--v-theme-primary), 0.12)"
        >
          <n-icon
            size="56"
            color="rgb(var(--v-theme-primary))"
          >
            <CheckmarkCircleOutline />
          </n-icon>
        </n-avatar>

        <div>
          <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">
            Senha redefinida!
          </h2>

          <p style="font-size: 14px; opacity: 0.7; margin: 0;">
            Sua senha foi alterada com sucesso.
            Agora você pode fazer login utilizando sua nova senha.
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
      <div
        v-if="currentStep !== 4"
        style="display: flex; flex-direction: column; gap: 12px; width: 100%;"
      >
        <n-button
          type="primary"
          block
          round
          size="large"
          :loading="loading"
          @click="
            currentStep === 1 ? loaderController(prepareVerifyCode) :
            currentStep === 2 ? loaderController(verifySecureCode) :
            loaderController(resetPassword)
          "
        >
          {{ currentStep === 3 ? 'Confirmar' : 'Avançar' }}
        </n-button>

        <n-button
          quaternary
          block
          round
          size="large"
          @click="currentStep === 1 ? router.back() : prevStep()"
        >
          {{ currentStep === 1 ? 'Cancelar' : 'Voltar' }}
        </n-button>
      </div>
    </template>
  </AppFormPage>
</template>

<script setup lang="ts">
import { AtOutline, CheckmarkCircleOutline, LockClosedOutline } from "@vicons/ionicons5";
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppFormPage from "@/components/modules/ComponentFormWrapper.vue";
import { type FieldParams, initField, default as stepForm } from "@/utils/form";
import http from "@/utils/http";

interface Params {
	email: FieldParams;
	verifyCode: FieldParams;
	passwd1: FieldParams;
	passwd2: FieldParams;
	accessUUID: string;
}

const formData = ref<Params>({
	email: initField(),
	verifyCode: initField([]),
	passwd1: initField(),
	passwd2: initField(),
	accessUUID: "",
});
const router = useRouter();
const {
	currentStep,
	prevStep,
	loading,
	loaderController,
	setFieldError,
	goToStep,
} = stepForm({
	totalSteps: 4,
});
const sentCode = ref(false);
let sameMail = "";

const prepareVerifyCode = async (resent: boolean = false) => {
	if (!formData.value.email.val?.trim()) {
		setFieldError(formData.value.email, "E-mail é obrigatório.");
		return;
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(formData.value.email.val)) {
		setFieldError(formData.value.email, "E-mail inválido.");
		return;
	}

	if (resent || (!sentCode.value && !(formData.value.email.val === sameMail))) {
		try {
			await http.get({
				type: "database",
				route: "getUserBasics",
				querys: { login: formData.value.email.val },
			});
			await http.post(
				{
					type: "database",
					route: "setResetPassCode",
				},
				{
					email: formData.value.email.val,
				},
			);

			sameMail = formData.value.email.val;
			sentCode.value = true;
			(window as any).$message?.success(
				"Código de recuperação enviado para seu e-mail!",
			);
			goToStep(2);
		} catch (error: any) {
			setFieldError(formData.value.email, error.message);
			(window as any).$message?.error(
				"Falha ao recuperar senha: " +
					(error.message || "E-mail não cadastrado"),
			);
		}
	} else {
		goToStep(2);
	}
};

const verifySecureCode = async () => {
	const codeValue = Array.isArray(formData.value.verifyCode.val)
		? formData.value.verifyCode.val.join("")
		: formData.value.verifyCode.val;

	if (!codeValue || codeValue.trim() === "") {
		setFieldError(formData.value.verifyCode, "Por favor, insira o código de verificação.");
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
		setFieldError(formData.value.verifyCode, err.message);
		(window as any).$message?.error("Código inválido. Tente novamente.");
	}
};

const resetPassword = async () => {
	if (!formData.value.passwd1.val) {
		setFieldError(formData.value.passwd1, "A senha é obrigatória.");
		return;
	}
	if (!formData.value.passwd2.val) {
		setFieldError(formData.value.passwd2, "Confirme sua senha.");
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
				route: "setUserPassword",
			},
			{
				newPassword: formData.value.passwd2.val,
				accessUUID: formData.value.accessUUID,
			},
		);
		(window as any).$message?.success("Sua senha foi redefinida!");
		goToStep(4);
	} catch (error: any) {
		setFieldError(
			formData.value.passwd1,
			error?.message ?? "Erro ao redefinir senha",
		);
		(window as any).$message?.error("Falha ao alterar senha. Tente novamente.");
	}
};
</script>
