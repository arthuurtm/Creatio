import { ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Um Composable para gerenciar a lógica de um formulário de múltiplos passos.
 * @param {object} options - Opções de configuração.
 * @param {number} options.initialStep - O passo inicial do formulário (padrão: 1).
 * @param {number} options.totalSteps - O número total de passos (opcional, para validação).
 */
export function useMultiStepForm(options = {}) {
  const currentStep = ref(options.initialStep || 1)
  const redirectWrapper = useRouter()

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

  async function pageRedirect(name, params = {}) {
    redirectWrapper.push({
      name,
      params,
    })
  }

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    pageRedirect,
  }
}
