<template>
  <div class="page" :class="isMinimal() && 'minimal'">
    <span
      v-if="!isMinimal()"
      class="settings-button material-symbols-outlined notranslate"
      @click="handleSettingsBox"
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

    <div class="main-form-container" :style="isMinimal() && 'border: none'">
      <div class="left">
        <img src="@/assets/img/min-logo.png" alt="Logo do Sysroot" id="logo" />
        <h1 v-if="config">{{ config.title }}</h1>
        <h1 v-else>Erro Interno</h1>
      </div>
      <div v-if="hasStepsData && currentStepData && !hasErrors" class="right">
        <ComponentForm
          :general="config"
          :stepData="currentStepData"
          @emitEvent="handleFunctionEvent"
        />
      </div>

      <div v-else-if="!hasStepsData || !currentStepData || hasErrors" class="right">
        <ComponentForm
          :stepData="{
            formEvent: 'error',
            buttons: [
              {
                text: 'Voltar',
                action: { type: 'local', name: 'back' },
              },
            ],
          }"
          @emitEvent="handleFunctionEvent"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ComponentForm from './ComponentForm.vue'

const props = defineProps({
  config: {
    type: Object,
  },
  formFunctions: {
    type: Object,
    default: () => ({}),
  },
  errorMessage: String,
  isLoading: Boolean,
  redirectName: String,
})

const emit = defineEmits(['button-click'])

const router = useRouter()
const store = inject('stores')
const formStore = store.form
const appDynamicDialog = store.dialog

const errors = ref([])
const formData = computed(() => formStore.getFormData)
const currentStep = computed(() => formStore.getCurrentStep)

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
const hasErrors = computed(() => errors.value.length > 0)

function isMinimal() {
  if (props.config?.type === 'minimal') {
    return true
  }
  return false
}

function submitForm() {
  console.log('Submetendo formulário com os dados...')
}

function handleSettingsBox() {
  appDynamicDialog.setDialog('DialogSettings', { title: 'Configurações' })
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
      errors.value.push({
        function: action,
      })
    }
  }
}

// Funções locais reutilizáveis
function redirect(link) {
  router.push({ name: link })
}

function forward() {
  formStore.setCurrentStep(formStore.getCurrentStep + 1)
}

function rewind() {
  formStore.setCurrentStep(formStore.getCurrentStep - 1)
}

function back() {
  router.back()
}

onMounted(() => {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const submitButton = document.querySelector('.btn.confirm')
      if (submitButton) {
        submitButton.click()
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      const submitButton = document.querySelector('.btn')
      if (submitButton) {
        submitButton.click()
      }
    }
  })
})

// Expondo os métodos e dados para o template
defineExpose({
  formData,
  errors,
  submitForm,
  currentStep,
  currentStepData,
  hasStepsData,
  handleSettingsBox,
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
