<template>
  <div class="page">
    <span class="settings-button material-symbols-outlined notranslate" @click="handleSettingsBox"
      >settings</span
    >

    <transition name="errAnim">
      <div
        v-if="errorMessage"
        id="error-message"
        class="error-message"
        :class="errorMessage && 'show'"
      >
        ✖ {{ errorMessage }}
      </div>
    </transition>

    <CreateLoading v-if="isLoading" :full="true" />

    <div class="main-form-container">
      <div class="left">
        <img src="@/assets/img/min-logo.png" alt="Logo do Sysroot" id="logo" />
        <h1 v-if="config">{{ config.title }}</h1>
        <h1 v-else>Erro Interno</h1>
      </div>

      <div v-if="hasStepsData && currentStepData" class="right">
        <form class="form-container" @submit.prevent="submitForm">
          <div class="centered">
            <transition name="slide-left" mode="out-in">
              <div :key="currentStepData.stepIndex">
                <div class="sepElements">
                  <CreateTextField
                    v-for="field in currentStepData.fields"
                    :key="field.model"
                    :field="field"
                    v-model="formData[field.model]"
                    :error-message="errors[field.model]"
                    @emitEvent="handleFunctionEvent"
                  />
                </div>
              </div>
            </transition>
          </div>

          <CreateAnchor
            v-if="currentStepData.anchor"
            :anchor="currentStepData.anchor"
            @emitEvent="handleFunctionEvent"
          />

          <CreateButton
            v-if="currentStepData.buttons"
            :buttons="currentStepData.buttons"
            @emitEvent="handleFunctionEvent"
          />
        </form>
      </div>

      <div v-else-if="!hasStepsData && !currentStepData" class="right">
        <form class="form-container" @submit.prevent="submitForm">
          <div class="centered">
            <div class="sepElements">
              <p>Ocorreu um erro interno, tente novamente mais tarde.</p>
            </div>
          </div>

          <div class="sepButtons">
            <button class="btn" @click="handleFunctionEvent({ action: 'back', type: 'local' })">
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormStore } from '@/stores/form'
import { useAppDynamicDialog } from '@/stores/dialog'
import { useRouter } from 'vue-router'

const props = defineProps({
  config: Object,
  errorMessage: String,
  isLoading: Boolean,
  formFunctions: Object,
  redirectName: String,
})

const emit = defineEmits(['button-click'])

const router = useRouter()
const formStore = useFormStore()
const appDynamicDialog = useAppDynamicDialog()

const errors = ref({})
const formData = computed(() => formStore.formData)
const currentStep = computed(() => formStore.getCurrentStep())

const allSteps = computed(() => {
  if (!props.config?.steps) return []
  return Object.entries(props.config.steps).map(([key, value]) => ({
    ...value,
    stepIndex: Number(key),
  }))
})

const currentStepData = computed(() => {
  return allSteps.value.find((step) => step.stepIndex === currentStep.value) || null
})

const hasStepsData = computed(() => !!props.config?.steps)

function submitForm() {
  console.log('Submetendo formulário com os dados...')
}

function handleSettingsBox() {
  appDynamicDialog.setDialog('DialogSettings', { title: 'Configurações' })
}

function handleButtonClick(action) {
  console.log('Executando função legada: ', formStore.getRequestedFunction())
  formStore.setRequestedFunction(action)
}

function handleFunctionEvent(payload) {
  const { action, value, type } = payload

  if (type === 'local') {
    try {
      switch (action) {
        case 'redirect':
          redirect(value)
          break
        case 'forward':
          forward()
          break
        case 'rewind':
          rewind()
          break
        case 'back':
          back()
          break
        default:
          console.warn(`Ação local "${action}" não implementada.`)
      }
    } catch (error) {
      console.error(`Erro ao executar ação local "${action}":`, error)
    }
  } else {
    if (props.formFunctions?.[action]) {
      props.formFunctions[action](value)
    } else {
      handleButtonClick(action)
    }
  }
}

function showToast(type, message, timeout) {
  try {
    toast[type](message, { timeout })
  } catch (error) {
    console.error('Erro ao exibir toast:', error)
  }
}

// Funções locais reutilizáveis
function redirect(link) {
  router.push({ name: link })
}

function forward() {
  formStore.setCurrentStep(formStore.getCurrentStep() + 1)
}

function rewind() {
  formStore.setCurrentStep(formStore.getCurrentStep() - 1)
}

function back() {
  router.back()
}

// Expondo os métodos e dados para o template
defineExpose({
  formData,
  errors,
  submitForm,
  currentStep,
  currentStepData,
  hasStepsData,
  handleSettingsBox,
  handleButtonClick,
  handleFunctionEvent,
  redirect,
  forward,
  rewind,
  back,
})
</script>

<style scoped>
@import url(/src/assets/css/components/c-form.css);
</style>
