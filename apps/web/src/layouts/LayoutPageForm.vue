<template>
  <v-main class="app-form d-flex align-center justify-center">
    <div class="header-actions">
      <slot name="header-actions" />
    </div>

    <v-sheet max-width="900" width="100%" rounded="xl" class="main-container d-grid">
      <!-- left -->
      <div class="left d-flex flex-column ga-5">
        <div class="logo" style="flex: 0 1; justify-content: start; align-items: start; display: flex;">
          <slot name="logo">
            <Logo />
          </slot>
        </div>

        <v-container>
          <div class="text-h4 font-weight-medium">
            <slot name="title">{{ title }}</slot>
          </div>

          <div class="text-body-1 text-medium-emphasis">
            <slot name="subTitle">{{ subTitle }}</slot>
          </div>
        </v-container>

        <div class="text-body-2">
          <slot name="formInfo" />
        </div>
      </div>
      <!-- right -->
      <div class="right d-flex flex-column overflow-y-auto">
        <slot />
      </div>
    </v-sheet>
  </v-main>
</template>

<script setup lang="ts">
import Logo from '@/components/ui/Logo.vue';
defineProps({
  title: String,
  subTitle: String,
})
</script>

<style scoped>
.app-form {
  width: 100%;
  height: 100%;
}

.header-actions {
  position: fixed;
  top: 0;
  right: 0;
  padding: 8px;
}

.main-container {
  display: grid;
  grid-template-columns: 0.4fr 0.6fr;
  gap: 24px;
  padding: 48px;
  min-height: 420px;
}

/* left section */
.left .logo {
  height: 64px;
}

/* responsivo */
@media (max-width: 960px) {
  .main-container {
    max-width: 90%;
    grid-template-columns: 1fr;
    padding: 32px;
    border-radius: 16px;
  }
}

@media (max-width: 600px) {
  .main-container {
    padding: 24px;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
