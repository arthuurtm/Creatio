<script setup>
import { computed, ref, watch, resolveDynamicComponent, inject } from 'vue'
import CreateLoading from './elements/CreateLoading.vue'

const props = defineProps({
  component: String,
  title: String,
})

const asyncComponent = ref(CreateLoading)
const store = inject('stores')

function close() {
  if (!store.dialog.getIsHistory) showDialogAnim.value = false
  setTimeout(() => {
    store.dialog.close()
  }, 300)
}

const showDialog = computed(() => store.dialog.getIsVisible)
const showDialogAnim = ref(false)

watch(showDialog, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showDialogAnim.value = newValue
    }, 200)
  }
})

watch(
  () => props.component,
  async (newComponent) => {
    if (!newComponent) return

    asyncComponent.value = CreateLoading
    const resolved = resolveDynamicComponent(newComponent)
    if (resolved) {
      asyncComponent.value = resolved
    }
  },
  { immediate: true },
)

//Eventos de Toque
let touchTimeout = null
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const onTouchStart = (event) => {
  startY.value = event.touches[0].clientY
  isDragging.value = false
  touchTimeout = setTimeout(() => {
    isDragging.value = true
  }, 100)
}

const onTouchMove = (event) => {
  event.stopPropagation()
  event.preventDefault()
  if (!isDragging.value) return

  currentY.value = event.touches[0].clientY
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  clearTimeout(touchTimeout)

  const deltaY = currentY.value - startY.value
  const activationThreshold = 50

  if (deltaY > activationThreshold) {
    close()
  }
}
</script>

<template>
  <div class="dialog-shadow" v-show="showDialog">
    <div class="dialog-main" :id="[]" :class="[showDialogAnim && 'active']">
      <div
        class="title-bar"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div class="options">
          <div class="title">
            <p>{{ props.title }}</p>
          </div>
          <div>
            <button id="close" @click="close">
              <span class="material-symbols-outlined notranslate">close</span>
            </button>
          </div>
        </div>
      </div>
      <div class="content">
        <transition name="fastFade" mode="out-in">
          <component :is="asyncComponent" :key="props.component" @close="close" />
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('/src/assets/css/components/c-dynamicDialog.css');
</style>
