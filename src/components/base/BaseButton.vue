<template>
  <v-btn v-bind="attrs" @click="handleClick" @mouseenter="playLottieAnimation" @mouseleave="pauseLottieAnimation">
    <template v-if="icon" #prepend>
      <div v-if="isLottieUrl" ref="lottieContainer" class="custom-lottie-icon"
        :style="{ width: '1.5em', height: '1.5em' }"></div>

      <img v-else-if="isUrl" :src="icon" class="custom-icon-url" style="width: 1.5em; height: auto;" />

      <span v-else-if="isEmoji" class="animated-emoji">
        {{ icon }}
      </span>

      <v-icon v-else class="material-symbols-rounded">
        {{ icon }}
      </v-icon>
    </template>

    <img v-if="img" :src="img.src" :class="img.class" :style="img.style" />

    <template v-if="text && !hasDefaultSlot">
      {{ text || label }}
    </template>
    <slot v-else />

    <template #loader>
      <BaseLoading size="1.2em" />
    </template>
  </v-btn>
</template>

<script setup lang="ts">
import { useSlots, computed, ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { default as lottie, type AnimationItem } from 'lottie-web'
import type { BaseButtonProps, BaseButtonEmits } from './BaseButton.props.js'

const attrs = useAttrs()
const props = defineProps<BaseButtonProps>()
const emits = defineEmits<BaseButtonEmits>()
const slots = useSlots()

const hasDefaultSlot = computed(() => !!slots.default)
const isEmoji = computed(() => {
  if (!props.icon || typeof props.icon !== 'string') return false
  const emojiRegex =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/
  return emojiRegex.test(props.icon)
})
const isUrl = computed(() => {
  if (!props.icon || typeof props.icon !== 'string') return false
  return props.icon.startsWith('http://') || props.icon.startsWith('https://')
})

const lottieContainer = ref<HTMLElement | null>(null)
let anim: AnimationItem | null = null
const isLottieUrl = computed(() => {
  if (!props.icon || typeof props.icon !== 'string') return false
  return props.icon.startsWith('http') && props.icon.endsWith('.json')
})

async function initializeLottie() {
  // Aguarda o próximo tick para garantir que o Vuetify renderizou o slot #prepend
  await nextTick()

  if (lottieContainer.value && isLottieUrl.value) {
    if (anim) {
      anim.destroy()
      anim = null
    }

    anim = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: props.icon,
    })

    anim.goToAndStop(0, true)
    lottieContainer.value.style.filter = 'grayscale(100%)'
  }
}

function playLottieAnimation() {
  if (anim && lottieContainer.value) {
    anim.loop = true
    anim.play()
    lottieContainer.value.style.filter = 'grayscale(0%)'
  }
}

function pauseLottieAnimation() {
  if (anim && lottieContainer.value) {
    anim.pause()
    anim.goToAndStop(0, true)
    lottieContainer.value.style.filter = 'grayscale(100%)'
  }
}

watch(isLottieUrl, () => {
  if (isLottieUrl.value) {
    initializeLottie()
  }
})

onMounted(() => {
  initializeLottie()
})

onBeforeUnmount(() => {
  if (anim) anim.destroy()
})

function handleClick(event: MouseEvent) {
  emits('click', event)
}
</script>

<style scoped>
.btn-content {
  display: inline-flex;
  align-items: center;
  gap: inherit;
  transition: opacity 0.2s ease-in-out;
}

.btn-content.is-loading-content {
  opacity: 0;
}
</style>
