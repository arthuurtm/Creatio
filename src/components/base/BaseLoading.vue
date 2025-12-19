<template>
  <div class="loading-overlay" :class="{ full: 'full' }">
    <div class="spinner center" :style="{ fontSize: size }">
      <div v-for="n in 8" :key="n" class="spinner-blade"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  full: Boolean,
  size: String,
})
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
}

.loading-overlay.full {
  background: rgba(0, 0, 0, 0.5);
}

/* From Uiverse.io by mrhyddenn */
.spinner {
  font-size: 36px;
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
}

.spinner.center {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

.spinner .spinner-blade {
  position: absolute;
  left: 0.4629em;
  bottom: 0;
  width: 0.074em;
  height: 0.2777em;
  border-radius: 0.0555em;
  background-color: transparent;
  -webkit-transform-origin: center -0.2222em;
  -ms-transform-origin: center -0.2222em;
  transform-origin: center -0.2222em;
  animation: spinner-fade9234 1s infinite linear;
}

.spinner .spinner-blade:nth-child(1) {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
  -webkit-transform: rotate(0deg);
  -ms-transform: rotate(0deg);
  transform: rotate(0deg);
}

.spinner .spinner-blade:nth-child(2) {
  -webkit-animation-delay: 0.125s;
  animation-delay: 0.125s;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.spinner .spinner-blade:nth-child(3) {
  -webkit-animation-delay: 0.25s;
  animation-delay: 0.25s;
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}

.spinner .spinner-blade:nth-child(4) {
  -webkit-animation-delay: 0.375s;
  animation-delay: 0.375s;
  -webkit-transform: rotate(135deg);
  -ms-transform: rotate(135deg);
  transform: rotate(135deg);
}

.spinner .spinner-blade:nth-child(5) {
  -webkit-animation-delay: 0.5s;
  animation-delay: 0.5s;
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}

.spinner .spinner-blade:nth-child(6) {
  -webkit-animation-delay: 0.625s;
  animation-delay: 0.625s;
  -webkit-transform: rotate(225deg);
  -ms-transform: rotate(225deg);
  transform: rotate(225deg);
}

.spinner .spinner-blade:nth-child(7) {
  -webkit-animation-delay: 0.75s;
  animation-delay: 0.75s;
  -webkit-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  transform: rotate(270deg);
}

.spinner .spinner-blade:nth-child(8) {
  -webkit-animation-delay: 0.875s;
  animation-delay: 0.875s;
  -webkit-transform: rotate(315deg);
  -ms-transform: rotate(315deg);
  transform: rotate(315deg);
}

/* .spinner .spinner-blade:nth-child(9) {
  -webkit-animation-delay: 0.664s;
  animation-delay: 0.664s;
  -webkit-transform: rotate(240deg);
  -ms-transform: rotate(240deg);
  transform: rotate(240deg);
}

.spinner .spinner-blade:nth-child(10) {
  -webkit-animation-delay: 0.747s;
  animation-delay: 0.747s;
  -webkit-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  transform: rotate(270deg);
}

.spinner .spinner-blade:nth-child(11) {
  -webkit-animation-delay: 0.83s;
  animation-delay: 0.83s;
  -webkit-transform: rotate(300deg);
  -ms-transform: rotate(300deg);
  transform: rotate(300deg);
}

.spinner .spinner-blade:nth-child(12) {
  -webkit-animation-delay: 0.913s;
  animation-delay: 0.913s;
  -webkit-transform: rotate(330deg);
  -ms-transform: rotate(330deg);
  transform: rotate(330deg);
} */

@keyframes spinner-fade9234 {
  0% {
    background-color: var(--text);
  }

  100% {
    background-color: transparent;
  }
}
</style>
