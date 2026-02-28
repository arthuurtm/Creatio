import type { EditorState } from "@projeto/types";
import { debounce } from "lodash-es";
import { computed, watch } from "vue";
import { useSyncProtection } from "@/composables/useSyncProtection.ts";
import { http, ws } from "@/functions";
import { useEditorStore } from "@/stores/editor";

export function editorConnection() {
	const store = useEditorStore();
	const base = computed(() => store.$state);
	const { isLocalStateNewer } = useSyncProtection(base);
	const { data, status, connect, send, disconnect, error, requestStatus } =
		ws<EditorState>(http.getApiUrl("ws"));

	async function start() {
		await connect();
	}

	const slowSend = debounce((state) => {
		const payload = JSON.parse(JSON.stringify(state));
		send({ event: "game:lab:update:json", payload });
	}, 500);

	function stop() {
		disconnect();
	}

	// observa as respostas do servidor
	watch(data, (msg) => {
		if (!msg || !msg.event) return;
		if (msg.event === "game:lab:get:json:success") {
			if (msg.payload && !isLocalStateNewer(msg.payload)) {
				store.setState(msg.payload);
			}
		}
	});

	// atualiza em tempo real
	watch(
		base,
		(newState) => {
			if (status.value === "OPEN") {
				try {
					slowSend(newState);
				} catch (err) {
					console.error("Erro ao preparar payload:", err);
				}
			}
		},
		{ deep: true },
	);

	return { start, stop, connStatus: status, send, data, error, requestStatus };
}
