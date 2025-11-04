<script setup>
import { computed, ref, watch, onUnmounted, shallowRef } from 'vue'

const props = defineProps({
  component: Object,
  title: String,
  settings: { type: Object, default: () => ({}) },
  componentProps: { type: Object, default: () => ({}) },
  x: { type: Number, default: null },
  y: { type: Number, default: null },
  isVisible: { type: Boolean, default: false },
  noCloseButton: { type: Boolean, default: false },
  noFocusWindow: { type: Boolean, default: false },
  isDraggable: { type: Boolean, default: false },
  noInterpolateSize: { type: Boolean, default: false },
  fullscreen: { type: Boolean, default: false },
})

const showDialog = computed(() => props.isVisible)
const showDialogAnim = ref(false)
const emit = defineEmits(['update:x', 'update:y', 'emit-event', 'close'])

function close() {
  setTimeout(() => {
    emit('close')
  }, 300)
}

watch(showDialog, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showDialogAnim.value = newValue
    }, 200)
  }
})

const touchHandlers = (() => {
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

  return [onTouchStart, onTouchMove, onTouchEnd]
})()

const [onTouchStart, onTouchMove, onTouchEnd] = touchHandlers

const dragHandlers = (() => {
  const position = ref({
    x: props.x,
    y: props.y,
  })
  let offsetX = 0
  let offsetY = 0

  function onDrag(event) {
    event.preventDefault()
    position.value.x = event.clientX - offsetX
    position.value.y = event.clientY - offsetY
  }

  function stopDrag() {
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)
    emit('update:x', position.value.x)
    emit('update:y', position.value.y)
  }

  function handleMouseDown(event) {
    if (!props.isDraggable) return
    if (event.button !== 0) return
    if (event.target.closest('button')) return

    offsetX = event.clientX - position.value.x
    offsetY = event.clientY - position.value.y
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', stopDrag)
  }

  return [position, stopDrag, handleMouseDown]
})()

const [position, stopDrag, handleMouseDown] = dragHandlers

const dialogStyle = computed(() => {
  if (props.x !== null && props.y !== null) {
    return {
      position: 'absolute',
      left: position.value.x + 'px',
      top: position.value.y + 'px',
      transform: 'none',
    }
  }
  return {}
})

onUnmounted(() => {
  stopDrag()
})
</script>

<template>
  <Transition :name="fullscreen ? 'slide-left-and-back' : ''" mode="out-in">
    <div
      :class="!noFocusWindow ? 'dialog-shadow focus' : 'dialog-shadow disabled'"
      v-show="showDialog"
      @click="!noFocusWindow && close()"
    >
      <div
        class="dialog-main"
        :id="[]"
        :class="{
          active: showDialogAnim,
          noInterpolateSize,
          fullscreen,
        }"
        :style="dialogStyle"
        @click.stop
      >
        <div
          class="title-bar"
          :class="{ left: fullscreen }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @mousedown="handleMouseDown"
        >
          <p>{{ props.title }}</p>
          <div id="close">
            <CButton
              v-if="!noCloseButton"
              icon="close"
              classes="symbolic no-padding no-scalling"
              id="close"
              @click="close()"
            />
          </div>
        </div>
        <div class="content">
          <transition name="fastFade">
            <component
              v-if="component"
              :is="component"
              :key="props.component"
              @close="close"
              @emit-event="(e) => emit('emit-event', e)"
              v-bind="componentProps"
            />
            <slot v-else />
          </transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-shadow {
  position: absolute;
  display: flex;
  z-index: 5;
}
.dialog-shadow.focus {
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: var(--overlay-bg);
}

.dialog-shadow:has(> .dialog-main.fullscreen) {
  /* border: 4px dashed red; */
  width: -webkit-fill-available;
  height: -webkit-fill-available;
}

.dialog-main {
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: var(--bg2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: var(--text);
  transition:
    color 0.5s ease,
    background-color 0.5s ease,
    border-color 0.5s ease,
    height 0.3s ease,
    transform 0.3s ease;
  overflow: hidden;
  border: 1px solid var(--border);
  height: 0;
  width: auto;
  interpolate-size: allow-keywords;
  z-index: 6;
}

.dialog-main.noInterpolateSize {
  height: auto;
}

.dialog-main.active {
  height: auto;
}

.dialog-main.fullscreen {
  width: 100%;
  height: 100%;
  border-radius: 0;
  border: none;
}

.dialog-main.fullscreen .title-bar {
  border-top: 1px solid var(--border);
}

.title-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  padding: 10px 20px;
  position: relative;
}

.title-bar p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--text);
  text-align: center;
  flex: 1;
  position: absolute;
}

/* botão de fechar */
.title-bar #close {
  all: unset;
  font-weight: bold;
  cursor: pointer;
  margin-left: auto;
}

.title-bar.left #close {
  order: -1;
  margin-left: 0;
  margin-right: auto;
}

.content {
  flex-grow: 1;
  min-height: 0;
}

@media (max-width: 600px) {
  .dialog-main {
    position: fixed;
    border-radius: 24px 24px 0 0;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 80%;
  }
}
</style>
