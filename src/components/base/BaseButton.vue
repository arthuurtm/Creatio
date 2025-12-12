<template>
  <button
    :type="type"
    :class="['btn', { 'is-loading': loading }, classes]"
    :disabled="disabled || loading"
    @click="handleClick"
    @mouseenter="playLottieAnimation"
    @mouseleave="pauseLottieAnimation"
  >
    <span class="btn-content" :class="{ 'is-loading-content': loading }">
      <!-- se for um arquivo de imagem animado (lottie)-->
      <template v-if="icon">
        <div
          v-if="isLottieUrl"
          ref="lottieContainer"
          class="custom-lottie-icon"
          aria-hidden="true"
          :style="{ width: '1.5em', height: '1.5em' }"
        ></div>

        <!--se for uma url-->
        <img
          v-else-if="isUrl"
          :src="icon"
          alt="Ícone customizado"
          class="custom-icon-url"
          aria-hidden="true"
          style="width: 1.5em; height: auto; border-radius: 0"
        />

        <!-- se for um emoji -->
        <span v-else-if="isEmoji" class="animated-emoji" aria-hidden="true">
          {{ icon }}
        </span>

        <!--nenhuma das anteriores, considera-se um material-symbols-->
        <span v-else class="material-symbols-rounded notranslate" aria-hidden="true">
          {{ icon }}
        </span>
      </template>

      <img
        v-if="img"
        :src="img.src"
        :alt="img.alt || ''"
        :class="img.class"
        :style="img.style"
        aria-hidden="true"
      />

      <p v-if="text && !hasDefaultSlot" class="btn-text">
        {{ text || label }}
      </p>
      <slot v-else />
    </span>

    <BaseLoading
      v-if="loading"
      size="1.2em"
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
    />
  </button>
</template>

<script setup>
import { useSlots, computed, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import BaseLoading from './BaseLoading.vue'
import { baseButtonProps, baseButtonEmits } from './BaseButton.props'
import lottie from 'lottie-web'

const props = defineProps(baseButtonProps)
const emits = defineEmits(baseButtonEmits)
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
const lottieContainer = ref(null)
let anim = null
const isLottieUrl = computed(() => {
  if (!props.icon || typeof props.icon !== 'string') return false
  // Assumimos que arquivos Lottie terminam com .json e estão em uma URL
  return props.icon.startsWith('http') && props.icon.endsWith('.json')
})

function initializeLottie() {
  if (lottieContainer.value && isLottieUrl.value) {
    // 1. Destrói a animação anterior se existir
    if (anim) {
      anim.destroy()
      anim = null
    }

    // 2. Inicializa a nova animação
    anim = lottie.loadAnimation({
      container: lottieContainer.value, // O elemento HTML (o <div> com ref="lottieContainer")
      renderer: 'svg', // svg é geralmente o melhor para ícones
      loop: false, // Começa em false, pois você quer controlar a repetição/play
      autoplay: false, // Começa em false, para iniciar apenas no hover
      path: props.icon, // A URL do arquivo .json
    })

    // 3. Define para o primeiro frame (estado pausado)
    anim.goToAndStop(0, true)
    lottieContainer.value.style.filter = 'grayscale(100%)'
  }
}

// 4. Funções de Controle (para o hover)
function playLottieAnimation() {
  if (anim) {
    // Opcional: Define para loop se for o comportamento desejado no hover
    anim.loop = true
    anim.play()
    lottieContainer.value.style.filter = 'grayscale(0%)'
  }
}

function pauseLottieAnimation() {
  if (anim) {
    anim.pause()
    // Volta para o primeiro frame quando o mouse sair
    anim.goToAndStop(0, true)
    lottieContainer.value.style.filter = 'grayscale(100%)'
  }
}

onMounted(() => {
  initializeLottie()
})

// Recria a animação se a prop 'icon' mudar
watch(isLottieUrl, () => {
  if (isLottieUrl.value) {
    initializeLottie()
  }
})

onBeforeUnmount(() => {
  if (anim) {
    anim.destroy()
  }
})

function handleClick(event) {
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
