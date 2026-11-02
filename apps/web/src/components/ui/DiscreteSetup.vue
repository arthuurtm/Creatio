
<script setup lang="ts">
import {
  useLoadingBar,
  useMessage,
  useNotification,
  useDialog,
  useThemeVars
} from "naive-ui";

import {
  watch,
  watchEffect,
  onBeforeUnmount
} from "vue";

import { useRoute } from "vue-router";
import { useSettingsStore } from "@/stores/global";

const loadingBar = useLoadingBar();
const route = useRoute();
const themeVars = useThemeVars();
const settingsStore = useSettingsStore();

// -----------------------------------------------------------------------------
// Global services
// -----------------------------------------------------------------------------

(window as any).$loadingBar = loadingBar;
(window as any).$message = useMessage();
(window as any).$notification = useNotification();
(window as any).$dialog = useDialog();

// -----------------------------------------------------------------------------
// Theme synchronization
// -----------------------------------------------------------------------------

watchEffect(() => {
  const root = document.documentElement;
  const t = themeVars.value;

  const isDark = settingsStore.theme === "dark";

  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", settingsStore.theme);

  const variables: Record<string, string> = {
    // -------------------------------------------------------------------------
    // Primary colors
    // -------------------------------------------------------------------------

    "--color-primary": t.primaryColor,
    "--color-primary-hover": t.primaryColorHover,
    "--color-primary-pressed": t.primaryColorPressed,
    "--color-primary-suppl": t.primaryColorSuppl,

    // -------------------------------------------------------------------------
    // Semantic colors
    // -------------------------------------------------------------------------

    "--color-info": t.infoColor,
    "--color-info-hover": t.infoColorHover,
    "--color-info-pressed": t.infoColorPressed,
    "--color-info-suppl": t.infoColorSuppl,

    "--color-success": t.successColor,
    "--color-success-hover": t.successColorHover,
    "--color-success-pressed": t.successColorPressed,
    "--color-success-suppl": t.successColorSuppl,

    "--color-warning": t.warningColor,
    "--color-warning-hover": t.warningColorHover,
    "--color-warning-pressed": t.warningColorPressed,
    "--color-warning-suppl": t.warningColorSuppl,

    "--color-error": t.errorColor,
    "--color-error-hover": t.errorColorHover,
    "--color-error-pressed": t.errorColorPressed,
    "--color-error-suppl": t.errorColorSuppl,

    // -------------------------------------------------------------------------
    // Base and surfaces
    // -------------------------------------------------------------------------

    "--color-base": t.baseColor,

    "--color-bg": t.bodyColor,
    "--color-surface": t.cardColor,
    "--color-surface-popover": t.popoverColor,
    "--color-surface-modal": t.modalColor,
    "--color-surface-table": t.tableColor,
    "--color-surface-action": t.actionColor,
    "--color-surface-tab": t.tabColor,
    "--color-surface-input": t.inputColor,
    "--color-surface-input-disabled": t.inputColorDisabled,
    "--color-surface-code": t.codeColor,
    "--color-surface-tag": t.tagColor,
    "--color-surface-avatar": t.avatarColor,
    "--color-surface-inverted": t.invertedColor,

    "--color-surface-hover": t.hoverColor,
    "--color-surface-pressed": t.pressedColor,

    "--color-hover": t.hoverColor,

    // Tables
    "--color-table-header": t.tableHeaderColor,
    "--color-table-hover": t.tableColorHover,
    "--color-table-striped": t.tableColorStriped,

    // Secondary buttons
    "--color-button-secondary": t.buttonColor2,
    "--color-button-secondary-hover": t.buttonColor2Hover,
    "--color-button-secondary-pressed": t.buttonColor2Pressed,

    // -------------------------------------------------------------------------
    // Borders and dividers
    // -------------------------------------------------------------------------

    "--color-border": t.borderColor,
    "--color-divider": t.dividerColor,

    "--color-progress-rail": t.progressRailColor,
    "--color-rail": t.railColor,

    // -------------------------------------------------------------------------
    // Typography
    // -------------------------------------------------------------------------

    "--color-text-base": t.textColorBase,
    "--color-text": t.textColor1,
    "--color-text-2": t.textColor2,
    "--color-text-3": t.textColor3,
    "--color-text-disabled": t.textColorDisabled,

    "--color-placeholder": t.placeholderColor,
    "--color-placeholder-disabled": t.placeholderColorDisabled,

    // -------------------------------------------------------------------------
    // Icons
    // -------------------------------------------------------------------------

    "--color-icon": t.iconColor,
    "--color-icon-hover": t.iconColorHover,
    "--color-icon-pressed": t.iconColorPressed,
    "--color-icon-disabled": t.iconColorDisabled,

    // Close button
    "--color-close-icon": t.closeIconColor,
    "--color-close-icon-hover": t.closeIconColorHover,
    "--color-close-icon-pressed": t.closeIconColorPressed,
    "--color-close-hover": t.closeColorHover,
    "--color-close-pressed": t.closeColorPressed,

    // Clear button
    "--color-clear": t.clearColor,
    "--color-clear-hover": t.clearColorHover,
    "--color-clear-pressed": t.clearColorPressed,

    // -------------------------------------------------------------------------
    // Opacity
    // -------------------------------------------------------------------------

    "--opacity-1": t.opacity1,
    "--opacity-2": t.opacity2,
    "--opacity-3": t.opacity3,
    "--opacity-4": t.opacity4,
    "--opacity-5": t.opacity5,
    "--opacity-disabled": t.opacityDisabled,

    // -------------------------------------------------------------------------
    // Scrollbar
    // -------------------------------------------------------------------------

    "--scrollbar-color": t.scrollbarColor,
    "--scrollbar-color-hover": t.scrollbarColorHover,
    "--scrollbar-width": t.scrollbarWidth,
    "--scrollbar-height": t.scrollbarHeight,
    "--scrollbar-radius": t.scrollbarBorderRadius,

    // -------------------------------------------------------------------------
    // Typography settings
    // -------------------------------------------------------------------------

    "--font-family": t.fontFamily,
    "--font-family-mono": t.fontFamilyMono,

    "--font-weight": t.fontWeight,
    "--font-weight-strong": t.fontWeightStrong,

    "--font-size-mini": t.fontSizeMini,
    "--font-size-tiny": t.fontSizeTiny,
    "--font-size-small": t.fontSizeSmall,
    "--font-size-medium": t.fontSizeMedium,
    "--font-size-large": t.fontSizeLarge,
    "--font-size-huge": t.fontSizeHuge,

    "--line-height": t.lineHeight,

    // -------------------------------------------------------------------------
    // Dimensions
    // -------------------------------------------------------------------------

    "--radius-sm": t.borderRadiusSmall,
    "--radius-md": t.borderRadius,

    "--height-tiny": t.heightTiny,
    "--height-small": t.heightSmall,
    "--height-medium": t.heightMedium,
    "--height-large": t.heightLarge,
    "--height-huge": t.heightHuge,

    // -------------------------------------------------------------------------
    // Shadows
    // -------------------------------------------------------------------------

    "--shadow-1": t.boxShadow1,
    "--shadow-2": t.boxShadow2,
    "--shadow-3": t.boxShadow3,

    // -------------------------------------------------------------------------
    // Motion
    // -------------------------------------------------------------------------

    "--ease-out": t.cubicBezierEaseOut,
    "--ease-in-out": t.cubicBezierEaseInOut,
    "--ease-in": t.cubicBezierEaseIn,

    // -------------------------------------------------------------------------
    // Canvas
    // -------------------------------------------------------------------------

    "--canvas-bg": t.bodyColor,
    "--canvas-dot-color": t.bodyColor,
  };

  // Apply all CSS variables
  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
});

// -----------------------------------------------------------------------------
// Route loading indicator
// -----------------------------------------------------------------------------

let loadingTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => route.path,
  () => {
    if (loadingTimer) {
      clearTimeout(loadingTimer);
    }

    loadingBar.start();

    loadingTimer = setTimeout(() => {
      loadingBar.finish();
      loadingTimer = undefined;
    }, 200);
  }
);

onBeforeUnmount(() => {
  if (loadingTimer) {
    clearTimeout(loadingTimer);
    loadingBar.finish();
  }
});
</script>

<template>
  <div style="display: none"></div>
</template>
