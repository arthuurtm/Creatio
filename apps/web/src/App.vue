<script setup lang="ts">
import { computed } from "vue";
import { darkTheme } from "naive-ui";
import DiscreteSetup from "@/components/ui/DiscreteSetup.vue";
import { useSettingsStore } from "@/stores/global";
import {
	lightThemeOverrides,
	darkThemeOverrides,
} from "@/plugins/naive";

const settingsStore = useSettingsStore();

const activeTheme = computed(() =>
	settingsStore.theme === "dark" ? darkTheme : null
);

const themeOverrides = computed(() =>
	settingsStore.theme === "dark" ? darkThemeOverrides : lightThemeOverrides
);
</script>

<template>
  <n-config-provider
    :theme="activeTheme"
    :theme-overrides="themeOverrides"
  >
    <n-global-style />
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <DiscreteSetup />
            <router-view />
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
@import "@/styles/tailwind.css";
</style>
