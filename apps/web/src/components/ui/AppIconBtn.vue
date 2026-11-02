<script setup lang="ts">
import { NButton, NTooltip } from "naive-ui";
import AppIcon from "./AppIcon.vue";

defineProps<{
  icon: string;
  tooltip?: string;
  type?: "default" | "primary" | "error" | "warning" | "info" | "success";
  size?: "tiny" | "small" | "medium" | "large";
  circle?: boolean;
  quaternary?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  iconSize?: number | string;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <NTooltip v-if="tooltip" trigger="hover">
    <template #trigger>
      <NButton
        :circle="circle !== false"
        :quaternary="!secondary && !tertiary"
        :secondary="secondary"
        :tertiary="tertiary"
        :type="type ?? 'default'"
        :size="size ?? 'small'"
        :disabled="disabled"
        :loading="loading"
        @click="$emit('click')"
      >
        <template #icon>
          <AppIcon :name="icon" :size="iconSize" />
        </template>
      </NButton>
    </template>
    <slot>{{ tooltip }}</slot>
  </NTooltip>

  <NButton
    v-else
    :circle="circle !== false"
    :quaternary="!secondary && !tertiary"
    :secondary="secondary"
    :tertiary="tertiary"
    :type="type ?? 'default'"
    :size="size ?? 'small'"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click')"
  >
    <template #icon>
      <AppIcon :name="icon" :size="iconSize" />
    </template>
  </NButton>
</template>
