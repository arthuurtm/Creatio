import { type Ref, ref } from "vue";
import { type LocationQueryValue, useRouter } from "vue-router";

// --- TYPES & INTERFACES ---

export interface FieldParams<T = any> {
	val: T;
	err: boolean;
	errVal: string;
}

export interface MultiStepFormOptions {
	initialStep?: number;
	totalSteps?: number;
}

export interface RedirectOptions {
	name?: string;
	path?: string | LocationQueryValue[];
	params?: Record<string, any>;
}

// --- UTILS ---

/**
 * Inicializa um estado de campo padrão.
 */
export function initField<T = string>(initialValue: any = ""): FieldParams<T> {
	return {
		val: initialValue,
		err: false,
		errVal: "",
	};
}

// --- COMPOSABLE ---

export default function useMultiStepForm(options: MultiStepFormOptions = {}) {
	const router = useRouter();

	// States
	const currentStep = ref(options.initialStep || 1);
	const loading = ref(false);

	// --- STEP NAVIGATION ---

	const nextStep = () => {
		if (options.totalSteps && currentStep.value >= options.totalSteps) return;
		currentStep.value++;
	};

	const prevStep = () => {
		if (currentStep.value > 1) currentStep.value--;
	};

	const goToStep = (step: number) => {
		if (step > 0 && (!options.totalSteps || step <= options.totalSteps)) {
			currentStep.value = step;
		}
	};

	// --- ACTIONS ---

	/**
	 * Wrapper para chamadas assíncronas que gerencia o estado de loading.
	 */
	const loaderController = async (action: () => Promise<void> | void) => {
		loading.value = true;
		try {
			await action();
		} catch (err: any) {
			console.error("[Form Error]: ", err);
			throw err; // Repassa o erro para que o componente possa tratar se necessário
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Facilita o redirecionamento entre páginas.
	 */
	const pageRedirect = async ({
		name = "",
		path,
		params = {},
	}: RedirectOptions) => {
		const target = path
			? { path: Array.isArray(path) ? (path[0] || "") : path, params }
			: { name, params };
		return router.push(target);
	};

	/**
	 * Helper para limpar erros de um objeto de formulário (Recurso Novo).
	 * @param formObj - O objeto ref do seu formData
	 */
	const clearFormErrors = (formObj: Ref<Record<string, any>>) => {
		Object.keys(formObj.value).forEach((key) => {
			if (
				formObj.value[key] &&
				typeof formObj.value[key] === "object" &&
				"err" in formObj.value[key]
			) {
				formObj.value[key].err = false;
				formObj.value[key].errVal = "";
			}
		});
	};

	/**
	 * Helper para injetar erro em um campo específico (Recurso Novo).
	 */
	const setFieldError = (field: FieldParams, message: string) => {
		field.err = true;
		field.errVal = message;
	};

	return {
		// States
		currentStep,
		loading,

		// Navigation
		nextStep,
		prevStep,
		goToStep,

		// Logic Helpers
		loaderController,
		pageRedirect,
		clearFormErrors,
		setFieldError,
		initField,
	};
}
