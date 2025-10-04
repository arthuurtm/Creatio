<template>
  <div class="games-grid" :class="styleType">
    <div class="content">
      <div class="scroll-button" id="left">
        <CreateButton
          v-if="isEnableScrollButton"
          @emitEvent="scrollLeft"
          :buttons="[
            {
              icon: 'arrow_back_ios',
              class: 'symbolic no-padding no-scalling',
              id: 'left',
            },
          ]"
        />
      </div>

      <div v-if="items && items.length > 0" class="sliding" ref="scrollContainer">
        <CreateCard :card="items" :styleType="cardsType" @emitEvent="reEmitEvent" />
      </div>

      <div class="scroll-button" id="right">
        <CreateButton
          v-if="isEnableScrollButton"
          @emitEvent="scrollRight"
          :buttons="[
            {
              position: 'left',
              icon: 'arrow_forward_ios',
              class: 'symbolic no-padding no-scalling',
              id: 'right',
            },
          ]"
        />
      </div>
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
.games-grid {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.games-grid .content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  /* overflow-x: auto; */
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

.games-grid.grade .content {
  scroll-behavior: unset;
}
.games-grid.grade .sliding {
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
  .content .group-button {
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
