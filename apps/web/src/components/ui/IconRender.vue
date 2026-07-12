<template>
  <div v-if="isLottieUrl" ref="container" class="lottie-icon" />

  <img v-else-if="isUrl" :src="icon as string" style="width: 1.5em; height: auto;" />

  <span v-else-if="isEmoji" style="font-size: 1.2em;">
    {{ icon }}
  </span>

  <v-icon v-else class="material-symbols-rounded">
    {{ icon }}
  </v-icon>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import lottie from "lottie-web"

const props = defineProps<{
  icon?: string | Record<string, any>;
}>()

const container = ref<HTMLElement | null>(null)
let lottieInstance: any = null

const isUrl = computed(() =>
  typeof props.icon === "string" && props.icon.startsWith("http")
)

const isEmoji = computed(() =>
  typeof props.icon === "string" && /\p{Emoji}/u.test(props.icon)
)

const isLottieUrl = computed(() =>
  typeof props.icon === "string" && props.icon.endsWith(".json")
)

onMounted(() => {
  if (isLottieUrl.value && container.value) {
    lottieInstance = lottie.loadAnimation({
      container: container.value,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: props.icon as string
    })
  }
})

onBeforeUnmount(() => {
  if (lottieInstance) {
    lottieInstance.destroy()
    lottieInstance = null
  }
})

function play() {
  lottieInstance?.play()
}

function pause() {
  lottieInstance?.pause()
}

defineExpose({ play, pause })
</script>

<style scoped>
.lottie-icon {
  width: 1.5em;
  height: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
