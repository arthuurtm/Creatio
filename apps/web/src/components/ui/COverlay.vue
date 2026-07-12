<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    type?: "dialog" | "search" | "fullscreen" | "bottom-sheet";
    title?: string;
    subtitle?: string;
    icon?: string;
    maxWidth?: string | number;
    persistent?: boolean;
    glass?: boolean;
    loading?: boolean;
    scrollable?: boolean;
    showClose?: boolean;
    divider?: boolean;
    contentClass?: string;
    bodyClass?: string;
    transition?: string;
  }>(),
  {
    type: "dialog",
    title: "",
    subtitle: "",
    icon: "",
    maxWidth: undefined,
    persistent: false,
    glass: false,
    loading: false,
    scrollable: true,
    showClose: true,
    divider: true,
    contentClass: "",
    bodyClass: "",
    transition: undefined,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const computedMaxWidth = computed(() => {
  if (props.maxWidth !== undefined) return props.maxWidth;
  switch (props.type) {
    case "search":
      return 600;
    case "bottom-sheet":
      return 800;
    case "fullscreen":
      return "100%";
    case "dialog":
    default:
      return 500;
  }
});

const computedFullscreen = computed(() => props.type === "fullscreen");

const computedTransition = computed(() => {
  if (props.transition !== undefined) return props.transition;
  switch (props.type) {
    case "search":
      return "dialog-top-transition";
    case "bottom-sheet":
    case "fullscreen":
      return "dialog-bottom-transition";
    case "dialog":
    default:
      return "dialog-bottom-transition";
  }
});

const computedRounded = computed(() => {
  if (props.type === "fullscreen") return "0";
  if (props.type === "bottom-sheet") return "t-sm b-0";
  return "sm";
});

const computedContentClass = computed(() => {
  const classes = [];
  if (props.type === "search") {
    classes.push("c-overlay-search-dialog");
  } else if (props.type === "bottom-sheet") {
    classes.push("c-overlay-bottom-sheet-dialog");
  }
  if (props.contentClass) {
    classes.push(props.contentClass);
  }
  return classes.join(" ");
});

function close() {
  isOpen.value = false;
  emit("close");
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    :max-width="computedMaxWidth"
    :fullscreen="computedFullscreen"
    :transition="computedTransition"
    :persistent="persistent"
    :scrollable="scrollable"
    :content-class="computedContentClass"
    class="c-overlay-dialog"
  >
    <v-card
      :class="[
        glass ? 'glass-overlay-card' : 'flat-overlay-card',
        { 'c-overlay-card--search': type === 'search' }
      ]"
      :rounded="computedRounded"
      elevation="24"
      class="c-overlay-card overflow-hidden position-relative"
    >
      <v-progress-linear
        v-if="loading"
        color="primary"
        height="3"
        indeterminate
        absolute
        top
        class="z-index-1"
      />

      <div
        v-if="$slots.header || title || subtitle || showClose"
        class="c-overlay-header px-6 py-4 d-flex align-center justify-space-between"
      >
        <slot name="header">
          <div class="d-flex align-center">
            <v-icon
              v-if="icon"
              color="primary"
              size="24"
              class="mr-3"
            >
              {{ icon }}
            </v-icon>
            <div>
              <h3 class="text-h6 font-weight-bold text-on-surface text-truncate max-width-text">
                <slot name="title-prepend" />
                {{ title }}
                <slot name="title-append" />
              </h3>
              <p
                v-if="subtitle"
                class="text-caption text-medium-emphasis mt-0.5 text-truncate max-width-text"
              >
                {{ subtitle }}
              </p>
            </div>
          </div>
          <v-btn
            v-if="showClose"
            icon="close"
            variant="text"
            density="comfortable"
            color="medium-emphasis"
            class="ml-auto"
            @click="close"
          />
        </slot>
      </div>

      <v-divider
        v-if="divider && (title || $slots.header) && type !== 'search'"
        class="border-opacity-100"
      />

      <v-card-text
        :class="[
          'c-overlay-body',
          type === 'search' ? 'pa-0' : (bodyClass || 'px-6 py-4'),
          { 'overlay-body-scrollable': scrollable && type !== 'fullscreen' && type !== 'search' }
        ]"
      >
        <slot />
      </v-card-text>

      <v-divider
        v-if="divider && $slots.actions && type !== 'search'"
        class="border-opacity-100"
      />

      <v-card-actions
        v-if="$slots.actions && type !== 'search'"
        class="px-6 py-4"
      >
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.c-overlay-search-dialog {
  align-self: flex-start !important;
  margin-top: 10vh !important;

  .v-card {
    border-radius: 4px !important;
  }
}

.c-overlay-bottom-sheet-dialog {
  align-self: flex-end !important;
  margin-bottom: 0 !important;
  margin-top: auto !important;

  .v-card {
    border-top-left-radius: 6px !important;
    border-top-right-radius: 6px !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}

.c-overlay-card {
  transition: box-shadow 0.25s ease, border-color 0.25s ease;

  &.c-overlay-card--search {
    border-radius: 4px !important;
  }
}

.max-width-text {
  max-width: 320px;
}

.z-index-1 {
  z-index: 1;
}
</style>
