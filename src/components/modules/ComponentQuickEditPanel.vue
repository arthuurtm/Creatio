<script setup>
import { computed } from 'vue'
import CInputText from '../ui/CInputText.vue'
import CButton from '../ui/CButton.vue'
import CGroup from '../ui/CGroup.vue'

// Importante: define o nome do componente para permitir recursividade
defineOptions({
  name: 'RecursiveEditor',
})

const props = defineProps({
  modelValue: {
    type: [Object, Array, String, Number, Boolean, null],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// --- Utilitários de Tipo ---
const isArray = computed(() => Array.isArray(props.modelValue))
const isObject = computed(
  () => props.modelValue !== null && typeof props.modelValue === 'object' && !isArray.value,
)
const isBoolean = computed(() => typeof props.modelValue === 'boolean')
const isPrimitive = computed(() => !isObject.value && !isArray.value && !isBoolean.value)
const isObjectValue = (v) => v && typeof v === 'object' && !Array.isArray(v)
const isArrayValue = (v) => Array.isArray(v)

// --- Manipulação de Objetos ---
function updateObjectKey(key, newValue) {
  const newObj = { ...props.modelValue }
  newObj[key] = newValue
  emit('update:modelValue', newObj)
}

// --- Manipulação de Arrays ---
function updateArrayItem(index, newValue) {
  const newArr = [...props.modelValue]
  newArr[index] = newValue
  emit('update:modelValue', newArr)
}

function addArrayItem() {
  // Adiciona uma string vazia por padrão, o usuário pode mudar depois
  // ou você pode criar lógica para inferir o tipo do item anterior
  const newItem = ''
  emit('update:modelValue', [...props.modelValue, newItem])
}

function removeArrayItem(index) {
  const newArr = [...props.modelValue]
  newArr.splice(index, 1)
  emit('update:modelValue', newArr)
}

// --- Manipulação de Primitivos ---
function updatePrimitive(value) {
  // Tenta converter para número se o input for numérico e o valor original era número
  if (typeof props.modelValue === 'number') {
    const num = Number(value)
    if (!isNaN(num)) return emit('update:modelValue', num)
  }
  emit('update:modelValue', value)
}
</script>

<template>
  <CGroup grow direction="column" gap="8px" padding="10px">
    <CGroup v-if="isObject" class="editor-block" direction="column">
      <!-- TITULO DO BLOCO -->
      <div class="block-title">
        {{ label || 'Configurações' }}
      </div>

      <!-- PRIMEIRO: CAMPOS PRIMITIVOS -->
      <div v-if="!isObjectValue(value) && !isArrayValue(value)" class="primitive-row">
        <RecursiveEditor
          v-for="(value, key) in modelValue"
          :key="key + '-primitive'"
          :label="String(key)"
          :model-value="value"
          @update:model-value="(v) => updateObjectKey(key, v)"
        />
      </div>

      <!-- OBJETOS -->
      <div v-if="isObjectValue(value)" class="sub-block">
        <RecursiveEditor
          v-for="(value, key) in modelValue"
          :key="key + '-object'"
          :label="String(key)"
          :model-value="value"
          @update:model-value="(v) => updateObjectKey(key, v)"
        />
      </div>

      <!-- ARRAYS -->
      <div v-if="isArrayValue(value)" class="sub-block">
        <RecursiveEditor
          v-for="(value, key) in modelValue"
          :key="key + '-array'"
          :label="String(key)"
          :model-value="value"
          @update:model-value="(v) => updateObjectKey(key, v)"
        />
      </div>
    </CGroup>

    <CGroup v-else-if="isArray" class="editor-block" direction="column">
      <div class="header-row">
        <span v-if="label" class="block-title">{{ label }} (Array)</span>
        <CButton
          icon="add_circle"
          classes="symbolic"
          title="Adicionar"
          @click="addArrayItem"
        ></CButton>
      </div>

      <div v-for="(item, index) in modelValue" :key="index" class="array-item">
        <div class="array-content">
          <RecursiveEditor
            :label="`Item ${index + 1}`"
            :model-value="item"
            @update:model-value="(v) => updateArrayItem(index, v)"
          />
        </div>
        <CButton
          classes="symbolic destructive"
          icon="delete"
          @click="removeArrayItem(index)"
        ></CButton>
      </div>

      <div v-if="modelValue.length === 0" class="empty-state">Lista vazia</div>
    </CGroup>

    <div v-else-if="isBoolean" class="input-wrapper">
      <label v-if="label">{{ label }}</label>
      <div class="checkbox-wrapper">
        <input
          type="checkbox"
          :checked="modelValue"
          @change="(e) => emit('update:modelValue', e.target.checked)"
        />
        <span>{{ modelValue ? 'True' : 'False' }}</span>
      </div>
    </div>

    <div v-else class="input-block input-wrapper">
      <label v-if="label">{{ label }}</label>
      <div>
        <CInputText
          :model-value="modelValue"
          @update:model-value="updatePrimitive"
          class="fiel-row"
        />
      </div>
    </div>
  </CGroup>
</template>

<style scoped>
.editor-block {
  padding: 12px;
  border-left: 2px solid var(--border-strong);
  margin-top: 4px;
}

.block-title {
  font-weight: bold;
  font-size: 0.9em;
  opacity: 0.7;
  margin-bottom: 8px;
  display: block;
}

.field-row {
  margin-bottom: 10px;
}

/* Estilo para Array */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.array-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-strong);
}

.array-content {
  flex-grow: 1;
}

.delete-btn {
  margin-top: 24px; /* Tenta alinhar com o input */
  padding: 4px 8px;
}

/* Inputs Primitivos */
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-wrapper label {
  font-size: 0.85em;
  opacity: 0.8;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.empty-state {
  font-style: italic;
  font-size: 0.8em;
  opacity: 0.5;
  padding: 8px;
}
</style>
