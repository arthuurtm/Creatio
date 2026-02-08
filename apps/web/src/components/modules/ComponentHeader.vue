<template>
  <v-slide-y-transition leave-absolute>
    <v-app-bar v-if="!hidden" class="px-4" elevation="0" style="border-radius: 0 !important" scroll-behavior="hide">
      <v-container class="d-flex align-center pa-0" style="max-width: 1280px">
        <div class="d-flex align-center gap-4">
          <logo style="cursor: pointer; height: 38px" @click="router.push({ name: 'Home' })" />

          <template v-if="title">
            <span class="mx-4 text-grey">x</span>
            <span class="text-h6 font-weight-bold">{{ title }}</span>
          </template>
        </div>

        <v-divider class="mx-4" inset vertical />

        <nav class="d-flex gap-4 justify-center align-center">
          <slot name="left" />
        </nav>

        <v-spacer />
        <div class="d-flex gap-6 justify-center align-center">
          <slot name="right" />
        </div>
      </v-container>
    </v-app-bar>
  </v-slide-y-transition>
</template>

<script setup lang="ts">
import router from "@/router";
import Logo from "@/components/ui/Logo.vue";

// Props
const props = defineProps<{
  hidden?: Boolean;
  title?: String;
}>();
</script>
