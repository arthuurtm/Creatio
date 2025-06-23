<template>
  <ComponentCreateGamePage>
    <div class="step-container double-divided">
      <div class="step-form">
        <div class="container" style="grid-column: 1">
          <ComponentFormPage :config="stepConfigs" :formFunctions="functions" />
        </div>
      </div>
      <div class="step-preview" style="grid-column: 2">
        <CreateCard
          :card="[
            {
              title: inputData.gameName,
              description: inputData.gameDescription,
              img: inputData.gameImage,
              sound: inputData.gameSound,
            },
          ]"
        />
      </div>
    </div>
  </ComponentCreateGamePage>
</template>
<script setup>
import { inject } from 'vue'
import { useRouter /*useRoute*/ } from 'vue-router'
import { post } from '@/functions/functions'
import { showToast } from '@/plugins/toast'
import ComponentCreateGamePage from '@/components/ComponentCreateGamePage.vue'
import ComponentFormPage from '@/components/ComponentFormPage.vue'

const store = inject('stores')
const globalStore = store.global
const inputData = globalStore.getInputData

const router = useRouter()
// const route = useRoute()

const stepConfigs = {
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

<style scoped>
/* Etapas */
.step-container {
  border-radius: 1rem;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

/* Tela dividida para Configurações */
.step-container.double-divided {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.step-form,
.step-preview {
  display: flex;
}

.step-form {
  margin-left: auto;
}

.step-preview {
  margin-right: auto;
}

/* Garante que o formulário tenha tamanho consistente */
.step-form .container,
.step-form form.form-container {
  width: 100%;
  max-width: 400px;
  min-width: 280px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Remove padding duplicado se o form já tiver */
.step-form .container {
  padding: 0;
  box-shadow: none;
  background: none;
}

/* Responsividade para telas pequenas */
@media (max-width: 600px) {
  .step-form,
  .step-preview {
    display: flex;
    margin-left: unset;
  }

  .step-form .container,
  .step-form form.form-container {
    max-width: 100vw;
    border-radius: 0.5rem;
    padding: 1rem;
  }
}
</style>
