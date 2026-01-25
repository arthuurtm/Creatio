<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  name: 'RecursiveEditor',
})

const props = defineProps({
  modelValue: {
    type: [Object, Array, String, Number, Boolean, null] as any,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  depth: {
    type: Number,
    default: 0,
  },
  startExpanded: {
    type: Boolean,
    default: false, // Por padrão, tudo encolhido
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'delete'): void // Emit para deletar a si mesmo (útil em arrays)
}>()

const isExpanded = ref(props.startExpanded)

const isArray = computed(() => Array.isArray(props.modelValue))
const isObject = computed(() =>
  props.modelValue !== null &&
  typeof props.modelValue === 'object' &&
  !isArray.value
)
const isBoolean = computed(() => typeof props.modelValue === 'boolean')
const isPrimitive = computed(() => !isObject.value && !isArray.value && !isBoolean.value)

// Agrupamento visual
const groupedKeys = computed(() => {
  if (!isObject.value) return { primitives: [], complex: [] }

  const primitives: string[] = []
  const complex: string[] = [] // Juntamos Objetos e Arrays

  Object.keys(props.modelValue).forEach((key) => {
    const val = props.modelValue[key]
    if (val !== null && typeof val === 'object') {
      complex.push(key)
    } else {
      primitives.push(key)
    }
  })

  return { primitives, complex }
})

// --- Ações ---
function updateObjectKey(key: string, newValue: any) {
  const newObj = { ...props.modelValue }
  newObj[key] = newValue
  emit('update:modelValue', newObj)
}

function updateArrayItem(index: number, newValue: any) {
  const newArr = [...props.modelValue]
  newArr[index] = newValue
  emit('update:modelValue', newArr)
}

function addArrayItem() {
  // Tenta adivinhar o tipo baseado no anterior, ou string vazia
  const newItem = props.modelValue.length > 0
    ? (typeof props.modelValue[0] === 'object' ? {} : "")
    : ""
  emit('update:modelValue', [...props.modelValue, newItem])
}

function removeArrayItem(index: number) {
  const newArr = [...props.modelValue]
  newArr.splice(index, 1)
  emit('update:modelValue', newArr)
}

function updatePrimitive(value: string | number) {
  if (typeof props.modelValue === 'number') {
    const num = Number(value)
    if (!isNaN(num)) {
      emit('update:modelValue', num)
      return
    }
  }
  emit('update:modelValue', value)
}

// Estilo dinâmico para indentação
const indentStyle = computed(() => ({
  paddingLeft: `${props.depth * 12}px`,
  // Uma cor de fundo sutil que escurece levemente a cada nível
  backgroundColor: `rgba(var(--v-theme-surface-variant), ${props.depth * 0.02})`
}))


// Watcher para permitir que o pai force o colapso/expansão de todos os níveis
watch(() => props.startExpanded, (newVal) => {
  isExpanded.value = newVal
})
</script>

<template>
  <div class="recursive-editor w-100">

    <div v-if="isObject || isArray" class="complex-container">
      <div class="d-flex align-center py-1 pr-2 cursor-pointer hover-bg" :style="indentStyle"
        @click.stop="isExpanded = !isExpanded">

        <v-icon :icon="isExpanded ? 'arrow_drop_down' : 'arrow_right'" size="small" color="medium-emphasis"
          class="mr-1" />

        <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
          {{ label || (isArray ? 'Lista' : 'Objeto') }}
        </span>
        <v-spacer />

        <v-btn v-if="isArray" icon="add" size="x-small" variant="text" density="comfortable" color="primary"
          @click.stop="addArrayItem" />

        <span v-if="!isExpanded" class="text-caption text-disabled ml-2">
          {{ isArray ? `${modelValue.length} itens` : '{...}' }}
        </span>
      </div>

      <v-expand-transition>
        <div v-show="isExpanded">

          <template v-if="isObject">
            <div v-if="groupedKeys.primitives.length" class="py-1">
              <RecursiveEditor v-for="key in groupedKeys.primitives" :key="key" :label="key"
                :model-value="props.modelValue[key]" :depth="depth + 1"
                @update:model-value="(v) => updateObjectKey(key, v)" />
            </div>

            <v-divider v-if="groupedKeys.primitives.length && groupedKeys.complex.length"
              class="my-1 border-opacity-25" />

            <RecursiveEditor v-for="key in groupedKeys.complex" :key="key" :label="key"
              :model-value="props.modelValue[key]" :depth="depth + 1"
              @update:model-value="(v) => updateObjectKey(key, v)" />
          </template>

          <template v-else-if="isArray">
            <div v-if="modelValue.length === 0" class="text-caption text-center py-2 text-disabled">
              (Vazio)
            </div>
            <div v-for="(item, index) in modelValue" :key="index" class="d-flex align-start group-hover-parent">
              <div class="flex-grow-1">
                <RecursiveEditor :label="String(index)" :model-value="item" :depth="depth + 1"
                  @update:model-value="(v) => updateArrayItem(index, v)" />
              </div>

              <v-btn icon="delete" size="x-small" variant="text" color="error" class="mt-1 opacity-50 hover-opacity-100"
                @click="removeArrayItem(index)" />
            </div>
          </template>
        </div>
      </v-expand-transition>
    </div>

    <div v-else class="d-flex align-center py-1 pr-2 hover-bg property-row" :style="indentStyle">
      <div class="property-label text-caption text-medium-emphasis text-truncate mr-2" :title="label">
        {{ label }}
      </div>

      <div class="flex-grow-1" style="min-width: 0;">
        <div v-if="isBoolean" class="d-flex justify-end">
          <v-switch :model-value="modelValue" color="primary" hide-details density="compact" class="ma-0 scale-switch"
            @update:model-value="(val) => emit('update:modelValue', val)" />
        </div>

        <v-text-field v-else :model-value="modelValue" variant="underlined" density="compact" hide-details
          class="custom-input centered-input" :class="{ 'text-right': typeof modelValue === 'number' }"
          @update:model-value="updatePrimitive" />
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Remove o outline padrão feio do browser */
.recursive-editor {
  font-family: 'Roboto', sans-serif;
  /* Ou sua fonte padrão */
}

/* Hover effect na linha inteira para guiar o olho */
.hover-bg:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}

/* Label com largura fixa ajuda a alinhar visualmente */
.property-label {
  width: 120px;
  /* Ajuste conforme necessário */
  flex-shrink: 0;
}

/* Input customizado para ficar sutil */
.custom-input :deep(.v-field__input) {
  padding-top: 4px;
  padding-bottom: 4px;
  min-height: 24px;
  font-size: 0.875rem;
}

/* Remove padding extra do underline */
.custom-input :deep(.v-input__details) {
  display: none;
}

/* Switch menorzinho */
.scale-switch {
  transform: scale(0.8);
  transform-origin: right center;
}

.opacity-50 {
  opacity: 0.5;
}

.hover-opacity-100:hover {
  opacity: 1;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
