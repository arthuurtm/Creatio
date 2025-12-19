<script setup>
import { ref, computed } from 'vue'
import { useEditorStore, getSubCategories, categories } from '@/stores/editor'
import CInputText from '@/components/ui/CInputText.vue'
import CInputSelect from '@/components/ui/CInputSelect.vue'
import CButton from '@/components/ui/CButton.vue'

const searchQuery = ref('')
const activeCategory = ref(null)
const formParams = ref([])
const isDialogOpen = ref(false)
const createItemExecuteFn = ref(null)
const editorStore = useEditorStore()
const allCategories = ref(categories)

// --- Map de componentes ---
const inputParamMap = {
  text: CInputText,
  number: CInputText,
  textarea: CInputText,
  select: CInputSelect,
  button: CButton,
  file: CInputText,
}

// --- Dados ---
const activeCategoryDatabase = computed(() =>
  activeCategory.value ? (editorStore.$state[activeCategory.value] ?? []) : [],
)
const activeCategoryConfig = computed(() =>
  activeCategory.value ? categories[activeCategory.value] : {},
)

// --- Ações ---
function openCategory(categoryKey) {
  activeCategory.value = categoryKey
}
function addButtonHandler(event) {
  const selectedItem = event
  formParams.value = selectedItem.params ?? []
  createItemExecuteFn.value = selectedItem.execute ?? null
  if (formParams.value.length > 0 && createItemExecuteFn.value) {
    isDialogOpen.value = true
  }
}
function handleCreate() {
  if (createItemExecuteFn.value) {
    // 1. Transforma o array de parâmetros em um objeto de valores
    const paramsObject = formParams.value.reduce((acc, param) => {
      // 'acc' é o objeto que está sendo construído (inicia como {})

      // ✅ Correção: Só adiciona ao objeto se 'param.key'
      // for uma string válida (não undefined, não um objeto).
      if (param.key && typeof param.key === 'string') {
        acc[param.key] = param.model
      }

      return acc
    }, {}) // Inicia com um objeto vazio

    // 2. ✅ Correção: Adiciona a propriedade 'text' APÓS o loop,
    // usando os valores que acabaram de ser coletados.
    paramsObject.text = paramsObject.name || paramsObject.label || null

    // 3. Passa o objeto de valores correto
    createItemExecuteFn.value(paramsObject)
    isDialogOpen.value = false
  }
}
</script>

<template>
  <CGroup height="100%" width="100">
    <!-- Painel lateral -->
    <CGroup direction="column" padding="1rem" gap="1rem" width="280px">
      <CInputText v-model="searchQuery" icon="search" placeholder="Buscar categoria..." />
      <CGroup grow direction="column" gap="0.25rem" align="start" justify="start">
        <template v-for="(category, index) in allCategories" :key="index">
          <CButton
            :text="category.text"
            :icon="category.icon"
            :active="activeCategory === index"
            classes="symbolic category-btn left"
            @click="openCategory(index)"
          />
        </template>
      </CGroup>
    </CGroup>

    <!-- Conteúdo principal -->
    <CGroup
      grow
      direction="column"
      style="
        background: var(--surface-2);
        border-left: 1px solid var(--border);
        border-top: 1px solid var(--border);
        border-top-left-radius: 24px;
      "
    >
      <!-- Cabeçalho -->
      <CGroup
        justify="between"
        align="center"
        padding="1rem 1.5rem"
        style="border-bottom: 1px solid var(--border)"
      >
        <CGroup direction="row" align="center" gap="0.5rem">
          <h3 style="font-size: 1.1rem; font-weight: 600; margin: 0">
            {{ activeCategoryConfig?.value?.text ?? 'Itens' }}
          </h3>
          <span v-if="activeCategoryDatabase.length" style="font-size: 0.9rem">
            ({{ activeCategoryDatabase.length }})
          </span>
        </CGroup>

        <CInputSelect
          icon="add_circle"
          title="Adicionar novo"
          classes="symbolic no-padding"
          :only-icon="true"
          :options="Object.values(getSubCategories(activeCategory))"
          @select="addButtonHandler"
        />
      </CGroup>

      <!-- Lista de itens -->
      <CGroup v-if="activeCategory" grow direction="column" padding="1.25rem" gap="0.75rem">
        <CGroup
          v-if="activeCategoryDatabase.length === 0"
          height="100%"
          align="center"
          justify="center"
        >
          Nenhum item em {{ activeCategoryConfig?.value?.text ?? 'item' }}
        </CGroup>

        <CGroup
          v-for="item in activeCategoryDatabase"
          :key="item.id"
          justify="between"
          align="center"
          padding="0.75rem 1rem"
          style="
            border: 1px solid var(--border);
            border-radius: 10px;
            background: var(--element-hover);
            transition:
              background 0.2s,
              transform 0.2s;
          "
        >
          <CGroup direction="column">
            <span style="font-weight: 600">{{ item.text || `Item #${item.id}` }}</span>
            <span style="font-size: 0.85rem">ID: {{ item.id }}</span>
          </CGroup>

          <CButton icon="edit" classes="symbolic" title="Editar" />
        </CGroup>
      </CGroup>

      <!-- Mensagem padrão -->
      <CGroup v-else grow align="center" justify="center">
        <p>Selecione uma categoria à esquerda</p>
      </CGroup>
    </CGroup>
  </CGroup>

  <!-- Diálogo de criação genérica -->
  <ComponentDialog v-model:is-visible="isDialogOpen" title="Criar Novo Objeto">
    <CGroup direction="column" gap="1.25rem" padding="1.5rem">
      <CGroup
        v-for="(param, index) in formParams"
        :key="index"
        direction="column"
        gap="0.5rem"
        style="max-width: 600px; width: 100%"
      >
        <component :is="inputParamMap[param.type]" v-bind="param" v-model="param.model" />
      </CGroup>

      <CGroup justify="center" gap="1rem" padding="1rem 0 0">
        <CButton text="Cancelar" icon="close" classes="ghost" @click="isDialogOpen = false" />
        <CButton text="Criar" icon="check" class="confirm" @click="handleCreate" />
      </CGroup>
    </CGroup>
  </ComponentDialog>
</template>

<style scoped>
.category-btn {
  border-radius: 8px;
  transition:
    background 0.15s,
    transform 0.1s;
}
.category-btn:hover {
  background: var(--surface-hover);
  transform: translateX(2px);
}
</style>
