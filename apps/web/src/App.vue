<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { darkTheme } from "naive-ui";
import DiscreteSetup from "@/components/ui/DiscreteSetup.vue";
import { useSettingsStore } from "@/stores/global";
import {
	lightThemeOverrides,
	darkThemeOverrides,
} from "@/styles/theme";
import {
	syncThemeCssVariables,
} from "@/plugins/naive";

const settingsStore = useSettingsStore();

// Computed properties for active theme and overrides
const activeTheme = computed(() => {
	return settingsStore.theme === "dark" ? darkTheme : null;
});

const themeOverrides = computed(() => {
	return settingsStore.theme === "dark"
		? darkThemeOverrides
		: lightThemeOverrides;
});

// Watch theme changes to sync custom theme CSS variables
watch(
	() => settingsStore.theme,
	(newTheme) => {
		syncThemeCssVariables(newTheme);
	},
);

onMounted(() => {
	syncThemeCssVariables(settingsStore.theme);
});
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
