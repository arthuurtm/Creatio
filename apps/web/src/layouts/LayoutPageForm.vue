<template>
  <div class="app-form-wrapper">
    <div class="header-actions">
      <slot name="header-actions" />
    </div>

    <!-- Centered Card Container -->
    <div class="card-container">
      <n-card
        class="auth-card"
        content-style="padding: 40px 32px;"
        :bordered="true"
      >
        <!-- Logo -->
        <div class="logo-container">
          <slot name="logo">
            <Logo style="height: 40px;" />
          </slot>
        </div>

        <!-- Progress Steps (Dots) -->
        <div v-if="totalSteps && totalSteps > 1" class="step-dots-container">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="step-pill"
            :class="{
              'step-pill--active': step === currentStep,
              'step-pill--done': step < (currentStep ?? 1),
            }"
          />
        </div>

        <!-- Title & Subtitle -->
        <div class="title-section">
          <h2 class="card-title">
            <slot name="title">{{ title }}</slot>
          </h2>
          <p class="card-subtitle">
            <slot name="subTitle">{{ subTitle }}</slot>
          </p>
        </div>

        <!-- Form Slot Content -->
        <div class="form-content-slot">
          <slot />
        </div>

        <!-- Card Footer -->
        <div class="card-footer">
          <slot name="formInfo" />
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from "@/components/ui/Logo.vue";

defineProps({
  title: String,
  subTitle: String,
  currentStep: Number,
  totalSteps: Number,
});
</script>

<style scoped>
/* Wrapper de página inteira com fundo pontilhado — identidade visual do produto */
.app-form-wrapper {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: var(--color-surface);
  background-size: var(--canvas-dot-size) var(--canvas-dot-size);
  background-image: radial-gradient(circle, var(--canvas-dot-color) 2px, transparent 1.5px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: var(--space-6) var(--space-4);
}

.header-actions {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  z-index: 10;
}

.card-container {
  width: 100%;
  max-width: 420px;

}

.auth-card {
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-1) !important;
  background-color: transparent !important;
  background-color: var(--color-bg) !important;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.logo-container :deep(img),
.logo-container :deep(svg) {
  height: 40px;
  width: auto;
}

/* Progress steps indicator */
.step-dots-container {
  display: flex;
  justify-content: center;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}

.step-pill {
  height: 4px;
  width: 8px;
  border-radius: 2px;
  background-color: var(--color-border);
  transition: all var(--transition-slow);
}

.step-pill--done {
  background-color: var(--color-primary);
  opacity: 0.4;
}

.step-pill--active {
  background-color: var(--color-primary);
  width: 20px;
}

/* Títulos */
.title-section {
  text-align: center;
  margin-bottom: var(--space-8);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin: 0 0 var(--space-1) 0;
  color: var(--color-text);
}

.card-subtitle {
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.7;
  margin: 0;
  color: var(--color-text-3);
}

.form-content-slot {
  min-height: auto;
}

.card-footer {
  font-size: 13px;
  opacity: 0.8;
  margin-top: var(--space-6);
  text-align: center;
  color: var(--color-text-3);
}

@media (max-width: 480px) {
  .app-form-wrapper {
    padding: 0;
    align-items: stretch;
  }

  .card-container {
    max-width: 100%;
    display: flex;
  }

  .auth-card {
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    background-color: var(--color-bg) !important;
  }
}
</style>
