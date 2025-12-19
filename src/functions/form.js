import { ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Um Composable para gerenciar a lógica de um formulário de múltiplos passos.
 * @param {object} options - Opções de configuração.
 * @param {number} options.initialStep - O passo inicial do formulário (padrão: 1).
 * @param {number} options.totalSteps - O número total de passos (opcional, para validação).
 */
export default function useMultiStepForm(options = {}) {
  const currentStep = ref(options.initialStep || 1)
  const redirectWrapper = useRouter()
  const loading = ref(false)

  function nextStep() {
    // Se um total de passos foi definido, não deixa passar do limite.
    if (options.totalSteps && currentStep.value >= options.totalSteps) {
      return
    }
    currentStep.value++
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function goToStep(step) {
    if (step > 0 && (!options.totalSteps || step <= options.totalSteps)) {
      currentStep.value = step
    }
  }

  async function pageRedirect({ name = null, path = null, params = {} }) {
    if (path && name) name = null
    redirectWrapper.push({
      path,
      name,
      params,
    })
  }

  async function loaderController(func) {
    loading.value = true
    try {
      await func?.()
    } catch (err) {
      console.error('Erro ao processar função: ', err)
    } finally {
      loading.value = false
    }
  }

  return {
    currentStep,
    loading,
    nextStep,
    prevStep,
    goToStep,
    pageRedirect,
    loaderController,
  }
}
