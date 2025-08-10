<template>
  <div v-for="(field, index) in allFields" :key="index" class="input-container">
    <label v-if="field.label" :for="field.model">{{ field.label }}</label>

    <div class="input" ref="inputWrapper" :class="[field.class, field.style]">
      <div v-if="field.icon" class="material-symbols-outlined notranslate">{{ field.icon }}</div>

      <component
        :is="getComponentType(field.type)"
        class="input-field"
        :type="field.type"
        :id="field.model"
        :placeholder="field.placeholder"
        @change="field.type === 'file' && handleFile($event, field.model)"
        @input="updateValue(field.model, $event.target.value)"
        :value="props.modelValue[field.model]"
      >
        <template v-if="field.type === 'select'">
          <option v-for="(option, index) in field.options" :key="index" :value="option.value">
            {{ option.label }}
          </option>
        </template>
      </component>

      <CreateButton
        v-if="field.type === 'password' || field.type === 'password-view'"
        :buttons="[
          {
            icon: field.actionIcon || 'visibility',
            class: 'symbolic no-padding no-scale center',
          },
        ]"
        @click="togglePassView(field)"
      />
    </div>

    <CreateAnchor v-if="field?.anchor" @emitEvent="reEmitEvent" :anchor="field.anchor" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emits = defineEmits(['emitEvent', 'update:modelValue'])
const props = defineProps({
  fields: {
    type: Array,
    default: () => [{}],
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

function updateValue(model, value) {
  const updatedObject = { ...props.modelValue }
  updatedObject[model] = value
  emits('update:modelValue', updatedObject)
}

const allFields = ref(
  Object.entries(props.fields || {}).map(([key, value]) => ({
    ...value,
    stepIndex: Number(key),
  })),
)

function reEmitEvent(actions) {
  emits('emitEvent', actions)
}

function togglePassView(field) {
  if (field.actionIcon === 'visibility' || field.actionIcon === undefined) {
    field.actionIcon = 'visibility_off'
    field.type = 'password-view'
  } else {
    field.actionIcon = 'visibility'
    field.type = 'password'
  }
}

function handleFile(event, field) {
  const file = event.target.files[0]
  if (file) {
    updateValue(field, file)
  }
}

function getComponentType(type) {
  switch (type) {
    case 'select':
      return 'select'

    default:
      return 'input'
  }
}
</script>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
</style>
