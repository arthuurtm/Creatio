<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

// --- Configuração ---
const tabMetadata = {
  conditions: { name: 'Condições', icon: 'check_circle' },
  consequences: { name: 'Consequências', icon: 'flash_on' },
  actions: { name: 'Ações', icon: 'bolt' },
  events: { name: 'Eventos', icon: 'event' },
  objects: { name: 'Objetos', icon: 'inventory' },
  avatars: { name: 'Personagens', icon: 'people' },
}
const componentMap = {
  text: 'CustomTextInput',
  number: 'CustomNumberInput',
  textarea: 'CustomTextareaInput',
  select: 'CustomSelectInput',
}

const editorStore = useEditorStore

// --- Estado da Interface ---

// O item selecionado (precisa de tipo E id)
const selectedItemRef = ref({ type: null, id: null })
// O termo da busca
const searchQuery = ref('')

// --- Dados Computados ---

// A "Árvore" principal, que reage à busca
const filteredTreeData = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return (
    Object.keys(tabMetadata)
      .map((typeKey) => {
        // 1. Pega os metadados da categoria (nome, ícone)
        const category = tabMetadata[typeKey]
        // 2. Pega os itens reais da store
        const allItems = editorStore[typeKey] || []

        // 3. Filtra os itens se houver uma busca
        const filteredItems = !query
          ? allItems // Se não há busca, retorna todos
          : allItems.filter((item) => item.name.toLowerCase().includes(query))

        return {
          key: typeKey,
          name: category.name,
          icon: category.icon,
          items: filteredItems,
        }
      })
      // 4. Se houver busca, esconde categorias que não têm resultados
      .filter((category) => {
        return !query || category.items.length > 0
      })
  )
})

// O item ativo, baseado na seleção
const activeItem = computed(() => {
  const { type, id } = selectedItemRef.value
  if (type && id) {
    const sourceArray = editorStore[type] || []
    return sourceArray.find((item) => item.id === id)
  }
  return null
})

// --- Funções ---

function selectItem(type, id) {
  selectedItemRef.value = { type, id }
}
</script>

<template>
  <div class="editor-container unified">
    <nav class="sidebar sidebar-tree">
      <div class="sidebar-search">
        <create-text-field :model-value="searchQuery" :fields="[{ icon: 'search' }]" />
      </div>

      <div class="sidebar-content">
        <div v-for="category in filteredTreeData" :key="category.key" class="tree-section">
          <create-button
            :text="`${category.name} (${category.items.length})`"
            icon="arrow_drop_down"
            class="symbolic"
          />

          <div class="tree-items">
            <create-button
              v-for="item in category.items"
              :key="item.id"
              :class="[item.id === selectedItemRef.id && 'active', 'symbolic no-scalling']"
              :text="item.name"
              @emit-event="selectItem(category.key, item.id)"
            />

            <p v-if="searchQuery && category.items.length === 0" class="no-items">
              Nenhum item encontrado.
            </p>
          </div>
        </div>

        <p v-if="filteredTreeData.length === 0 && searchQuery" class="no-results">
          Nenhum resultado para "{{ searchQuery }}".
        </p>
      </div>
    </nav>

    <div class="content-panel" v-if="activeItem">
      <div class="panel-header">
        <h2>
          Editando: <strong>{{ activeItem.name }}</strong>
        </h2>
        <p>Configure as propriedades e parâmetros deste item.</p>
      </div>

      <div class="panel-body">
        <div class="form-section">
          <h3 class="section-title">Propriedades Gerais</h3>
          <CustomTextInput label="Nome" v-model="activeItem.name" />
          <CustomIconPicker label="Ícone" v-model="activeItem.icon" />
        </div>

        <div class="form-section" v-if="activeItem.params && activeItem.params.length">
          <h3 class="section-title">Parâmetros</h3>
          <div v-for="param in activeItem.params" :key="param.key" class="param-field">
            <component
              :is="componentMap[param.type] || 'CustomTextInput'"
              :label="param.label"
              :placeholder="param.placeholder"
              :options="param.options"
              v-model="param.value"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="content-panel placeholder">
      <p>Selecione um item na árvore à esquerda para editar.</p>
    </div>
  </div>
</template>

<style scoped>
/* Layout Unificado: Sidebar + Conteúdo */
.editor-container.unified {
  display: flex;
  flex-direction: row; /* Lado a lado */
  width: 100%;
  height: 100%;
  min-height: 0;
}

/* --- Sidebar (Árvore) --- */
.sidebar-tree {
  width: 300px; /* Mais espaço para a árvore */
  display: flex;
  flex-direction: column;
  background-color: var(--navigator);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
}

/* Busca no Topo */
.sidebar-search {
  padding: 1rem;
  flex-shrink: 0;
}

/* Conteúdo da Árvore */
.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 1rem;
}

.tree-section {
  margin-bottom: 1.5rem;
}

.tree-category-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--form-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem;
}

.tree-category-title .material-icons {
  font-size: 1.1rem;
}

/* Estilos para botões de item */
.tree-items :deep(button) {
  width: 100%;
  padding: 0.5rem 0.75rem;
}

.tree-items :deep(button.active) {
  background-color: var(--form-normal-link-active-bg);
  color: var(--form-normal-link);
  font-weight: 600;
}

.no-items,
.no-results {
  color: var(--form-sub);
  font-size: 0.9rem;
  padding: 0 0.75rem;
}

/* --- Painel de Conteúdo --- */
.content-panel {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Placeholder (quando vazio) */
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--form-sub);
  font-size: 1.1rem;
  height: 100%;
}

.panel-header {
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 2rem;
  flex-shrink: 0;
}
.panel-header h2 {
  font-size: 1.5rem;
  margin: 0;
}
.panel-header p {
  color: var(--form-sub);
  margin: 0.25rem 0 0;
}

/* Wrapper para o scroll do formulário */
.panel-body {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2.5rem;
}
/* .section-title { ... }
.param-field { ... } */
</style>
