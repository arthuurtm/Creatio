<script setup>
import { reactive, watch } from 'vue'
import { util } from '@/functions'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  data: {
    type: Object,
    default: () => ({}),
  },
})

const params = reactive(
  Object.entries(props.data || {}).map(([key, value]) => ({
    tag: 'select',
    key,
    options: value,
  })),
)

const selectedParams = reactive([])

watch(
  () => selectedParams,
  () => {
    console.log(selectedParams)
    emit('update:modelValue', selectedParams)
  },
  { deep: true },
)

function addParam(e) {
  if (e.id) {
    selectedParams.push(e.id)
  }
}

function removeParam(key) {
  delete params[key]
}

function findName(id) {
  const { text } = util.deepFindById(props.data, id)
  return text
}
</script>

<template>
  <div class="inline-params">
    <p v-for="value in selectedParams" :key="value">{{ findName(value) }}</p>
    <create-button :buttons="params" @emit-event="addParam" />
  </div>
</template>

<style scoped>
.inline-params {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-size: inherit;
}

.inline-input {
  width: 70px;
  padding: 2px 4px;
  font-size: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 2px;
  background: transparent;
  color: inherit;
}

.inline-btn {
  padding: 2px 6px;
  font-size: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  color: inherit;
}

.add-btn {
  font-weight: bold;
}
</style>
