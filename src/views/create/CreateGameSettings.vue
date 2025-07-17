<script setup>
import { inject } from 'vue'
import { useRouter /*useRoute*/ } from 'vue-router'
import { post } from '@/functions'
import { showToast } from '@/plugins/toast'
import ComponentFormPage from '@/layouts/AppFormPage.vue'

const store = inject('stores')
const globalStore = store.global
const inputData = globalStore.getInputData

const router = useRouter()

const steps = {
  type: 'minimal',
  store: 'global',
  steps: {
    1: {
      fields: [
        {
          label: 'Nome do Jogo',
          model: 'gameName',
          placeholder: 'Um nome bem legal!',
          icon: 'emoji_objects',
          style: { rounded: true },
        },
        {
          label: 'Descrição do Jogo',
          model: 'gameDescription',
          placeholder: 'Uma descrição legal!',
          icon: 'description',
          style: { rounded: true },
        },
      ],
      buttons: [
        {
          text: 'Pular',
          icon: 'skip_next',
          position: 'left',
          class: 'symbolic',
          action: { name: 'handleGameCreate' },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          action: { name: 'forward', type: 'local' },
        },
      ],
    },
    2: {
      fields: [
        {
          label: 'Imagem do Jogo',
          type: 'file',
          icon: 'image',
          model: 'gameImage',
          style: { rounded: true },
        },
        {
          label: 'Som do Jogo',
          type: 'file',
          icon: 'music_note',
          model: 'gameSound',
          style: { rounded: true },
        },
      ],
      buttons: [
        {
          text: 'Voltar',
          position: 'left',
          class: '',
          action: { type: 'local', name: 'rewind' },
        },
        {
          text: 'Pular',
          icon: 'skip_next',
          class: 'symbolic',
          action: { name: 'handleGameCreate' },
        },
        {
          text: 'Avançar',
          class: 'confirm',
          action: { name: 'handleGameCreate', value: 'true' },
        },
      ],
    },
  },
}

const functions = {
  handleGameCreate: async (images = false) => {
    try {
      if (inputData.gameName === undefined || inputData.gameDescription === undefined) {
        showToast({ type: 'warning', message: 'Preencha o nome e a descrição do jogo.' })
        return
      }

      let result = await post(
        { type: 'database', route: 'setGame' },
        { title: inputData.gameName, description: inputData.gameDescription },
      )

      if (images) {
        const gameData = new FormData()
        gameData.append('gameImage', inputData.gameImage)
        gameData.append('gameSound', inputData.gameSound)
        gameData.append('gameId', result.details.game.id)

        for (const pair of gameData.entries()) {
          console.log(pair[0], pair[1])
        }
        post(
          { type: 'database', route: 'setFileUpload', contentType: 'multipart/form-data' },
          gameData,
        )
      }

      router.push({ name: 'EditGame', params: { id: result.details.game.id } })
    } catch (error) {
      showToast({ type: 'error', message: 'Erro ao criar o jogo.' })
      console.error('Erro ao criar o jogo:', error)
    }
  },
}
</script>

<template>
  <div class="main-container">
    <ComponentFormPage :config="steps" :functions="functions" />
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.background,
.background-banner {
  width: 100%;
  height: 100%;
}

.background {
  background: var(--input-bg);
  /* position: fixed; */
}

.corner-blur-mask {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.6) 100%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 1;
}

.ui-options {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  width: 100%;
  height: 100%;
  position: absolute;
}

.ui-options .game-details {
  margin: auto 0 auto 3rem;
}

.ui-options .game-details .options {
  width: 100%;
  margin-top: 1rem;
}

.ui-options .game-description {
  grid-row: 2;
}
</style>
