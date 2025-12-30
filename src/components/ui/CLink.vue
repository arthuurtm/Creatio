<template>
  <a class="h-link" :class="classes" @click="$emit('click', $event)"> {{ text }}</a>
</template>

<script setup>
import { baseButtonEmits, baseButtonProps } from '../base/BaseButton.props.js'
defineProps(baseButtonProps)
defineEmits(baseButtonEmits)
</script>
