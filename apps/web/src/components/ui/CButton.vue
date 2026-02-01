<template>
  <v-btn v-bind="attrs" :icon="isIconOnly" :rounded="isIconOnly ? 'circle' : attrs?.rounded" @click="handleClick"
    @mouseenter="playLottieAnimation" @mouseleave="pauseLottieAnimation">

    <!-- caso icon + texto -->
    <template v-if="icon && hasContent" #prepend>
      <IconRenderer ref="iconRef" :icon="icon" />
    </template>

    <!-- caso icon-only -->
    <template v-if="icon">
      <IconRenderer ref="iconRef" :icon="icon" />
    </template>

    <img v-if="img" :src="img.src" :class="img.class" :style="img.style" />

    <template v-if="text && !hasDefaultSlot">
      {{ text || label }}
    </template>

    <slot v-else />
  </v-btn>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from "vue"
import IconRenderer from "./IconRender.vue"

const props = defineProps({
  icon: [String, Object],
  text: String,
  label: String,
  img: Object,
  attrs: Object,
})

const emit = defineEmits(["click"])
const slots = useSlots()

const iconRef = ref(null)
const hasDefaultSlot = computed(() => !!slots.default)

const hasContent = computed(() =>
  !!(props.text || props.label || props.img || slots.default)
)

const isIconOnly = computed(() =>
  !!props.icon && !hasContent.value
)

function handleClick(e: MouseEvent) {
  emit("click", e)
}

function playLottieAnimation() {
  iconRef.value?.play?.()
}

function pauseLottieAnimation() {
  iconRef.value?.pause?.()
}
</script>
