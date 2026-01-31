import { debounce } from "lodash-es";
import { onUnmounted, ref, shallowRef } from "vue";
import type {
	RequestStatusValues,
	ConnStatusValues as StatusValues,
	WebSocketError,
	WebSocketMessage,
} from "#types/shared/websocket.ts";

function normalizeWsError(err: unknown): WebSocketError {
	if (typeof err === "object" && err && "message" in err) {
		return {
			message: String((err as any).message),
			raw: err,
		};
	}

	if (err instanceof Event) {
		return {
			message: "Erro de conexão com o servidor.",
			raw: err,
		};
	}

	if (err instanceof Error) {
		return {
			message: err.message,
			raw: err,
		};
	}

	return {
		message: "Erro desconhecido.",
		raw: err,
	};
}

/**
 * @abstract Composable para gerenciar uma conexão WebSocket com reconexão automática e gerenciamento de ciclo de vida.
 */
export default function useWebSocket(
	url: string,
	options: {
		autoReconnect?: boolean;
		reconnectLimit?: number;
		reconnectInterval?: number;
		maxReconnectInterval?: number;
	} = {},
) {
	const {
		autoReconnect = true,
		reconnectLimit = 5,
		reconnectInterval = 2000,
		maxReconnectInterval = 30000,
	} = options;

	// --- Estado Reativo ---
	const data = ref<WebSocketMessage>();
	const status = ref<StatusValues>("CLOSED");
	const requestStatus = ref<RequestStatusValues>("IDLE");
	const ws = shallowRef<WebSocket>();
	const error = ref<WebSocketMessage<
		WebSocketError | Event | Record<string, unknown>
	> | null>();
	const retryCount = ref(0);
	let explicitClose = false;
	let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

	const _setupEventListeners = () => {
		if (!ws.value) return;

		ws.value.onmessage = (event: MessageEvent) => {
			try {
				const res = JSON.parse(event.data);
				data.value = res;

				const evt = res.event ?? "unknown";
				const payload = res.payload ?? {};

				if (evt.endsWith(":error")) {
					console.groupCollapsed(
						`%cWS ← ERROR %c${evt}`,
						"color:#f33;font-weight:bold;",
						"color:#aaa;",
					);

					console.error("message:", payload.message ?? "(no message)");
					console.debug("raw:", res);

					console.groupEnd();

					requestStatus.value = "ERROR";
					return setError(payload, evt || "server:error");
				}

				console.groupCollapsed(
					`%cWS ← EVENT %c${evt}`,
					"color:#3a7;font-weight:bold;",
					"color:#aaa;",
				);

				console.info("payload:", payload);
				console.debug("raw:", res);

				console.groupEnd();

				requestStatus.value = "SUCCESS";
			} catch (err) {
				console.groupCollapsed(
					`%cWS ← PARSE ERROR`,
					"color:#e90;font-weight:bold;",
				);
				console.error(err);
				console.groupEnd();

				requestStatus.value = "ERROR";
				setError(err, "server:error");
			}
		};

		ws.value.onerror = (e) => {
			console.error("Erro no WebSocket (Runtime):", e);
			setError(e, "server:error");
		};

		ws.value.onclose = (e) => {
			ws.value = undefined;

			if (explicitClose) {
				console.log("Conexão WebSocket fechada intencionalmente.");
				status.value = "CLOSED";
			} else {
				console.warn(
					`WebSocket desconectado. Código: ${e.code}. Motivo: ${e.reason || "Desconhecido"}`,
				);
				if (autoReconnect && retryCount.value < reconnectLimit) {
					_reconnect();
				} else {
					status.value = "CLOSED";
					console.error("Limite de tentativas de reconexão atingido.");
				}
			}
		};
	};

	const _request = async ({ event, payload = {} }: WebSocketMessage) => {
		console.log(`Enviando evento WebSocket: ${event}`, payload);
		return new Promise<void>((resolve, reject) => {
			if (!ws.value || status.value !== "OPEN") {
				const err: WebSocketMessage<WebSocketError> = {
					event: "client:error",
					payload: {
						message: "Não conectado ao servidor.",
						raw: {},
					},
				};
				requestStatus.value = "ERROR";
				error.value = err;
				console.warn(err, { status: status.value });
				return reject(err);
			}

			requestStatus.value = "SENDING";

			try {
				const dataToSend = JSON.stringify({ event, payload });
				ws.value.send(dataToSend);

				// pronto: enviada ao buffer
				requestStatus.value = "WAITING";
				resolve();
			} catch (err) {
				const e = err as WebSocketMessage<WebSocketError>;
				requestStatus.value = "ERROR";
				error.value = e;
				console.error("Falha ao enviar mensagem:", e);
				reject(e);
			}
		});
	};

	const _reconnect = () => {
		status.value = "RECONNECTING";
		retryCount.value++;

		const delay =
			Math.min(
				reconnectInterval * 2 ** (retryCount.value - 1),
				maxReconnectInterval,
			) *
			(Math.random() * 0.2 + 0.9);

		console.log(
			`Tentando reconectar em ${Math.round(delay / 1000)}s... (Tentativa ${retryCount.value})`,
		);

		reconnectTimer = setTimeout(() => {
			connect();
		}, delay);
	};

	/** Inicia a conexão WebSocket. */
	const connect = async () => {
		if (
			ws.value ||
			status.value === "CONNECTING" ||
			status.value === "RECONNECTING"
		)
			return;

		status.value = "CONNECTING";
		explicitClose = false;
		error.value = null;

		return new Promise<void>((resolve, reject) => {
			try {
				const socket = new WebSocket(url);
				ws.value = socket;

				socket.onopen = () => {
					console.log("WebSocket conectado com sucesso!");
					status.value = "OPEN";
					retryCount.value = 0;
					_setupEventListeners();
					resolve();
				};

				socket.onerror = (e) => {
					status.value = "CLOSED";
					reject(setError(e, "server:error"));
				};

				socket.onclose = () => {
					if (status.value === "CONNECTING") {
						status.value = "CLOSED";
					}
				};
			} catch (e) {
				status.value = "CLOSED";
				reject(setError(e, "server:error"));
			}
		});
	};

	const setError = (payload: unknown, eventName: string = "client:error") => {
		const normalized = normalizeWsError(payload);
		error.value = {
			event: eventName,
			payload: normalized,
		};
		requestStatus.value = "ERROR";
		return normalized;
	};

	const send = async (endpoint: WebSocketMessage) => {
		_request(endpoint);
	};
	send.slow = debounce((endpoint: WebSocketMessage) => _request(endpoint), 500);

	/** Fecha a conexão WebSocket intencionalmente. */
	const disconnect = () => {
		if (ws.value) {
			console.log("Fechando conexão WebSocket...");
			explicitClose = true;
			status.value = "CLOSING";
			clearTimeout(reconnectTimer);
			ws.value.close(1000, "Fechamento intencional pelo cliente.");
		}
	};

	onUnmounted(() => {
		disconnect();
	});

	return {
		data,
		status,
		error,
		retryCount,
		requestStatus,
		connect,
		send,
		disconnect,
		ws,
		setError,
	};
}
