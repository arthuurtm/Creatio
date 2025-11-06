<script setup>
import { ref, computed } from 'vue'
import { useEditorStore as editorStore, addFunctions } from '@/stores/editor'
import CInputText from '@/components/ui/CInputText.vue'
import CInputSelect from '@/components/ui/CInputSelect.vue'
import CButton from '@/components/ui/CButton.vue'

const searchQuery = ref('')
const activeCategory = ref(null)
const formParams = ref([])
const isDialogOpen = ref(false)
const createItemExecuteFn = ref(null)

// --- Metadados ---
const inputParamMap = {
  text: CInputText,
  select: CInputSelect,
  button: CButton,
}
const tabMetadata = editorStore.$components
const activeCategoryItems = computed(() => {
  if (!activeCategory.value) return []
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
function addButtonHandler(event) {
  const selectedItem = event
  formParams.value = selectedItem.params ?? []
  createItemExecuteFn.value = selectedItem.execute ?? null
  if (formParams.value.length > 0 && createItemExecuteFn.value) {
    isDialogOpen.value = true
  }
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
        </CGroup>
      </CGroup>
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
        <CInputSelect
          icon="add_circle"
          classes="symbolic"
          title="Adicionar novo"
          :options="Object.values(addFunctions.getSubCategories(activeCategory))"
          @select="addButtonHandler"
        />
      </CGroup>

      <CGroup grow direction="column" padding="1rem" gap="0.5rem" style="overflow-y: auto">
        <div v-if="activeCategoryItems.length === 0" style="text-align: center; padding: 2rem">
          Nenhum item em <b>{{ tabMetadata[activeCategory]?.text || 'esta categoria' }}</b
          >.
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
          :fullscreen="true"
          @close="isDialogOpen = false"
        >
          <template #default>
            <CGroup direction="column" gap="1.5rem" padding="1rem">
              <template v-for="(param, index) in formParams" :key="index">
                <component :is="inputParamMap[param.type]" :="param" v-model="param.model" />
              </template>
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
