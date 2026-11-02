import { computed, onScopeDispose, ref, watch, type Ref } from "vue";
import type { RequestStatusValues } from "@projeto/types";

const ICONS: Record<RequestStatusValues, string> = {
  IDLE: "cloud",
  SENDING: "sync",
  ERROR: "cloud_alert",
  WAITING: "sync",
  SUCCESS: "cloud_done",
};

const TEXTS: Record<RequestStatusValues, string> = {
  IDLE: "Salvo",
  SENDING: "Salvando...",
  ERROR: "Erro ao salvar",
  WAITING: "Carregando...",
  SUCCESS: "Salvo",
};

// Tempo mínimo para exibir estados de carregamento (evita que 'Salvando...' pisque muito rápido)
const MIN_LOADING_TIME = 800;
// Tempo que o status 'Salvo' (SUCCESS) permanece visível com destaque antes de voltar a IDLE
const SUCCESS_DELAY = 2500;
// Tempo que o status de erro permanece exibido antes de retornar para IDLE
const ERROR_DELAY = 5000;

export function useConnectionStatus(requestStatus: Ref<RequestStatusValues>) {
  const delayedStatus = ref<RequestStatusValues>(requestStatus.value);
  let loadingStartTime = 0;
  let minLoadingTimer: ReturnType<typeof setTimeout> | null = null;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  if (delayedStatus.value === "SUCCESS") {
    applyResolvedStatus("SUCCESS");
  } else if (delayedStatus.value === "SENDING" || delayedStatus.value === "WAITING") {
    loadingStartTime = Date.now();
  }

  function clearTimers() {
    if (minLoadingTimer) {
      clearTimeout(minLoadingTimer);
      minLoadingTimer = null;
    }
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  }

  function handleStatusChange(newStatus: RequestStatusValues) {
    if (newStatus === "SENDING" || newStatus === "WAITING") {
      clearTimers();
      loadingStartTime = Date.now();
      delayedStatus.value = newStatus;
      return;
    }

    // Se estamos atualmente exibindo um estado de carregamento, garante o tempo mínimo
    if (delayedStatus.value === "SENDING" || delayedStatus.value === "WAITING") {
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

      if (remaining > 0) {
        if (minLoadingTimer) clearTimeout(minLoadingTimer);
        minLoadingTimer = setTimeout(() => {
          minLoadingTimer = null;
          applyResolvedStatus(newStatus);
        }, remaining);
        return;
      }
    }

    applyResolvedStatus(newStatus);
  }

  function applyResolvedStatus(status: RequestStatusValues) {
    clearTimers();
    delayedStatus.value = status;

    if (status === "SUCCESS") {
      resetTimer = setTimeout(() => {
        resetTimer = null;
        if (requestStatus.value === "SUCCESS" || requestStatus.value === "IDLE") {
          delayedStatus.value = "IDLE";
        }
      }, SUCCESS_DELAY);
    } else if (status === "ERROR") {
      resetTimer = setTimeout(() => {
        resetTimer = null;
        if (requestStatus.value === "ERROR") {
          delayedStatus.value = "IDLE";
        }
      }, ERROR_DELAY);
    }
  }

  watch(requestStatus, (newVal) => {
    handleStatusChange(newVal);
  });

  onScopeDispose(() => {
    clearTimers();
  });

  const isSpinning = computed(() => {
    return delayedStatus.value === "SENDING" || delayedStatus.value === "WAITING";
  });

  return {
    delayedStatus,
    isSpinning,
    icon: computed(() => ICONS[delayedStatus.value]),
    text: computed(() => TEXTS[delayedStatus.value]),
  };
}

