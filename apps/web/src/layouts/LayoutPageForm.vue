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
            :class="{ 'step-pill--active': step === currentStep, 'step-pill--done': step < (currentStep ?? 1) }"
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
import Logo from '@/components/ui/Logo.vue';

defineProps({
  title: String,
  subTitle: String,
  currentStep: Number,
  totalSteps: Number,
})
</script>

<style scoped>
/* Wrapper filling full page */
.app-form-wrapper {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: var(--n-body-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 24px 16px;
}

.header-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.card-container {
  width: 100%;
  max-width: 420px;
}

/* Elegant, flat card with a subtle border and standard shadow */
.auth-card {
  border-radius: 12px !important;
  background-color: var(--n-card-color) !important;
  border: 1px solid var(--n-border-color) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01) !important;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
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
  gap: 6px;
  margin-bottom: 24px;
}

.step-pill {
  height: 4px;
  width: 8px;
  border-radius: 2px;
  background-color: var(--n-border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-pill--done {
  background-color: rgba(var(--v-theme-primary), 0.4);
}

.step-pill--active {
  background-color: var(--n-primary-color);
  width: 20px;
}

/* Titles and sub-titles styling */
.title-section {
  text-align: center;
  margin-bottom: 28px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin: 0 0 6px 0;
  color: var(--n-title-text-color);
}

.card-subtitle {
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.7;
  margin: 0;
  color: var(--n-text-color-3);
}

.form-content-slot {
  min-height: auto;
}

.card-footer {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 24px;
  text-align: center;
  color: var(--n-text-color-3);
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
    background-color: var(--n-body-color) !important;
  }
}
</style>
