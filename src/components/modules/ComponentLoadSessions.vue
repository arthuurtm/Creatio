<template>
  <div class="grid-man" :class="styleType">
    <div class="scroll-button" id="left">
      <CButton
        v-if="isEnableScrollButton"
        @emitEvent="scrollLeft"
        icon="arrow_back_ios"
        classes="symbolic no-padding no-scalling"
        id="left"
      />
    </div>

    <div v-if="items && items.length > 0" class="sliding" ref="scrollContainer">
      <CGameCard
        v-for="(card, index) in items"
        :key="index"
        :="card"
        :styleType="cardsType"
        @emitEvent="card?.action"
      />
    </div>

    <div class="scroll-button" id="right">
      <CButton
        v-if="isEnableScrollButton"
        @emitEvent="scrollRight"
        icon="arrow_forward_ios"
        classes="symbolic no-padding no-scalling left"
        id="right"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  styleType: {
    type: String,
    default: 'line',
  },
  cardsType: {
    type: String,
  },
})
const emits = defineEmits(['emitEvent'])

const grids = ref({
  big: ['grade', 'spaced'],
  medium: ['line'],
  small: ['reduced', 'list'],
})
const scrollContainer = ref(null)
const scrollAmount = 260

const isEnableScrollButton = computed(() => {
  if (grids.value.big.includes(props.styleType) || grids.value.small.includes(props.styleType))
    return false
  return true
})

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= scrollAmount
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += scrollAmount
  }
}

function reEmitEvent(args = {}) {
  emits('emitEvent', args)
}
</script>

<style scoped>
.grid-man {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  scroll-behavior: smooth;
}

.sliding {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  white-space: nowrap;
  box-sizing: border-box;
}

.grid-man.grade {
  scroll-behavior: unset;
}
.grid-man.grade .sliding {
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  align-items: flex-start;
}

.btn#left {
  display: grid;
  grid-column: 1;
  grid-row: 1;
}

.btn#right {
  display: grid;
  grid-column: 3;
  grid-row: 1;
}

#play-button {
  background-color: var(--discovery-play-button);
  z-index: 1;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .grid-man .group-button {
    display: none;
  }
  #btn {
    display: none;
  }
  .sliding {
    gap: 0;
  }
}
</style>
