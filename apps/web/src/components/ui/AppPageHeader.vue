<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="page-header">
    <div class="page-header-text">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.page-header-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.page-subtitle {
  font-size: 13px;
  opacity: 0.7;
  margin: 0;
  color: var(--color-text-2);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
