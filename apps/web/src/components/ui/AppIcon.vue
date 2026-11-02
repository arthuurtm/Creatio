<script setup lang="ts">
import { NIcon } from "naive-ui";
import { getIconComponent } from "@/utils/icons";

defineProps<{
  name: string;
  size?: number | string;
  color?: string;
}>();
</script>

<template>
  <NIcon :size="size ?? 18" :color="color">
    <component :is="getIconComponent(name)" />
  </NIcon>
</template>
