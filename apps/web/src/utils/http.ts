import { debounce } from "lodash-es";
import type { RouteOptions } from "@projeto/types";
import { showToast } from "@/plugins/toast";
import { useUserStore } from "@/stores/user";

class FormError extends Error {
	constructor(message: string, details = {}) {
		super(message);
		Object.assign(this, { ...details });
	}
}

interface EndpointParams {
	type: RouteOptions;
	route: string;
	querys?: Record<string, any>;
	contentType?: string;
}

interface ApiResponse {
	message?: string;
	[key: string]: any;
}

type Endpoint = EndpointParams;
type EndpointBody = FormData | Record<string, any> | null;
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function getApiUrl(
	type: RouteOptions,
	route?: any,
	querys?: Record<string, any> | null,
) {
	const origin = window.location.origin;

	if (type === "ws") {
		return `${origin.replace(/^(https?:\/\/)/, "ws://")}/ws`;
	}

	if (!type || !route) {
		console.error("Tipo ou rota não fornecidos.");
		return "";
	}

	let url = `${origin}/api/${type}/${route}`;

	if (querys) {
		url += `?${buildQuery(querys)}`;
	}
	return url;
}

function buildQuery(params = {}) {
	if (!params) {
		return "";
	}
	const query = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			// envia array como ?tags=a&tags=b&tags=c
			value.forEach((v) => {
				query.append(key, v);
			});
		} else if (typeof value === "object" && value !== null) {
			// envia objeto como JSON string
			query.append(key, JSON.stringify(value));
		} else if (value !== undefined && value !== null) {
			query.append(key, String(value));
		}
	});

	return query.toString();
}

/**
 *
 * @param {*} endpoint
 * @param {string} endpoint.type tipo de endpoint
 * @param {string} endpoint.route rota do endpoint
 * @param {string} endpoint.query querys adicionais (opcional)
 * @param {string} endpoint.contentType content-type do endpoint (opcional, padrão: application/json)
 * @param {*} body corpo da requisição (opcional)
 * @returns
 */
const request = async (
	endpoint: EndpointParams,
	method: HttpMethod = "GET",
	body: EndpointBody = null,
) => {
	const getHttpStatusMessage = (status: number) => {
		const messages: Record<number, string> = {
			400: "A requisição não pôde ser processada. Tente novamente.",
			401: "Sua sessão expirou ou você não está autenticado.",
			403: "Você não tem permissão para acessar este recurso.",
			404: "O recurso solicitado não foi encontrado.",
			500: "Estamos enfrentando um problema no servidor. Tente novamente mais tarde.",
			503: "O serviço está temporariamente indisponível. Por favor, tente mais tarde.",
		};
		return messages[status] || "Erro desconhecido";
	};

	const isFormData = body instanceof FormData;

	const config: RequestInit = {
		credentials: "include",
		method,
		headers: isFormData
			? undefined
			: {
					"Content-Type": endpoint.contentType || "application/json",
				},
		body: isFormData ? body : body ? JSON.stringify(body) : null,
	};

	try {
		const response = await fetch(
			getApiUrl(endpoint.type, endpoint.route, endpoint.querys),
			config,
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const serverMessage =
				errorData.message || getHttpStatusMessage(response.status);

			// 401 — sessão expirada ou não autenticado: limpa store e redireciona
			if (response.status === 401) {
				useUserStore().clearUserData();
				const { default: router } = await import('@/router');
				if (router.currentRoute.value.name !== 'Login') {
					router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
				}
			}

			throw new FormError(serverMessage, {
				...errorData,
				status: response.status,
			});
		}

		const res = response ? await response.json() : {};

		console.groupCollapsed(
			`%cHTTP ← SUCCESS %c${method} ${endpoint.route}`,
			"color:#3a7;font-weight:bold;",
			"color:#555;",
		);
		console.info("payload:", res);
		console.debug("endpoint:", endpoint);
		console.groupEnd();

		return res;
	} catch (error) {
		const err = error as FormError & { status?: number };

		const status = err.status ?? "N/A";
		const route = endpoint.route ?? "unknown";

		console.groupCollapsed(
			`%cHTTP ← ERROR %c${method} ${route} %c(${status})`,
			"color:#e33;font-weight:bold;",
			"color:#555;",
			"color:#999;",
		);
		if (err.message) {
			console.error("message:", err.message);
		}
		console.debug("details:", err);
		console.debug("endpoint:", endpoint);
		console.groupEnd();

		throw err;
	}
};
const get = (endpoint: EndpointParams) => request(endpoint, "GET");
const post = (endpoint: EndpointParams, body: EndpointBody) =>
	request(endpoint, "POST", body);
const put = (endpoint: EndpointParams, body: EndpointBody) =>
	request(endpoint, "PUT", body);
const del = (endpoint: EndpointParams, body: EndpointBody = null) => request(endpoint, "DELETE", body);
get.slow = debounce((endpoint) => request(endpoint, "GET"), 500);

async function handleUserData() {
	try {
		const res = await get({ type: "database", route: "getUserData" });

		if (res) {
			useUserStore().setUserData({
				id: res.id,
				name: res.nickname,
				username: res.username,
				email: res.email,
				profilePicture: res.profilePic,
			});
			return true;
		}
		throw new Error("Dados do usuário não encontrados");
	} catch (error) {
		console.error(`Erro ao recuperar dados: ${error}`);
		useUserStore().clearUserData();
		return false;
	}
}
async function isAuthenticated() {
	return handleUserData();
}
async function logout() {
	const res = await del({ type: "database", route: "logout" });
	if (res) {
		useUserStore().clearUserData();
		return true;
	} else {
		return false;
	}
}
async function logoutAll() {
	del({ type: "database", route: "logoutAll" }).then((result) => {
		if (result) {
			return true;
		}
		return;
	});
}
const auth = { isAuthenticated, logout, logoutAll };

export default { get, post, put, del, getApiUrl, auth };
