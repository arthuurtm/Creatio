<script setup>
const props = defineProps({
  style: {
    type: [Object, String],
    default: () => ({}),
  },
})
</script>

<template>
  <img src="/src/assets/img/min-logo.png" :style="props.style" />
</template>
