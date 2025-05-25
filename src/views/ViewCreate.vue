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
      <CreateStepProgress :steps="steps" :currentStep="actualPage" v-if="actualPage != 0" />
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
              :config="{
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
                        style: {
                          rounded: true,
                        },
                      },
                      {
                        label: 'Descrição do Jogo',
                        model: 'gameDescription',
                        placeholder: 'Uma descrição legal!',
                        icon: 'description',
                        style: {
                          rounded: true,
                        },
                      },
                      {
                        label: 'Imagem do Jogo',
                        type: 'file',
                        icon: 'image',
                        name: 'arquivo',
                        style: {
                          rounded: true,
                        },
                      },
                      {
                        label: 'Som do Jogo',
                        type: 'file',
                        icon: 'music_note',
                        name: 'arquivo',
                        style: {
                          rounded: true,
                        },
                      },
                    ],
                    buttons: [
                      {
                        text: 'Avançar',
                        class: 'confirm',
                        action: {
                          name: '',
                        },
                      },
                    ],
                  },
                },
              }"
              :formFunctions="{
                handleGameCreate: async () => {
                  //Criar uma função que faz a conexão com o websocket usando algo que vou importar em ViewCreate
                },
              }"
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
    </div>
  </div>
</template>

<script setup>
import ComponentForm from '@/components/ComponentForm.vue'
import { inject, ref, computed, onMounted } from 'vue'

const store = inject('stores')
const globalStore = store.global
const inputData = globalStore.getInputData

const steps = ['Configurações básicas', 'Jogo', 'Créditos', 'Revisão']
const actualPage = ref(0)

function criarNovoJogo() {
  actualPage.value = 1
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
  flex-direction: column;
  gap: 1rem;
}

.step-form .container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 50%;
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
