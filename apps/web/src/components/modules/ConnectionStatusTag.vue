<script setup lang="ts">
import { computed } from "vue";
import { NIcon, NTag, NTooltip } from "naive-ui";
import { useConnectionStatus } from "@/composables/useConnectionStatus";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { getIconComponent } from "@/utils/icons";

const persistence = useEditorPersistence();
const { delayedStatus, isSpinning, icon, text } = useConnectionStatus(persistence.requestStatus);

const tagType = computed(() => {
  switch (delayedStatus.value) {
    case "ERROR":
      return "error";
    case "SENDING":
    case "WAITING":
      return "info";
    case "SUCCESS":
      return "success";
    case "IDLE":
    default:
      return "default";
  }
});

const displayText = computed(() => {
  if (delayedStatus.value === "ERROR") {
    return persistence.saveError.value || text.value;
  }
  return text.value;
});

const tooltipText = computed(() => {
  switch (delayedStatus.value) {
    case "ERROR":
      return "Erro na sincronização. Clique para tentar novamente.";
    case "SENDING":
      return "Salvando alterações na nuvem...";
    case "WAITING":
      return "Carregando dados do projeto...";
    case "SUCCESS":
      return "Todas as alterações foram salvas!";
    case "IDLE":
    default:
      return "Status sincronizado. Clique para forçar o salvamento.";
  }
});

function handleClick() {
  if (delayedStatus.value !== "SENDING" && delayedStatus.value !== "WAITING") {
    void persistence.saveState();
  }
}
</script>

<template>
  <NTooltip trigger="hover" placement="bottom">
    <template #trigger>
      <NTag
        :type="tagType"
        round
        class="status-tag cursor-pointer select-none transition-all duration-300"
        @click="handleClick"
      >
        <template #icon>
          <NIcon
            size="16"
            class="status-icon"
            :class="{ 'status-icon-spin': isSpinning }"
          >
            <component :is="getIconComponent(icon)" />
          </NIcon>
        </template>
        <span class="status-text">{{ displayText }}</span>
      </NTag>
    </template>
    {{ tooltipText }}
  </NTooltip>
</template>

<style scoped>
.status-tag {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.status-icon-spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

