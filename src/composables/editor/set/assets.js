import { generateId, useEditorStore } from '@/stores/editor'
import { computed } from 'vue'

export const assets = computed(() => {
  const editorStore = useEditorStore()

  function pushAssetDefinition(assetType, params) {
    const id = generateId('asset')
    const definition = { id, type: assetType, ...params }
    editorStore.assets.push(definition)
    console.log(`Novo Asset criado: ${assetType} com ID ${id}`)
    return id
  }

  return {
    text: 'Arquivos enviados',
    icon: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/lottie.json',
    definitions: {
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
  }
})
