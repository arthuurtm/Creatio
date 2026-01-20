import { computed, watch } from "vue";
import { useSyncProtection } from "#src/composables/useSyncProtection.ts";
import type { EditorState } from "#types/domain/editor/models.ts";
import type { WebSocketMessage } from "#types/shared/websocket.ts";
import { http, ws } from "@/functions";
import { useEditorStore } from "@/stores/editor";

export function editorConnection() {
	const store = useEditorStore();

	// 1. Computed para observar o estado
	const base = computed(() => store.$state);

	const { isLocalStateNewer } = useSyncProtection(base);
	const { data, status, connect, send, disconnect, error, requestStatus } = ws(
		http.getApiUrl("ws"),
	);

	async function start() {
		await connect();
	}

	function stop() {
		disconnect();
	}

	// Recebe do servidor
	watch(data, (msg: WebSocketMessage<EditorState>) => {
		if (!msg || !msg.event) return;

		if (msg.event === "game:lab:get:json:success") {
			// Passa o dado recebido para verificação
			if (msg.payload && !isLocalStateNewer(msg.payload)) {
				store.setState(msg.payload);
			}
		}
	});

	// Envia quando algo muda
	watch(
		base,
		(newState) => {
			if (status.value === "OPEN") {
				try {
					const payload = JSON.parse(JSON.stringify(newState));
					send({ event: "game:lab:update:json", payload });
				} catch (err) {
					console.error("Erro ao preparar payload:", err);
				}
			}
		},
		{ deep: true },
	);

	return { start, stop, connStatus: status, send, data, error, requestStatus };
}
