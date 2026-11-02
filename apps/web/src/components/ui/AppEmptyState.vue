<script setup lang="ts">
import AppIcon from "./AppIcon.vue";

defineProps<{
  icon?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="empty-state">
    <AppIcon v-if="icon" :name="icon" class="empty-icon" />
    <p class="empty-title">{{ title }}</p>
    <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-12) 0;
  gap: var(--space-3);
}

.empty-icon {
  font-size: 64px;
  opacity: 0.3;
  color: var(--color-primary);
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.empty-subtitle {
  font-size: 13px;
  opacity: 0.7;
  margin: 0;
  color: var(--color-text-2);
}
</style>
