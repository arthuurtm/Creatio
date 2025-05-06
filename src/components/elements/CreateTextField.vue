<template>
  <div class="input-group" v-for="(field, index) in props.fields" :key="index">
    <label v-if="field.label" :for="field.model">{{ field.label }}</label>
    <div
      class="input"
      :class="[
        field.class,
        field.style?.rounded && 'rounded',
        field.style?.border && 'border',
        field.style?.color,
      ]"
    >
      <div v-if="field.icon" class="material-symbols-outlined notranslate">{{ field.icon }}</div>
      <input
        class="input-field"
        v-model="formData[field.model]"
        :type="field.type"
        :id="field.model"
        :placeholder="field.placeholder"
      />
    </div>
    <CreateAnchor v-if="field.anchor" @emitEvent="reEmitEvent" :anchor="field.anchor" />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import CreateAnchor from '@/components/elements/CreateAnchor.vue'

const props = defineProps({ fields: Array })
const emits = defineEmits(['emitEvent'])

const store = inject('stores')
const formStore = store.form
const formData = computed(() => formStore.getFormData)

function reEmitEvent(actions) {
  emits('emitEvent', actions)
}
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
@import url('/src/assets/css/components/c-form.css');
</style>
