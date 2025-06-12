<template>
  <div class="main-container">
    <div id="helpButton" title="Ajuda">
      <CreateButton
        :buttons="[
          {
            label: 'Ajuda',
            icon: 'help',
            color: 'primary',
            class: 'symbolic no-padding no-scalling',
          },
        ]"
      />
    </div>

    <Transition name="moveToBottom" mode="out-in">
      <CreateStepProgress :steps="steps" :currentStep="actualPage - 1" v-if="actualPage != 0" />
    </Transition>

    <div class="steps">
      <!-- Etapa 0 - Página Inicial -->
      <div class="step-container" v-if="actualPage === 0">
        <h2>Suas Criações</h2>
        <CreateButton
          :buttons="[
            {
              text: 'Criar',
              icon: 'add',
              class: 'symbolic no-padding no-scalling',
            },
          ]"
          @emitEvent="criarNovoJogo"
        />
      </div>

      <!-- Etapa 1 - Configurações Básicas -->
      <div class="step-container double-divided" v-if="actualPage === 1">
        <div class="step-form" style="grid-column: 1">
          <div class="container">
            <ComponentForm
              :stepData="stepConfigs[actualStep]"
              :general="{ store: 'global' }"
              :key="actualStep"
              @emitEvent="handleFormEvent"
            />
          </div>
        </div>
        <div class="step-preview" style="grid-column: 2">
          <CreateCard
            :games="[
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

      <!-- Etapa 2 - Editor -->
      <div class="step-container" v-if="actualPage === 2"></div>

      <!-- Etapa 3 - Créditos -->
      <div class="step-container" v-if="actualPage === 3"></div>

      <!-- Etapa 4 - Revisão -->
      <div class="step-container" v-if="actualPage === 4"></div>

      <button class="btn" @click="actualPage++">Avançar (forçar -> dev)</button>
    </div>
  </div>
</template>

<script setup>
import ComponentForm from '@/components/ComponentForm.vue'
import { inject, ref, computed } from 'vue'
import { post } from '@/functions/functions'
import { showToast } from '@/plugins/toast'

const store = inject('stores')
const globalStore = store.global
const inputData = globalStore.getInputData

const steps = ['Configurações básicas', 'Jogo', 'Créditos', 'Revisão']
const actualPage = ref(0)
const actualStep = computed(() => actualPage.value) // ou ajuste conforme sua lógica

const stepConfigs = {
  1: {
    stepIndex: 1,
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
    stepIndex: 2,
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
        text: 'Avançar',
        class: 'confirm',
        action: { name: 'handleGameCreate', value: 'true' },
      },
    ],
  },
}

function criarNovoJogo() {
  actualPage.value = 1
}

function handleFormEvent(event) {
  if (event.type === 'local') {
  }
  if (typeof event.name === 'function') {
  } else {
  }
}

const functions = {
  handleGameCreate: async (images = false) => {
    try {
      post(
        { type: 'database', route: 'setGame' },
        { title: inputData.gameName, description: inputData.gameDescription },
      )

      if (images) {
        const gameData = new FormData()
        gameData.append('gameImage', inputData.gameImage)
        gameData.append('gameSound', inputData.gameSound)
        for (const pair of gameData.entries()) {
          console.log(pair[0], pair[1])
        }
        post({ type: 'file', route: 'upload', contentType: 'multipart/form-data' }, gameData)
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Erro ao criar o jogo.' })
      console.error('Erro ao criar o jogo:', error)
    }
  },
}
</script>

<style scoped>
#helpButton {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
}

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

/* Formulários e prévia */
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
  background: var(--form-bg, #fff);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  .step-container {
    padding: 0;
  }
  .step-container.double-divided {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .step-form,
  .step-preview {
    display: flex;
    margin-left: unset;
  }

  .step-form .container,
  .step-form form.form-container {
    max-width: 100vw;
    min-width: unset;
    border-radius: 0.5rem;
    padding: 1rem;
  }
}

/* Lista de jogos */
.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Créditos */
.creditos-lista {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.creditos-lista input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
  flex: 1;
}

/* Preview */
.step-preview img {
  max-width: 100%;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

/* Animações */
</style>
