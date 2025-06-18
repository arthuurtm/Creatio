<template>
  <div class="input-group" v-for="(field, index) in props.fields" :key="index">
    <label v-if="field.label" :for="field.model">{{ field.label }}</label>
    <div
      class="input"
      ref="inputWrapper"
      :class="[
        field.class,
        field.style?.rounded && 'rounded',
        field.style?.border && 'border',
        field.style?.color,
        field.style?.minimal && 'minimal',
        (field.type === 'password' || field.type === 'password-view') && 'flex-reverse',
      ]"
    >
      <div v-if="field.icon" class="material-symbols-outlined notranslate">{{ field.icon }}</div>
      <div
        v-if="field.type === 'password' || field.type === 'password-view'"
        class="btn symbolic no-padding no-scale material-symbols-outlined notranslate"
        @click="togglePassView(field)"
      >
        {{ customIcon.password }}
      </div>
      <select
        v-if="field.type === 'select'"
        class="input-field"
        v-model="formData[field.model]"
        :id="field.model"
        :placeholder="field.placeholder"
      >
        <option v-for="(option, index) in field.options" :key="index" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <input
        v-else-if="field.type === 'file'"
        class="input-field"
        :type="field.type"
        @change="handleFile($event, field.model)"
      />
      <input
        v-else
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
import { computed, inject, ref, onMounted } from 'vue'
import CreateAnchor from '@/components/elements/CreateAnchor.vue'

const props = defineProps({
  fields: Array,
  storeName: {
    type: String,
    default: 'global',
  },
})
const emits = defineEmits(['emitEvent'])

const store = inject('stores')
const activeStore = computed(() => store[props.storeName])
const formData = ref(activeStore.value.getInputData)

const customIcon = ref({ password: 'visibility' })

onMounted(() => {
  const inputContainer = document.querySelector('.input')
  if (inputContainer) {
    inputContainer.addEventListener('click', (e) => {
      const inputField = e.currentTarget.querySelector('.input-field')
      if (inputField) {
        inputField.focus()
      }
    })
  }
})

function reEmitEvent(actions) {
  emits('emitEvent', actions)
}

function togglePassView(field) {
  if (customIcon.value.password === 'visibility_off') {
    customIcon.value.password = 'visibility'
    field.type = 'password'
  } else {
    customIcon.value.password = 'visibility_off'
    field.type = 'password-view'
  }
}

function handleFile(event, field) {
  const file = event.target.files[0]
  console.log('Handling file for field:', field, 'file: ', file)
  if (file) {
    formData.value[field] = file
  }
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
