<script setup>
import { reactive, watch } from 'vue'

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

// cópia reativa do objeto vindo
const params = reactive({ ...props.modelValue, ...props.data })

watch(
  () => params,
  () => {
    emit('update:modelValue', { ...params })
  },
  { deep: true },
)

function addParam() {
  const newKey = `obj${Object.keys(params).length + 1}`
  params[newKey] = {}
}

function removeParam(key) {
  delete params[key]
}
</script>

<template>
  <div class="inline-params">
    <template v-for="(value, key) in params" :key="key">
      <input
        :value="key"
        @input="
          (e) => {
            const newKey = e.target.value
            if (newKey && newKey !== key) {
              params[newKey] = params[key]
              delete params[key]
            }
          }
        "
        placeholder="chave"
        class="inline-input"
      />
      <input v-model="params[key]" placeholder="valor" class="inline-input" />
      <button class="inline-btn" @click="removeParam(key)">×</button>
    </template>

    <button class="inline-btn add-btn" @click="addParam">+</button>
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
