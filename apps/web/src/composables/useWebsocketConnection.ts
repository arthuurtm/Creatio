import type { EditorState } from "@projeto/types";
import { debounce } from "lodash-es";
import { watch } from "vue";
import { http, ws } from "@/utils";
import { useEditorStore } from "@/stores/editor";

export function editorConnection() {
  const store = useEditorStore();
  const { data, status, connect, send, disconnect, error, requestStatus } =
    ws<EditorState>(http.getApiUrl("ws"));

  async function start() {
    await connect();
  }

  function stop() {
    disconnect();
  }

  // Serializa apenas os campos que o servidor precisa — sem Proxy, sem computed
  const slowSend = debounce(() => {
    const payload = {
      info: JSON.parse(JSON.stringify(store.info)),
      nodes: JSON.parse(JSON.stringify(store.nodes)),
      connections: JSON.parse(JSON.stringify(store.connections)),
    };
    send({ event: "project:lab:update:json", payload });
  }, 500);

  // Resposta do servidor ao get inicial
  watch(data, (msg) => {
    if (!msg?.event) return;
    if (msg.event === "project:lab:get:json:success" && msg.payload) {
      // Só hidrata se o servidor realmente tiver dados (nodes não vazio)
      // Evita sobrescrever estado local com snapshot vazia na reconexão
      const remote = msg.payload as EditorState;
      const hasRemoteData = remote.nodes?.length > 0 || remote.connections?.length > 0;
      if (hasRemoteData) {
        store.setState(remote);
      }
    }
  });

  // Envia ao servidor sempre que nodes ou connections mudarem
  // flush:'post' garante que roda depois de todas as mutations da microtask
  watch(
    () => [store.nodes, store.connections],
    () => {
      if (status.value === "OPEN") {
        slowSend();
      }
    },
    { deep: true, flush: "post" },
  );

  return { start, stop, connStatus: status, send, data, error, requestStatus };
}
