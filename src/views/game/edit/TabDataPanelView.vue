<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEditorStore as editorStore, addFunctions } from '@/stores/editor'

const searchQuery = ref('')
const activeCategory = ref(null)
const formParams = ref([])
const popupContextMenu = ref(null)
const isDialogOpen = ref(false)
const createItemExecuteFn = ref(null)

// --- Inicialização de teste ---
onMounted(() => {
  editorStore.actions.push({ text: 'Ação teste' })
  editorStore.conditions.push({ text: 'Condição teste' })
})

// --- Metadados das abas ---
const tabMetadata = editorStore.$components
/** Retorna subcategorias da função em addFunctions */
const getSubCategories = (categoryKey = null) => {
  addFunctions[categoryKey]?.value ?? [{ text: 'Nada a mostrar.', icon: 'info' }]
}
const activeCategoryItems = computed(() => {
  if (!activeCategory.value) return []
  // Garante que é um array, caso a categoria exista na store
  return editorStore[activeCategory.value] ?? []
})
/** Computed: filtra categorias com base na busca */
const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return Object.entries(tabMetadata)
    .filter(([_, cat]) => cat.text.toLowerCase().includes(query))
    .map(([key, cat]) => ({
      key,
      ...cat,
      count: editorStore[key]?.length ?? 0,
    }))
})

// --- Ações ---
function openCategory(categoryKey) {
  activeCategory.value = categoryKey
}

function openAddObjectContextMenu(items, event) {
  popupContextMenu.value.openContextMenu(items, event)
}

function handleContextMenuEvent(e) {
  const selectedItem = e.item
  formParams.value = selectedItem.params ?? []
  createItemExecuteFn.value = selectedItem.execute ?? null
  if (formParams.value.length > 0 && createItemExecuteFn.value) {
    isDialogOpen.value = true
  }
}

function handleSaveNewItem(formData) {
  if (!activeCategory.value || !createItemExecuteFn.value) {
    console.error('Categoria ou função de criação não definida.')
    return
  }
  const newItem = createItemExecuteFn.value(formData)
  editorStore[activeCategory.value].push(newItem)
  isDialogOpen.value = false
  formParams.value = []
  createItemExecuteFn.value = null
}
</script>

<template>
  <CGroup height="100%" width="100%">
    <CGroup
      direction="column"
      padding="1rem"
      gap="1rem"
      style="border-right: 1px solid var(--border)"
      width="280px"
    >
      <CInputText v-model="searchQuery" icon="search" placeholder="Buscar categoria..." />

      <CGroup grow direction="column" gap="0.5rem">
        <CGroup
          v-for="category in filteredCategories"
          :key="category.key"
          justify="between"
          align="center"
        >
          <CButton
            :text="category.text"
            :icon="category.icon"
            :active="activeCategory === category.key"
            classes="symbolic no-scalling"
            @click="openCategory(category.key)"
          />
          <CButton
            icon="add_circle"
            classes="symbolic"
            title="Adicionar novo"
            @click="openAddObjectContextMenu([{ items: getSubCategories(category.key) }], $event)"
          />
        </CGroup>
      </CGroup>

      <CContextMenu ref="popupContextMenu" @emit-event="handleContextMenuEvent" />
    </CGroup>

    <CGroup v-if="activeCategory" grow direction="column">
      <CGroup
        justify="between"
        align="center"
        padding="1rem"
        style="border-bottom: 1px solid var(--border)"
      >
        <h3>
          {{ tabMetadata[activeCategory]?.text || 'Itens' }}
        </h3>
        <CButton icon="add_circle" text="Adicionar" @click="isDialogOpen = true" />
      </CGroup>

      <CGroup grow direction="column" padding="1rem" gap="0.5rem" style="overflow-y: auto">
        <div
          v-if="activeCategoryItems.length === 0"
          style="text-align: center; color: var(--form-sub); padding: 2rem"
        >
          Nenhum item em **{{ tabMetadata[activeCategory]?.text || 'esta categoria' }}**.
        </div>
        <CGroup
          v-for="item in activeCategoryItems"
          :key="item.id"
          justify="between"
          align="center"
          padding="0.5rem 1rem"
          style="border: 1px solid var(--border); border-radius: 8px"
        >
          <span>{{ item.text || `Item #${item.id}` }}</span>
          <CButton icon="edit" classes="symbolic" title="Editar" />
        </CGroup>

        <ComponentDialog
          :is-visible="isDialogOpen"
          title="Adicionar Novo Item"
          fullscreen="true"
          @close="isDialogOpen = false"
        >
          <template #default>
            <CGroup direction="column" gap="1.5rem" padding="1rem">
              <CFormBuilder :params="formParams" @submit="handleSaveNewItem" />
              <CGroup justify="end">
                <CButton text="Cancelar" classes="symbolic" @click="isDialogOpen = false" />
              </CGroup>
            </CGroup>
          </template>
        </ComponentDialog>
      </CGroup>
    </CGroup>

    <CGroup v-else grow align="center" justify="center" style="color: var(--form-sub)">
      <p>Selecione uma categoria à esquerda</p>
    </CGroup>
  </CGroup>
</template>
