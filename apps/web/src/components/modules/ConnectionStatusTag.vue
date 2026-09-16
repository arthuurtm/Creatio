<script setup lang="ts">
import { NIcon, NTag } from "naive-ui";
import { useConnectionStatus } from "@/composables/useConnectionStatus";
import { useEditorPersistence } from "@/composables/useEditorPersistence.ts";
import { getIconComponent } from "@/utils/icons";

const persistence = useEditorPersistence();
const { delayedStatus, icon, text } = useConnectionStatus(persistence.requestStatus);
</script>

<template>
  <NTag :type="delayedStatus === 'ERROR' ? 'error' : 'success'" round>
    <template #icon>
      <NIcon size="16"><component :is="getIconComponent(icon)" /></NIcon>
    </template>
    {{ persistence.saveError.value || text }}
  </NTag>
</template>
