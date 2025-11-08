// object.js
import { computed } from 'vue'
import { useEditorStore, generateId } from '@/stores/editor.js'

// --- FUNÇÃO AUXILIAR PARA CRIAR OBJETOS ---
function pushDefinition(type, params) {
  const id = generateId('object')
  const definition = { id, type, ...params }
  useEditorStore.objects.push(definition)
  return id
}

// --- FUNÇÃO AUXILIAR PARA CRIAR ASSETS (Assumida no contexto de Objects) ---
function pushAssetDefinition(assetType, params) {
  const id = generateId('asset')
  const definition = { id, type: assetType, ...params }
  // O recurso é adicionado a uma nova propriedade da store, por exemplo:
  useEditorStore.assets.push(definition)
  console.log(`Novo Asset criado: ${assetType} com ID ${id}`)
  return id
}

export const objects = computed(() => ({
  text: 'Objetos',
  icon: 'category',
  definitions: {
    // 1. Item (Com referência de Asset)
    createItem: {
      text: 'Criar Item',
      icon: 'inventory_2',
      params: [
        { key: 'name', label: 'Nome', type: 'text', required: true },
        {
          key: 'inventoryIcon',
          label: 'Ícone (Inventário)',
          type: 'file',
          assetType: 'image',
          options: useEditorStore.assets,
        },
        { key: 'stackable', label: 'Empilhável', type: 'checkbox', default: true },
        { key: 'maxStack', label: 'Máx. Pilha', type: 'number', default: 99 },
      ],
      execute: (params) => pushDefinition('item', params),
    },

    // ... Outras definições (NPC, Contêiner, etc.) ...

    // -----------------------------------------------------------
    // 2. FUNÇÃO DEDICADA PARA CRIAR ASSETS (DENTRO DO MENU OBJECTS)
    // -----------------------------------------------------------
    assetSeparator: {
      // Um item separador ou não clicável no menu
      text: '— Recurso de Mídia —',
      icon: 'add_photo_alternate',
      params: [],
      execute: () => null,
      isSeparator: true,
    },
    createImageAsset: {
      text: 'Criar Imagem/Sprite',
      icon: 'image',
      params: [
        { key: 'assetName', label: 'Nome do Recurso', type: 'text', required: true },
        { key: 'path', label: 'Caminho/URL da Imagem', type: 'resource-link', required: true },
        { key: 'description', label: 'Uso/Descrição', type: 'textarea' },
      ],
      execute: (params) => pushAssetDefinition('image', params),
    },
    createAudioAsset: {
      text: 'Criar Recurso de Áudio',
      icon: 'volume_up',
      params: [
        { key: 'assetName', label: 'Nome do Recurso', type: 'text', required: true },
        { key: 'path', label: 'Caminho/URL do Áudio', type: 'resource-link', required: true },
        { key: 'isLooping', label: 'Reprodução em Loop?', type: 'checkbox', default: false },
      ],
      execute: (params) => pushAssetDefinition('audio', params),
    },
    createVideoAsset: {
      text: 'Criar Recurso de Vídeo',
      icon: 'movie',
      params: [
        { key: 'assetName', label: 'Nome do Recurso', type: 'text', required: true },
        { key: 'path', label: 'Caminho/URL do Vídeo', type: 'resource-link', required: true },
      ],
      execute: (params) => pushAssetDefinition('video', params),
    },
  },
}))
