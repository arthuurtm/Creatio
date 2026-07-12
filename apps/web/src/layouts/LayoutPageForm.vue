<template>
  <v-main class="app-form d-flex align-center justify-center py-6 px-4">
    <!-- FLOATING BACKGROUND GLOWS (MESH GRADIENT) -->
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
    <div class="glow-orb orb-3"></div>

    <!-- MOUSE GLOW ORB -->
    <div
      class="mouse-glow"
      :style="{
        left: `${mouseX}px`,
        top: `${mouseY}px`
      }"
    ></div>

    <div class="header-actions">
      <slot name="header-actions" />
    </div>

    <!-- GLASSMORPHIC AUTH CARD -->
    <v-card max-width="440" width="100%" class="auth-card rounded-2xl" flat>
      <!-- PROGRESS LINE FOR MULTI-STEP -->
      <!-- <v-progress-linear
        v-if="totalSteps && totalSteps > 1"
        :model-value="((currentStep ?? 1) / totalSteps) * 100"
        color="primary"
        height="3"
        class="position-absolute top-0 left-0 right-0"
        style="z-index: 10;"
      /> -->

      <v-card-text class="pa-8 pa-sm-10 d-flex flex-column" style="z-index: 2; position: relative;">
        <!-- LOGO (CENTERED) -->
        <div class="logo-wrapper d-flex justify-center mb-6">
          <slot name="logo">
            <Logo style="height: 48px;" />
          </slot>
        </div>

        <!-- INDICADOR DE PROGRESSO MULTI-STEP (dots) -->
        <div v-if="totalSteps && totalSteps > 1" class="step-dots d-flex justify-center ga-2 mb-6">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="step-dot"
            :class="{ 'step-dot--active': step === currentStep, 'step-dot--done': step < (currentStep ?? 1) }"
          />
        </div>

        <!-- TITLE & SUBTITLE -->
        <div class="text-center mb-8">
          <h2 class="text-h5 font-weight-bold tracking-tight mb-2 text-high-emphasis">
            <slot name="title">{{ title }}</slot>
          </h2>
          <p class="text-body-2 text-medium-emphasis">
            <slot name="subTitle">{{ subTitle }}</slot>
          </p>
        </div>

        <!-- FORM CONTENT -->
        <div class="form-slot-wrapper">
          <slot />
        </div>

        <!-- FOOTER INFO -->
        <div class="text-caption text-medium-emphasis mt-8 text-center">
          <slot name="formInfo" />
        </div>
      </v-card-text>
    </v-card>
  </v-main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Logo from '@/components/ui/Logo.vue';

defineProps({
  title: String,
  subTitle: String,
  currentStep: Number,
  totalSteps: Number,
})

const mouseX = ref(0);
const mouseY = ref(0);

function handleMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.app-form {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  position: relative;
  background-color: rgb(var(--v-theme-background));
  overflow: hidden;
  z-index: 1;
}

/* MOUSE GLOW ORB */
.mouse-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.15) 0%, rgba(0,0,0,0) 70%);
  filter: blur(85px);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.25s cubic-bezier(0.25, 1, 0.5, 1), top 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: -1;
}

/* FLOATING GLOW ORBS */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: -1;
}

.orb-1 {
  top: -5%;
  left: 10%;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.25) 0%, rgba(0,0,0,0) 70%);
  animation: floatOrb1 25s infinite alternate ease-in-out;
}

.orb-2 {
  bottom: -5%;
  right: 10%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(var(--v-theme-secondary), 0.2) 0%, rgba(0,0,0,0) 70%);
  animation: floatOrb2 30s infinite alternate ease-in-out;
}

.orb-3 {
  top: 40%;
  left: 45%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.12) 0%, rgba(0,0,0,0) 70%);
  animation: floatOrb3 20s infinite alternate ease-in-out;
}

@keyframes floatOrb1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(60px, 80px) scale(1.15); }
}

@keyframes floatOrb2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-80px, -60px) scale(1.2); }
}

@keyframes floatOrb3 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, -50px) scale(1.1); }
}

.header-actions {
  position: fixed;
  top: 0;
  right: 0;
  padding: 8px;
  z-index: 10;
}

/* FROSTED GLASS CARD */
.auth-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px !important;
  background: rgba(var(--v-theme-surface), 0.72) !important;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(var(--v-border-color), 0.08) !important;
  box-shadow: 0 24px 64px -16px rgba(0, 0, 0, 0.16) !important;
  transition: all 0.3s ease;
}

.logo-wrapper {
  height: 48px;
}

.logo-wrapper :deep(.logo) {
  height: 48px;
  width: auto;
}

.tracking-tight {
  letter-spacing: -0.02em !important;
}

@media (max-width: 600px) {
  .app-form {
    padding: 0 !important;
  }

  .auth-card {
    border: none !important;
    border-radius: 0 !important;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: rgb(var(--v-theme-background)) !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
  }

  .glow-orb, .mouse-glow {
    display: none;
  }
}

/* STEP DOTS — indicador de progresso */
.step-dots {
  margin-bottom: 4px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-on-surface), 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.step-dot--done {
  background-color: rgba(var(--v-theme-primary), 0.5);
  width: 8px;
}

.step-dot--active {
  background-color: rgb(var(--v-theme-primary));
  width: 24px;
  border-radius: 4px;
}
</style>
