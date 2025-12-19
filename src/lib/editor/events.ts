import { useEditorStore, generateId } from '@/stores/editor.js'
import { createDefinitions } from '@/types/editor-config'
import { computed } from 'vue'

export const events = computed(() => {
  const editorStore = useEditorStore()

  function pushEvent(type: string, params: any) {
    const id = generateId('event')
    const event = { id, type, ...params }
    editorStore.events.push(event)
    return id
  }

  const definitions = createDefinitions({
    onGameLoad: {
      text: 'Ao Carregar Jogo',
      icon: 'power_settings_new',
      params: [
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
        },
      ],
      execute: (params) => pushEvent('onGameLoad', params),
    },
    onEnterNode: {
      text: 'Entrar no Nó',
      icon: 'input',
      params: [
        {
          key: 'nodeId',
          label: 'Nó',
          type: 'select',
          options: editorStore.nodes,
          required: true,
        },
        { key: 'conditions', label: 'Condições', type: 'complex-array' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
        },
      ],
      execute: (params) => pushEvent('onEnterNode', params),
    },
    onObjectInteract: {
      text: 'Interagir com Objeto',
      icon: 'ads_click',
      params: [
        {
          key: 'objectId',
          label: 'Objeto',
          type: 'select',
          options: editorStore.objects,
          required: true,
        },
        { key: 'conditions', label: 'Condições', type: 'complex-array' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
        },
      ],
      execute: (params) => pushEvent('onObjectInteract', params),
    },
    // onRegionEnter: {
    //   text: 'Entrar na Região',
    //   icon: 'place',
    //   params: [
    //     {
    //       key: 'regionId',
    //       label: 'Região (Trigger)',
    //       type: 'select',
    //       options: editorStore.regions,
    //       required: true,
    //     },
    //     { key: 'conditions', label: 'Condições', type: 'complex-array' },
    //     {
    //       key: 'consequences',
    //       label: 'Consequências',
    //       type: 'complex-array',
    //     },
    //   ],
    //   execute: (params) => pushEvent('onRegionEnter', params),
    // },
    onChoiceSelected: {
      text: 'Escolha Selecionada',
      icon: 'check_circle',
      params: [
        { key: 'choiceId', label: 'ID da Escolha (do Nó)', type: 'text', required: true },
        { key: 'conditions', label: 'Condições', type: 'complex-array' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
        },
      ],
      execute: (params) => pushEvent('onChoiceSelected', params),
    },
    onTimeElapsed: {
      text: 'Tempo Decorrido',
      icon: 'timer',
      params: [
        { key: 'duration', label: 'Duração (s)', type: 'number', required: true },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
        },
      ],
      execute: (params) => pushEvent('onTimeElapsed', params),
    },
    onFlagChanged: {
      text: 'Flag Alterada',
      icon: 'flag',
      params: [
        {
          key: 'flagId',
          label: 'Flag',
          type: 'select',
          options: editorStore.flags,
          required: true,
        },
        { key: 'value', label: 'Valor (Opcional)', type: 'text' },
        {
          key: 'consequences',
          label: 'Consequências',
          type: 'complex-array',
        },
      ],
      execute: (params) => pushEvent('onFlagChanged', params),
    },
  })

  return {
    text: 'Eventos',
    icon: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f514/lottie.json',
    definitions,
  }
})
