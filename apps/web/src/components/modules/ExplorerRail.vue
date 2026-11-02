<script setup lang="ts">
import { ChevronForward } from "@vicons/ionicons5";
import AppIconBtn from "@/components/ui/AppIconBtn.vue";

defineProps<{
  activeView: "explorer" | "catalog";
}>();

const emit = defineEmits<{
  "select-view": [value: "explorer" | "catalog"];
  expand: [];
}>();
</script>

<template>
  <div class="rail">
    <!-- Botões de Alternância das Telas -->
    <div class="rail-nav">
      <AppIconBtn
        icon="grid_view"
        :type="activeView === 'explorer' ? 'primary' : 'default'"
        :quaternary="activeView !== 'explorer'"
        size="medium"
        tooltip="Estruturas"
        @click="emit('select-view', 'explorer')"
      />
      <AppIconBtn
        icon="interests"
        :type="activeView === 'catalog' ? 'primary' : 'default'"
        :quaternary="activeView !== 'catalog'"
        size="medium"
        tooltip="Catálogo de Blocos"
        @click="emit('select-view', 'catalog')"
      />
    </div>

    <!-- Expand button -->
    <AppIconBtn
      icon="chevron_right"
      tertiary
      size="small"
      tooltip="Expandir painel"
      @click="emit('expand')"
    />
  </div>
</template>

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: var(--space-4) var(--space-2);
}

.rail-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}
</style>
