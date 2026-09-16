import { computed, ref, watch, type Ref } from "vue";
import { debounce } from "lodash-es";
import type { RequestStatusValues } from "@projeto/types";

const ICONS: Record<RequestStatusValues, string> = {
  IDLE: "cloud",
  SENDING: "cloud_sync",
  ERROR: "cloud_alert",
  WAITING: "cloud_sync",
  SUCCESS: "cloud_done",
};

const TEXTS: Record<RequestStatusValues, string> = {
  IDLE: "Salvo",
  SENDING: "Salvando...",
  ERROR: "Erro ao salvar",
  WAITING: "Carregando...",
  SUCCESS: "Salvo",
};

export function useConnectionStatus(requestStatus: Ref<RequestStatusValues>) {
  const delayedStatus = ref<RequestStatusValues>(requestStatus.value);
  const updateDelayed = debounce((s: RequestStatusValues) => (delayedStatus.value = s), 500);

  watch(requestStatus, (s) => updateDelayed(s));

  return {
    delayedStatus,
    icon: computed(() => ICONS[delayedStatus.value]),
    text: computed(() => TEXTS[delayedStatus.value]),
  };
}
